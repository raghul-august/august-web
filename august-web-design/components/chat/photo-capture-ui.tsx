'use client';

import { useEffect, useRef, useState } from 'react';

interface PhotoCaptureUIProps {
  /** Called with the captured photo file when the user taps "Use photo". */
  onCapture: (file: File) => void;
  /** Called when the user backs out without capturing. */
  onClose: () => void;
  /** Header label. */
  title?: string;
}

type CamState = 'init' | 'ready' | 'review' | 'denied';

/**
 * Centered modal webcam photo capture. Camera + snapshot logic mirrors the
 * driver-license webcam capture in pre-doctor-popup.tsx; overlay/styling
 * mirrors VideoRecorderUI. The camera is acquired once in a Strict-Mode-safe
 * effect (in-flight acquisition is cancelled on cleanup).
 */
export function PhotoCaptureUI({ onCapture, onClose, title = 'Take a photo' }: PhotoCaptureUIProps) {
  const [state, setState] = useState<CamState>('init');
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pendingBlobRef = useRef<Blob | null>(null);
  const pendingUrlRef = useRef<string | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const attachStream = async (stream: MediaStream) => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      try {
        await videoRef.current.play();
      } catch {}
    }
  };

  useEffect(() => {
    let active = true;
    setState('init');
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        await attachStream(stream);
        if (active) setState('ready');
      } catch {
        if (active) setState('denied');
      }
    })();
    return () => {
      active = false;
      stopStream();
      if (pendingUrlRef.current) {
        URL.revokeObjectURL(pendingUrlRef.current);
        pendingUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryCamera = async () => {
    setState('init');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      await attachStream(stream);
      setState('ready');
    } catch {
      setState('denied');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      pendingBlobRef.current = blob;
      const url = URL.createObjectURL(blob);
      pendingUrlRef.current = url;
      setPendingUrl(url);
      setState('review');
    }, 'image/png');
  };

  const retake = () => {
    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
    pendingBlobRef.current = null;
    setPendingUrl(null);
    if (streamRef.current) setState('ready');
    else retryCamera();
  };

  const usePhoto = () => {
    const blob = pendingBlobRef.current;
    if (!blob) return;
    const file = new File([blob], `photo_${Date.now()}.png`, { type: blob.type || 'image/png' });
    stopStream();
    pendingBlobRef.current = null;
    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
    setPendingUrl(null);
    onCapture(file);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(20, 21, 21, 0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        fontFamily: '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`@keyframes chat-photo-spin { to { transform: rotate(360deg); } }`}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#141515',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: '#141515',
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 500, fontSize: 16, lineHeight: '22px', color: '#FFFFFF' }}>{title}</span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 32,
              height: 32,
              borderRadius: 999,
              background: '#FFFFFF',
              border: '1px solid #F3F1EB',
              boxSizing: 'border-box',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4l8 8M4 12L12 4" stroke="#7A7468" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Camera viewport */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 4',
            maxHeight: '64vh',
            background: '#000000',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: state === 'ready' ? 'block' : 'none',
            }}
          />

          {state === 'init' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#A8A39A',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: '2.5px solid rgba(255,255,255,0.35)',
                  borderTopColor: '#FFFFFF',
                  borderRadius: '50%',
                  animation: 'chat-photo-spin 0.9s linear infinite',
                }}
              />
            </div>
          )}

          {state === 'denied' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 32px',
                gap: 12,
                background: '#A8A39A',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 18, lineHeight: '24px', color: '#FFFFFF', textAlign: 'center' }}>
                Camera unavailable
              </div>
              <div
                style={{
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#141515',
                  textAlign: 'center',
                  maxWidth: 320,
                }}
              >
                We couldn&apos;t access your camera. Please allow camera access and try again.
              </div>
              <button
                type="button"
                onClick={retryCamera}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 32px',
                  borderRadius: 999,
                  background: '#FFFFFF',
                  color: '#141515',
                  fontWeight: 500,
                  fontSize: 15,
                  lineHeight: '20px',
                }}
              >
                Try again
              </button>
            </div>
          )}

          {state === 'review' && pendingUrl && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#141515',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pendingUrl}
                alt="Captured photo preview"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 24px 28px',
            background: '#141515',
            flexShrink: 0,
          }}
        >
          {state === 'ready' && (
            <button
              type="button"
              aria-label="Capture photo"
              onClick={capturePhoto}
              style={{
                all: 'unset',
                cursor: 'pointer',
                width: 68,
                height: 68,
                borderRadius: 999,
                border: '4px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ width: 54, height: 54, borderRadius: 999, background: '#FFFFFF' }} />
            </button>
          )}

          {state === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 14, width: '100%' }}>
              <button
                type="button"
                onClick={retake}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  flex: 1,
                  height: 50,
                  borderRadius: 999,
                  border: '2px solid #7A7468',
                  color: '#FFFFFF',
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: '20px',
                  boxSizing: 'border-box',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 9a6 6 0 1 1 1.76 4.24" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 4v5h5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Retake
              </button>
              <button
                type="button"
                onClick={usePhoto}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                  height: 50,
                  borderRadius: 999,
                  background: '#FFFFFF',
                  color: '#141515',
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: '20px',
                  boxSizing: 'border-box',
                }}
              >
                Use photo
              </button>
            </div>
          )}

          {(state === 'init' || state === 'denied') && <div style={{ height: 68 }} />}
        </div>
      </div>
    </div>
  );
}
