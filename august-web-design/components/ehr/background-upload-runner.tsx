'use client';

/**
 * Background runner for EHR report uploads.
 *
 * Headless component (renders nothing) that lives at the page level. Watches
 * `uploadJobs` in the store and drives each job through the pipeline:
 *
 *   uploading -> extracting -> indexing -> done | failed
 *
 * 1. For jobs in `uploading` without a `requestId` yet, run uploadMedia +
 *    submitReportUpload with retry. Flip to `extracting` on success or
 *    `failed` on permanent error / retry budget exhaustion.
 *
 * 2. Once any jobs are in `extracting` or `indexing`, poll
 *    /ehr/report-uploads/status keyed by personId (one poll per affected
 *    person, batched by request_ids belonging to that person). Map each
 *    status row's `ehr_state` back onto the job and flip terminal states.
 *
 * 3. On done/failed transitions: push a toast, invalidate page caches for
 *    the owner person, and call the supplied onJobDone hook so the page can
 *    refetch summaries. Terminal jobs stay in the list until the user
 *    dismisses them.
 */

import { useEffect, useRef } from 'react';
import { useEhrStore, type UploadJob } from '@/stores/ehr-store';
import { uploadMedia } from '@/services/media-service';
import {
  submitReportUpload,
  getReportUploadStatus,
  type ReportUploadStatusRow,
} from '@/services/ehr-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { track } from '@/services/analytics-service';

const POLL_INTERVAL_MS = 15000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes — matches in-modal flow
const UPLOAD_RETRY_BUDGET_MS = 2 * 60 * 1000;
const RETRY_INITIAL_BACKOFF_MS = 1000;
const RETRY_MAX_BACKOFF_MS = 15_000;

/** Process-global sets keyed by job id. These live outside the React tree so
 *  a runner unmount/remount (e.g. landing -> detail view-state flip while a
 *  job is still in-flight) doesn't reset them, which would otherwise cause a
 *  second uploadMedia for the same file or a second terminal-toast firing.
 *  Cleared on full page reload — same lifetime as the store. */
const startedJobs = new Set<string>();
const finishedJobs = new Set<string>();

function isRetryableUploadError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } } | undefined)?.response?.status;
  if (status == null) return true;
  if (status === 408 || status === 429) return true;
  return status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(op: () => Promise<T>, deadline: number): Promise<T> {
  let backoff = RETRY_INITIAL_BACKOFF_MS;
  let lastErr: unknown;
  while (true) {
    try {
      return await op();
    } catch (err) {
      lastErr = err;
      if (!isRetryableUploadError(err)) throw err;
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw lastErr;
      await sleep(Math.min(backoff, remaining));
      backoff = Math.min(backoff * 2, RETRY_MAX_BACKOFF_MS);
    }
  }
}

/**
 * Translate the per-report status row's `ehr_state` into our pipeline state.
 * Backend states: pending | queued | building | complete | failed | skipped.
 */
function mapEhrState(state: ReportUploadStatusRow['ehr_state']): UploadJob['status'] {
  switch (state) {
    case 'pending':
    case 'queued':
      return 'extracting';
    case 'building':
      return 'indexing';
    case 'complete':
    case 'skipped':
      return 'done';
    case 'failed':
      return 'failed';
    default:
      return 'extracting';
  }
}

interface RunnerProps {
  /** File blobs the user dropped, keyed by job id. The store can't hold File
   *  objects (zustand serializes oddly with File), so the runner keeps them
   *  in a separate live map. Page passes this in by reference. */
  fileMap: React.MutableRefObject<Map<string, File>>;
  /** Called when a job hits `done`. Page wires this to `fetchEhr` +
   *  `markRecentlyUploaded` so the dashboard reflects new data. */
  onJobDone?: (job: UploadJob) => void;
}

