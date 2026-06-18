'use client';

import type { ChatLog } from '@/services/consultations-service';

const CONSULT_STORAGE_KEY = 'consult-storage';
export const CONSULT_CACHE_UPDATED_EVENT = 'consult-cache-updated';
const CHAT_LOGS_CACHE_MAX = 200;

type ConsultStorage = Record<string, ChatLog[]>;

function readAllConsultStorage(): ConsultStorage {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CONSULT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ConsultStorage;
    }
    return {};
  } catch {
    return {};
  }
}

function writeAllConsultStorage(map: ConsultStorage): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSULT_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Quota exceeded / private mode — silently ignore.
  }
}

export function readCachedChatLogs(encounterId: string): ChatLog[] | null {
  const all = readAllConsultStorage();
  const logs = all[encounterId];
  return Array.isArray(logs) && logs.length > 0 ? logs : null;
}

export function writeCachedChatLogs(encounterId: string, logs: ChatLog[]): void {
  if (typeof window === 'undefined') return;
  const sanitized = logs
    .map((log) => {
      if (typeof log.id === 'string' && log.id.startsWith('temp-')) return null;
      if (!Array.isArray(log.files) || log.files.length === 0) return log;
      const cleanFiles = log.files.filter(
        (f: any) => !(typeof f?.url === 'string' && f.url.startsWith('blob:')),
      );
      return { ...log, files: cleanFiles };
    })
    .filter(Boolean) as ChatLog[];
  const trimmed = sanitized.slice(-CHAT_LOGS_CACHE_MAX);
  const all = readAllConsultStorage();
  all[encounterId] = trimmed;
  writeAllConsultStorage(all);
  try {
    window.dispatchEvent(
      new CustomEvent(CONSULT_CACHE_UPDATED_EVENT, { detail: { encounterId } }),
    );
  } catch {
    // Older browsers without CustomEvent constructor — silently skip.
  }
}

export function getLatestCachedMessageTimestamp(encounterId: string): number | null {
  const logs = readCachedChatLogs(encounterId);
  if (!logs || logs.length === 0) return null;
  let latest = 0;
  for (const log of logs) {
    if (!log.timestamp) continue;
    const t = new Date(log.timestamp).getTime();
    if (Number.isFinite(t) && t > latest) latest = t;
  }
  return latest > 0 ? latest : null;
}
