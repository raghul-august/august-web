'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, CheckCircle2, AlertTriangle, FileText, X } from 'lucide-react';
import {
  uploadMedia,
  isValidReportFile,
  REPORT_FILE_ACCEPT,
} from '@/services/media-service';
import {
  submitReportUpload,
  getReportUploadStatus,
} from '@/services/ehr-service';
import { useEhrStore, EMPTY_UPLOAD_SESSION, type PendingUploadFile } from '@/stores/ehr-store';
import { UploadTargetRow } from './upload-target-row';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { track } from '@/services/analytics-service';
import { useTrackOnce } from '@/services/ehr-analytics';


// ── Constants ──────────────────────────────────────────────────

const POLL_INTERVAL_MS = 4500;
const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/** Max concurrent file pipelines. Browsers cap connections per origin around
 *  6; leave headroom for the status-polling request and other in-flight calls. */
const MAX_CONCURRENT_UPLOADS = 4;

/** Per-file retry budget. Within this window we keep retrying transient
 *  failures with exponential backoff. Past this, the file goes to 'errored'. */
const UPLOAD_RETRY_BUDGET_MS = 2 * 60 * 1000; // 2 minutes

const RETRY_INITIAL_BACKOFF_MS = 1000;
const RETRY_MAX_BACKOFF_MS = 15_000;


// ── Retry helpers ──────────────────────────────────────────────

/** Whether an error from axios is worth retrying. Treats network errors and
 *  5xx as retryable; treats explicit 408/429 as retryable; everything else
 *  (4xx validation, 401/403 auth) is permanent — no point retrying. */
function isRetryableUploadError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } } | undefined)?.response?.status;
  if (status == null) return true; // network/timeout/no response
  if (status === 408 || status === 429) return true;
  return status >= 500;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Run `op` and retry on retryable errors with exponential backoff until
 *  `deadline` (epoch ms) elapses. */
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


// ── Helpers ────────────────────────────────────────────────────

function makeLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}


// ── Component ──────────────────────────────────────────────────

