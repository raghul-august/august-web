'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, Trash2, Upload, X } from 'lucide-react';
import { EhrSkeleton } from './ehr-skeleton';
import { useEhrStore } from '@/stores/ehr-store';
import {
  deleteReportUpload,
  type ReportLibraryItem,
} from '@/services/ehr-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { ReportPreviewModal } from './report-preview-modal';
import { track } from '@/services/analytics-service';

// ── Display helpers ────────────────────────────────────────────

/** Best-effort label for a row. The backend doesn't return the original
 *  filename, so we synthesize from the parsed fields. Falls back to the
 *  request id's prefix as a last resort. */
function reportDisplayName(r: ReportLibraryItem): string {
  const parts = [r.type, r.original_lab].filter((s): s is string => !!s && !!s.trim());
  if (parts.length > 0) return parts.join(' · ');
  if (r.extracted_patient_name) return r.extracted_patient_name;
  return `Report ${r.request_id.slice(0, 6)}`;
}

type BadgeVariant = 'green' | 'amber' | 'red' | 'gray';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-[#EAFAF2]', text: 'text-[#1D7A55]', dot: 'bg-[#1D7A55]' },
  amber: { bg: 'bg-[#FFF8EC]', text: 'text-[#B8791A]', dot: 'bg-[#B8791A]' },
  red: { bg: 'bg-[#FEF1F1]', text: 'text-[#C44040]', dot: 'bg-[#C44040]' },
  gray: { bg: 'bg-[#F3F4F4]', text: 'text-[#6B7370]', dot: 'bg-[#6B7370]' },
};

const STATE_TO_BADGE: Record<ReportLibraryItem['ehr_state'], { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Processing', variant: 'amber' },
  building: { label: 'Processing', variant: 'amber' },
  complete: { label: 'Added', variant: 'green' },
  skipped: { label: 'Skipped', variant: 'gray' },
  failed: { label: 'Failed', variant: 'red' },
  removed: { label: 'Removed', variant: 'gray' },
};

