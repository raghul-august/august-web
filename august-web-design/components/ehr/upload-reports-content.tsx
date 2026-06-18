'use client';

import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useEhrStore, type UploadJob } from '@/stores/ehr-store';
import {
  backgroundUploadFilesRef,
  retryBackgroundUploadJob,
} from '@/utils/background-upload-files';
import { track } from '@/services/analytics-service';
import { trackKeyedOnce } from '@/services/ehr-analytics';
import { ReportUploadSection } from './report-upload-section';
import { UploadProgressBar } from './health-dashboard/upload-progress-bar';

/**
 * Shared state + actions for the upload-reports flow. Owned by the
 * top-level component (modal or wizard sub-screen) so it can render
 * its own primary CTA (footer button) using the same `stagedFiles`
 * count + `uploadStagedFiles` action this hook exposes.
 *
 * The hook intentionally does NOT render anything — that's the content
 * component's job. This split lets us reuse the body inside the upload
 * modal AND inside the onboarding wizard's records sub-screen without
 * either side reaching into the other's chrome.
 */
export type UploadReportsState = {
  stagedFiles: File[];
  manualJobs: UploadJob[];
  hasManualJobs: boolean;
  manualInFlight: boolean;
  manualAllTerminal: boolean;
  manualDoneCount: number;
  manualFailedCount: number;
  stageFiles: (files: File[], targetPersonId: string) => void;
  removeStagedFile: (idx: number) => void;
  uploadStagedFiles: () => void;
  dismissFinishedManualJobs: () => void;
};

export function useUploadReports({
  personId,
  userId,
}: {
  personId: string;
  userId: string | undefined;
}): UploadReportsState {
  const uploadJobs = useEhrStore(s => s.uploadJobs);

  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedTargetPersonId, setStagedTargetPersonId] = useState<string | null>(null);

  const stageFiles = useCallback((files: File[], targetPersonId: string) => {
    track('ehr_upload_files_staged', {
      mode: 'background',
      file_count: files.length,
      person_type: targetPersonId === userId ? 'self' : 'family',
    });
    setStagedFiles(prev => [...prev, ...files]);
    setStagedTargetPersonId(targetPersonId);
  }, [userId]);

  const removeStagedFile = useCallback((idx: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const enqueueBackgroundUploads = useCallback(
    (files: File[], targetPersonId: string) => {
      const addUploadJob = useEhrStore.getState().addUploadJob;
      for (const file of files) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        backgroundUploadFilesRef.current.set(id, file);
        addUploadJob({
          id,
          fileName: file.name,
          personId: targetPersonId,
          // Backend contract: omit person_id when uploading to self.
          apiPersonId: targetPersonId !== userId ? targetPersonId : undefined,
          status: 'uploading',
          startedAt: Date.now(),
        });
      }
    },
    [userId],
  );

  const uploadStagedFiles = useCallback(() => {
    if (stagedFiles.length === 0 || !stagedTargetPersonId) return;
    if (stagedTargetPersonId !== personId) {
      track('ehr_upload_cancelled', {
        reason: 'target_person_changed',
        file_count: stagedFiles.length,
      });
      setStagedFiles([]);
      setStagedTargetPersonId(null);
      return;
    }
    track('ehr_upload_started', {
      mode: 'background',
      file_count: stagedFiles.length,
      person_type: stagedTargetPersonId === userId ? 'self' : 'family',
    });
    enqueueBackgroundUploads(stagedFiles, stagedTargetPersonId);
    setStagedFiles([]);
    setStagedTargetPersonId(null);
  }, [stagedFiles, stagedTargetPersonId, personId, enqueueBackgroundUploads, userId]);

  const manualJobs = uploadJobs.filter(j => j.personId === personId);
  const hasManualJobs = manualJobs.length > 0;
  const manualInFlight = manualJobs.some(j => j.status !== 'done' && j.status !== 'failed');
  const manualAllTerminal = hasManualJobs && !manualInFlight;
  const manualDoneCount = manualJobs.filter(j => j.status === 'done').length;
  const manualFailedCount = manualJobs.filter(j => j.status === 'failed').length;

  const dismissFinishedManualJobs = useCallback(() => {
    const { uploadJobs: jobs, removeUploadJob: rm } = useEhrStore.getState();
    for (const j of jobs) {
      if (j.personId !== personId) continue;
      if (j.status === 'done' || j.status === 'failed') rm(j.id);
    }
  }, [personId]);

  return {
    stagedFiles,
    manualJobs,
    hasManualJobs,
    manualInFlight,
    manualAllTerminal,
    manualDoneCount,
    manualFailedCount,
    stageFiles,
    removeStagedFile,
    uploadStagedFiles,
    dismissFinishedManualJobs,
  };
}