export function ReportUploadSection({
  personId,
  userId,
  onReady,
  onBackgroundUpload,
  onBeforeAccept,
  targetLocked: externalTargetLocked,
}: {
  personId: string;
  /** The authenticated user's own id. When equal to personId we omit the
   *  person_id query param per backend contract for self views. */
  userId: string | undefined;
  /** Optional caller hook fired when the upload batch reaches `ready` phase.
   *  The component always invalidates page caches itself; this is for caller
   *  effects (e.g. transitioning the EHR landing view into the detail view
   *  once there's data to show). */
  onReady?: () => void;
  /** When provided, drops and picks route into the page-level background
   *  pipeline instead of staging into the in-card queue. Lets the caller
   *  close any wrapping modal so the user sees the header chip take over. */
  onBackgroundUpload?: (files: File[], targetPersonId: string) => void;
  /** Optional gate fired before any files are accepted from drop or pick.
   *  If it resolves false (e.g. the caller opened a profile modal and the
   *  user dismissed it), the files are silently discarded. Lets the
   *  landing page require self.name/sex before the first ingest action. */
  onBeforeAccept?: () => Promise<boolean>;
  /** Caller-driven lock for the target picker. The component already locks
   *  internally once any in-card file is submitted, but when the caller
   *  uses onBackgroundUpload the in-card queue stays empty — pass true
   *  while the caller is holding staged files so a mid-stage target
   *  change can't redirect already-staged files to a different person. */
  targetLocked?: boolean;
}) {
  const invalidatePersonPages = useEhrStore(s => s.invalidatePersonPages);
  const markRecentlyUploaded = useEhrStore(s => s.markRecentlyUploaded);
  const setUploadSession = useEhrStore(s => s.setUploadSession);
  const persons = useEhrStore(s => s.persons);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload session lives in the store, keyed by personId, so that when the
  // page transitions landing -> detail (and our position in the JSX tree
  // changes), the upload card hydrates from the existing session and keeps
  // showing progress instead of remounting empty.
  const session = useEhrStore(s => s.uploadSessions[personId] ?? EMPTY_UPLOAD_SESSION);
  const files = session.files;
  const status = session.status;
  const phase = session.phase;
  const setFiles = (
    updater: (prev: PendingUploadFile[]) => PendingUploadFile[],
  ) => setUploadSession(personId, prev => ({ files: updater(prev.files) }));

  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { track: trackTerminalUpload } = useTrackOnce();

  // Per-batch target person. Defaults to the currently-viewed person but
  // the user can switch via UploadTargetRow before submitting — that
  // override does NOT mutate the global selectedPersonId in the store.
  const targetPersonId = session.targetPersonId ?? personId;
  const setTargetPersonId = (id: string) =>
    setUploadSession(personId, { targetPersonId: id });
  // Once any file has been submitted to the queue, lock the picker — a
  // mid-batch switch would split owners across the same upload. The
  // external override covers the background-upload mode where the caller
  // is holding staged files outside this component.
  const targetLocked = externalTargetLocked
    || files.some(f => f.status === 'submitted' || f.status === 'uploading');

  // person_id to send to the backend; omit when uploading to self.
  const apiPersonId = targetPersonId !== userId ? targetPersonId : undefined;

  // Only count files that successfully reached the backend queue.
  const submittedFiles = files.filter(f => f.status === 'submitted' && f.requestId);
  const submittedRequestIds = submittedFiles.map(f => f.requestId!);
  // The user's intent: every file they meant to upload, excluding client-side
  // rejects (unsupported types). This is the denominator for the progress
  // bars and gates the polling hook from firing "ready" on a partial batch.
  const intendedFiles = files.filter(f => f.status !== 'rejected');
  const intendedCount = intendedFiles.length;
  const allIntendedSubmitted =
    intendedCount > 0 &&
    !intendedFiles.some(f => f.status === 'queued' || f.status === 'uploading');

  // ── Status polling ──────────────────────────────────────────
  // Inlined (was a hook) since results now route to the store. While there
  // are non-terminal request IDs and uploads aren't done, poll the status
  // endpoint every POLL_INTERVAL_MS until either the terminal condition
  // fires or POLL_TIMEOUT_MS elapses.
  const requestIdsKey = submittedRequestIds.join(',');
  useEffect(() => {
    const requestIds = requestIdsKey ? requestIdsKey.split(',') : [];
    const expectedCount = requestIds.length;
    if (requestIds.length === 0) {
      setUploadSession(personId, { phase: 'idle' });
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const startedAt = Date.now();
    setUploadSession(personId, { phase: 'polling' });

    const poll = async () => {
      if (cancelled) return;
      try {
        const next = await getReportUploadStatus({ requestIds, personId: apiPersonId });
        if (cancelled) return;
        setUploadSession(personId, { status: next });

        const finished =
          allIntendedSubmitted &&
          next.ehr_queued_count === 0 &&
          next.ehr_complete_count + next.ehr_failed_count === expectedCount;
        if (finished) {
          setUploadSession(personId, { phase: 'ready' });
          return;
        }

        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          setUploadSession(personId, { phase: 'timeout' });
          return;
        }

        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        logger.error('[Report uploads] Status poll failed', serializeError(err));
        if (!cancelled && Date.now() - startedAt < POLL_TIMEOUT_MS) {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        } else if (!cancelled) {
          setUploadSession(personId, { phase: 'timeout' });
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [requestIdsKey, personId, apiPersonId, allIntendedSubmitted, setUploadSession]);

  // Reveal data progressively as it lands.
  // - First file to reach the health record: mark recently-uploaded (so the
  //   landing-view gate flips), drop page caches, and fire the page-level
  //   onReady (which transitions landing -> detail). One-shot.
  // - Each subsequent completion: drop caches so already-mounted sections
  //   refetch and pick up the new rows. Avoids waiting until the whole batch
  //   is done — important for long batches that may hit the 10-min poll
  //   timeout before everything finishes.
  const firstResultFiredRef = useRef(false);
  const lastSeenCompleteRef = useRef(0);
  const ehrComplete = status?.ehr_complete_count ?? 0;

  useEffect(() => {
    if (ehrComplete === 0) return;

    if (!firstResultFiredRef.current) {
      firstResultFiredRef.current = true;
      markRecentlyUploaded(personId);
      invalidatePersonPages(personId);
      onReady?.();
    } else if (ehrComplete > lastSeenCompleteRef.current) {
      invalidatePersonPages(personId);
    }
    lastSeenCompleteRef.current = ehrComplete;
  }, [ehrComplete, personId, markRecentlyUploaded, invalidatePersonPages, onReady]);

  // Final invalidation on terminal phase — covers the case where the last
  // status response arrived in the same render as the phase transition,
  // so the previous effect's "subsequent completion" branch had nothing
  // newer to react to.
  useEffect(() => {
    if (phase === 'ready' || phase === 'timeout') {
      if (firstResultFiredRef.current) invalidatePersonPages(personId);
    }
  }, [phase, personId, invalidatePersonPages]);

  // ── File staging ────────────────────────────────────────────

  const addFiles = (list: File[]) => {

    // Background mode: hand the raw files off to the page-level pipeline
    // and skip the in-card staging queue entirely. The caller is expected
    // to close any wrapping modal so the user sees the header chip take
    // over. We still drop unsupported types client-side so the user gets
    // immediate feedback instead of a backend error toast.
    if (onBackgroundUpload) {
      const valid: File[] = [];
      for (const file of list) {
        if (isValidReportFile(file)) valid.push(file);
      }
      track('ehr_upload_files_selected', {
        mode: 'background',
        file_count: list.length,
        valid_count: valid.length,
        rejected_count: list.length - valid.length,
      });
      if (valid.length > 0) {
        onBackgroundUpload(valid, targetPersonId);
      }
      return;
    }

    const next: PendingUploadFile[] = list.map(file => {
      const valid = isValidReportFile(file);
      return {
        localId: makeLocalId(),
        file,
        status: valid ? 'queued' : 'rejected',
        error: valid ? undefined : 'Unsupported file type',
      };
    });
    track('ehr_upload_files_selected', {
      mode: 'inline',
      file_count: list.length,
      valid_count: next.filter(f => f.status === 'queued').length,
      rejected_count: next.filter(f => f.status === 'rejected').length,
    });
    setFiles(prev => [...prev, ...next]);
  };

  // Run the optional caller gate before passing files through. Drop/pick
  // both call this so a dismissed gate (e.g. profile modal) silently
  // drops the files instead of leaking them into the upload pipeline.
  // Takes a pre-snapshotted File[] — callers must snapshot synchronously
  // inside the event handler because the source FileList / DataTransfer
  // is invalidated as soon as we clear the input or yield to the gate's
  // awaited promise.
  const acceptFiles = async (files: File[]): Promise<void> => {
    if (onBeforeAccept && !(await onBeforeAccept())) return;
    addFiles(files);
  };

  const onPick = () => fileInputRef.current?.click();
  const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = ''; // allow re-picking the same file
    if (files.length) void acceptFiles(files);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length) void acceptFiles(files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const removeFile = (localId: string) => {
    setFiles(prev => prev.filter(f => f.localId !== localId));
  };

  // ── Submit ──────────────────────────────────────────────────

  /**
   * Run a single file through the two-step pipeline (uploadMedia ->
   * submitReportUpload), retrying transient failures within
   * UPLOAD_RETRY_BUDGET_MS. Once uploadMedia succeeds we don't re-upload the
   * blob on a submit failure — only the submit step retries past that point.
   */
  const runOneUpload = async (pending: PendingUploadFile): Promise<void> => {
    setFiles(prev => prev.map(f =>
      f.localId === pending.localId ? { ...f, status: 'uploading' } : f
    ));

    const deadline = Date.now() + UPLOAD_RETRY_BUDGET_MS;
    try {
      const uploaded = await withRetry(() => uploadMedia(pending.file), deadline);
      const queued = await withRetry(
        () => submitReportUpload({
          file: uploaded.fileURL,
          personId: apiPersonId,
          docType: null,
        }),
        deadline,
      );
      setFiles(prev => prev.map(f =>
        f.localId === pending.localId
          ? { ...f, status: 'submitted', requestId: queued.request_id }
          : f
      ));
    } catch (err) {
      logger.error('[Report uploads] Failed to upload/submit after retries', serializeError(err));
      track('ehr_upload_file_failed', {
        mode: 'inline',
        stage: 'upload_or_submit',
      });
      setFiles(prev => prev.map(f =>
        f.localId === pending.localId
          ? { ...f, status: 'errored', error: 'Upload failed after retries — try again' }
          : f
      ));
    }
  };

  const submitQueued = async () => {
    const toSubmit = files.filter(f => f.status === 'queued');
    if (toSubmit.length === 0) return;
    track('ehr_upload_started', {
      mode: 'inline',
      file_count: toSubmit.length,
    });
    setSubmitting(true);

    // Worker-pool parallelism: spin up MAX_CONCURRENT_UPLOADS workers, each
    // pulls the next pending file off a shared queue and runs the pipeline.
    // This caps in-flight requests so we don't saturate the browser's
    // per-origin connection budget while polling and other calls are running.
    const queue = [...toSubmit];
    const workers = Array.from(
      { length: Math.min(MAX_CONCURRENT_UPLOADS, queue.length) },
      async () => {
        while (queue.length > 0) {
          const pending = queue.shift();
          if (!pending) return;
          await runOneUpload(pending);
        }
      },
    );
    await Promise.all(workers);

    setSubmitting(false);
  };

  // ── Derived UI state ────────────────────────────────────────

  const queuedCount = files.filter(f => f.status === 'queued').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;
  const erroredCount = files.filter(f => f.status === 'errored' || f.status === 'rejected').length;
  const submittedCount = submittedFiles.length;

  const processed = status?.processed_report_count ?? 0;
  const ehrQueued = status?.ehr_queued_count ?? 0;
  const ehrFailed = status?.ehr_failed_count ?? 0;
  // ehrComplete already derived above for the progressive-reveal effect.

  useEffect(() => {
    if (phase !== 'ready' && phase !== 'timeout') return;
    const key = `${phase}:${requestIdsKey}:${intendedCount}:${ehrFailed}:${erroredCount}`;

    if (phase === 'ready') {
      trackTerminalUpload(key, 'ehr_upload_completed', {
        mode: 'inline',
        file_count: intendedCount,
        failed_count: ehrFailed + erroredCount,
      });
    } else {
      trackTerminalUpload(key, 'ehr_upload_timeout', {
        mode: 'inline',
        file_count: intendedCount,
        completed_count: ehrComplete,
        failed_count: ehrFailed + erroredCount,
      });
    }
  }, [ehrComplete, ehrFailed, erroredCount, intendedCount, phase, requestIdsKey, trackTerminalUpload]);

  // Progress block visible from the moment the user kicks off an upload —
  // bars start at 0/N and fill in as files submit, get processed, and land
  // in the health record.
  const showProgress = intendedCount > 0 && (uploadingCount > 0 || submittedCount > 0);

  return (
    <div className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-[#1A1E1C]">Add reports</h2>
          <p className="text-[12px] text-[#6B7370] mt-0.5">
            Upload labs, prescriptions, or discharge summaries. We&apos;ll add them to the health record.
          </p>
        </div>
      </div>

      {/* Drop zone — placed above the target picker so the primary
          action (pick a file) is the first thing the user sees; the
          "Saving to" row sits below as a confirmation/correction step. */}
      <div
        onClick={onPick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`mt-3 flex flex-col items-center justify-center gap-1.5 border border-dashed rounded-lg cursor-pointer transition-colors py-5 ${
          dragOver
            ? 'border-[#206E55] bg-[#EAFAF2]'
            : 'border-[#D6DCD9] bg-[#FBFCFC] hover:border-[#206E55]/50 hover:bg-[#F8FAF9]'
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPick(); }}
      >
        <Upload className="h-5 w-5 text-[#206E55]" />
        <p className="text-[13px] font-medium text-[#1A1E1C]">Drop files or click to upload</p>
        <p className="text-[11px] text-[#8A9290]">PDF, DOCX, JPG, PNG, WEBP, HEIC, TXT</p>
      </div>

      {/* Upload target picker — the user's last chance to catch a
          wrong-profile upload before files leave the browser. Hidden
          until persons load to avoid a chip-less first paint flicker. */}
      {persons.length > 0 && userId && (
        <div className="mt-3">
          <UploadTargetRow
            persons={persons}
            targetPersonId={targetPersonId}
            userId={userId}
            onChange={setTargetPersonId}
            disabled={targetLocked}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={REPORT_FILE_ACCEPT}
        onChange={onFilesPicked}
        className="hidden"
      />

      {/* Selected files list */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map(f => (
            <li
              key={f.localId}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#F8FAF9] border border-[#E4E8E6]"
            >
              <FileText className="h-3.5 w-3.5 text-[#6B7370] shrink-0" />
              <span className="text-[12px] text-[#1A1E1C] flex-1 truncate">{f.file.name}</span>
              <FileStatusPill status={f.status} error={f.error} />
              {(f.status === 'queued' || f.status === 'rejected' || f.status === 'errored') && (
                <button
                  onClick={() => removeFile(f.localId)}
                  className="text-[#8A9290] hover:text-[#4a5250] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#206E55]/30 focus-visible:ring-offset-1"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Action button */}
      {queuedCount > 0 && (
        <button
          onClick={submitQueued}
          disabled={submitting}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-full bg-[#206E55] text-white hover:bg-[#1a5a46] disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#206E55]/30 focus-visible:ring-offset-2"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {submitting ? `Uploading ${uploadingCount}…` : `Upload ${queuedCount} file${queuedCount === 1 ? '' : 's'}`}
        </button>
      )}

      {/* Progress / status */}
      {showProgress && (
        <div className="mt-3 border-t border-[#F0F1F1] pt-3">
          <ProgressLine
            label="Files uploaded"
            current={submittedCount}
            total={intendedCount}
          />
          <ProgressLine
            label="Processed by reader"
            current={processed}
            total={intendedCount}
          />
          <ProgressLine
            label="Added to health record"
            current={ehrComplete + ehrFailed}
            total={intendedCount}
          />

          {phase === 'ready' && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[12px] text-[#1D7A55]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>
                Health data updated
                {ehrFailed > 0 && (
                  <span className="text-[#B8791A]">
                    {' '}— {ehrFailed} of {intendedCount} {ehrFailed === 1 ? 'report' : 'reports'} failed
                  </span>
                )}
              </span>
            </div>
          )}

          {phase === 'timeout' && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[12px] text-[#B8791A]">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Still processing — check back later. New data will appear automatically.</span>
            </div>
          )}

          {phase === 'polling' && ehrQueued > 0 && (
            <p className="mt-2.5 text-[11px] text-[#6B7370]">
              Building health data… this usually takes under a minute.
            </p>
          )}
        </div>
      )}

      {erroredCount > 0 && phase === 'idle' && (
        <p className="mt-2 text-[11px] text-[#C44040]">
          {erroredCount} file{erroredCount === 1 ? '' : 's'} couldn&apos;t be added. Remove and try again.
        </p>
      )}
    </div>
  );
}


// ── Subcomponents ──────────────────────────────────────────────

function FileStatusPill({ status, error }: { status: PendingUploadFile['status']; error?: string }) {
  if (status === 'queued') {
    return <span className="text-[10px] text-[#6B7370]">Ready</span>;
  }
  if (status === 'uploading') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-[#6B7370]">
        <Loader2 className="h-3 w-3 animate-spin" />
        Uploading
      </span>
    );
  }
  if (status === 'submitted') {
    return <span className="text-[10px] text-[#1D7A55]">Submitted</span>;
  }
  return (
    <span className="text-[10px] text-[#C44040]" title={error}>
      {status === 'rejected' ? 'Unsupported' : 'Failed'}
    </span>
  );
}

function ProgressLine({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));
  const done = total > 0 && current >= total;
  return (
    <div className="mt-1.5 first:mt-0">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#6B7370]">{label}</span>
        <span className={done ? 'text-[#1D7A55] font-medium' : 'text-[#1A1E1C]'}>
          {current} / {total}
        </span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-[#F0F1F1] overflow-hidden">
        <div
          className={`h-full transition-all ${done ? 'bg-[#1D7A55]' : 'bg-[#206E55]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
