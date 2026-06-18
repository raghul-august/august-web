import { uploadScribeChunk } from '@/services/scribe-service';
import type { ScribeChunkResponse } from '@/services/scribe-service';
import logger from '@/utils/logger';

export type ChunkStatus = 'queued' | 'uploading' | 'acked' | 'retry_wait' | 'failed';

export type QueueSyncState = 'synced' | 'uploading' | 'retrying' | 'offline' | 'idle';

export interface QueuedChunk {
  sessionId: string;
  chunkIndex: number;
  blob: Blob;
  sizeBytes: number;
  durationMsStart: number;
  durationMsEnd: number;
  status: ChunkStatus;
  attempts: number;
}

interface ChunkQueueCallbacks {
  onSyncStateChange: (state: QueueSyncState) => void;
  onChunkAcked: (chunkIndex: number, confirmedChunks: number) => void;
  onError: (chunkIndex: number, error: string) => void;
}

const RETRY_DELAYS = [1000, 2000, 5000, 10000, 20000];
const MAX_ATTEMPTS = 10;

const DB_NAME = 'scribe_db';
const DB_VERSION = 1;
const CHUNKS_STORE = 'chunks';
const SESSION_STORE = 'sessions';

// IndexedDB helpers
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CHUNKS_STORE)) {
        db.createObjectStore(CHUNKS_STORE, { keyPath: ['sessionId', 'chunkIndex'] });
      }
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: 'sessionId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(storeName: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function idbDelete(storeName: string, key: IDBValidKey | IDBKeyRange): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function idbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => { db.close(); resolve(req.result as T[]); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

async function idbClearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export interface ScribeSessionMeta {
  sessionId: string;
  mimeType: string;
  status: 'recording' | 'paused' | 'stopped';
  totalChunksQueued: number;
  durationMs: number;
  createdAt: string;
}

export class ScribeChunkQueue {
  private queue: QueuedChunk[] = [];
  private processing = false;
  private complete = false;
  private destroyed = false;
  private callbacks: ChunkQueueCallbacks;
  private sessionId: string;
  private drainResolve: (() => void) | null = null;
  private online = true;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(sessionId: string, callbacks: ChunkQueueCallbacks) {
    this.sessionId = sessionId;
    this.callbacks = callbacks;
    this.online = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.online = true;
    this.processNext();
  };

  private handleOffline = () => {
    this.online = false;
    this.callbacks.onSyncStateChange('offline');
  };

  async enqueue(chunk: Omit<QueuedChunk, 'status' | 'attempts'>): Promise<void> {
    const queued: QueuedChunk = { ...chunk, status: 'queued', attempts: 0 };
    this.queue.push(queued);

    // Persist to IndexedDB
    await idbPut(CHUNKS_STORE, {
      sessionId: chunk.sessionId,
      chunkIndex: chunk.chunkIndex,
      sizeBytes: chunk.sizeBytes,
      durationMsStart: chunk.durationMsStart,
      durationMsEnd: chunk.durationMsEnd,
      status: 'queued',
      attempts: 0,
      // Store blob as-is — IndexedDB supports Blob natively
      blob: chunk.blob,
    });

    this.processNext();
  }

  markComplete(): void {
    this.complete = true;
    this.checkDrained();
  }

  /** Returns a promise that resolves when all queued chunks are acked and markComplete has been called. */
  drain(): Promise<void> {
    if (this.isDrained()) return Promise.resolve();
    return new Promise((resolve) => {
      this.drainResolve = resolve;
    });
  }

  async discard(): Promise<void> {
    this.queue = [];
    this.complete = true;
    this.processing = false;
    this.destroyed = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    await this.clearIdb();
    this.drainResolve?.();
    this.drainResolve = null;
    this.destroy();
  }

