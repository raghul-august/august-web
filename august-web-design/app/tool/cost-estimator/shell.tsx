'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useIsWebview } from '@/hooks/use-webview';
import { initializeAuth } from '@/services/auth-service';
import { useToolsStore } from '@/stores/tools-store';
import { TurnstileLoader } from '@/components/turnstile-loader';

export function CostEstimatorShell({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const isWebview = useIsWebview();
  const [isExternalDomain, setIsExternalDomain] = useState(false);

  useEffect(() => {
    useToolsStore.getState().setLastUsedTool('cost-estimator');
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    setIsExternalDomain(
      window.location.hostname === 'medicalcostestimator.com' ||
        window.location.hostname === 'bankruptcyavoider.com'
    );

    if (params.has('returnTo')) {
      params.delete('returnTo');
      window.history.replaceState(
        {},
        '',
        url.pathname + (params.toString() ? `?${params}` : '')
      );
    }
  }, []);

  useEffect(() => {
    if (isWebview) return;
    // Kicks off Turnstile + anonymous session on cost-estimator load
    // (matches appeal-assistant / bill-analyser)
    initializeAuth().catch(() => {});
  }, [isWebview]);

  useEffect(() => {
    // Override overflow:hidden on html, body, and the root <main>
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    const rootMain = document.body.querySelector('main.overflow-hidden');
    if (rootMain) {
      (rootMain as HTMLElement).style.overflow = 'auto';
      (rootMain as HTMLElement).style.height = 'auto';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
      if (rootMain) {
        (rootMain as HTMLElement).style.overflow = '';
        (rootMain as HTMLElement).style.height = '';
      }
    };
  }, []);

  return (
    <AppShell
      background="#f5f1e8"
      className={`${className} ce-layout`}
      style={{ height: '100dvh' }}
      webviewExitSource="cost-estimator"
      externalDomain={isExternalDomain}
      externalLoginUrl="https://www.meetaugust.ai/chat"
    >
      <TurnstileLoader />
      {children}
    </AppShell>
  );
}
