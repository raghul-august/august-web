import { useEhrStore } from '@/stores/ehr-store';

/**
 * Shared in-memory store for File blobs that have been handed off to
 * the background upload pipeline. Keyed by job id (the same id the
 * runner sees in `useEhrStore.uploadJobs`).
 *
 * Lives outside the zustand store because File objects don't round-trip
 * through zustand's persisted middleware cleanly, and outside React
 * state because multiple surfaces (the upload modal, the background
 * runner, retry handlers) need to share the same map across route
 * changes. The module-scope singleton survives navigation between
 * `/ehr` and `/records` so an upload kicked off on one page can finish
 * (and be retried) on the other.
 *
 * Exported as a ref-shaped object so it can be passed directly to
 * `BackgroundUploadRunner`'s `MutableRefObject<Map<string, File>>` prop
 * without any wrapping at call sites.
 */
export const backgroundUploadFilesRef: { current: Map<string, File> } = {
  current: new Map<string, File>(),
};

/**
 * Re-submit a previously-failed background upload. Replaces the failed
 * job with a fresh `uploading` entry under a new id so the runner picks
 * it up cleanly (its module-scope `startedJobs` / `finishedJobs` sets
 * key on job id, so a new id sidesteps both). The original File is
 * preserved in the singleton map until the runner consumes it.
 *
 * Called from both the upload modal's failure list and the landing
 * page's in-flight list, so it lives at module scope rather than being
 * duplicated per caller.
 */
export function retryBackgroundUploadJob(failedJobId: string): void {
  const { uploadJobs, addUploadJob, removeUploadJob } = useEhrStore.getState();
  const failed = uploadJobs.find(j => j.id === failedJobId);
  if (!failed || failed.status !== 'failed') return;
  const file = backgroundUploadFilesRef.current.get(failedJobId);
  if (!file) return;
  const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  backgroundUploadFilesRef.current.set(newId, file);
  backgroundUploadFilesRef.current.delete(failedJobId);
  addUploadJob({
    id: newId,
    fileName: failed.fileName,
    personId: failed.personId,
    apiPersonId: failed.apiPersonId,
    status: 'uploading',
    startedAt: Date.now(),
  });
  removeUploadJob(failedJobId);
}
