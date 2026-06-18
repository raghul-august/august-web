'use client';

import Script from 'next/script';
import { useIsWebview } from '@/hooks/use-webview';

export function TurnstileLoader() {
  // Webview identity comes from native-injected tokens — no bot-challenge needed.
  const isWebview = useIsWebview();
  if (isWebview) return null;

  return (
    <>
      <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div id="cf-turnstile-root" aria-hidden="true" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }} />
    </>
  );
}
