'use client';

import { AppShell } from '@/components/layout/app-shell';
import { HealthDashboardShell } from '@/components/ehr/health-dashboard-shell';

export function EhrShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell webviewExitSource="ehr">
      <HealthDashboardShell>{children}</HealthDashboardShell>
    </AppShell>
  );
}
