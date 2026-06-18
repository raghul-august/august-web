'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Ignore sub-pixel/rounding overshoot so the toggle doesn't appear for
// content that only just exceeds maxHeight.
const OVERFLOW_TOLERANCE_PX = 4;

interface ClampBlockProps {
  /** Collapsed max height in px. The toggle only appears when content exceeds this. */
  maxHeight?: number;
  children: ReactNode;
  className?: string;
  /** Override the bottom fade tint to match the container bg (default: white fade). */
  fadeClassName?: string;
}

/** Caps a content block's height and reveals a "Show more / Show less" toggle
 *  only when the content actually overflows. Used for long lab-report
 *  narratives; generic enough to wrap any tall content block. */
export function ClampBlock({
  maxHeight = 280,
  children,
  className,
  fadeClassName = 'bg-gradient-to-t from-white to-transparent',
}: ClampBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setOverflowing(el.scrollHeight > maxHeight + OVERFLOW_TOLERANCE_PX);
    measure();

    // The observer catches content-driven changes too: crossing the maxHeight
    // boundary always changes the clamped element's box height, so it re-fires
    // whenever `overflowing` could flip — no need to depend on `children`.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxHeight]);

  return (
    <div className={className}>
      <div
        ref={ref}
        style={{
          maxHeight: expanded ? undefined : maxHeight,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {children}
        {overflowing && !expanded && (
          <div
            aria-hidden
            className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-12', fadeClassName)}
          />
        )}
      </div>

      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="mt-2 flex items-center gap-1 text-[12px] font-medium text-[#206E55] hover:text-[#1a5a46] transition-colors"
        >
          {expanded ? 'Show less' : 'Show more'}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}