/**
 * Renders the upload-reports body: dropzone + reassurance + staged
 * files + in-flight progress card. Parent owns the chrome + primary
 * action button — this component never renders Upload / Done / Close.
 *
 * Pass `showReassurance={false}` to suppress the "make sure these
 * belong to {Name}" line (the wizard already names the profile in its
 * sub-screen header so it'd be redundant there).
 */
export function UploadReportsContent({
  state,
  personId,
  personName,
  userId,
  onBeforeAccept,
  showReassurance = true,
}: {
  state: UploadReportsState;
  personId: string;
  personName: string;
  userId: string | undefined;
  onBeforeAccept?: () => Promise<boolean>;
  showReassurance?: boolean;
}) {
  const removeUploadJob = useEhrStore(s => s.removeUploadJob);
  const {
    stagedFiles,
    manualJobs,
    hasManualJobs,
    manualAllTerminal,
    manualDoneCount,
    manualFailedCount,
    stageFiles,
    removeStagedFile,
  } = state;
  const failedJobs = manualJobs.filter(j => j.status === 'failed');

  useEffect(() => {
    if (!manualAllTerminal || manualJobs.length === 0) return;
    const key = manualJobs.map(j => `${j.id}:${j.status}`).join('|');
    trackKeyedOnce(key, 'ehr_upload_completed', {
      mode: 'background',
      file_count: manualJobs.length,
      failed_count: manualFailedCount,
    });
  }, [manualAllTerminal, manualFailedCount, manualJobs]);

  return (
    <>
      <div className="shrink-0">
        <ReportUploadSection
          personId={personId}
          userId={userId}
          onBackgroundUpload={stageFiles}
          onBeforeAccept={onBeforeAccept}
          targetLocked={stagedFiles.length > 0}
        />
      </div>
      {showReassurance && (
        <p className="shrink-0 mt-2 text-[11px] leading-relaxed text-[#6B7370] text-center">
          Please make sure these belong to{' '}
          <span className="font-semibold text-[#1A1E1C]">{personName}</span>
          {' '}&mdash; you can move them to another profile later from Records section on the sidebar.
        </p>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1 mt-3 space-y-3">
        {stagedFiles.length > 0 && (
          <ul className="space-y-1.5">
            {stagedFiles.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#F8FAF9] border border-[#E4E8E6]"
              >
                <span className="text-[12px] text-[#1A1E1C] truncate flex-1" title={f.name}>{f.name}</span>
                <button
                  onClick={() => removeStagedFile(i)}
                  className="text-[#8A9290] hover:text-[#1A1E1C] p-1 rounded"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {hasManualJobs && (
          <div className="rounded-2xl border border-[#E4E8E6] bg-white p-4">
            <div className="flex items-baseline justify-between gap-2 mb-2.5">
              <span className="text-[13px] font-semibold text-[#1A1E1C]">
                {manualAllTerminal ? 'All set' : 'Processing reports'}
              </span>
              <span className="text-[11px] text-[#6B7370] tabular-nums shrink-0">
                {manualDoneCount} of {manualJobs.length} added
                {manualFailedCount > 0 ? ` · ${manualFailedCount} failed` : ''}
              </span>
            </div>
            <UploadProgressBar jobs={manualJobs} allTerminal={manualAllTerminal} />
            {failedJobs.length > 0 && (
              <ul className="mt-3 pt-3 border-t border-[#ECEEED] space-y-1.5">
                {failedJobs.map(job => (
                  <li
                    key={job.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#FEF1F1] border border-[#F5D5D5]"
                  >
                    <span className="text-[12px] text-[#1A1E1C] truncate flex-1" title={job.fileName}>
                      {job.fileName}
                    </span>
                    <span className="text-[10px] font-bold text-[#C44040] uppercase tracking-wider shrink-0">
                      Failed
                    </span>
                    <button
                      onClick={() => retryBackgroundUploadJob(job.id)}
                      className="text-[11px] font-semibold text-[#206E55] hover:text-[#1a5a46] px-2 py-0.5 rounded"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => removeUploadJob(job.id)}
                      className="text-[#8A9290] hover:text-[#1A1E1C] p-1 rounded"
                      aria-label="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {hasManualJobs && stagedFiles.length === 0 && !manualAllTerminal && (
          <p className="text-[12px] text-center text-[#6B7370]">
            You can close this window &mdash; we&rsquo;ll keep working in the background.
          </p>
        )}
      </div>
    </>
  );
}
