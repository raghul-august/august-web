'use client';

import { useEffect } from 'react';
import { AppShell, useAppShellSidebar } from '@/components/layout/app-shell';
import { Navbar } from '@/components/layout/navbar';
import { TurnstileLoader } from '@/components/turnstile-loader';
import { useToolsStore } from '@/stores/tools-store';
import { initializeLocation } from '@/services/location-service';

// Rendered inside the AppShell scroll area (not via renderNavbar), so it scrolls
// with the page — letting Quiz auto-scroll past the login chrome on screen change.
function InlineNavbar() {
  const { openSidebar } = useAppShellSidebar();
  return <Navbar onMenuClick={openSidebar} />;
}

export function SymptomsCheckerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    useToolsStore.getState().setLastUsedTool('symptoms-checker');
  }, []);

  useEffect(() => {
    initializeLocation().catch(() => {});
  }, []);

  return (
    <AppShell
      webviewExitSource="symptoms-checker"
      renderNavbar={() => null}
    >
      <TurnstileLoader />
      <div data-tool-category="quiz">
        <InlineNavbar />
        {children}
      </div>
    </AppShell>
  );
}
