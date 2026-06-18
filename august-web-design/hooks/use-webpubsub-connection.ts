'use client';

import { useEffect } from 'react';
import { ensureWebPubSubConnected } from '@/services/webpubsub-service';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Keeps the WebPubSub singleton connected for the current user while the
 * calling component is mounted. The /chat page boots the connection from
 * chat-container, but it also tears it down on unmount — any other route
 * that needs live events (consults list, consult chat panes) mounts this
 * hook to bring the connection back up.
 *
 * On hard refresh the auth store rehydrates async — we wait for both a
 * userId AND an access token (negotiate-token won't work without it).
 * ensureWebPubSubConnected() is idempotent and serializes against an
 * in-flight disconnect, so mounting this on several components at once is
 * safe.
 *
 * `source` tags the console diagnostics so a missing connection can be
 * traced to the component that should have established it.
 */
export function useWebPubSubConnection(source: string): void {
  // The persisted auth-store user shape uses `userId` (from the JWT payload),
  // not `id`. Read both for safety in case the shape ever changes upstream.
  const userId = useAuthStore((s) => (s.user as { id?: string; userId?: string } | null)?.userId ?? (s.user as { id?: string } | null)?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  // Read accessToken from the cookie on every render. We can't subscribe to
  // it via Zustand because it lives in a cookie, not the store — but the
  // effect below re-runs whenever userId / isAuthenticated change, by which
  // point the cookie is set on hard refresh.
  const getAccessToken = useAuthStore((s) => s.getAccessToken);

  useEffect(() => {
    const ready = (): boolean => {
      if (!userId) {
        console.info(`[${source}] WebPubSub init: waiting on userId`);
        return false;
      }
      if (!isAuthenticated && !isAnonymous) {
        console.info(`[${source}] WebPubSub init: waiting on auth hydration`);
        return false;
      }
      if (!getAccessToken()) {
        console.info(`[${source}] WebPubSub init: waiting on access token`);
        return false;
      }
      return true;
    };

    if (!ready()) return;

    console.info(`[${source}] Ensuring WebPubSub connection`, { userId });
    void ensureWebPubSubConnected();

    // The service's auto-reconnect gives up after 5 attempts (~31s of
    // backoff), and browsers kill sockets in backgrounded tabs — so a user
    // who locks their laptop or loses network for a minute comes back to a
    // dead connection that nothing revives. Re-ensure when the tab regains
    // visibility/network, plus a slow heartbeat for give-ups that happen
    // while the page stays foregrounded. ensureWebPubSubConnected() is a
    // cheap no-op when already connected.
    const reEnsure = () => {
      if (!ready()) return;
      void ensureWebPubSubConnected();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') reEnsure();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', reEnsure);
    window.addEventListener('focus', reEnsure);
    const heartbeat = setInterval(reEnsure, 30_000);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', reEnsure);
      window.removeEventListener('focus', reEnsure);
      clearInterval(heartbeat);
    };
  }, [userId, isAuthenticated, isAnonymous, getAccessToken, source]);
}
