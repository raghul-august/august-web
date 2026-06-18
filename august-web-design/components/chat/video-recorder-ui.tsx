'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoRecorderUIProps {
  /** Called with the recorded video file when the user taps "Use video". */
  onCapture: (file: File) => void;
  /** Called when the user backs out without recording. */
  onClose: () => void;
}

type CamState = 'init' | 'ready' | 'recording' | 'review' | 'denied';

/** Hard cap on recording length — auto-stops at 5 minutes. */
const MAX_RECORDING_SECONDS = 5 * 60;

/**
 * Centered modal webcam video recorder for the chat input. Camera + recording
 * logic mirrors the intro-video recorder in pre-doctor-popup.tsx, minus the
 * face-guide oval and face-specific copy. The camera is acquired once in a
 * Strict-Mode-safe effect (in-flight acquisition is cancelled on cleanup so the
 * dev double-mount doesn't leave a stream holding the device and trip a
 * NotReadableError on the second attempt).
 */
export function VideoRecorderUI({ onCapture, onClose }: VideoRecorderUIProps) {
  const [state, setState] = useState<CamState>('init');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const pendingBlobRef = useRef<Blob | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingUrlRef = useRef<string | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const clearRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const attachStream = async (stream: MediaStream) => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      // A muted video may still reject play() under some autoplay policies —
      // that's not a permission failure, so never let it flip us to "denied".
      try {
        await videoRef.current.play();
      } catch {}
    }
  };

  // Acquire the camera once on mount. The `active` flag guards against React
  // Strict Mode's mount→unmount→mount cycle: if we're torn down before (or
  // after) getUserMedia resolves, we stop the stream instead of leaking it.
  useEffect(() => {
    let active = true;
    setState('init');

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
      clearRecordingTimer();
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {}
      mediaRecorderRef.current = null;
      recordedChunksRef.current = [];
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      await attachStream(stream);
      setState('ready');
    } catch {
      setState('denied');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const stream = streamRef.current;
    const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mimeType = candidates.find((t) =>
      typeof MediaRecorder !== 'undefined' && (MediaRecorder as any).isTypeSupported?.(t),
    );
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recordedChunksRef.current = chunks;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || 'video/webm';
      const blob = new Blob(chunks, { type });
      const url = URL.createObjectURL(blob);
      pendingBlobRef.current = blob;
      pendingUrlRef.current = url;
      setPendingUrl(url);
      setState('review');
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setState('recording');
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
  };

  const stopRecording = () => {
    clearRecordingTimer();
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch {}
  };

  // Enforce the 5-minute cap — auto-stop once the limit is reached.
  useEffect(() => {
    if (state === 'recording' && recordingSeconds >= MAX_RECORDING_SECONDS) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, recordingSeconds]);

  const retake = () => {
    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
    setPendingUrl(null);
    setRecordingSeconds(0);
    // Reuse the live stream if it's still around; otherwise re-acquire.
    if (streamRef.current) {
      setState('ready');
    } else {
      retryCamera();
    }
  };

  const useVideo = () => {
    const blob = pendingBlobRef.current;
    if (!blob) return;
    const ext = (mediaRecorderRef.current?.mimeType || blob.type).includes('mp4') ? 'mp4' : 'webm';
    const mime = (mediaRecorderRef.current?.mimeType || blob.type).split(';')[0] || 'video/webm';
    const file = new File([blob], `video_${Date.now()}.${ext}`, { type: mime });
    clearRecordingTimer();
    stopStream();
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    pendingBlobRef.current = null;
    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
    setPendingUrl(null);
    onCapture(file);
  };

  const formatRecordingTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const showLiveVideo = state === 'ready' || state === 'recording';

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
      <style>{`@keyframes chat-video-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Modal card */}
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
          <span style={{ fontWeight: 500, fontSize: 16, lineHeight: '22px', color: '#FFFFFF' }}>
            Record a video
          </span>
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
          {/* Live stream — always mounted to keep the ref stable */}
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
              display: showLiveVideo ? 'block' : 'none',
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
                  animation: 'chat-video-spin 0.9s linear infinite',
                }}
              />
            </div>
          )}

          {state === 'ready' && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 16,
                display: 'flex',
                justifyContent: 'center',
                padding: '0 24px',
              }}
            >
              <div
                style={{
                  fontWeight: 500,
                  fontSize: 15,
                  lineHeight: '20px',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}
              >
                Tap the button to start recording
              </div>
            </div>
          )}

          {state === 'recording' && (
            <div
              style={{
                position: 'absolute',
                top: 16,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 18px',
                  borderRadius: 999,
                  background: 'rgba(20, 21, 21, 0.6)',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 999, background: '#C0473C' }} />
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 15,
                    lineHeight: '20px',
                    color: '#FFFFFF',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatRecordingTime(recordingSeconds)} / {formatRecordingTime(MAX_RECORDING_SECONDS)}
                </span>
              </div>
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
              <video
                src={pendingUrl}
                controls
                playsInline
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', background: '#000' }}
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
              aria-label="Start recording"
              onClick={startRecording}
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
              <div style={{ width: 54, height: 54, borderRadius: 999, background: '#C0473C' }} />
            </button>
          )}

          {state === 'recording' && (
            <button
              type="button"
              aria-label="Stop recording"
              onClick={stopRecording}
              style={{
                all: 'unset',
                cursor: 'pointer',
                width: 68,
                height: 68,
                borderRadius: 999,
                border: '4px solid #C0473C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ width: 26, height: 26, borderRadius: 4, background: '#C0473C' }} />
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
                onClick={useVideo}
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
                Use video
              </button>
            </div>
          )}

          {(state === 'init' || state === 'denied') && (
            <div style={{ height: 68 }} />
          )}
        </div>
      </div>
    </div>
  );
}
