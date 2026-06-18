'use client';

import { X } from 'lucide-react';
import { UploadReportsContent, useUploadReports } from './upload-reports-content';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Person the staged files will be attributed to. The modal locks the
   *  target while files are staged so a profile switch can't silently
   *  redirect a batch. */
  personId: string;
  /** Display name shown in the reassurance line. Falls back are the
   *  caller's responsibility — pass 'this profile' if nothing better. */
  personName: string;
  /** Logged-in user id. Drives the apiPersonId convention (omit for self
   *  uploads, send personId otherwise). */
  userId: string | undefined;
  /** Pre-flight gate (e.g. self profile completeness) called by the
   *  dropzone before accepting files. Returns false to refuse intake. */
  onBeforeAccept?: () => Promise<boolean>;
  /** Optional header link — shows "View all reports" when provided.
   *  The records page omits this because it already IS the library. */
  onViewAllReports?: () => void;
  /** Fired when the user clicks Done on a finished batch (in addition
   *  to dismissFinishedManualJobs + onClose). Lets callers refresh data
   *  / change view as appropriate. */
  onDone?: () => void;
};

export function UploadReportsModal({
  open,
  onClose,
  personId,
  personName,
  userId,
  onBeforeAccept,
  onViewAllReports,
  onDone,
}: Props) {
  const state = useUploadReports({ personId, userId });
  const { stagedFiles, hasManualJobs, manualAllTerminal, uploadStagedFiles, dismissFinishedManualJobs } = state;

  if (!open) return null;

  const doneIsPrimary = manualAllTerminal && stagedFiles.length === 0 && hasManualJobs;
  const primaryCls = 'w-full py-2.5 rounded-xl bg-[#206E55] text-white font-semibold text-sm hover:bg-[#1a5a46] transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const secondaryCls = 'w-full py-2.5 rounded-xl border border-[#ECEEED] font-semibold text-sm text-[#1A1E1C] hover:bg-[#F8FAF9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-5 max-w-2xl w-full max-h-[calc(100vh-6rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — fixed. */}
        <div className="flex items-center justify-between mb-4 gap-3 shrink-0">
          <h3 className="font-semibold text-[#141515] text-base">Add reports</h3>
          <div className="flex items-center gap-3">
            {onViewAllReports && (
              <button
                onClick={() => { onClose(); onViewAllReports(); }}
                className="text-[12px] font-semibold text-[#206E55] hover:text-[#1a5a46]"
              >
                View all reports
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#6B7370] hover:text-[#1A1E1C] p-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <UploadReportsContent
          state={state}
          personId={personId}
          personName={personName}
          userId={userId}
          onBeforeAccept={onBeforeAccept}
        />
        {/* Primary actions — fixed at the bottom, layout stable across
            states. Visual hierarchy flips when the batch is done: Upload
            quiets to a secondary outline (no work to do), Done takes
            over as the primary green CTA. */}
        <div className="mt-4 flex flex-col gap-2 shrink-0">
          <button
            onClick={uploadStagedFiles}
            disabled={stagedFiles.length === 0}
            className={doneIsPrimary ? secondaryCls : primaryCls}
          >
            {stagedFiles.length > 0
              ? `Upload ${stagedFiles.length} report${stagedFiles.length === 1 ? '' : 's'}`
              : 'Upload'}
          </button>
          <button
            onClick={() => {
              dismissFinishedManualJobs();
              onClose();
              onDone?.();
            }}
            disabled={!doneIsPrimary}
            className={doneIsPrimary ? primaryCls : secondaryCls}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
