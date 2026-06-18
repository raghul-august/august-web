import { useAuthStore } from '@/stores/auth-store';
import { getActiveTenant } from '@/lib/tenant';
import logger from '@/utils/logger';
import { serializeError } from './error-reporter';

export interface ScribeStartResponse {
  success: boolean;
  sessionId: string;
  status: string;
  confirmedChunks: number;
}

export interface ScribeChunkResponse {
  success: boolean;
  acked: boolean;
  sessionId: string;
  chunkIndex: number;
  confirmedChunks: number;
}

export interface ScribeStatusResponse {
  success: boolean;
  sessionId: string;
  status: string;
  confirmedChunks: number;
  totalChunks: number | null;
  uploadComplete: boolean;
}

export interface ScribeFinalizeResponse {
  success: boolean;
  sessionId: string;
  status: string;
}

export interface ScribeCancelResponse {
  success: boolean;
  sessionId: string;
  status: string;
}

export type ScribeProcessingStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

export interface ScribeTranscriptTurn {
  speaker: 'doctor' | 'patient' | 'unknown';
  text: string;
}

export interface ScribeSessionItem {
  sessionId: string;
  status: string;
  confirmedChunks: number;
  totalDurationMs: number | null;
  createdAt: string;
  finalizedAt: string | null;
  processingStatus: ScribeProcessingStatus | null;
  transcriptPreview: string | null;
}

export interface ScribeSessionsResponse {
  success: boolean;
  sessions: ScribeSessionItem[];
}

export interface ScribeResultResponse {
  success: boolean;
  sessionId: string;
  uploadStatus: string;
  processingStatus: ScribeProcessingStatus;
  transcriptText?: string;
  turns?: ScribeTranscriptTurn[];
  error?: string;
}

/**
 * All scribe calls go through the dedicated /api/scribe/... proxy route,
 * bypassing the generic axios proxy which corrupts binary data.
 */
async function scribeFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = useAuthStore.getState().getAccessToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // The /api/scribe proxy runs server-side where getActiveTenant() (a client
  // store) isn't readable, so resolve the active tenant here and pass it along.
  headers.set('x-august-tenant', getActiveTenant());
  const res = await fetch(`/api/scribe/${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Scribe API error ${res.status}`);
    (err as any).response = { status: res.status, data: body };
    throw err;
  }
  return res;
}

export async function startScribeSession(mimeType: string): Promise<ScribeStartResponse> {
  try {
    const res = await scribeFetch('start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mimeType,
        clientStartedAt: new Date().toISOString(),
      }),
    });
    return res.json();
  } catch (error) {
    logger.error('[Scribe] Error starting session', serializeError(error));
    throw error;
  }
}

export async function uploadScribeChunk(
  sessionId: string,
  chunkIndex: number,
  blob: Blob,
  sizeBytes: number,
  durationMsStart: number,
  durationMsEnd: number,
): Promise<ScribeChunkResponse> {
  try {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('sizeBytes', String(sizeBytes));
    formData.append('durationMsStart', String(durationMsStart));
    formData.append('durationMsEnd', String(durationMsEnd));

    const res = await scribeFetch(`${sessionId}/chunk/${chunkIndex}`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  } catch (error) {
    logger.error('[Scribe] Error uploading chunk', serializeError(error));
    throw error;
  }
}

export async function getScribeStatus(sessionId: string): Promise<ScribeStatusResponse> {
  try {
    const res = await scribeFetch(`${sessionId}/status`);
    return res.json();
  } catch (error) {
    logger.error('[Scribe] Error fetching status', serializeError(error));
    throw error;
  }
}

export async function finalizeScribeSession(
  sessionId: string,
  totalChunks: number,
  totalDurationMs: number,
): Promise<ScribeFinalizeResponse> {
  try {
    const res = await scribeFetch(`${sessionId}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalChunks, totalDurationMs }),
    });
    return res.json();
  } catch (error) {
    logger.error('[Scribe] Error finalizing session', serializeError(error));
    throw error;
  }
}

export async function cancelScribeSession(sessionId: string): Promise<ScribeCancelResponse> {
  try {
    const res = await scribeFetch(`${sessionId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return res.json();
  } catch (error) {
    logger.error('[Scribe] Error cancelling session', serializeError(error));
    throw error;
  }
}

export async function getScribeResult(sessionId: string): Promise<ScribeResultResponse> {
  try {
    const res = await scribeFetch(`${sessionId}/result`);
    return res.json();
  } catch (error) {
    logger.error('[Scribe] Error fetching result', serializeError(error));
    throw error;
  }
}

export async function getScribeSessions(): Promise<ScribeSessionsResponse> {
  try {
    const res = await scribeFetch('sessions');
    return res.json();
  } catch (error) {
    logger.error('[Scribe] Error fetching sessions', serializeError(error));
    throw error;
  }
}
