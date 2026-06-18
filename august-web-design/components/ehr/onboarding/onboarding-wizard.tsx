'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useEhrStore } from '@/stores/ehr-store';
import { useEhrConnectAvailability } from '@/hooks/use-ehr-connect-availability';
import type { FastenConnectionEvent, PersonInfo } from '@/types/ehr';
import { markOnboardingComplete } from '@/utils/onboarding-flag';
import { ProfilesStep, makeBlankFamilyRow } from './profiles-step';
import { RecordsStep } from './records-step';
import { UploadSubScreen } from './upload-sub-screen';
import { ConnectSubScreen } from './connect-sub-screen';
import { track } from '@/services/analytics-service';
import { useTrackOnce } from '@/services/ehr-analytics';

type Step = 1 | 2;
type SubScreen =
  | { kind: 'upload'; personId: string }
  | { kind: 'connect'; personId: string }
  | null;

export type FooterState = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  secondary?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    /** Promote to an outlined brand button for proceed actions (e.g. "Continue
     *  to records"). Default is a muted text button, right for skips. */
    prominent?: boolean;
  };
};

export type ProfilesDraft = {
  selfName: string;
  selfAge: string;
  selfSex: string;
  // Each draft row carries a stable client-generated id so the
  // post-save filter can remove the just-saved row even if the user
  // edited it during the API call (which replaces the row object).
  family: Array<{ id: string; name: string; relationship: string; age: string; sex: string }>;
};

// Discriminated union for which profile the rail has selected. Step 1
// only ever points to self or a draft family member (saved family are
// fully persisted and not editable in this wizard). Step 2 can also
// point to a saved family member so the user walks through records
// for everyone in the household.
//
// draftFamily addresses by rowId (not array index) so the lookup
// can't drift when async filter-by-id mutations re-order the
// family array between scheduling and commit.
export type ActiveProfile =
  | { kind: 'self' }
  | { kind: 'savedFamily'; personId: string }
  | { kind: 'draftFamily'; rowId: string };

/**
 * Two-step onboarding wizard with a persistent left avatar rail.
 *
 * The rail shows every profile in the household — self, saved family,
 * and unsaved drafts — and a "+" to add another. Clicking switches the
 * main body to that profile's form (step 1) or records flow (step 2).
 * Adding from step 2 jumps back to step 1 so the new profile gets a
 * name before records get attached to it.
 */
