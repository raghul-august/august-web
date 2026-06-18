'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  startScribeSession,
  finalizeScribeSession,
  cancelScribeSession,
  getScribeStatus,
  getScribeResult,
} from '@/services/scribe-service';
import type { ScribeProcessingStatus, ScribeTranscriptTurn } from '@/services/scribe-service';
import { ScribeChunkQueue } from '@/lib/scribe/chunk-queue';
import type { QueueSyncState, ScribeSessionMeta } from '@/lib/scribe/chunk-queue';
import { onScribeEvent } from '@/lib/scribe/events';
import logger from '@/utils/logger';

export type ScribeStatus =
  | 'idle'
  | 'starting'
  | 'recording'
  | 'paused'
  | 'stopping'
  | 'finalizing'
  | 'processing'
  | 'done'
  | 'error';

export interface UseScribeSessionResult {
  status: ScribeStatus;
  syncState: QueueSyncState;
  durationMs: number;
  analyserNode: AnalyserNode | null;
  sessionId: string | null;
  error: string | null;
  ackedChunks: number;
  totalChunks: number;
  processingStatus: ScribeProcessingStatus;
  transcriptText: string | null;
  transcriptTurns: ScribeTranscriptTurn[] | null;
  start: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  finalize: () => Promise<void>;
  discard: () => Promise<void>;
  refreshResult: () => Promise<void>;
}

const SCRIBE_CHUNK_TIMESLICE_MS = 12000;

const SUPPORTED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
];

