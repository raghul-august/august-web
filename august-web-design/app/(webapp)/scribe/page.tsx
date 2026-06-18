'use client';

import { useEffect, useState, useCallback } from 'react';
import { useScribeSession } from '@/hooks/use-scribe-session';
import type { ScribeStatus } from '@/hooks/use-scribe-session';
import type { ScribeTranscriptTurn, ScribeSessionItem } from '@/services/scribe-service';
import { getScribeSessions, getScribeResult } from '@/services/scribe-service';
import type { ScribeResultResponse } from '@/services/scribe-service';
import { useAuthStore } from '@/stores/auth-store';
import { WaveformCanvas } from '@/components/scribe/waveform-canvas';
import { SyncBadge } from '@/components/scribe/sync-badge';
import { TranscriptSheet, useBottomSheet } from '@/components/scribe/transcript-sheet';
import { Loader2 } from 'lucide-react';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function IdleView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={onStart}
        className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #206E55 0%, #2D8F6F 100%)',
          boxShadow: '0 0 0 8px rgba(32, 110, 85, 0.12), 0 4px 24px rgba(32, 110, 85, 0.25)',
        }}
      >
        <i className="ph ph-microphone" style={{ fontSize: '32px', color: 'white' }} aria-hidden />
      </button>
      <div className="text-center">
        <p className="text-sm text-[#4E5553]">Tap to start recording</p>
      </div>
    </div>
  );
}

