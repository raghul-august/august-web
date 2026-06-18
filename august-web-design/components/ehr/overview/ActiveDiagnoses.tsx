'use client';

import { Heart } from 'lucide-react';
import type { EhrConditionPageItem } from '@/types/ehr';

/** Same resolved-status set the conditions section uses. Anything else
 *  counts as "active" for the overview. */
const RESOLVED_STATUSES = new Set(['inactive', 'remission', 'resolved']);

function statusChip(c: EhrConditionPageItem): { label: string; bg: string; fg: string } {
  if (!c.status) return { label: 'ACTIVE', bg: '#FEF1F1', fg: '#C44040' };
  if (c.status === 'resolved') return { label: 'RESOLVED', bg: '#EAF4EE', fg: '#206E55' };
  if (RESOLVED_STATUSES.has(c.status)) return { label: 'CONTROLLED', bg: '#EAF4EE', fg: '#206E55' };
  if (c.status === 'remission') return { label: 'REMISSION', bg: '#EAF4EE', fg: '#206E55' };
  return { label: 'ACTIVE', bg: '#FEF1F1', fg: '#C44040' };
}

/** Year-only date label. Conditions surface "since YYYY" because exact
 *  onset dates are rarely meaningful past a year. */
function yearOnly(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})/);
  return m ? m[1] : null;
}

export interface ActiveDiagnosesProps {
  conditions: EhrConditionPageItem[];
  /** Open the full Conditions section. Wires from page.tsx's hamburger
   *  modal switch. */
  onOpenAll?: () => void;
}

export function ActiveDiagnoses({ conditions, onOpenAll }: ActiveDiagnosesProps) {
  const active = conditions.filter(c => !c.status || !RESOLVED_STATUSES.has(c.status));

  return (
    <div className="bg-white rounded-[14px] border border-[#E4E8E6] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-[#6B7370]">
            Conditions
          </div>
          <h2 className="text-[14px] font-semibold tracking-[-0.005em] text-[#1A1E1C] mt-0.5">
            Active diagnoses
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#6B7370] font-mono tabular-nums">
            {active.length}
          </span>
          {onOpenAll && conditions.length > 0 && (
            <button
              type="button"
              onClick={onOpenAll}
              className="text-[12px] font-medium text-[#206E55] hover:text-[#1a5a46]"
            >
              View all
            </button>
          )}
        </div>
      </div>

      {conditions.length === 0 ? (
        <p className="text-[13px] text-[#6B7370] py-3">No conditions recorded.</p>
      ) : active.length === 0 ? (
        <p className="text-[13px] text-[#6B7370] py-3">No active diagnoses.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {active.slice(0, 5).map(c => {
            const chip = statusChip(c);
            const year = yearOnly(c.since);
            return (
              <li
                key={c.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#F8FAF9]"
              >
                <span
                  className="inline-flex items-center justify-center shrink-0"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: '#FBEDED',
                    color: '#C44040',
                  }}
                  aria-hidden
                >
                  <Heart size={14} strokeWidth={1.85} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#1A1E1C] truncate">
                    {c.name}
                  </div>
                  {year && (
                    <div className="text-[11px] text-[#6B7370] font-mono tabular-nums">
                      since {year}
                    </div>
                  )}
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide shrink-0"
                  style={{ background: chip.bg, color: chip.fg }}
                >
                  {chip.label}
                </span>
              </li>
            );
          })}
          {active.length > 5 && onOpenAll && (
            <li>
              <button
                type="button"
                onClick={onOpenAll}
                className="w-full text-[12px] font-medium text-[#6B7370] hover:text-[#1A1E1C] py-2 rounded-lg bg-[#F0F1F1]"
              >
                + {active.length - 5} more
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
