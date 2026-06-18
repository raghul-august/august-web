'use client';

import { LabReportsPageSection } from '@/components/ehr';
import { useHealthDashboard } from '@/components/ehr/health-dashboard-shell';

export default function EhrLabReportsPage() {
  const { selectedPersonId } = useHealthDashboard();

  return <LabReportsPageSection personId={selectedPersonId} />;
}
