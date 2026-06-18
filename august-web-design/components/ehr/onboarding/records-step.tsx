'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Check, Link2, Upload } from 'lucide-react';
import type { PersonInfo } from '@/types/ehr';
import { useEhrStore } from '@/stores/ehr-store';
import type { ActiveProfile, FooterState } from './onboarding-wizard';

export function RecordsStep({
  userId,
  persons,
  activeProfile,
  setActiveProfile,
  onFooterChange,
  onUploadForPerson,
  onConnectForPerson,
  canConnectRecords,
  onDone,
}: {
  userId: string;
  persons: PersonInfo[];
  activeProfile: ActiveProfile;
  setActiveProfile: (next: ActiveProfile) => void;
  onFooterChange: (footer: FooterState) => void;
  onUploadForPerson: (personId: string) => void;
  onConnectForPerson: (personId: string) => void;
  canConnectRecords: boolean;
  onDone: () => void;
}) {
  const uploadJobs = useEhrStore(s => s.uploadJobs);
  const recentlyUploadedFor = useEhrStore(s => s.recentlyUploadedFor);
  const getProvidersForPerson = useEhrStore(s => s.getProvidersForPerson);

  // Rail order: self first, then saved family in the order persons returns
  // them. Must match the wizard rail render order so "Next" feels visually
  // continuous.
  const orderedPersons = useMemo<PersonInfo[]>(() => {
    const self = persons.find(p => p.person_id === userId);
    const family = persons.filter(p => p.person_id !== userId);
    return self ? [self, ...family] : family;
  }, [persons, userId]);

  const activePerson = useMemo<PersonInfo | undefined>(() => {
    if (activeProfile.kind === 'self') return orderedPersons.find(p => p.person_id === userId);
    if (activeProfile.kind === 'savedFamily') return orderedPersons.find(p => p.person_id === activeProfile.personId);
    return undefined;
  }, [activeProfile, orderedPersons, userId]);

  const activeIdx = activePerson ? orderedPersons.findIndex(p => p.person_id === activePerson.person_id) : -1;
  const isLast = activeIdx >= 0 && activeIdx === orderedPersons.length - 1;
  const nextPerson = !isLast && activeIdx >= 0 ? orderedPersons[activeIdx + 1] : undefined;
  const nextFirstName = nextPerson
    ? (nextPerson.name || (nextPerson.person_id === userId ? 'You' : nextPerson.relationship) || 'next').split(/\s+/)[0]
    : '';

  const advance = useCallback(() => {
    // No active person resolved (e.g. a stale draft pill was clicked):
    // do nothing rather than silently completing onboarding. The user
    // can pick a different rail item.
    if (activeIdx < 0) return;
    if (isLast || !nextPerson) {
      onDone();
      return;
    }
    setActiveProfile(
      nextPerson.person_id === userId
        ? { kind: 'self' }
        : { kind: 'savedFamily', personId: nextPerson.person_id },
    );
  }, [isLast, activeIdx, nextPerson, setActiveProfile, onDone, userId]);

  const onFooterChangeRef = useRef(onFooterChange);
  const advanceRef = useRef(advance);
  useEffect(() => { onFooterChangeRef.current = onFooterChange; }, [onFooterChange]);
  useEffect(() => { advanceRef.current = advance; }, [advance]);
  useEffect(() => {
    onFooterChangeRef.current({
      label: isLast ? 'Finish' : `Next: ${nextFirstName}`,
      onClick: () => advanceRef.current(),
      secondary: {
        label: isLast ? 'Skip and finish' : 'Skip this step',
        onClick: () => advanceRef.current(),
      },
    });
  }, [isLast, nextFirstName]);

  if (!activePerson) {
    return (
      <div className="max-w-[560px] mx-auto text-center pt-10">
        <p className="text-[13px] text-[#8A9290]">No profile selected.</p>
      </div>
    );
  }

  const isSelf = activePerson.person_id === userId;
  const personName = activePerson.name || (isSelf ? 'You' : activePerson.relationship || 'this person');
  const firstName = personName.split(/\s+/)[0];
  const uploadedCount = uploadJobs.filter(
    j => j.personId === activePerson.person_id && j.status === 'done',
  ).length;
  const recentlyUploaded = !!recentlyUploadedFor[activePerson.person_id];
  const providers = getProvidersForPerson(activePerson.person_id);
  const connectedNames = providers.map(pr => pr.platformType || 'Provider');
  const hasAny = uploadedCount > 0 || recentlyUploaded || connectedNames.length > 0;

  return (
    <div className="max-w-[560px] mx-auto">
      <h1 className="font-serif text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.01em] text-[#1A1E1C]">
        {hasAny ? `Add more for ${firstName}` : `Add ${firstName}${firstName.endsWith('s') ? '’' : '’s'} first record`}
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-[#4a5250]">
        {canConnectRecords
          ? 'Start with a report, or connect a provider to pull records automatically.'
          : 'Start with a report. August will organize it into their health record.'}
      </p>

      {(uploadedCount > 0 || connectedNames.length > 0) && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {uploadedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#206E55] bg-[#F0F7F4] border border-[#206E55]/30 rounded-full px-2 py-0.5">
              <Check className="h-3 w-3" strokeWidth={2.5} />
              {uploadedCount} report{uploadedCount === 1 ? '' : 's'}
            </span>
          )}
          {connectedNames.map(n => (
            <span key={n} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#206E55] bg-[#F0F7F4] border border-[#206E55]/30 rounded-full px-2 py-0.5">
              <Check className="h-3 w-3" strokeWidth={2.5} />
              {n}
            </span>
          ))}
        </div>
      )}

      <p className="mt-8 text-[13px] text-[#6B7370]">How would you like to start?</p>

      <div className="mt-3 divide-y divide-[#ECEEED] border-y border-[#ECEEED]">
        <button
          type="button"
          onClick={() => onUploadForPerson(activePerson.person_id)}
          className="group w-full flex items-center gap-4 py-5 text-left hover:bg-[#FAFBFA] transition-colors px-2 -mx-2 rounded"
        >
          <Upload className="h-5 w-5 text-[#1A1E1C] shrink-0" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-[#1A1E1C]">
              {uploadedCount > 0 ? 'Add more reports' : 'Upload a report'}
            </p>
            <p className="text-[12px] text-[#8A9290] mt-0.5">PDF, image, or document</p>
          </div>
        </button>
        {canConnectRecords && (
          <button
            type="button"
            onClick={() => onConnectForPerson(activePerson.person_id)}
            className="group w-full flex items-center gap-4 py-5 text-left hover:bg-[#FAFBFA] transition-colors px-2 -mx-2 rounded"
          >
            <Link2 className="h-5 w-5 text-[#206E55] shrink-0" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[#1A1E1C]">
                {connectedNames.length > 0 ? 'Connect another provider' : 'Connect a provider'}
              </p>
              <p className="text-[12px] text-[#8A9290] mt-0.5">Pull records automatically</p>
            </div>
          </button>
        )}
      </div>

      <p className="mt-6 text-[12px] italic text-[#8A9290]">
        You only need one record to get started.
      </p>
    </div>
  );
}
