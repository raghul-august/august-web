'use client';

import { MedicationsPageSection } from '@/components/ehr';
import { useHealthDashboard } from '@/components/ehr/health-dashboard-shell';

export default function EhrMedicationsPage() {
  const { selectedPersonId } = useHealthDashboard();

  return <MedicationsPageSection personId={selectedPersonId} />;
}
