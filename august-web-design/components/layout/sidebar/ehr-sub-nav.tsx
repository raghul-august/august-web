'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EHR_SECTIONS } from '@/components/ehr/health-dashboard/sections';
import { track } from '@/services/analytics-service';
import { trackClevertap } from '@/utils/clevertap';

/**
 * The EHR section list rendered under the active "View Records" nav item.
 * Shared by every sidebar variant; `onNavigate` lets the mobile sheet close
 * itself after a tap.
 *
 * Uses <Link prefetch> rather than a button + router.push so Next warms each
 * section's RSC payload + JS chunk while the subnav is on screen — a cold
 * router.push paid that round-trip on click, which is why nothing happened for
 * ~1s before the new page (and the highlight) appeared.
 */
export function EhrSubNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // Optimistic selection: highlight the tapped item immediately instead of
  // waiting for usePathname(), which only updates when the navigation commits
  // (a beat behind the tap on a cold click). Cleared once pathname catches up.
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  return (
    <div className="ml-9 space-y-1 border-l border-[#D9DED9] pl-3">
      {EHR_SECTIONS.map((subnav) => {
        const isSubnavSelected = pendingPath
          ? pendingPath === subnav.path
          : pathname === subnav.path;
        return (
          <Link
            key={subnav.id}
            href={subnav.path}
            prefetch
            onClick={() => {
              setPendingPath(subnav.path);
              track('ehr_section_tapped', { section: subnav.id });
              trackClevertap('Sidebar Navigation Selected', { destination: `ehr_${subnav.id}` });
              onNavigate?.();
            }}
            className={`block w-full rounded-lg px-3 py-2 text-left text-[14px] transition ${
              isSubnavSelected
                ? 'bg-[#F3F5F1] font-semibold text-[#206E55]'
                : 'text-[#5F6865] hover:bg-[#F3F5F1] hover:text-[#1A1E1C]'
            }`}
          >
            {subnav.label}
          </Link>
        );
      })}
    </div>
  );
}
