'use client';

import { AppShell } from '@/components/layout/app-shell';
// Chat-app theme tokens — only loaded for the /tool hub via this shell
// (child tool routes use their own shells/layouts).
import '@/app/chat-app.css';

export function ToolsShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell background="var(--background)" webviewExitSource="tools">
      {children}
    </AppShell>
  );
}
