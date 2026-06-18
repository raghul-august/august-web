'use client';

import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { PersonInfo } from '@/types/ehr';
import { createPerson, updatePerson } from '@/services/person-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import type { ActiveProfile, FooterState, ProfilesDraft } from './onboarding-wizard';

const SEXES: Array<{ value: string; label: string; symbol: string }> = [
  { value: 'male', label: 'Male', symbol: '♂' },
  { value: 'female', label: 'Female', symbol: '♀' },
  { value: 'other', label: 'Other', symbol: '⚥' },
];

const RELATIONSHIPS: Array<{ value: string; label: string }> = [
  { value: 'daughter', label: 'Daughter' },
  { value: 'son', label: 'Son' },
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'other', label: 'Other' },
];

function generateRowId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `r${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function makeBlankFamilyRow(): ProfilesDraft['family'][number] {
  return { id: generateRowId(), name: '', relationship: '', age: '', sex: '' };
}

export function ProfilesStep({
  userId,
  persons,
  draft,
  setDraft,
  activeProfile,
  fetchPersons,
  savedNotice,
  onFooterChange,
  onContinue,
}: {
  userId: string;
  persons: PersonInfo[];
  draft: ProfilesDraft;
  setDraft: Dispatch<SetStateAction<ProfilesDraft>>;
  activeProfile: ActiveProfile;
  fetchPersons: (userId: string) => Promise<unknown>;
  /** Name of the profile just saved; shows the "<name>'s profile saved"
   *  confirmation banner on the loved-one form. */
  savedNotice: string | null;
  onFooterChange: (footer: FooterState) => void;
  /** Called after a successful save. `viaSkip` means the user hit the
   *  Continue-to-records secondary on a loved-one form — wizard should
   *  advance to Records. `selfWasAlreadySaved` is true when self had name
   *  + sex on file BEFORE this click; the wizard uses it to decide whether
   *  to chain the first-time loved-one prompt. `savedName` carries the
   *  just-saved person's name for the confirmation banner. */
  onContinue: (params: {
    savedFromSelf: boolean;
    viaSkip: boolean;
    selfWasAlreadySaved: boolean;
    savedName?: string;
  }) => void;
}) {
  const self = useMemo(() => persons.find(p => p.person_id === userId), [persons, userId]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Self always needs name + sex to advance. When the user is on a draft
  // loved-one row, that row also needs to be fully valid (the form
  // labels the fields as required) — but Skip is allowed to bail out
  // without filling it, so canSkip drops the active-row requirement.
  const selfValid = draft.selfName.trim() !== '' && draft.selfSex !== '';
  const activeDraftValid =
    activeProfile.kind === 'draftFamily'
      ? (() => {
          const row = draft.family.find(r => r.id === activeProfile.rowId);
          return !!row && row.name.trim() !== '' && row.relationship !== '' && row.sex !== '';
        })()
      : true;
  const canContinue = selfValid && activeDraftValid;
  const canSkip = selfValid;
  // Used to (a) pick the right primary-CTA label on the self form and
  // (b) tell the wizard whether to skip the first-time loved-one prompt.
  const selfWasAlreadySaved = !!self?.name?.trim() && !!self?.sex?.trim();
  const selfHasPendingChanges =
    draft.selfName.trim() !== (self?.name ?? '') ||
    draft.selfAge.trim() !== (self?.age ?? '') ||
    draft.selfSex !== (self?.sex ?? '');

  // draftRef gives the footer-publish effect's onClick closures access
  // to the latest draft without re-publishing the footer on every
  // keystroke. Synced in an effect so we don't mutate refs during render.
  const draftRef = useRef(draft);
  useEffect(() => { draftRef.current = draft; }, [draft]);

  const onFooterChangeRef = useRef(onFooterChange);
  const onContinueRef = useRef(onContinue);
  useEffect(() => { onFooterChangeRef.current = onFooterChange; }, [onFooterChange]);
  useEffect(() => { onContinueRef.current = onContinue; }, [onContinue]);

  // Skip publishes itself when active is a draft loved-one. familyIdx is
  // computed below from activeProfile; we declare it here so the footer
  // effect can read it.
  const isSelfActive = activeProfile.kind === 'self';
  // Resolve by rowId, not index, so the lookup tracks the row even
  // after async filter mutations re-order family.
  const activeFamilyIdx = activeProfile.kind === 'draftFamily'
    ? draft.family.findIndex(r => r.id === activeProfile.rowId)
    : -1;

  const isSavedFamilyActive = activeProfile.kind === 'savedFamily';

  useEffect(() => {
    // Saved family is shown as a readonly "already added" card on
    // step 1. The only action available is to advance the wizard.
    if (isSavedFamilyActive) {
      onFooterChangeRef.current({
        label: 'Continue to Records',
        onClick: () => onContinueRef.current({ savedFromSelf: false, viaSkip: true, selfWasAlreadySaved }),
      });
      return;
    }

    const persistAndAdvance = async (snapshot: ProfilesDraft, viaSkip: boolean) => {
      // Skip only needs self to be saveable; Create profile additionally
      // needs the active loved-one row to be valid.
      if (saving) return;
      if (viaSkip ? !canSkip : !canContinue) return;
      setSaving(true);
      setError(null);
      try {
        const selfChanged =
          snapshot.selfName.trim() !== (self?.name ?? '') ||
          snapshot.selfAge.trim() !== (self?.age ?? '') ||
          snapshot.selfSex !== (self?.sex ?? '');
        if (selfChanged) {
          await updatePerson({
            personId: userId,
            givenName: snapshot.selfName.trim(),
            age: snapshot.selfAge.trim() || undefined,
            sex: snapshot.selfSex || undefined,
          });
        }
        // Only persist the loved-one the user explicitly clicked
        // Create profile on. Background drafts in snapshot.family stay
        // as drafts; the user has to navigate to them and submit each
        // one individually. Skip never persists any draft.
        let savedRowId: string | null = null;
        if (!viaSkip && !isSelfActive && activeFamilyIdx >= 0) {
          const row = snapshot.family[activeFamilyIdx];
          if (row && row.name.trim() && row.relationship && row.sex) {
            await createPerson({
              name: row.name.trim(),
              relationship: row.relationship,
              age: row.age.trim() || undefined,
              sex: row.sex,
            });
            savedRowId = row.id;
          }
        }
        await fetchPersons(userId);
        // Merge against the LATEST draft so concurrent edits during
        // the API call survive: rows added via rail "+", edits to the
        // self form, and edits to any draft row (including the one
        // being saved — its id is stable across edits, so filter by
        // id, not by reference). We intentionally do NOT overwrite
        // self fields from the pre-await snapshot; if the user typed
        // in self during the loved-one save, those edits stay.
        setDraft(current => ({
          ...current,
          family: savedRowId ? current.family.filter(r => r.id !== savedRowId) : current.family,
        }));
        setSaving(false);
        // Name to confirm in the next form's banner: the self name on a
        // self save, the loved-one's name on a loved-one save, nothing on
        // a skip (no profile was created).
        const savedName = viaSkip
          ? undefined
          : isSelfActive
            ? snapshot.selfName.trim()
            : savedRowId
              ? snapshot.family[activeFamilyIdx]?.name.trim()
              : undefined;
        onContinueRef.current({ savedFromSelf: isSelfActive, viaSkip, selfWasAlreadySaved, savedName });
      } catch (err) {
        logger.error('[Onboarding] Profile save failed', serializeError(err));
        setError('Could not save your profile. Please try again.');
        setSaving(false);
      }
    };

    const primaryLabel = (() => {
      if (saving) return 'Saving…';
      if (isSelfActive && selfWasAlreadySaved) {
        return selfHasPendingChanges ? 'Save changes' : 'Continue to Records';
      }
      return 'Create profile';
    })();
    onFooterChangeRef.current({
      label: primaryLabel,
      disabled: !canContinue || saving,
      onClick: () => persistAndAdvance(draftRef.current, false),
      secondary: !isSelfActive && activeFamilyIdx >= 0
        ? {
            label: 'Continue to records',
            prominent: true,
            disabled: !canSkip || saving,
            onClick: () => {
              const trimmed = {
                ...draftRef.current,
                family: draftRef.current.family.filter((_, i) => i !== activeFamilyIdx),
              };
              setDraft(trimmed);
              persistAndAdvance(trimmed, true);
            },
          }
        : undefined,
    });
  }, [canContinue, canSkip, saving, self, userId, fetchPersons, setDraft, isSelfActive, activeFamilyIdx, isSavedFamilyActive, selfWasAlreadySaved, selfHasPendingChanges]);

  const updateSelf = (patch: Partial<Pick<ProfilesDraft, 'selfName' | 'selfAge' | 'selfSex'>>) => {
    setDraft({ ...draft, ...patch });
  };
  const updateFamily = (idx: number, patch: Partial<ProfilesDraft['family'][number]>) => {
    setDraft({
      ...draft,
      family: draft.family.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    });
  };

  const isSelf = isSelfActive;
  const familyIdx = activeFamilyIdx;
  const familyRow = familyIdx >= 0 ? draft.family[familyIdx] : null;

  // Saved family — readonly summary so the user knows the person is on
  // file and can switch to another profile or advance.
  if (isSavedFamilyActive && activeProfile.kind === 'savedFamily') {
    const savedPerson = persons.find(p => p.person_id === activeProfile.personId);
    if (!savedPerson) {
      return (
        <div className="max-w-[480px] mx-auto text-center pt-10">
          <p className="text-[13px] text-[#8A9290]">Profile not found.</p>
        </div>
      );
    }
    const display = savedPerson.name || savedPerson.relationship || 'Loved one';
    return (
      <div className="max-w-[480px] mx-auto text-center pt-6">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-[20px] font-semibold text-white"
          style={{ background: savedPerson.color || '#C44D6A' }}
        >
          {display.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-5 font-serif text-[32px] sm:text-[36px] leading-[1.1] tracking-[-0.01em] text-[#1A1E1C]">
          {display} is added
        </h1>
        <p className="mt-3 text-[14px] text-[#6B7370]">
          {[savedPerson.relationship, savedPerson.age, savedPerson.sex].filter(Boolean).join(' · ') || '—'}
        </p>
        <p className="mt-6 text-[12px] italic text-[#8A9290]">
          You can edit {display}&rsquo;s details later from the workspace.
        </p>
      </div>
    );
  }

  if (!isSelf && !familyRow) {
    return (
      <div className="max-w-[560px] mx-auto text-center pt-10">
        <p className="text-[13px] text-[#8A9290]">Profile not available. Tap a profile on the left.</p>
      </div>
    );
  }

  const name = isSelf ? draft.selfName : familyRow!.name;
  const age = isSelf ? draft.selfAge : familyRow!.age;
  const sex = isSelf ? draft.selfSex : familyRow!.sex;
  const relationship = !isSelf ? familyRow!.relationship : '';

  const setName = (v: string) => (isSelf ? updateSelf({ selfName: v }) : updateFamily(familyIdx, { name: v }));
  const setAge = (v: string) => (isSelf ? updateSelf({ selfAge: v }) : updateFamily(familyIdx, { age: v }));
  const setSex = (v: string) => (isSelf ? updateSelf({ selfSex: v }) : updateFamily(familyIdx, { sex: v }));
  const setRelationship = (v: string) => updateFamily(familyIdx, { relationship: v });

  return (
    <div className="max-w-[480px] mx-auto">
      {!isSelf && savedNotice && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-[#206E55]/30 bg-[#F0F7F4] px-3.5 py-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#206E55]">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
          <span className="text-[13px] font-semibold text-[#15543F]">{savedNotice}&rsquo;s profile saved</span>
        </div>
      )}
      {!isSelf && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A9290] mb-1.5">Optional</p>
      )}
      <h1 className="font-serif text-[32px] sm:text-[36px] leading-[1.1] tracking-[-0.01em] text-[#1A1E1C]">
        {isSelf ? 'Your health profile' : 'Add a loved one'}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-[#6B7370]">
        {isSelf
          ? "This helps us organize your records."
          : "We'll keep their records alongside yours — or continue to records."}
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label htmlFor="op-name" className="block text-[13px] font-medium text-[#1A1E1C]">
            Name <span className="text-[#C44040]">*</span>
          </label>
          <input
            id="op-name"
            type="text"
            placeholder={isSelf ? 'Your name' : 'Their name'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 block w-full h-10 px-3 rounded-md border border-[#D6DAD8] bg-white text-[14px] text-[#1A1E1C] placeholder:text-[#A0A8A5] focus:outline-none focus:border-[#206E55] focus:ring-2 focus:ring-[#206E55]/20"
          />
        </div>

        {!isSelf && (
          <div>
            <label htmlFor="op-rel" className="block text-[13px] font-medium text-[#1A1E1C]">
              Relationship <span className="text-[#C44040]">*</span>
            </label>
            <select
              id="op-rel"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="mt-1.5 block w-full h-10 px-3 rounded-md border border-[#D6DAD8] bg-white text-[14px] text-[#1A1E1C] focus:outline-none focus:border-[#206E55] focus:ring-2 focus:ring-[#206E55]/20 appearance-none bg-no-repeat bg-[length:16px_16px] bg-[position:right_12px_center] pr-9"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7370' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='m6 9 6 6 6-6'/%3e%3c/svg%3e\")",
              }}
            >
              <option value="" disabled>Select relationship</option>
              {RELATIONSHIPS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
          <div>
            <label htmlFor="op-age" className="block text-[13px] font-medium text-[#1A1E1C]">
              Age
            </label>
            <input
              id="op-age"
              type="number"
              min={0}
              max={120}
              placeholder="—"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1.5 block w-full h-10 px-3 rounded-md border border-[#D6DAD8] bg-white text-[14px] text-[#1A1E1C] placeholder:text-[#A0A8A5] focus:outline-none focus:border-[#206E55] focus:ring-2 focus:ring-[#206E55]/20"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1A1E1C]">
              Sex <span className="text-[#C44040]">*</span>
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Sex">
              {SEXES.map((s) => {
                const active = sex === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSex(s.value)}
                    className={`h-10 px-2 rounded-md border text-[13px] flex items-center justify-center gap-1.5 transition-colors ${
                      active
                        ? 'border-[#206E55] bg-[#F0F7F4] text-[#206E55] font-semibold'
                        : 'border-[#D6DAD8] bg-white text-[#1A1E1C] hover:border-[#206E55]/40'
                    }`}
                  >
                    <span className={active ? 'text-[#206E55]' : 'text-[#8A9290]'}>{s.symbol}</span>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-[12px] text-[#8A9290]">
          This helps us tailor guidance and provide the right care.
        </p>
      </div>

      {error && (
        <p className="mt-5 text-[13px] text-[#C44040]">{error}</p>
      )}
    </div>
  );
}
