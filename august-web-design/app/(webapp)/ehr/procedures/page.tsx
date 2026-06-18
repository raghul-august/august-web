'use client';

import { ProceduresPageSection } from '@/components/ehr';
import { useHealthDashboard } from '@/components/ehr/health-dashboard-shell';

export default function EhrProceduresPage() {
  const { selectedPersonId } = useHealthDashboard();

  return <ProceduresPageSection personId={selectedPersonId} />;
}
