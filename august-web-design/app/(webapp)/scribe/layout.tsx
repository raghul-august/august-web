'use client';

import { AppShell } from '@/components/layout/app-shell';

export default function ScribeLayout({ children }: { children: React.ReactNode }) {
  return <AppShell webviewExitSource="scribe">{children}</AppShell>;
}
