'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share2, X } from 'lucide-react';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { trackTelehealth } from '@/services/telehealth-analytics';
import { useAuthStore } from '@/stores/auth-store';

const THUMB_SIZE = 240;

interface ChatImageProps {
  src: string;
  alt?: string;
  name?: string;
}

export function ChatImage({ src, alt, name }: ChatImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackTelehealth('user_viewed_media', {
            source: useAuthStore.getState().isAuthenticated
              ? 'telehealth_loggeinuser_chat'
              : 'telehealth_anon_chat',
            media_type: 'image',
          });
          setOpen(true);
        }}
        className="block rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#206E55]"
        style={{ width: THUMB_SIZE, height: THUMB_SIZE, maxWidth: '100%' }}
        aria-label={alt || 'Open image'}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ''}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </button>
      {open && (
        <ImageViewerModal
          src={src}
          alt={alt}
          name={name}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

interface ImageViewerModalProps {
  src: string;
  alt?: string;
  name?: string;
  onClose: () => void;
}

function deriveFilename(src: string, name?: string): string {
  if (name && name.trim()) return name;
  try {
    const url = new URL(src);
    const last = url.pathname.split('/').filter(Boolean).pop();
    if (last) return decodeURIComponent(last);
  } catch {}
  return 'image';
}

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
};

// Some signed URLs (e.g. Azure blobs with rsct=application/octet-stream)
// return a non-image MIME type, which breaks Web Share file detection.
// Prefer extension-based inference; fall back to the blob type only if
// it's already an image MIME.
function inferImageMime(src: string, name: string, blobType?: string): string {
  const candidate = (name || src).split('?')[0].toLowerCase();
  const ext = candidate.split('.').pop() || '';
  if (EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
  if (blobType && blobType.startsWith('image/')) return blobType;
  return 'image/jpeg';
}

function ImageViewerModal({ src, alt, name, onClose }: ImageViewerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const triggerDownload = (b: Blob, filename: string) => {
    const mime = inferImageMime(src, filename, b.type);
    const typedBlob = b.type === mime ? b : b.slice(0, b.size, mime);
    const objectUrl = URL.createObjectURL(typedBlob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  };

  const handleDownload = () => {
    if (busy) return;
    const filename = deriveFilename(src, name);
    setBusy('download');
    fetch(src, { mode: 'cors' })
      .then((res) => res.blob())
      .then((b) => triggerDownload(b, filename))
      .catch((error) => {
        logger.error('Image download error', serializeError(error));
        window.open(src, '_blank', 'noopener,noreferrer');
      })
      .finally(() => setBusy(null));
  };

  // Matches the feedback-row share pattern: URL share via the native
  // share sheet, with a clipboard fallback.
  const handleShare = () => {
    if (busy) return;
    const nav = navigator as any;

    const fallbackToClipboard = () => {
      navigator.clipboard.writeText(src).catch(() => {});
    };

    const onShareError = (err: Error) => {
      if (err.name === 'AbortError') return;
      logger.error('Image share error', serializeError(err));
      fallbackToClipboard();
    };

    if (nav.share) {
      nav
        .share({ title: 'Shared image from August', url: src })
        .catch(onShareError);
      return;
    }

    fallbackToClipboard();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Image preview'}
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.92)' }}
    >
      <div className="flex items-center justify-end gap-2 p-3 sm:p-4">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy !== null}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 disabled:opacity-50 transition-colors"
          aria-label="Download image"
          title="Download"
        >
          <Download className="w-5 h-5 text-white" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={busy !== null}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 disabled:opacity-50 transition-colors"
          aria-label="Share image"
          title="Share"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close"
          title="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center px-4 pb-6 sm:pb-10 overflow-hidden"
        onClick={onClose}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ''}
          className="max-w-full max-h-full object-contain select-none"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </div>
    </div>,
    document.body,
  );
}