export function OnboardingWizard({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (params: { pendingSyncEvent?: FastenConnectionEvent & { event_type?: string } }) => void;
}) {
  const { user } = useAuthStore();
  const userId = (user?.id ?? (user as Record<string, unknown> | undefined)?.userId) as string | undefined;
  const { canConnectRecords } = useEhrConnectAvailability();
  const persons = useEhrStore(s => s.persons);
  const fetchPersons = useEhrStore(s => s.fetchPersons);

  const [step, setStep] = useState<Step>(1);
  const [subScreen, setSubScreen] = useState<SubScreen>(null);
  const [footer, setFooter] = useState<FooterState>({ label: 'Create profile', disabled: true });
  // Name of the profile just saved — drives the inline "<name>'s profile
  // saved" banner on the loved-one form. Cleared when a fresh draft is
  // started manually (rail "+") so a stale banner doesn't linger.
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<ActiveProfile>({ kind: 'self' });
  const [draft, setDraft] = useState<ProfilesDraft>(() => {
    const self = userId ? persons.find(p => p.person_id === userId) : undefined;
    return {
      selfName: self?.name ?? '',
      selfAge: self?.age ?? '',
      selfSex: self?.sex ?? '',
      family: [],
    };
  });
  const {
    track: trackOnboardingOpen,
    reset: resetOnboardingOpen,
  } = useTrackOnce();
  const {
    track: trackRecordsStepViewed,
    reset: resetRecordsStepViewed,
  } = useTrackOnce();
  // Derived self overlay: if persons loads after the wizard mounted
  // (initial fetch in flight), this overlays the persisted self onto
  // the draft. Only applies while the draft is untouched — once the
  // user types, the draft wins and the overlay stops. No effect /
  // setState here, so the React 19 set-state-in-effect rule stays
  // happy; render derives the visible state directly.
  const hydratedSelf = useMemo(() => userId ? persons.find(p => p.person_id === userId) : undefined, [persons, userId]);
  const hydratedDraft = useMemo<ProfilesDraft>(() => {
    const untouched = !draft.selfName.trim() && !draft.selfSex && !draft.selfAge.trim();
    if (untouched && hydratedSelf && (hydratedSelf.name || hydratedSelf.sex || hydratedSelf.age)) {
      return {
        selfName: hydratedSelf.name ?? '',
        selfAge: hydratedSelf.age ?? '',
        selfSex: hydratedSelf.sex ?? '',
        family: draft.family,
      };
    }
    return draft;
  }, [draft, hydratedSelf]);
  const [pendingSyncEvent, setPendingSyncEvent] = useState<(FastenConnectionEvent & { event_type?: string }) | undefined>(undefined);

  const savedFamily = useMemo<PersonInfo[]>(() => {
    return persons.filter(p => p.person_id !== userId);
  }, [persons, userId]);

  const addDraftFamily = useCallback((savedName?: string) => {
    // Generate the row here so its id is known synchronously — that
    // way setActiveProfile can pin to the new row without depending
    // on a stale draftRef or the order of pending setDraft updates.
    const newRow = makeBlankFamilyRow();
    setDraft(prev => ({ ...prev, family: [...prev.family, newRow] }));
    setActiveProfile({ kind: 'draftFamily', rowId: newRow.id });
    setSubScreen(null);
    setStep(1);
    // Post-save calls pass the saved name to show the confirmation
    // banner; a manual "+" passes nothing, clearing any prior banner.
    setSavedNotice(savedName ?? null);
  }, []);

  const goToStep = useCallback((n: Step) => {
    setSubScreen(null);
    setStep(n);
    if (n === 2) {
      // Only reset activeProfile if it can't survive on step 2.
      // Drafts can't (they're not persisted). Self and savedFamily
      // both map to a real records flow — carrying over savedFamily
      // means a "Continue to Records" from a saved person's readonly
      // card lands on THEIR records, not self's. Drafts in family
      // stay in state; the rail hides them on step 2, and the
      // open→true reset effect below clears them between sessions.
      setActiveProfile(prev => prev.kind === 'draftFamily' ? { kind: 'self' } : prev);
    }
  }, []);

  const openSubScreen = useCallback((sub: SubScreen) => {
    if (sub) {
      track('ehr_onboarding_record_action_opened', {
        action: sub.kind,
        person_type: sub.personId === userId ? 'self' : 'family',
        can_connect_records: canConnectRecords,
      });
    }
    setSubScreen(sub);
  }, [canConnectRecords, userId]);

  const closeSubScreen = useCallback(() => {
    setSubScreen(null);
  }, []);

  useEffect(() => {
    if (subScreen?.kind === 'connect' && !canConnectRecords) {
      closeSubScreen();
    }
  }, [canConnectRecords, closeSubScreen, subScreen]);

  const selfHasProfile = useCallback((): boolean => {
    if (!userId) return false;
    const self = persons.find(p => p.person_id === userId);
    return !!self?.name?.trim() && !!self?.sex?.trim();
  }, [persons, userId]);

  const handleDismiss = useCallback(() => {
    track('ehr_onboarding_dismissed', {
      step,
      sub_screen: subScreen?.kind ?? 'none',
      can_connect_records: canConnectRecords,
    });
    if (selfHasProfile()) markOnboardingComplete(userId);
    if (pendingSyncEvent) {
      onComplete({ pendingSyncEvent });
      return;
    }
    onClose();
  }, [canConnectRecords, onClose, onComplete, pendingSyncEvent, selfHasProfile, step, subScreen, userId]);

  const handleDone = useCallback(() => {
    track('ehr_onboarding_completed', {
      has_pending_sync: Boolean(pendingSyncEvent),
      can_connect_records: canConnectRecords,
    });
    if (selfHasProfile()) markOnboardingComplete(userId);
    onComplete({ pendingSyncEvent });
  }, [canConnectRecords, onComplete, pendingSyncEvent, selfHasProfile, userId]);

  useEffect(() => {
    if (open) {
      trackOnboardingOpen('started', 'ehr_onboarding_started', {
        can_connect_records: canConnectRecords,
      });
    }
    if (!open) {
      resetOnboardingOpen();
      resetRecordsStepViewed();
    }
  }, [canConnectRecords, open, resetOnboardingOpen, resetRecordsStepViewed, trackOnboardingOpen]);

  useEffect(() => {
    if (!open || step !== 2 || subScreen !== null) return;
    trackRecordsStepViewed('records-step', 'ehr_onboarding_records_step_viewed', {
      can_connect_records: canConnectRecords,
      saved_family_count: savedFamily.length,
    });
  }, [canConnectRecords, open, savedFamily.length, step, subScreen, trackRecordsStepViewed]);

  if (!open) return null;

  // Build the rail items in the order self → saved family → drafts.
  // Step 1 hides saved family because this wizard doesn't edit them.
  type RailItem = {
    key: string;
    initial: string;
    color: string;
    active: ActiveProfile;
    isSelf: boolean;
    statusKind?: 'none' | 'done';
  };
  const railItems: RailItem[] = [];
  railItems.push({
    key: 'self',
    initial: (hydratedDraft.selfName || 'Y').charAt(0).toUpperCase(),
    color: '#206E55',
    active: { kind: 'self' },
    isSelf: true,
  });
  // Saved family appear on both steps so a just-persisted loved-one
  // doesn't disappear from the rail when the wizard chains the next
  // draft prompt. Step 1 clicks show a readonly summary; step 2 clicks
  // switch the records flow to that person.
  for (const p of savedFamily) {
    railItems.push({
      key: `saved-${p.person_id}`,
      initial: (p.name || p.relationship || 'L').charAt(0).toUpperCase(),
      color: p.color || '#C44D6A',
      active: { kind: 'savedFamily', personId: p.person_id },
      isSelf: false,
    });
  }
  // Drafts only show on step 1 — they're unpersisted and have nothing
  // to manage in Records. Hiding them on step 2 also prevents the
  // draft-pill → "No profile selected" → onDone() premature-finish
  // path in RecordsStep.
  if (step === 1) {
    hydratedDraft.family.forEach((row) => {
      railItems.push({
        key: `draft-${row.id}`,
        initial: (row.name || row.relationship || 'L').charAt(0).toUpperCase(),
        color: '#C44D6A',
        active: { kind: 'draftFamily', rowId: row.id },
        isSelf: false,
      });
    });
  }

  const isItemActive = (item: RailItem): boolean => {
    if (activeProfile.kind !== item.active.kind) return false;
    if (activeProfile.kind === 'self') return true;
    if (activeProfile.kind === 'savedFamily' && item.active.kind === 'savedFamily') {
      return activeProfile.personId === item.active.personId;
    }
    if (activeProfile.kind === 'draftFamily' && item.active.kind === 'draftFamily') {
      return activeProfile.rowId === item.active.rowId;
    }
    return false;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6"
      onClick={handleDismiss}
    >
      <div
        className="bg-white w-full max-w-[1100px] h-full max-h-[88vh] rounded-2xl shadow-2xl flex flex-col sm:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Profile rail — horizontal strip on mobile, vertical column
            on desktop. Mobile users get the same add/switch affordances
            without losing screen real estate to a side panel. */}
        <aside className="flex flex-row sm:flex-col w-full sm:w-[88px] h-[72px] sm:h-auto shrink-0 bg-[#FBFAF6] border-b sm:border-b-0 sm:border-r border-[#ECEEED] py-3 sm:py-6 px-4 sm:px-3 items-center gap-3 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto">
          {railItems.map((item) => {
            const active = isItemActive(item);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => { setSubScreen(null); setActiveProfile(item.active); }}
                className={`relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-semibold text-white transition-all ${
                  active ? 'ring-2 ring-offset-2 ring-offset-[#FBFAF6] ring-[#206E55]' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ background: item.color }}
                aria-label={item.isSelf ? 'You' : 'Family member'}
              >
                {item.initial}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              track('ehr_onboarding_add_family_clicked', {
                source: 'rail',
              });
              addDraftFamily();
            }}
            className="shrink-0 w-12 h-12 rounded-full border-2 border-dashed border-[#C9CFCD] text-[#8A9290] flex items-center justify-center hover:border-[#206E55] hover:text-[#206E55] hover:bg-[#F0F7F4] transition-colors"
            aria-label="Add family member"
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
        </aside>

        {/* Right column: header / body / footer */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-8 pt-6 pb-2 flex items-center shrink-0 relative">
            {subScreen === null ? (
              <div className="mx-auto flex items-center gap-3">
                <div className={`flex items-center gap-2 ${step !== 1 ? 'opacity-40' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-[#206E55]' : 'border border-[#8A9290]'}`} />
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${step === 1 ? 'text-[#206E55]' : 'text-[#8A9290]'}`}>
                    Profiles
                  </span>
                </div>
                <span className="w-12 h-px bg-[#ECEEED]" />
                <div className={`flex items-center gap-2 ${step !== 2 ? 'opacity-40' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-[#206E55]' : 'border border-[#8A9290]'}`} />
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${step === 2 ? 'text-[#206E55]' : 'text-[#8A9290]'}`}>
                    Records
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={closeSubScreen}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#206E55] hover:text-[#1a5a46] px-2 py-1 rounded"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to records
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="absolute right-8 top-6 text-[#8A9290] hover:text-[#1A1E1C] p-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-10">
            {subScreen === null && step === 1 && userId && (
              <ProfilesStep
                userId={userId}
                persons={persons}
                draft={hydratedDraft}
                setDraft={setDraft}
                activeProfile={activeProfile}
                fetchPersons={fetchPersons}
                savedNotice={savedNotice}
                onFooterChange={setFooter}
                onContinue={({ savedFromSelf, viaSkip, selfWasAlreadySaved, savedName }) => {
                  if (!viaSkip && savedName) {
                    track('ehr_onboarding_profile_saved', {
                      person_type: savedFromSelf ? 'self' : 'family',
                    });
                  }
                  // Skip is the explicit "done with profiles" path —
                  // always advance, no further prompts.
                  if (viaSkip) {
                    track('ehr_onboarding_continue_to_records_tapped', {
                      via: 'skip',
                    });
                    goToStep(2);
                    return;
                  }
                  // Self save: only prompt for a first loved-one on
                  // the FIRST self save (i.e. self had no name/sex on
                  // file before). Subsequent self edits — or a click
                  // back to a saved self via the rail — just advance.
                  if (savedFromSelf) {
                    if (selfWasAlreadySaved) {
                      track('ehr_onboarding_continue_to_records_tapped', {
                        via: 'primary',
                      });
                      goToStep(2);
                      return;
                    }
                    const freshPersons = useEhrStore.getState().persons;
                    const hasSavedFamily = freshPersons.some(p => p.person_id !== userId);
                    if (!hasSavedFamily) {
                      addDraftFamily(savedName);
                      return;
                    }
                    track('ehr_onboarding_continue_to_records_tapped', {
                      via: 'primary',
                    });
                    goToStep(2);
                    return;
                  }
                  // Loved-one save via Create profile: chain another
                  // blank draft so the user can keep adding household
                  // members. Skip is how they exit the loop.
                  addDraftFamily(savedName);
                }}
              />
            )}
            {subScreen === null && step === 2 && userId && (
              <RecordsStep
                userId={userId}
                persons={persons}
                activeProfile={activeProfile}
                setActiveProfile={setActiveProfile}
                onFooterChange={setFooter}
                onUploadForPerson={(personId) => openSubScreen({ kind: 'upload', personId })}
                onConnectForPerson={(personId) => {
                  if (!canConnectRecords) return;
                  openSubScreen({ kind: 'connect', personId });
                }}
                canConnectRecords={canConnectRecords}
                onDone={handleDone}
              />
            )}
            {subScreen?.kind === 'upload' && userId && (
              <UploadSubScreen
                key={`upload-${subScreen.personId}`}
                userId={userId}
                personId={subScreen.personId}
                persons={persons}
                onFooterChange={setFooter}
                onBack={closeSubScreen}
              />
            )}
            {subScreen?.kind === 'connect' && userId && canConnectRecords && (
              <ConnectSubScreen
                key={`connect-${subScreen.personId}`}
                personId={subScreen.personId}
                persons={persons}
                onFooterChange={setFooter}
                onConnected={closeSubScreen}
                onConnectionStarted={(event) => setPendingSyncEvent(event)}
              />
            )}
          </div>

          {/* Primary stays centered (as before); the secondary "Continue
              to records" sits on the right rail so the proceed action is
              clearly available without displacing the create button. */}
          <div className="px-8 py-5 border-t border-[#ECEEED] grid grid-cols-[1fr_auto_1fr] items-center shrink-0">
            <span aria-hidden />
            <button
              onClick={footer.onClick}
              disabled={footer.disabled}
              className="px-10 py-3 rounded-full bg-[#206E55] text-white text-[14px] font-semibold hover:bg-[#1a5a46] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {footer.label}
            </button>
            <div className="justify-self-end">
              {footer.secondary && (
                <button
                  onClick={footer.secondary.onClick}
                  disabled={footer.secondary.disabled}
                  className={
                    footer.secondary.prominent
                      ? "px-5 py-2.5 rounded-full text-[14px] font-semibold text-[#206E55] border-[1.5px] border-[#206E55] hover:bg-[#F0F7F4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      : "px-4 py-2 rounded-full text-[14px] font-medium text-[#6B7370] hover:text-[#1A1E1C] hover:bg-[#F5F4F1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  }
                >
                  {footer.secondary.label}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
