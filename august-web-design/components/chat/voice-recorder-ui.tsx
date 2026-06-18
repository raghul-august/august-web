'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { uploadMedia } from '@/services/media-service';
import { sendMessage } from '@/services/chat-service';
import { track } from '@/services/analytics-service';
import { getTelehealthBaseParams } from '@/services/telehealth-analytics';
import { useAuthStore } from '@/stores/auth-store';
import { trackClevertap } from '@/utils/clevertap';
import { convertBlobToWav } from '@/utils/audio-converter';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';

interface VoiceRecorderUIProps {
  onClose: () => void;
}

/**
 * Inline voice recording UI that replaces the text input when recording.
 * Mirrors the mobile app's voice recording experience.
 *
 * Flow (matching mobile's ChatInput.tsx):
 * 1. Auto-starts recording on mount
 * 2. Shows animated waveform + timer
 * 3. Cancel (trash) = discard, Send (arrow) = upload & send
 */
export function VoiceRecorderUI({ onClose }: VoiceRecorderUIProps) {
  const {
    isRecording,
    duration,
    analyserNode,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [isSending, setIsSending] = useState(false);

  // Auto-start recording on mount (mirrors mobile's auto-start behavior)
  useEffect(() => {
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw waveform from AnalyserNode (replaces @simform_solutions/react-native-audio-waveform)
  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, rect.width, rect.height);

      const barWidth = 3;
      const gap = 2;
      const barCount = Math.floor(rect.width / (barWidth + gap));
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = i * step;
        const value = dataArray[dataIndex] / 255;
        const barHeight = Math.max(4, value * rect.height * 0.85);

        const x = i * (barWidth + gap);
        const y = (rect.height - barHeight) / 2;

        ctx.fillStyle = '#141515';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1.5);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [analyserNode]);

  // Format duration as MM:SS (matches mobile's timer format)
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = useCallback(() => {
    cancelRecording();
    track('voice_recording_cancelled');
    trackClevertap('Voice Recording Cancelled', {});
    onClose();
  }, [cancelRecording, onClose]);

  /**
   * Handles the send flow — mirrors mobile's handleSendVoice():
   * 1. Stop recording → get Blob
   * 2. Wrap Blob as File
   * 3. Upload via uploadMedia() (same endpoint as mobile)
   * 4. Send via sendMessage() with voice attachment (matching mobile webhook payload)
   */
  const handleSend = useCallback(async () => {
    if (isSending) return;
    setIsSending(true);

    try {
      const blob = await stopRecording();
      if (!blob) {
        logger.error('No audio blob from recording');
        onClose();
        return;
      }

      // logger.info('Preparing to upload voice recording', {
      //   size: blob.size,
      //   type: blob.type,
      // });

      // Convert WebM/Opus → WAV for iOS/Android compatibility
      // logger.info('Converting audio to WAV for cross-platform compatibility');
      const wavBlob = await convertBlobToWav(blob);

      // logger.info('WAV conversion complete', {
      //   originalSize: blob.size,
      //   wavSize: wavBlob.size,
      //   originalType: blob.type,
      //   wavType: wavBlob.type,
      // });

      // Wrap WAV blob as File (matching mobile's FormData construction)
      const fileName = `recording-${Date.now()}.wav`;
      const file = new File([wavBlob], fileName, {
        type: 'audio/wav',
      });

      // Upload via existing media service (same endpoint mobile uses)
      // logger.info('Uploading media to server', { fileName, mimeType: file.type });
      const uploaded = await uploadMedia(file);

      // logger.info('Media upload response', {
      //   fileURL: uploaded.fileURL,
      //   signedURL: uploaded.signedURL,
      // });

      // Send as voice message (matching mobile's webhook payload exactly)
      // Mobile sends: { attachment: fileURL, fileExtension: ".m4a", messageType: "voice" }
      await sendMessage('', [
        {
          fileURL: uploaded.fileURL,
          signedURL: uploaded.signedURL,
          blobName: uploaded.blobName,
          fileName: uploaded.fileName,
          mimeType: uploaded.mimeType,
          isVoice: true,
        },
      ]);

      track('voice_message_sent', {
        ...getTelehealthBaseParams(),
        source: useAuthStore.getState().isAuthenticated ? 'telehealth_loggeinuser_chat' : 'telehealth_anon_chat',
        duration,
      });
      trackClevertap('Sent Message', { type: 'voice', hasText: false });
      // logger.info('Voice message sent successfully');
    } catch (err) {
      logger.error('Failed to send voice message', serializeError(err));
    } finally {
      setIsSending(false);
      onClose();
    }
  }, [isSending, stopRecording, onClose, duration]);

  // Show error state
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          width: '100%',
        }}
      >
        <p style={{ color: '#E53E3E', fontSize: '14px', flex: 1 }}>{error}</p>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#767F7C',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '4px 0',
      }}
    >
      {/* Cancel button (trash) */}
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSending}
        className="h-10 w-10 flex items-center justify-center rounded-full shrink-0 transition-colors hover:bg-[#E8EBEA]"
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <Trash2 className="h-5 w-5" style={{ color: '#E53E3E' }} />
      </button>

      {/* Waveform + Timer */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#E8EBEA',
          borderRadius: '24px',
          padding: '8px 16px',
          minHeight: '44px',
        }}
      >
        {/* Recording indicator dot */}
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#FF4444',
            animation: 'blink 1s infinite',
            flexShrink: 0,
          }}
        />

        {/* Timer */}
        <span
          style={{
            color: '#141515',
            fontSize: '14px',
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
            minWidth: '36px',
            flexShrink: 0,
          }}
        >
          {formatDuration(duration)}
        </span>

        {/* Waveform canvas */}
        <canvas
          ref={canvasRef}
          style={{
            flex: 1,
            height: '32px',
          }}
        />
      </div>

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        disabled={isSending || !isRecording}
        className="h-10 w-10 flex items-center justify-center rounded-full shrink-0 transition-colors"
        style={{
          background: isSending ? '#206E55aa' : '#206E55',
          border: 'none',
          cursor: isSending ? 'not-allowed' : 'pointer',
        }}
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M13.1208 6.59398H0.8125C0.581931 6.59398 0.388917 6.51616 0.233458 6.36052C0.0778193 6.20506 0 6.01205 0 5.78148C0 5.55091 0.0778193 5.3579 0.233458 5.20244C0.388917 5.0468 0.581931 4.96898 0.8125 4.96898H13.1208L9.55419 1.40238C9.39313 1.24114 9.3136 1.05255 9.31559 0.836604C9.31775 0.62066 9.39729 0.42864 9.55419 0.260543C9.72229 0.092626 9.9153 0.00586778 10.1332 0.000270552C10.3513 -0.00532667 10.5444 0.0759234 10.7125 0.244021L15.5645 5.096C15.666 5.19747 15.7375 5.30445 15.779 5.41694C15.8207 5.52943 15.8416 5.65094 15.8416 5.78148C15.8416 5.91202 15.8207 6.03354 15.779 6.14602C15.7375 6.25851 15.666 6.36549 15.5645 6.46696L10.7125 11.3189C10.5513 11.48 10.36 11.5595 10.1386 11.5575C9.91711 11.5554 9.72229 11.4703 9.55419 11.3024C9.39729 11.1343 9.31604 10.944 9.31044 10.7315C9.30484 10.519 9.38609 10.3287 9.55419 10.1606L13.1208 6.59398Z" fill="white"/>
          </svg>
        )}
      </button>

      {/* Blink animation for recording indicator */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
