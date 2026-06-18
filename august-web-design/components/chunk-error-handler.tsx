'use client';

import { useEffect } from 'react';

/**
 * Auto-reloads the page when a chunk load error occurs.
 * This handles the case where an old tab tries to load chunks
 * that no longer exist after a new deployment.
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    const RELOAD_KEY = 'reloaded-after-chunk-error';

    function handleError(event: ErrorEvent) {
      const message = event?.error?.message || event.message || '';
      if (
        message.includes('Failed to load chunk') ||
        message.includes('ChunkLoadError') ||
        message.includes('Loading chunk')
      ) {
        try {
          if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(RELOAD_KEY)) {
            sessionStorage.setItem(RELOAD_KEY, '1');
            window.location.reload();
          }
        } catch {
          window.location.reload();
        }
      }
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason ?? '';
      const message =
        typeof reason === 'string' ? reason : (reason?.message as string) || '';
      if (
        message.includes('Failed to load chunk') ||
        message.includes('ChunkLoadError') ||
        message.includes('Loading chunk')
      ) {
        try {
          if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(RELOAD_KEY)) {
            sessionStorage.setItem(RELOAD_KEY, '1');
            window.location.reload();
          }
        } catch {
          window.location.reload();
        }
      }
    }

    // Clear the reload flag on successful page load
    // so future chunk errors can trigger a reload
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(RELOAD_KEY);
      }
    } catch {
      // ignore
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
