import type { Metadata } from 'next';

// Passthrough layout — only here to give /ehr/records its own page title.
// The EHR shell (header, nav, FAB) lives in the parent ehr/layout, so this
// adds no wrapper and does not remount the shell on navigation.
export const metadata: Metadata = {
  title: 'Manage Records — August',
};

export default function EhrRecordsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
