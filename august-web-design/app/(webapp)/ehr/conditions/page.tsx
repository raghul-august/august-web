'use client';

import { ConditionsPageSection } from '@/components/ehr';
import { useHealthDashboard } from '@/components/ehr/health-dashboard-shell';

export default function EhrConditionsPage() {
  const { selectedPersonId } = useHealthDashboard();

  return <ConditionsPageSection personId={selectedPersonId} />;
}
