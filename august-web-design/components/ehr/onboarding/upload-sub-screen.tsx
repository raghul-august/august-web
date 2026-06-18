'use client';

import { useEffect, useRef } from 'react';
import type { PersonInfo } from '@/types/ehr';
import { UploadReportsContent, useUploadReports } from '../upload-reports-content';
import { avatarInitials } from '@/components/ehr/health-dashboard/utils';
import type { FooterState } from './onboarding-wizard';

export function UploadSubScreen({
  userId,
  personId,
  persons,
  onFooterChange,
  onBack,
}: {
  userId: string;
  personId: string;
  persons: PersonInfo[];
  onFooterChange: (footer: FooterState) => void;
  onBack: () => void;
}) {
  const person = persons.find(p => p.person_id === personId);
  const isSelf = personId === userId;
  const personName = person?.name || (isSelf ? 'You' : person?.relationship) || 'this profile';
  const tone = isSelf ? '#206E55' : (person?.color || '#C44D6A');

  const state = useUploadReports({ personId, userId });
  const { stagedFiles, hasManualJobs, manualAllTerminal, manualInFlight, uploadStagedFiles } = state;

  // Footer morphs through three states:
  //   1. Nothing staged & nothing processing → "Upload" disabled (the
  //      dropzone is the obvious next action).
  //   2. Files staged → "Upload N report(s)" primary.
  //   3. A batch is in flight → "Uploading…" disabled.
  //   4. Batch complete (terminal) → "Next →" returns to records grid.
  const onFooterChangeRef = useRef(onFooterChange);
  const onBackRef = useRef(onBack);
  useEffect(() => { onFooterChangeRef.current = onFooterChange; }, [onFooterChange]);
  useEffect(() => { onBackRef.current = onBack; }, [onBack]);
  useEffect(() => {
    let label = 'Upload';
    let disabled = true;
    let onClick: (() => void) | undefined;
    if (manualInFlight && stagedFiles.length === 0) {
      label = 'Uploading…';
      disabled = true;
    } else if (stagedFiles.length > 0) {
      label = `Upload ${stagedFiles.length} report${stagedFiles.length === 1 ? '' : 's'}`;
      disabled = false;
      onClick = uploadStagedFiles;
    } else if (manualAllTerminal) {
      label = 'Next →';
      disabled = false;
      onClick = () => onBackRef.current();
    }
    onFooterChangeRef.current({ label, disabled, onClick });
  }, [stagedFiles.length, hasManualJobs, manualAllTerminal, manualInFlight, uploadStagedFiles]);

  return (
    <div className="max-w-[640px] mx-auto flex flex-col">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold text-white"
          style={{ background: tone }}
        >
          {avatarInitials(personName)}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7370]">Uploading for</p>
          <p className="text-[18px] font-semibold text-[#1A1E1C]">{personName}</p>
        </div>
      </div>
      <h2 className="mt-8 font-serif text-[28px] leading-tight text-[#1A1E1C]">
        Add reports for{' '}
        <span className="font-sans font-semibold text-[#206E55]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro", system-ui, sans-serif' }}>
          {personName}
        </span>
      </h2>
      <p className="mt-2 text-[13px] text-[#6B7370]">
        PDF, JPG, or PNG. Even one is enough to start. You can always add more later.
      </p>
      <div className="mt-6 flex flex-col">
        <UploadReportsContent
          state={state}
          personId={personId}
          personName={personName}
          userId={userId}
          showReassurance={false}
        />
      </div>
    </div>
  );
}
