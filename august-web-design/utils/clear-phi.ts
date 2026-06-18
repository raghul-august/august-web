import { useChatStore } from '@/stores/chat-store';

const PRESERVE_LOCAL_KEYS = new Set<string>([
  'auth-storage',
]);

const SESSION_PHI_KEYS: string[] = [
  'health_memory_transfer',
];
export function clearAllPHI(): void {
  if (typeof window === 'undefined') return;

  try {
    const localKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key) localKeys.push(key);
    }
    for (const key of localKeys) {
      if (key.endsWith('-storage') && !PRESERVE_LOCAL_KEYS.has(key)) {
        try {
          localStorage.removeItem(key);
        } catch {
          // quota / private mode — non-fatal
        }
      }
    }
  } catch {
    // localStorage unavailable (private mode, etc.) — non-fatal
  }

  try {
    for (const key of SESSION_PHI_KEYS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // sessionStorage unavailable — non-fatal
  }

  // Force the chat store's in-memory state to clear so the on-screen
  // message list empties before the route push runs.
  try {
    useChatStore.getState().reset();
  } catch {
    // store not initialised yet — non-fatal
  }
}