  destroy(): void {
    this.destroyed = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  get pendingCount(): number {
    return this.queue.filter(c => c.status !== 'acked').length;
  }

  get ackedCount(): number {
    return this.queue.filter(c => c.status === 'acked').length;
  }

  get totalCount(): number {
    return this.queue.length;
  }

  private isDrained(): boolean {
    return this.complete && this.queue.every(c => c.status === 'acked');
  }

  private checkDrained(): void {
    if (this.isDrained() && this.drainResolve) {
      this.drainResolve();
      this.drainResolve = null;
    }
  }

  private async processNext(): Promise<void> {
    if (this.destroyed || this.processing) return;
    if (!this.online) {
      this.callbacks.onSyncStateChange('offline');
      return;
    }

    const next = this.queue.find(c => c.status === 'queued' || c.status === 'retry_wait');
    if (!next) {
      this.callbacks.onSyncStateChange(this.isDrained() || this.queue.every(c => c.status === 'acked') ? 'synced' : 'idle');
      this.checkDrained();
      return;
    }

    // Enforce serial order — don't upload chunk N+1 until N is acked
    const prevChunk = this.queue.find(c => c.chunkIndex === next.chunkIndex - 1);
    if (prevChunk && prevChunk.status !== 'acked') {
      return;
    }

    this.processing = true;
    next.status = 'uploading';
    next.attempts++;
    this.callbacks.onSyncStateChange(next.attempts > 1 ? 'retrying' : 'uploading');

    try {
      const response = await uploadScribeChunk(
        next.sessionId,
        next.chunkIndex,
        next.blob,
        next.sizeBytes,
        next.durationMsStart,
        next.durationMsEnd,
      );

      if (this.destroyed) return;

      next.status = 'acked';
      await idbDelete(CHUNKS_STORE, [next.sessionId, next.chunkIndex]);
      this.callbacks.onChunkAcked(next.chunkIndex, response.confirmedChunks);

      this.processing = false;
      this.processNext();
    } catch (error: unknown) {
      if (this.destroyed) return;

      const status = (error as any)?.response?.status;
      const errorCode = (error as any)?.response?.data?.error;

      // Non-retryable errors
      if (status === 400 || status === 404 || errorCode === 'session_finalized' || errorCode === 'session_cancelled') {
        next.status = 'failed';
        this.processing = false;
        this.callbacks.onError(next.chunkIndex, errorCode || 'upload_failed');
        return;
      }

      // Retryable — network error, 5xx, or out_of_order (concurrent retry)
      if (next.attempts >= MAX_ATTEMPTS) {
        next.status = 'failed';
        this.processing = false;
        this.callbacks.onError(next.chunkIndex, 'max_retries_exceeded');
        return;
      }

      next.status = 'retry_wait';
      const delay = RETRY_DELAYS[Math.min(next.attempts - 1, RETRY_DELAYS.length - 1)];
      logger.warn(`[Scribe] Chunk ${next.chunkIndex} retry ${next.attempts} in ${delay}ms`);

      this.processing = false;
      this.retryTimer = setTimeout(() => {
        this.retryTimer = null;
        this.processNext();
      }, delay);
    }
  }

  private async clearIdb(): Promise<void> {
    try {
      await idbClearStore(CHUNKS_STORE);
      await idbClearStore(SESSION_STORE);
    } catch {
      // ignore
    }
  }

  // Recovery: load persisted chunks from IndexedDB
  static async loadPersistedChunks(sessionId: string): Promise<QueuedChunk[]> {
    try {
      const all = await idbGetAll<QueuedChunk & { blob: Blob }>(CHUNKS_STORE);
      return all
        .filter(c => c.sessionId === sessionId)
        .sort((a, b) => a.chunkIndex - b.chunkIndex)
        .map(c => ({
          sessionId: c.sessionId,
          chunkIndex: c.chunkIndex,
          blob: c.blob,
          sizeBytes: c.sizeBytes,
          durationMsStart: c.durationMsStart,
          durationMsEnd: c.durationMsEnd,
          status: 'queued' as ChunkStatus,
          attempts: 0,
        }));
    } catch {
      return [];
    }
  }

  static async loadPersistedSession(): Promise<ScribeSessionMeta | null> {
    try {
      const all = await idbGetAll<ScribeSessionMeta>(SESSION_STORE);
      return all[0] || null;
    } catch {
      return null;
    }
  }

  static async persistSessionMeta(meta: ScribeSessionMeta): Promise<void> {
    await idbPut(SESSION_STORE, meta);
  }

  static async clearAll(): Promise<void> {
    try {
      await idbClearStore(CHUNKS_STORE);
      await idbClearStore(SESSION_STORE);
    } catch {
      // ignore
    }
  }
}