function StatusBadge({ state }: { state: ReportLibraryItem['ehr_state'] }) {
  const { label, variant } = STATE_TO_BADGE[state];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${VARIANT_STYLES[variant].bg} ${VARIANT_STYLES[variant].text}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${VARIANT_STYLES[variant].dot}`} />
      {label}
    </span>
  );
}

// ── Confirm modal ──────────────────────────────────────────────

function ConfirmRemoveModal({
  reportName,
  busy,
  onCancel,
  onConfirm,
}: {
  reportName: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={busy ? undefined : onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ECEEED]">
          <h3 className="text-base font-semibold text-[#1A1E1C]">Remove this report?</h3>
          <button
            onClick={onCancel}
            disabled={busy}
            className="text-[#6B7370] hover:text-[#1A1E1C] p-1 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] text-[#1A1E1C] mb-1 break-words">{reportName}</p>
          <p className="text-[12px] text-[#6B7370]">
            Its parsed data will disappear from your record. You can toggle &quot;Show removed&quot; to find it again later.
          </p>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-[#ECEEED]">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl border border-[#ECEEED] font-medium text-sm text-[#1A1E1C] hover:bg-[#F8FAF9] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-[#C44040] text-white font-semibold text-sm hover:bg-[#a73838] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main section ───────────────────────────────────────────────

export function ReportLibrarySection({
  personId,
  onUploadReport,
}: {
  personId: string;
  /** Optional callback to open the upload modal from the empty state. */
  onUploadReport?: () => void;
}) {
  const fetchReportLibrary = useEhrStore(s => s.fetchReportLibrary);
  const markReportRemoved = useEhrStore(s => s.markReportRemoved);
  const invalidatePersonPages = useEhrStore(s => s.invalidatePersonPages);
  const pushToast = useEhrStore(s => s.pushToast);
  const refreshSeq = useEhrStore(s => s.pageRefreshSeq[personId] ?? 0);

  const [items, setItems] = useState<ReportLibraryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [showRemoved, setShowRemoved] = useState(false);
  const [confirmReport, setConfirmReport] = useState<ReportLibraryItem | null>(null);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportLibraryItem | null>(null);

  // (Re)fetch when the person, the show-removed toggle, or the global
  // refreshSeq for this person changes (e.g. after a successful delete
  // or after an upload completes elsewhere).
  useEffect(() => {
    let cancelled = false;
    const key = `${personId}|${showRemoved ? 'all' : 'active'}`;
    fetchReportLibrary(personId, { includeRemoved: showRemoved })
      .then(res => {
        if (cancelled) return;
        setItems(res);
        setError(null);
        setLoadedKey(key);
      })
      .catch(err => {
        logger.error('[EHR] Report library fetch failed', serializeError(err));
        if (cancelled) return;
        setItems(null);
        setError('Failed to load reports');
        setLoadedKey(key);
      });
    return () => { cancelled = true; };
  }, [personId, showRemoved, refreshSeq, fetchReportLibrary]);

  const expectedKey = `${personId}|${showRemoved ? 'all' : 'active'}`;
  const loading = loadedKey !== expectedKey;

  const handleConfirmRemove = async () => {
    if (!confirmReport) return;
    const target = confirmReport;
    setDeletingRequestId(target.request_id);
    // Optimistic — the row updates immediately. Local items state mirrors
    // the store update so the user sees instant feedback.
    setItems(prev => {
      if (!prev) return prev;
      if (showRemoved) {
        return prev.map(r => r.request_id === target.request_id
          ? { ...r, removed: true, ehr_state: 'removed' as const }
          : r,
        );
      }
      return prev.filter(r => r.request_id !== target.request_id);
    });
    markReportRemoved(personId, target.request_id);

    try {
      await deleteReportUpload({ requestId: target.request_id, personId });
      track('ehr_record_deleted', {
        report_state: target.ehr_state,
      });
      // Drop section caches so other sections (lab reports, conditions,
      // etc.) refetch without the now-disconnected report's rows. Also
      // bumps pageRefreshSeq, which triggers this section to refetch
      // and reconcile with whatever the backend now returns.
      invalidatePersonPages(personId);
    } catch (err) {
      logger.error('[EHR] Report delete failed', serializeError(err));
      pushToast({
        kind: 'error',
        title: 'Could not remove report',
        body: 'Please try again.',
      });
      // Revert by invalidating + letting the next fetch repopulate.
      invalidatePersonPages(personId);
    } finally {
      setDeletingRequestId(null);
      setConfirmReport(null);
    }
  };

  if (loading) {
    return <EhrSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-[#C44040] text-center py-4">{error}</p>;
  }

  // Backend has been observed returning the same request_id twice (e.g.
  // an existing row + its rebuild). Dedupe so React keys stay unique
  // and the list shows one row per logical report — first occurrence
  // wins, which is the freshest entry per the backend's sort order.
  const rawItems = items ?? [];
  const seen = new Set<string>();
  const allItems: ReportLibraryItem[] = [];
  for (const r of rawItems) {
    if (seen.has(r.request_id)) continue;
    seen.add(r.request_id);
    allItems.push(r);
  }
  const visibleItems = showRemoved ? allItems : allItems.filter(r => !r.removed);
  const removedCount = allItems.filter(r => r.removed).length;

  if (visibleItems.length === 0 && !showRemoved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-8 w-8 text-[#8A9290] mb-3" />
        <p className="text-sm text-[#1A1E1C] font-medium mb-1">No reports uploaded yet</p>
        <p className="text-[12px] text-[#6B7370] mb-4 max-w-xs">
          Upload a lab report, prescription, or discharge summary and we&apos;ll add it to this person&apos;s record.
        </p>
        {onUploadReport && (
          <button
            onClick={onUploadReport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#206E55] text-white text-sm font-semibold hover:bg-[#1a5a46] transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload reports
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-[#6B7370]">
          {visibleItems.length} report{visibleItems.length === 1 ? '' : 's'}
          {showRemoved && removedCount > 0 && ` · ${removedCount} removed`}
        </p>
        <div className="flex items-center gap-3">
          {removedCount > 0 || showRemoved ? (
            <label className="inline-flex items-center gap-1.5 text-[12px] text-[#6B7370] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showRemoved}
                onChange={(e) => setShowRemoved(e.target.checked)}
                className="accent-[#206E55] cursor-pointer"
              />
              Show removed
            </label>
          ) : null}
          {onUploadReport && (
            <button
              onClick={onUploadReport}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-[#206E55] text-white hover:bg-[#1a5a46] transition-colors shadow-sm"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload reports
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[14px] shadow-sm divide-y divide-[#EFEDE8]">
        {visibleItems.map(r => {
          const isDeleting = deletingRequestId === r.request_id;
          // Removed rows aren't previewable — backend hides them
          // (preview returns 404). Keep them visible in the list (with
          // muted styling) but not clickable.
          const previewable = !r.removed;
          return (
            <div
              key={r.request_id}
              className={`flex items-center gap-3 px-4 py-3.5 group ${r.removed ? 'opacity-60' : 'hover:bg-[#F8FAF9] transition-colors cursor-pointer'}`}
              onClick={previewable ? () => {
                track('ehr_report_preview_opened', {
                  report_state: r.ehr_state,
                });
                setPreviewReport(r);
              } : undefined}
              role={previewable ? 'button' : undefined}
              tabIndex={previewable ? 0 : undefined}
              onKeyDown={previewable ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  track('ehr_report_preview_opened', {
                    report_state: r.ehr_state,
                  });
                  setPreviewReport(r);
                }
              } : undefined}
            >
              <FileText className="h-4 w-4 text-[#6B7370] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium leading-tight text-[#1A1E1C] truncate" title={reportDisplayName(r)}>
                  {reportDisplayName(r)}
                </p>
              </div>
              <StatusBadge state={r.ehr_state} />
              {!r.removed && (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmReport(r); }}
                  disabled={isDeleting}
                  className="p-1.5 rounded-md text-[#8A9290] hover:text-[#C44040] hover:bg-[#FEF1F1] transition-colors disabled:opacity-50"
                  aria-label="Remove report"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {confirmReport && (
        <ConfirmRemoveModal
          reportName={reportDisplayName(confirmReport)}
          busy={deletingRequestId === confirmReport.request_id}
          onCancel={() => { if (!deletingRequestId) setConfirmReport(null); }}
          onConfirm={handleConfirmRemove}
        />
      )}

      {previewReport && (
        <ReportPreviewModal
          requestId={previewReport.request_id}
          personId={personId}
          fallbackTitle={reportDisplayName(previewReport)}
          onClose={() => setPreviewReport(null)}
        />
      )}
    </div>
  );
}
