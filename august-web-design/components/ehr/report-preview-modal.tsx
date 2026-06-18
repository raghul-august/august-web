'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  getReportPreview,
  type ReportPreviewData,
} from '@/services/ehr-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';

type PreviewKind = 'pdf' | 'image' | 'other';

/**
 * Pick a renderer from the file's URL extension:
 *  - 'pdf'   → inline browser PDF viewer
 *  - 'image' → <img> (HEIC is excluded — only Safari can decode it, so it
 *              falls through to 'other' rather than rendering broken)
 *  - 'other' → docx/txt/unknown: no inline preview, offer the original file
 *
 * The preview payload's `type` (e.g. BLOOD_REPORT) is a report category, not
 * a mime type, so the extension is what we have to go on.
 */
function classifyUrl(url: string): PreviewKind {
  let path: string;
  try {
    path = new URL(url, 'https://x').pathname.toLowerCase();
  } catch {
    return 'other';
  }
  if (path.endsWith('.pdf')) return 'pdf';
  if (/\.(png|jpe?g|gif|webp|bmp|tiff?)$/.test(path)) return 'image';
  return 'other';
}

export function ReportPreviewModal({
  requestId,
  personId,
  fallbackTitle,
  onClose,
}: {
  requestId: string;
  personId?: string;
  /** Shown in the header until the backend's `title` arrives. */
  fallbackTitle?: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<ReportPreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReportPreview({ requestId, personId })
      .then(res => { if (!cancelled) setData(res); })
      .catch(err => {
        if (cancelled) return;
        logger.error('[EHR] Report preview fetch failed', serializeError(err));
        const status = (err as { response?: { status?: number } })?.response?.status;
        setError(status === 404
          ? 'This report is no longer available.'
          : 'Could not load the report. Please try again.');
      });
    return () => { cancelled = true; };
  }, [requestId, personId]);

  const title = data?.title || fallbackTitle || 'Report';
  const url = data?.url ?? null;
  const kind = url ? classifyUrl(url) : null;

  // PDFs: the signed URL is served as `application/octet-stream`, which the
  // browser won't render inline. Fetch the bytes and re-wrap them in an
  // `application/pdf` blob — the typed blob URL renders in the native PDF
  // viewer. Images and other types skip this.
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFailed, setPdfFailed] = useState(false);

  useEffect(() => {
    if (!url || kind !== 'pdf') return;
    let cancelled = false;
    let objectUrl: string | null = null;
    setPdfUrl(null);
    setPdfFailed(false);
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`File fetch failed (${res.status})`);
        return res.blob();
      })
      .then(blob => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        setPdfUrl(objectUrl);
      })
      .catch(err => {
        if (cancelled) return;
        logger.error('[EHR] Report file fetch failed', serializeError(err));
        setPdfFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, kind]);

  function renderBody() {
    if (error) {
      return <p className="text-[13px] text-[#6B7370] text-center px-6 py-12">{error}</p>;
    }
    if (!data) {
      return <Loader2 className="h-6 w-6 animate-spin text-[#206E55]" />;
    }
    if (kind === 'image') {
      return (
        <img
          src={url!}
          alt={title}
          className="max-w-full max-h-full object-contain p-4"
        />
      );
    }
    if (kind === 'pdf' && !pdfFailed) {
      if (!pdfUrl) {
        return <Loader2 className="h-6 w-6 animate-spin text-[#206E55]" />;
      }
      return (
        <iframe src={pdfUrl} title={title} className="w-full h-full border-0" />
      );
    }
    // 'other' types (docx / heic / txt / unknown) and PDF fetch failures:
    // no inline preview, so offer the original file.
    return (
      <p className="text-[13px] text-[#6B7370] text-center px-6 py-12">
        {kind === 'pdf'
          ? 'Could not load the report.'
          : "This file type can't be previewed here."}{' '}
        <a
          href={url!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#206E55] underline"
        >
          Open original
        </a>
      </p>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[88vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#ECEEED] shrink-0">
          <span className="text-[13px] font-medium text-[#1A1E1C] truncate" title={title}>
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#6B7370] hover:bg-[#F0ECE4] hover:text-[#1A1E1C] transition-colors shrink-0"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center bg-[#F5F4F1]">
          {renderBody()}
        </div>
      </div>
    </div>
  );
}
