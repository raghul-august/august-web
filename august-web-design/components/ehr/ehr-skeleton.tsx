'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Consistent loading skeleton for EHR pages. A stack of card placeholders
 * that approximates the cards/rows every section and the overview render, so
 * the swap from loading -> content has minimal layout shift. Reused at the
 * shell loading gate, the overview, and each section's loader so loading
 * looks the same everywhere. Width-filling — the caller's container supplies
 * the page padding.
 */
export function EhrSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-[14px] bg-[#E4E8E6]" />
      ))}
    </div>
  );
}
