import { EhrSkeleton } from '@/components/ehr/ehr-skeleton';

/**
 * Route-level loading fallback for /ehr and its subpages. The EHR shell lives
 * in layout.tsx and stays mounted across section navigations, so this fallback
 * renders into the shell's content slot — giving an instant skeleton when you
 * tap a section instead of leaving the previous page painted while the next
 * route's RSC payload + JS chunk load. Content-only: the shell supplies the
 * header and surrounding chrome.
 */
export default function EhrLoading() {
  return <EhrSkeleton rows={6} />;
}
