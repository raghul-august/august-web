'use client';

import { OverviewPage } from '@/components/ehr/overview';
import { useHealthDashboard } from '@/components/ehr/health-dashboard-shell';

export default function EhrOverviewPage() {
  const { selectedPersonId, goToSection, onUploadReport } = useHealthDashboard();

  return (
    <OverviewPage
      personId={selectedPersonId}
      onOpenLabReports={() => goToSection('lab-reports')}
      onOpenMedications={() => goToSection('medications')}
      onOpenConditions={() => goToSection('conditions')}
      onUploadReport={onUploadReport}
    />
  );
}
