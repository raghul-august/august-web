'use client';

import { ReportLibrarySection } from '@/components/ehr';
import { useHealthDashboard } from '@/components/ehr/health-dashboard-shell';

// Thin page — all chrome (header, picker, FAB, upload modal) is owned by
// HealthDashboardShell's manage-records branch, same as every other EHR
// section. This just renders the per-person report library.
export default function EhrRecordsPage() {
  const { selectedPersonId, onUploadReport } = useHealthDashboard();

  return (
    <div className="bg-[#F8FAF9] rounded-2xl p-5 border border-[#ECEEED]">
      <ReportLibrarySection
        personId={selectedPersonId}
        onUploadReport={onUploadReport}
      />
    </div>
  );
}
