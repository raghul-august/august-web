'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage(msg: string): void };
  }
}

/**
 * Detects whether the page is running inside the native-app webview.
 * Two signals qualify:
 *   - `window.ReactNativeWebView` is injected by the React Native host.
 *   - URL carries `?source=webview` (our app uses this when opening links
 *     from the native app into web routes).
 */
export function useIsWebview(): boolean {
  const searchParams = useSearchParams();
  const [isWebview, setIsWebview] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fromHost = !!window.ReactNativeWebView;
    const fromParam = searchParams.get('source') === 'webview';
    setIsWebview(fromHost || fromParam);
  }, [searchParams]);

  return isWebview;
}

/**
 * Send a message to the React Native host. No-op outside the webview.
 * Use this instead of `window.ReactNativeWebView?.postMessage(...)` scattered
 * around the codebase.
 */
export function postToNative(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.ReactNativeWebView?.postMessage(JSON.stringify(payload));
}

/**
 * Registers a listener for `{type: 'NAVIGATION', action: 'BACK'}` messages
 * from the native host. Returns nothing — cleanup happens on unmount.
 */
export function useWebviewBackMessage(handler: () => void): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMessage = (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'NAVIGATION' && data?.action === 'BACK') {
          handler();
        }
      } catch {
        // Non-JSON message — ignore.
      }
    };

    window.addEventListener('message', onMessage);
    document.addEventListener('message', onMessage as EventListener);
    return () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('message', onMessage as EventListener);
    };
  }, [handler]);
}
