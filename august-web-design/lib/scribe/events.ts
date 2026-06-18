import type { ScribeTranscriptTurn } from '@/services/scribe-service';

export interface ScribeTranscriptionCompleteEvent {
  type: 'scribe-transcription-complete';
  sessionId: string;
  processingStatus: 'completed';
  transcriptText: string;
  turns: ScribeTranscriptTurn[];
  timestamp: string;
}

export interface ScribeTranscriptionFailedEvent {
  type: 'scribe-transcription-failed';
  sessionId: string;
  processingStatus: 'failed';
  error: string;
  timestamp: string;
}

export type ScribeEvent = ScribeTranscriptionCompleteEvent | ScribeTranscriptionFailedEvent;

type ScribeEventListener = (event: ScribeEvent) => void;

const listeners = new Set<ScribeEventListener>();

export function onScribeEvent(listener: ScribeEventListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function emitScribeEvent(event: ScribeEvent): void {
  listeners.forEach(fn => fn(event));
}

export function isScribeEvent(data: any): data is ScribeEvent {
  return data?.type === 'scribe-transcription-complete' || data?.type === 'scribe-transcription-failed';
}
