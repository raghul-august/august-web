'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionSectionProps {
  title: string;
  icon: LucideIcon;
  count: number;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export function AccordionSection({
  title,
  icon: Icon,
  count,
  defaultExpanded = false,
  children,
}: AccordionSectionProps) {
  const isEmpty = count === 0;
  const [expanded, setExpanded] = useState(defaultExpanded && !isEmpty);

  const toggle = () => {
    if (isEmpty) return;
    setExpanded(!expanded);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl mt-2.5 overflow-hidden',
        'border border-black/[0.07] shadow-sm',
        isEmpty && 'opacity-50'
      )}
    >
      {/* Top accent bar - only for non-empty */}
      {!isEmpty && <div className="h-0.5 w-full bg-[#E2E0DB]" />}

      {/* Header */}
      <button
        onClick={toggle}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-[15px]',
          !isEmpty && 'cursor-pointer hover:bg-gray-50 transition-colors',
          isEmpty && 'cursor-default'
        )}
        disabled={isEmpty}
      >
        {/* Icon */}
        <div
          className={cn(
            'w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0',
            isEmpty ? 'bg-[#EEEDE9]' : 'bg-[rgba(13,30,22,0.07)]'
          )}
        >
          <Icon size={16} strokeWidth={1.8} className={isEmpty ? 'text-[#C0C8C5]' : 'text-[#0D1E16]'} />
        </div>

        {/* Title */}
        <div className="flex-1 text-left">
          <span
            className={cn(
              'text-[15.5px] font-semibold',
              isEmpty ? 'text-[#A8B0AE] font-medium' : 'text-[#141515]'
            )}
            style={{ letterSpacing: '-0.2px' }}
          >
            {title}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {isEmpty ? (
            <span className="text-xs text-[#B8C0BE]">No records</span>
          ) : (
            <div className="px-2.5 py-0.5 rounded-full min-w-[30px] text-center bg-[rgba(13,30,22,0.07)]">
              <span className="text-xs font-bold text-[#0D1E16]">{count}</span>
            </div>
          )}

          {!isEmpty && (
            <div
              className={cn(
                'w-5 flex items-center justify-center transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            >
              <ChevronDown size={15} strokeWidth={2.2} className="text-[#A0A8A6]" />
            </div>
          )}
        </div>
      </button>

      {/* Body */}
      {!isEmpty && expanded && (
        <div className="px-4 pb-5">
          <div className="h-[0.5px] bg-black/[0.07] -mx-4 mb-3.5" />
          {children}
        </div>
      )}
    </div>
  );
}
