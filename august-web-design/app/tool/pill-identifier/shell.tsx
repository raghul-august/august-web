'use client';

import { useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { TurnstileLoader } from '@/components/turnstile-loader';
import { initializeLocation } from '@/services/location-service';

export function PillIdentifierShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initializeLocation().catch(() => {});
  }, []);

  return (
    <AppShell webviewExitSource="pill-identifier">
      <TurnstileLoader />
      <div data-tool-category="calculator">
        {children}
      </div>
    </AppShell>
  );
}