function getSupportedMimeType(): string {
  for (const type of SUPPORTED_MIME_TYPES) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

export function useScribeSession(): UseScribeSessionResult {
  const [status, setStatus] = useState<ScribeStatus>('idle');
  const [syncState, setSyncState] = useState<QueueSyncState>('idle');
  const [durationMs, setDurationMs] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ackedChunks, setAckedChunks] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<ScribeProcessingStatus>('idle');
  const [transcriptText, setTranscriptText] = useState<string | null>(null);
  const [transcriptTurns, setTranscriptTurns] = useState<ScribeTranscriptTurn[] | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<ScribeChunkQueue | null>(null);
  const chunkIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartRef = useRef(0);
  const pausedDurationRef = useRef(0);
  const mimeTypeRef = useRef('');
  const sessionIdRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Chain of pending async enqueue operations from ondataavailable.
  // pause()/stop() must await this before proceeding to ensure
  // the final chunk is durably queued.
  const enqueueChainRef = useRef<Promise<void>>(Promise.resolve());

  const cleanupMedia = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAnalyserNode(null);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const refreshResult = useCallback(async () => {
    if (!sessionIdRef.current) return;
    try {
      const result = await getScribeResult(sessionIdRef.current);
      setProcessingStatus(result.processingStatus);
      if (result.processingStatus === 'completed') {
        setTranscriptText(result.transcriptText || null);
        setTranscriptTurns(result.turns || null);
        setStatus('done');
        stopPolling();
        ScribeChunkQueue.clearAll();
      } else if (result.processingStatus === 'failed') {
        setError(result.error || 'Transcription failed');
        setStatus('error');
        stopPolling();
      }
    } catch {
      // Polling failure is transient — don't surface to UI
    }
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollingRef.current = setInterval(() => {
      refreshResult();
    }, 5000);
  }, [stopPolling, refreshResult]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMedia();
      queueRef.current?.destroy();
      stopPolling();
    };
  }, [cleanupMedia, stopPolling]);

  // Listen for WebPubSub scribe events
  useEffect(() => {
    const unsubscribe = onScribeEvent((event) => {
      if (event.sessionId !== sessionIdRef.current) return;

      if (event.type === 'scribe-transcription-complete') {
        setProcessingStatus('completed');
        setTranscriptText(event.transcriptText);
        setTranscriptTurns(event.turns);
        setStatus('done');
        stopPolling();
        ScribeChunkQueue.clearAll();
      } else if (event.type === 'scribe-transcription-failed') {
        setProcessingStatus('failed');
        setError(event.error || 'Transcription failed');
        setStatus('error');
        stopPolling();
      }
    });
    return unsubscribe;
  }, [stopPolling]);

  // Check for recoverable session on mount
  useEffect(() => {
    (async () => {
      try {
        const meta = await ScribeChunkQueue.loadPersistedSession();
        if (!meta) return;

        // Check backend status
        const backendStatus = await getScribeStatus(meta.sessionId).catch(() => null);
        if (!backendStatus) {
          await ScribeChunkQueue.clearAll();
          return;
        }

        if (backendStatus.status === 'cancelled') {
          await ScribeChunkQueue.clearAll();
          return;
        }

        if (backendStatus.status === 'finalized') {
          // Check if transcription is in progress or complete
          const result = await getScribeResult(meta.sessionId).catch(() => null);
          if (result) {
            setSessionId(meta.sessionId);
            sessionIdRef.current = meta.sessionId;
            setProcessingStatus(result.processingStatus);
            if (result.processingStatus === 'completed') {
              setTranscriptText(result.transcriptText || null);
              setTranscriptTurns(result.turns || null);
              setStatus('done');
              await ScribeChunkQueue.clearAll();
            } else if (result.processingStatus === 'failed') {
              setError(result.error || 'Transcription failed');
              setStatus('error');
              await ScribeChunkQueue.clearAll();
            } else {
              // Still processing — keep IDB for next recovery, start polling
              setStatus('processing');
              startPolling();
            }
          }
          // If result fetch failed, leave IDB intact for next recovery attempt
          return;
        }

        // Restore common state
        setSessionId(meta.sessionId);
        sessionIdRef.current = meta.sessionId;
        mimeTypeRef.current = meta.mimeType;
        chunkIndexRef.current = meta.totalChunksQueued;
        setTotalChunks(meta.totalChunksQueued);
        setAckedChunks(backendStatus.confirmedChunks);
        pausedDurationRef.current = meta.durationMs || 0;
        setDurationMs(meta.durationMs || 0);

        // Load persisted chunks that backend hasn't confirmed yet
        const persistedChunks = await ScribeChunkQueue.loadPersistedChunks(meta.sessionId);
        const unacked = persistedChunks.filter(c => c.chunkIndex >= backendStatus.confirmedChunks);

        if (unacked.length > 0) {
          // Has unuploaded chunks — set up queue and resume uploading
          setSyncState('uploading');

          const recoverySessionId = meta.sessionId;
          const queue = new ScribeChunkQueue(recoverySessionId, {
            onSyncStateChange: (s) => { if (sessionIdRef.current === recoverySessionId) setSyncState(s); },
            onChunkAcked: (_, confirmed) => { if (sessionIdRef.current === recoverySessionId) setAckedChunks(confirmed); },
            onError: (idx, err) => {
              if (sessionIdRef.current !== recoverySessionId) return;
              logger.error(`[Scribe] Recovery chunk ${idx} failed: ${err}`);
              setError(`Upload failed for chunk ${idx}`);
              setStatus('error');
            },
          });
          queueRef.current = queue;

          for (const chunk of unacked) {
            await queue.enqueue(chunk);
          }

          if (meta.status === 'stopped') {
            queue.markComplete();
          }
        }

        // Regardless of unacked count, surface the session for user action.
        // Reload can't resume mic capture, so treat recording/paused as stopped.
        if (meta.status === 'stopped') {
          setStatus('stopping');
        } else {
          // Was recording or paused — can't resume mic, mark as stopped
          setStatus('stopping');
          await ScribeChunkQueue.persistSessionMeta({ ...meta, status: 'stopped' });
          queueRef.current?.markComplete();
        }
      } catch (err) {
        logger.error('[Scribe] Recovery check failed', String(err));
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startMediaRecorder = useCallback((stream: MediaStream, mimeType: string) => {
    const recorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 128000,
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size === 0) return;
      const idx = chunkIndexRef.current++;
      const chunkDurationMs = SCRIBE_CHUNK_TIMESLICE_MS;
      const durationMsStart = idx * chunkDurationMs;
      const durationMsEnd = durationMsStart + chunkDurationMs;

      setTotalChunks(prev => prev + 1);

      // Chain the async enqueue work so pause()/stop() can await it.
      // Each link catches its own errors so one failure doesn't poison
      // the chain and brick subsequent chunks.
      enqueueChainRef.current = enqueueChainRef.current.then(async () => {
        if (queueRef.current) {
          await queueRef.current.enqueue({
            sessionId: sessionIdRef.current!,
            chunkIndex: idx,
            blob: event.data,
            sizeBytes: event.data.size,
            durationMsStart,
            durationMsEnd,
          });

          await ScribeChunkQueue.persistSessionMeta({
            sessionId: sessionIdRef.current!,
            mimeType,
            status: 'recording',
            totalChunksQueued: chunkIndexRef.current,
            durationMs: pausedDurationRef.current + (Date.now() - recordingStartRef.current),
            createdAt: new Date().toISOString(),
          });
        }
      }).catch((err) => {
        logger.error(`[Scribe] Failed to enqueue chunk ${idx}`, String(err));
        cleanupMedia();
        setError(`Failed to save chunk ${idx}`);
        setStatus('error');
      });
    };

    recorder.onerror = () => {
      logger.error('[Scribe] MediaRecorder error');
      setError('Recording failed');
      setStatus('error');
      cleanupMedia();
    };

    recorder.start(SCRIBE_CHUNK_TIMESLICE_MS);
    mediaRecorderRef.current = recorder;
  }, [cleanupMedia]);

  const start = useCallback(async () => {
    try {
      setError(null);
      setStatus('starting');

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        setError('No supported audio format found');
        setStatus('error');
        return;
      }
      mimeTypeRef.current = mimeType;

      // Acquire microphone FIRST — before creating any server state.
      // If this fails, no orphan session or queue is left behind.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Audio context for waveform
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      setAnalyserNode(analyser);

      // Now create the backend session (mic is confirmed working)
      const response = await startScribeSession(mimeType);
      setSessionId(response.sessionId);
      sessionIdRef.current = response.sessionId;
      setAckedChunks(0);
      setTotalChunks(0);
      chunkIndexRef.current = 0;
      enqueueChainRef.current = Promise.resolve();

      // Destroy any old recovery queue before creating a new one
      if (queueRef.current) {
        queueRef.current.destroy();
        queueRef.current = null;
      }
      await ScribeChunkQueue.clearAll();

      // Set up chunk queue
      const activeSessionId = response.sessionId;
      const queue = new ScribeChunkQueue(activeSessionId, {
        onSyncStateChange: (s) => { if (sessionIdRef.current === activeSessionId) setSyncState(s); },
        onChunkAcked: (_, confirmed) => { if (sessionIdRef.current === activeSessionId) setAckedChunks(confirmed); },
        onError: (idx, err) => {
          if (sessionIdRef.current !== activeSessionId) return;
          logger.error(`[Scribe] Chunk ${idx} failed: ${err}`);
          setError(`Upload failed for chunk ${idx}`);
          setStatus('error');
        },
      });
      queueRef.current = queue;

      // Start recording with timeslice
      startMediaRecorder(stream, mimeType);

      // Persist session meta
      await ScribeChunkQueue.persistSessionMeta({
        sessionId: response.sessionId,
        mimeType,
        status: 'recording',
        totalChunksQueued: 0,
        durationMs: 0,
        createdAt: new Date().toISOString(),
      });

      // Duration timer — tracks recorded audio time, not wall clock
      setDurationMs(0);
      pausedDurationRef.current = 0;
      recordingStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDurationMs(pausedDurationRef.current + (Date.now() - recordingStartRef.current));
      }, 100);

      setStatus('recording');
    } catch (err) {
      logger.error('[Scribe] Failed to start', String(err));

      // Clean up anything that was partially set up
      cleanupMedia();

      // If we created a backend session but something failed after,
      // cancel it to avoid orphans
      if (sessionIdRef.current) {
        cancelScribeSession(sessionIdRef.current).catch(() => {});
        await ScribeChunkQueue.clearAll();
        queueRef.current?.destroy();
        queueRef.current = null;
        sessionIdRef.current = null;
        setSessionId(null);
      }

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone permission denied');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found');
        } else {
          setError('Could not access microphone');
        }
      } else {
        setError('Failed to start recording');
      }
      setStatus('error');
    }
  }, [cleanupMedia, startMediaRecorder]);

  const pause = useCallback(async () => {
    if (status !== 'recording') return;

    // Accumulate recorded duration
    pausedDurationRef.current += Date.now() - recordingStartRef.current;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop the recorder — this triggers a final dataavailable event
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      await new Promise<void>((resolve) => {
        recorder.addEventListener('stop', () => resolve(), { once: true });
        recorder.requestData();
        recorder.stop();
      });
    }
    mediaRecorderRef.current = null;

    // Wait for the final chunk's async enqueue to complete
    await enqueueChainRef.current;

    setStatus('paused');

    await ScribeChunkQueue.persistSessionMeta({
      sessionId: sessionIdRef.current!,
      mimeType: mimeTypeRef.current,
      status: 'paused',
      totalChunksQueued: chunkIndexRef.current,
      durationMs: pausedDurationRef.current,
      createdAt: new Date().toISOString(),
    });
  }, [status]);

  const resume = useCallback(async () => {
    if (status !== 'paused') return;

    try {
      // If stream was lost (e.g. after a tab switch), re-acquire
      let stream = streamRef.current;
      if (!stream || stream.getAudioTracks().every(t => t.readyState === 'ended')) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;

        // Reconnect analyser
        if (audioContextRef.current) {
          const source = audioContextRef.current.createMediaStreamSource(stream);
          const analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.7;
          source.connect(analyser);
          setAnalyserNode(analyser);
        }
      }

      // Start new MediaRecorder, chunk numbering continues
      startMediaRecorder(stream, mimeTypeRef.current);

      // Resume timer
      recordingStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDurationMs(pausedDurationRef.current + (Date.now() - recordingStartRef.current));
      }, 100);

      setStatus('recording');

      await ScribeChunkQueue.persistSessionMeta({
        sessionId: sessionIdRef.current!,
        mimeType: mimeTypeRef.current,
        status: 'recording',
        totalChunksQueued: chunkIndexRef.current,
        durationMs: pausedDurationRef.current,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      logger.error('[Scribe] Failed to resume', String(err));
      setError('Failed to resume recording');
      setStatus('error');
    }
  }, [status, startMediaRecorder]);

  const stop = useCallback(async () => {
    if (status !== 'recording' && status !== 'paused') return;

    setStatus('stopping');

    // Stop timer
    if (status === 'recording') {
      pausedDurationRef.current += Date.now() - recordingStartRef.current;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop recorder and wait for final dataavailable + stop events
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        recorder.addEventListener('stop', () => resolve(), { once: true });
        recorder.stop();
      });
    }

    // Wait for the final chunk's async enqueue to complete
    await enqueueChainRef.current;

    cleanupMedia();

    // Mark queue complete
    queueRef.current?.markComplete();

    await ScribeChunkQueue.persistSessionMeta({
      sessionId: sessionIdRef.current!,
      mimeType: mimeTypeRef.current,
      status: 'stopped',
      totalChunksQueued: chunkIndexRef.current,
      durationMs: pausedDurationRef.current,
      createdAt: new Date().toISOString(),
    });
  }, [status, cleanupMedia]);

  const finalize = useCallback(async () => {
    if (!sessionIdRef.current) return;

    setStatus('finalizing');

    try {
      // Wait for all chunks to be uploaded
      if (queueRef.current) {
        await queueRef.current.drain();
      }

      await finalizeScribeSession(
        sessionIdRef.current,
        chunkIndexRef.current,
        pausedDurationRef.current,
      );

      queueRef.current?.destroy();
      queueRef.current = null;

      // Keep a lightweight session record for post-refresh recovery.
      // Clear chunk data but preserve session metadata so recovery
      // can find the sessionId and fetch the transcription result.
      await ScribeChunkQueue.persistSessionMeta({
        sessionId: sessionIdRef.current!,
        mimeType: mimeTypeRef.current,
        status: 'stopped',
        totalChunksQueued: chunkIndexRef.current,
        durationMs: pausedDurationRef.current,
        createdAt: new Date().toISOString(),
      });

      // Transition to processing — backend is now transcribing
      setProcessingStatus('queued');
      setStatus('processing');
      startPolling();
    } catch (err) {
      logger.error('[Scribe] Finalize failed', String(err));
      setError('Failed to finalize recording');
      setStatus('error');
    }
  }, []);

  const discard = useCallback(async () => {
    if (!sessionIdRef.current) return;

    try {
      cleanupMedia();
      await queueRef.current?.discard();
      queueRef.current = null;

      await cancelScribeSession(sessionIdRef.current).catch(() => {});
      await ScribeChunkQueue.clearAll();

      setStatus('idle');
      setSessionId(null);
      sessionIdRef.current = null;
      setDurationMs(0);
      setAckedChunks(0);
      setTotalChunks(0);
      setError(null);
      chunkIndexRef.current = 0;
      pausedDurationRef.current = 0;
    } catch (err) {
      logger.error('[Scribe] Discard failed', String(err));
    }
  }, [cleanupMedia]);

  return {
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
  };
}
