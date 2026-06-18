import { ClipboardList, FileText, Files, Heart, LayoutDashboard, Pill } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type EhrWorkspaceSection = 'overview' | 'conditions' | 'medications' | 'lab-reports' | 'procedures' | 'manage-records';

export type EhrSectionConfig = {
  id: EhrWorkspaceSection;
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
};

export const EHR_SECTIONS: EhrSectionConfig[] = [
  { id: 'overview', label: 'Overview', description: 'Action items, key markers, today’s plan', path: '/ehr', icon: LayoutDashboard },
  { id: 'lab-reports', label: 'Lab reports', description: 'Results, trends, and clinical notes', path: '/ehr/lab-reports', icon: FileText },
  { id: 'medications', label: 'Medications', description: 'Prescriptions, dose, and history', path: '/ehr/medications', icon: Pill },
  { id: 'procedures', label: 'Procedures', description: 'Surgeries, tests, and requests', path: '/ehr/procedures', icon: ClipboardList },
  { id: 'conditions', label: 'Conditions', description: 'Diagnoses and grouped history', path: '/ehr/conditions', icon: Heart },
  { id: 'manage-records', label: 'Manage records', description: 'Upload and review uploaded reports', path: '/ehr/records', icon: Files },
];

export const EHR_SECTION_PATHS: Record<EhrWorkspaceSection, string> = {
  overview: '/ehr',
  'lab-reports': '/ehr/lab-reports',
  medications: '/ehr/medications',
  procedures: '/ehr/procedures',
  conditions: '/ehr/conditions',
  'manage-records': '/ehr/records',
};

export function sectionFromPath(pathname: string | null): EhrWorkspaceSection {
  if (pathname?.startsWith('/ehr/conditions')) return 'conditions';
  if (pathname?.startsWith('/ehr/medications')) return 'medications';
  if (pathname?.startsWith('/ehr/lab-reports')) return 'lab-reports';
  if (pathname?.startsWith('/ehr/procedures')) return 'procedures';
  if (pathname?.startsWith('/ehr/records')) return 'manage-records';
  return 'overview';
}
