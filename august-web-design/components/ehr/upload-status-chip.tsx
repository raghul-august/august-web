'use client';

/**
 * Header chip for in-flight background uploads.
 *
 * Sits in the page header (right side, near the date eyebrow or "+ Add"
 * FAB) and shows an aggregate state — "{n} report · {dominantStage}".
 * Clicking the chip reopens the upload modal so the user can see per-file
 * progress. The chip hides only when the person has no upload jobs at all;
 * terminal jobs keep it visible (showing "{n} done" / "{n} failed") until
 * the user dismisses them.
 */

import { useMemo } from 'react';
import { Check, Loader2, AlertTriangle } from 'lucide-react';
import { useEhrStore, type UploadJob, type UploadJobStatus } from '@/stores/ehr-store';

const STATUS_VERB: Record<UploadJobStatus, string> = {
  uploading: 'Uploading',
  extracting: 'Reading',
  indexing: 'Adding to record',
  done: 'Done',
  failed: 'Failed',
};

/** The single status we surface on the chip — picks the most "active" state
 *  among in-flight jobs so the chip reads like one continuous pipeline. */
function dominantInflightStatus(jobs: UploadJob[]): UploadJobStatus {
  // Ordered by lateness in the pipeline: indexing > extracting > uploading.
  // Users care about progress, not the slowest worker.
  if (jobs.some(j => j.status === 'indexing')) return 'indexing';
  if (jobs.some(j => j.status === 'extracting')) return 'extracting';
  return 'uploading';
}

export function UploadStatusChip({ onClick }: { onClick?: () => void }) {
  // Person-scoped so a user uploading on Person A doesn't see the count
  // bleed into Person B's header after a profile switch. To see another
  // person's in-flight work the user switches to that profile.
  //
  // Two flat selectors + a useMemo: filtering inside a zustand selector
  // would return a new array every call (Object.is sees a snapshot
  // change every read) and trigger the "result of getSnapshot should be
  // cached to avoid an infinite loop" warning.
  const allJobs = useEhrStore(s => s.uploadJobs);
  const selectedPersonId = useEhrStore(s => s.selectedPersonId);
  const jobs = useMemo(
    () => selectedPersonId
      ? allJobs.filter(j => j.personId === selectedPersonId)
      : [],
    [allJobs, selectedPersonId],
  );

  const inflight = jobs.filter(j => j.status !== 'done' && j.status !== 'failed');
  const failed = jobs.filter(j => j.status === 'failed');
  const done = jobs.filter(j => j.status === 'done');

  // Hide only when this person has no jobs at all. Terminal jobs persist
  // until dismissed, so the chip stays (as "{n} done" / "{n} failed")
  // through that.
  if (jobs.length === 0) return null;

  const totalActive = inflight.length;
  const dominantStatus = totalActive > 0 ? dominantInflightStatus(inflight) : null;

  const label = totalActive > 0
    ? `${totalActive} report${totalActive === 1 ? '' : 's'} · ${STATUS_VERB[dominantStatus!]}`
    : failed.length > 0
      ? `${failed.length} failed`
      : `${done.length} done`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-[#E4E8E6] bg-white text-[#1A1E1C] hover:bg-[#F8FAF9] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#206E55]/30 focus-visible:ring-offset-2"
      aria-label="Show upload status"
    >
      {totalActive > 0 ? (
        <Loader2 className="h-3.5 w-3.5 text-[#206E55] animate-spin" />
      ) : failed.length > 0 ? (
        <AlertTriangle className="h-3.5 w-3.5 text-[#C44040]" />
      ) : (
        <Check className="h-3.5 w-3.5 text-[#206E55]" />
      )}
      <span>{label}</span>
    </button>
  );
}