export function BackgroundUploadRunner({ fileMap, onJobDone }: RunnerProps) {
  const jobs = useEhrStore(s => s.uploadJobs);
  const updateUploadJob = useEhrStore(s => s.updateUploadJob);
  const pushToast = useEhrStore(s => s.pushToast);
  const invalidatePersonPages = useEhrStore(s => s.invalidatePersonPages);
  const markRecentlyUploaded = useEhrStore(s => s.markRecentlyUploaded);

  /** Per-person polling interval handles. One poll loop per person — all
   *  in-flight jobs for that person share it. */
  const pollHandlesRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  /** Per-person poll start time, used to enforce POLL_TIMEOUT_MS. */
  const pollStartedAtRef = useRef<Map<string, number>>(new Map());

  // ── Start uploads for newly-added jobs ─────────────────────
  useEffect(() => {
    for (const job of jobs) {
      if (job.status !== 'uploading') continue;
      if (job.requestId) continue;
      if (startedJobs.has(job.id)) continue;
      const file = fileMap.current.get(job.id);
      if (!file) continue;

      startedJobs.add(job.id);
      runUploadPipeline(job, file).catch(err => {
        logger.error('[BG upload] Pipeline failed', serializeError(err));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  // ── Drive per-person status polling ────────────────────────
  useEffect(() => {
    // Group submitted-but-not-terminal jobs by personId. Each group gets
    // a single polling loop that batches all request_ids.
    const groups = new Map<string, UploadJob[]>();
    for (const job of jobs) {
      if (!job.requestId) continue;
      if (job.status !== 'extracting' && job.status !== 'indexing') continue;
      const arr = groups.get(job.personId) ?? [];
      arr.push(job);
      groups.set(job.personId, arr);
    }

    // Start a poll loop for any new person that isn't already polling.
    for (const [personId, group] of groups) {
      if (pollHandlesRef.current.has(personId)) continue;
      const apiPersonId = group[0].apiPersonId;
      pollStartedAtRef.current.set(personId, Date.now());
      const handle = setInterval(
        () => pollPerson(personId, apiPersonId),
        POLL_INTERVAL_MS,
      );
      pollHandlesRef.current.set(personId, handle);
      // Kick off an immediate first poll so users don't wait the full
      // interval for the first state transition.
      pollPerson(personId, apiPersonId).catch(() => undefined);
    }

    // Stop polling for persons that have no more in-flight jobs.
    for (const personId of Array.from(pollHandlesRef.current.keys())) {
      if (!groups.has(personId)) {
        const handle = pollHandlesRef.current.get(personId);
        if (handle) clearInterval(handle);
        pollHandlesRef.current.delete(personId);
        pollStartedAtRef.current.delete(personId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  // ── Fire terminal-state side effects exactly once ─────────
  useEffect(() => {
    for (const job of jobs) {
      if (job.status !== 'done' && job.status !== 'failed') continue;
      if (finishedJobs.has(job.id)) continue;
      finishedJobs.add(job.id);

      if (job.status === 'done') {
        track('ehr_upload_file_completed', {
          mode: 'background',
          person_type: job.apiPersonId ? 'family' : 'self',
        });
        fileMap.current.delete(job.id);
        pushToast({
          kind: 'success',
          title: `${job.fileName} added to your record`,
        });
        markRecentlyUploaded(job.personId);
        invalidatePersonPages(job.personId);
        onJobDone?.(job);
        // Finished jobs are kept until the user explicitly dismisses them
        // (the Done / View Records click + per-row X in InFlightUploadList).
        // Auto-clearing would silently collapse the modal's Done summary
        // back to the dropzone, which looks like the modal closed itself
        // mid-batch.
      } else {
        track('ehr_upload_file_failed', {
          mode: 'background',
          person_type: job.apiPersonId ? 'family' : 'self',
          stage: job.requestId ? 'processing' : 'upload_or_submit',
        });
        // Keep the file in the map so the user can retry without
        // re-picking. Cleared when the user explicitly dismisses or
        // retries the job.
        pushToast({
          kind: 'error',
          title: `${job.fileName} failed`,
          body: job.errorMessage || 'Try uploading again.',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  // ── Cleanup on unmount ────────────────────────────────────
  useEffect(() => {
    // Capture the ref into a local — by the time the cleanup runs, the
    // map reference is stable but React lint wants the snapshot for safety.
    const handles = pollHandlesRef.current;
    return () => {
      for (const handle of handles.values()) clearInterval(handle);
      handles.clear();
    };
  }, []);

  // ── Pipeline implementation ───────────────────────────────

  async function runUploadPipeline(job: UploadJob, file: File): Promise<void> {
    const deadline = Date.now() + UPLOAD_RETRY_BUDGET_MS;
    try {
      const uploaded = await withRetry(() => uploadMedia(file), deadline);
      const queued = await withRetry(
        () => submitReportUpload({
          file: uploaded.fileURL,
          personId: job.apiPersonId,
          docType: null,
        }),
        deadline,
      );
      updateUploadJob(job.id, {
        status: 'extracting',
        requestId: queued.request_id,
      });
    } catch (err) {
      logger.error('[BG upload] Failed to upload/submit after retries', serializeError(err));
      updateUploadJob(job.id, {
        status: 'failed',
        errorMessage: 'Upload failed, try again.',
      });
    }
  }

  async function pollPerson(personId: string, apiPersonId: string | undefined): Promise<void> {
    // Re-read current state to avoid stale closures from the interval.
    const current = useEhrStore.getState().uploadJobs.filter(
      j => j.personId === personId
        && j.requestId
        && (j.status === 'extracting' || j.status === 'indexing'),
    );
    if (current.length === 0) return;

    const requestIds = current.map(j => j.requestId!).filter(Boolean);
    if (requestIds.length === 0) return;

    // Timeout guard: any job that's been polling for longer than
    // POLL_TIMEOUT_MS gets a soft-failure terminal state so the chip
    // doesn't spin forever if the backend is wedged.
    const startedAt = pollStartedAtRef.current.get(personId) ?? Date.now();
    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      for (const j of current) {
        updateUploadJob(j.id, {
          status: 'failed',
          errorMessage: 'Still processing in the background. Refresh later.',
        });
      }
      return;
    }

    try {
      const status = await getReportUploadStatus({ requestIds, personId: apiPersonId });
      const rows = status.reports ?? [];
      if (rows.length === 0) return;
      const byRequest = new Map(rows.map(r => [r.request_id, r]));

      for (const j of current) {
        const row = byRequest.get(j.requestId!);
        if (!row) continue;
        const next = mapEhrState(row.ehr_state);
        if (next !== j.status) {
          if (next === 'failed') {
            updateUploadJob(j.id, {
              status: 'failed',
              errorMessage: 'Backend failed to process this report.',
            });
          } else {
            updateUploadJob(j.id, { status: next });
          }
        }
      }
    } catch (err) {
      // Transient poll failures shouldn't kill the loop. The interval keeps
      // firing; a permanent failure will surface via the timeout guard above.
      logger.error('[BG upload] Status poll failed', serializeError(err));
    }
  }

  return null;
}
