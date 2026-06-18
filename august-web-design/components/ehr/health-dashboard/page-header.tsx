import type { ReactNode } from 'react';

/** Single page header for every EHR section. The title is the greeting on
 *  Overview and the section name elsewhere; the greeting is intentionally NOT
 *  repeated on the other pages. rightSlot carries the upload chip + profile
 *  picker; the subtitle sits under the title. */
export function EhrPageHeader({
  title,
  subtitle,
  rightSlot,
}: {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}) {
  return (
    <header className="mt-6 mb-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[36px] leading-none tracking-[-0.02em] font-semibold text-[#1A1E1C]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-[#6B7370]">{subtitle}</p>
          )}
        </div>
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>
    </header>
  );
}