function RecordingView({
  status,
  durationMs,
  analyserNode,
  syncState,
  ackedChunks,
  totalChunks,
  onPause,
  onResume,
  onStop,
}: {
  status: ScribeStatus;
  durationMs: number;
  analyserNode: AnalyserNode | null;
  syncState: string;
  ackedChunks: number;
  totalChunks: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  const isPaused = status === 'paused';

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      {/* Timer */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          {!isPaused && (
            <div
              className="w-2 h-2 rounded-full bg-red-500"
              style={{ animation: 'scribeBlink 1s infinite' }}
            />
          )}
          <span
            className="text-4xl font-light text-[#141515] tracking-tight"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatDuration(durationMs)}
          </span>
        </div>
        <span className="text-xs text-[#767F7C]">
          {isPaused ? 'Paused' : 'Recording'}
        </span>
      </div>

      {/* Waveform */}
      <div
        className="w-full rounded-2xl px-4 py-3"
        style={{ backgroundColor: 'rgba(32, 110, 85, 0.06)', height: '80px' }}
      >
        <WaveformCanvas
          analyserNode={isPaused ? null : analyserNode}
          barColor={isPaused ? '#9CA3AF' : '#206E55'}
        />
      </div>

      {/* Sync badge */}
      <SyncBadge
        syncState={syncState as any}
        ackedChunks={ackedChunks}
        totalChunks={totalChunks}
      />

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Pause / Resume */}
        <button
          type="button"
          onClick={isPaused ? onResume : onPause}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'rgba(32, 110, 85, 0.1)',
            border: '1px solid rgba(32, 110, 85, 0.2)',
          }}
        >
          <i
            className={`ph ${isPaused ? 'ph-play' : 'ph-pause'}`}
            style={{ fontSize: '24px', color: '#206E55' }}
            aria-hidden
          />
        </button>

        {/* Stop */}
        <button
          type="button"
          onClick={onStop}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
            boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)',
          }}
        >
          <div className="w-5 h-5 rounded-sm bg-white" />
        </button>
      </div>

      <style jsx>{`
        @keyframes scribeBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function StoppingView({
  durationMs,
  syncState,
  ackedChunks,
  totalChunks,
  onFinalize,
  onDiscard,
}: {
  durationMs: number;
  syncState: string;
  ackedChunks: number;
  totalChunks: number;
  onFinalize: () => void;
  onDiscard: () => void;
}) {
  const allUploaded = ackedChunks >= totalChunks && totalChunks > 0;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <div className="text-center">
        <span
          className="text-3xl font-light text-[#141515] tracking-tight"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatDuration(durationMs)}
        </span>
        <p className="text-xs text-[#767F7C] mt-1">Recording stopped</p>
      </div>

      <SyncBadge
        syncState={syncState as any}
        ackedChunks={ackedChunks}
        totalChunks={totalChunks}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onDiscard}
          className="px-6 py-2.5 rounded-full text-sm font-medium transition-colors hover:bg-[#F3F4F6]"
          style={{ color: '#DC2626', border: '1px solid #E5E7EB' }}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onFinalize}
          disabled={!allUploaded}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#206E55' }}
        >
          {allUploaded ? 'Finalize' : 'Uploading...'}
        </button>
      </div>
    </div>
  );
}

function FinalizingView() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 text-[#206E55] animate-spin" />
      <p className="text-sm text-[#4E5553]">Finalizing recording...</p>
    </div>
  );
}

function ProcessingView() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 text-[#206E55] animate-spin" />
      <div className="text-center">
        <p className="text-sm font-medium text-[#141515]">Generating transcript...</p>
        <p className="text-xs text-[#767F7C] mt-1">This may take a minute</p>
      </div>
    </div>
  );
}

function ErrorView({ error, onNewRecording, onDiscard }: { error: string; onNewRecording: () => void; onDiscard: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 max-w-sm text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
      >
        <i className="ph ph-warning" style={{ fontSize: '32px', color: '#DC2626' }} aria-hidden />
      </div>
      <p className="text-sm text-[#DC2626]">{error}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDiscard}
          className="px-5 py-2 rounded-full text-sm font-medium transition-colors hover:bg-[#F3F4F6]"
          style={{ color: '#4E5553', border: '1px solid #E5E7EB' }}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={async () => { await onDiscard(); onNewRecording(); }}
          className="px-5 py-2 rounded-full text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#206E55' }}
        >
          New Recording
        </button>
      </div>
    </div>
  );
}

function SessionHistoryItem({ session, onSelect }: { session: ScribeSessionItem; onSelect: (id: string, durationMs?: number) => void }) {
  const date = new Date(session.createdAt);
  const timeStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' +
    date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const durationStr = session.totalDurationMs
    ? `${Math.floor(session.totalDurationMs / 60000)}m ${Math.floor((session.totalDurationMs % 60000) / 1000)}s`
    : null;

  const statusLabel = session.processingStatus === 'completed' ? 'Transcribed'
    : session.processingStatus === 'processing' || session.processingStatus === 'queued' ? 'Processing...'
    : session.processingStatus === 'failed' ? 'Failed'
    : session.status === 'finalized' ? 'Finalized'
    : session.status;

  const statusColor = session.processingStatus === 'completed' ? '#206E55'
    : session.processingStatus === 'failed' ? '#DC2626'
    : '#767F7C';

  return (
    <button
      type="button"
      onClick={() => onSelect(session.sessionId, session.totalDurationMs || undefined)}
      className="w-full text-left p-3 rounded-xl hover:bg-[#F3F4F6] transition-colors"
      style={{ border: '1px solid #E5E7EB' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#767F7C]">{timeStr}</span>
        <span className="text-[10px] font-medium" style={{ color: statusColor }}>{statusLabel}</span>
      </div>
      {durationStr && <span className="text-xs text-[#9CA3AF]">{durationStr}</span>}
      {session.transcriptPreview && (
        <p className="text-xs text-[#4E5553] mt-1.5 line-clamp-2 leading-relaxed">{session.transcriptPreview}</p>
      )}
    </button>
  );
}

function SessionHistory({ onSelect }: { onSelect: (id: string, durationMs?: number) => void }) {
  const [sessions, setSessions] = useState<ScribeSessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScribeSessions()
      .then(res => setSessions(res.sessions.filter(s => s.processingStatus === 'completed')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (sessions.length === 0) return null;

  return (
    <div className="w-full mt-8">
      <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Previous Recordings</h2>
      <div className="space-y-2">
        {sessions.map(s => (
          <SessionHistoryItem key={s.sessionId} session={s} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function ScribeContent() {
  const {
    status,
    syncState,
    durationMs,
    analyserNode,
    sessionId,
    error,
    ackedChunks,
    totalChunks,
    processingStatus,
    transcriptText,
    transcriptTurns,
    start,
    pause,
    resume,
    stop,
    finalize,
    discard,
    refreshResult,
  } = useScribeSession();

  const sheet = useBottomSheet('collapsed');

  const [sheetTranscript, setSheetTranscript] = useState<{
    text: string | null;
    turns: ScribeTranscriptTurn[] | null;
    durationMs?: number;
  } | null>(null);

  // Auto-open sheet when transcript arrives
  useEffect(() => {
    if (status === 'done' && transcriptText) {
      setSheetTranscript({ text: transcriptText, turns: transcriptTurns, durationMs });
      sheet.snapTo('half');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, transcriptText]);

  const handleSelectSession = useCallback(async (selectedSessionId: string, sessionDurationMs?: number) => {
    try {
      const result = await getScribeResult(selectedSessionId);
      if (result.processingStatus === 'completed') {
        setSheetTranscript({
          text: result.transcriptText || null,
          turns: result.turns || null,
          durationMs: sessionDurationMs,
        });
        sheet.snapTo('half');
      }
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex-1 flex flex-col items-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-[#141515]">Scribe</h1>
          </div>

          {(status === 'idle' || status === 'done') && (
            <>
              <IdleView onStart={status === 'done' ? async () => { await discard(); start(); } : start} />
              <SessionHistory onSelect={handleSelectSession} />
            </>
          )}

          {status === 'starting' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-[#206E55] animate-spin" />
              <p className="text-sm text-[#4E5553]">Starting...</p>
            </div>
          )}

          {(status === 'recording' || status === 'paused') && (
            <RecordingView
              status={status}
              durationMs={durationMs}
              analyserNode={analyserNode}
              syncState={syncState}
              ackedChunks={ackedChunks}
              totalChunks={totalChunks}
              onPause={pause}
              onResume={resume}
              onStop={stop}
            />
          )}

          {status === 'stopping' && (
            <StoppingView
              durationMs={durationMs}
              syncState={syncState}
              ackedChunks={ackedChunks}
              totalChunks={totalChunks}
              onFinalize={finalize}
              onDiscard={discard}
            />
          )}

          {status === 'finalizing' && <FinalizingView />}
          {status === 'processing' && <ProcessingView />}

          {status === 'error' && (
            <ErrorView
              error={error || 'Something went wrong'}
              onNewRecording={async () => { await discard(); start(); }}
              onDiscard={discard}
            />
          )}
        </div>
      </div>

      {sheetTranscript && (
        <TranscriptSheet
          sheet={sheet}
          transcriptText={sheetTranscript.text}
          turns={sheetTranscript.turns}
          durationMs={sheetTranscript.durationMs}
        />
      )}
    </>
  );
}

export default function ScribePage() {
  const { isAuthenticated } = useAuthStore();

  // Unauthenticated visitors are gated by the forced SignUpModal
  // (LoginModalWatcher); render nothing behind it until they sign in.
  if (!isAuthenticated) {
    return null;
  }

  return <ScribeContent />;
}
