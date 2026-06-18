'use client';

import { Bell, Clock, Moon, Sun } from 'lucide-react';
import type { EhrMedicationPageItem } from '@/types/ehr';

type Slot = 'morning' | 'afternoon' | 'evening' | 'bedtime';

const SLOT_LABEL: Record<Slot, { label: string; hint: string }> = {
  morning: { label: 'Morning', hint: '7:30 AM' },
  afternoon: { label: 'Afternoon', hint: '1:00 PM' },
  evening: { label: 'Evening', hint: '7:00 PM' },
  bedtime: { label: 'Bedtime', hint: '10:00 PM' },
};

const SLOT_ICON: Record<Slot, typeof Sun> = {
  morning: Sun,
  afternoon: Bell,
  evening: Clock,
  bedtime: Moon,
};

/** Map free-text timing/instruction blobs to the four slots used by the
 *  overview. Mirrors the keyword heuristics from medications-section.tsx
 *  (BID/TID/QID, morning, evening, bedtime, daily). Returns the set of
 *  slots a medication should appear in. */
function slotsFromTiming(m: EhrMedicationPageItem): Set<Slot> {
  const blob = `${m.dosage?.timing ?? ''} ${m.dosage?.instruction ?? ''}`.toLowerCase();
  const has = (s: string) => blob.includes(s);
  const out = new Set<Slot>();

  if (has('qid') || has('four times')) {
    out.add('morning'); out.add('afternoon'); out.add('evening'); out.add('bedtime');
    return out;
  }
  if (has('tid') || has('three times') || has('thrice')) {
    out.add('morning'); out.add('afternoon'); out.add('evening');
    return out;
  }
  if (has('bid') || has('twice') || has('every 12')) {
    out.add('morning'); out.add('evening');
    return out;
  }
  if (has('bedtime') || has('hs') || has('night') || has('at night')) {
    out.add('bedtime');
    return out;
  }
  if (has('evening')) {
    out.add('evening');
    return out;
  }
  if (has('afternoon') || has('noon') || has('lunch')) {
    out.add('afternoon');
    return out;
  }
  if (has('morning') || has('breakfast') || has('am') || has('empty stomach')) {
    out.add('morning');
    return out;
  }
  if (has('daily') || has('once') || has('qd') || has('od')) {
    // Default once-daily lands in the morning slot — matches the lab
    // section's choice and is the safest single-slot default.
    out.add('morning');
    return out;
  }
  return out; // empty => not surfaced in any slot
}

/** Hash a string to a stable hue so each medication gets a distinct color
 *  pill without needing real RxNorm color data. Same approach used in
 *  medications-section.tsx — keeps the overview visually consistent. */
function pillHueForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return `hsl(${h % 360}, 55%, 70%)`;
}

export interface TodayMedicationScheduleProps {
  medications: EhrMedicationPageItem[];
  /** Opens the full Medications section. Wires from page.tsx's hamburger
   *  modal switch so "View all" is a single click, not a hunt. */
  onOpenAll?: () => void;
}

export function TodayMedicationSchedule({ medications, onOpenAll }: TodayMedicationScheduleProps) {
  const active = medications.filter(m => m.status === 'active');

  const slots: Array<{ key: Slot; meds: EhrMedicationPageItem[] }> = (
    ['morning', 'afternoon', 'evening', 'bedtime'] as const
  ).map(key => ({
    key,
    meds: active.filter(m => slotsFromTiming(m).has(key)),
  }));

  // If we have active meds but every slot is empty, the timing blobs were
  // too vague to bucket. Surface a single fallback row pointing at the full
  // section instead of leaving the user staring at four "—" tiles.
  const allEmpty = slots.every(s => s.meds.length === 0);

  return (
    <div className="bg-white rounded-[14px] border border-[#E4E8E6] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-[#6B7370]">
            Today
          </div>
          <h2 className="text-[14px] font-semibold tracking-[-0.005em] text-[#1A1E1C] mt-0.5">
            Medication schedule
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#6B7370] font-mono tabular-nums">
            {active.length} active
          </span>
          {onOpenAll && active.length > 0 && (
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

      {active.length === 0 ? (
        <p className="text-[13px] text-[#6B7370] py-3">No active medications.</p>
      ) : allEmpty ? (
        <p className="text-[13px] text-[#6B7370] py-3">
          We couldn&rsquo;t place your medications on a daily schedule from the source
          timing text.{' '}
          {onOpenAll && (
            <button
              type="button"
              onClick={onOpenAll}
              className="text-[#206E55] font-medium hover:underline"
            >
              View all medications
            </button>
          )}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {slots.map(({ key, meds }) => {
            const Icon = SLOT_ICON[key];
            const info = SLOT_LABEL[key];
            return (
              <div
                key={key}
                className="rounded-lg p-3 flex flex-col gap-2.5 min-h-[120px] bg-[#F8FAF9] border border-[#E4E8E6]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} strokeWidth={1.85} className="text-[#6B7370]" />
                    <span className="text-[12px] font-medium text-[#1A1E1C]">
                      {info.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono tabular-nums text-[#6B7370]">
                    {info.hint}
                  </span>
                </div>
                {meds.length === 0 ? (
                  <div className="text-[12px] italic text-[#9CA3A0] mt-1">—</div>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {meds.map(m => (
                      <li
                        key={m.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white border border-[#E4E8E6]"
                      >
                        <span
                          aria-hidden
                          className="shrink-0"
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: pillHueForId(m.id),
                            border: '1px solid rgba(13,17,23,0.18)',
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-[#1A1E1C] truncate leading-tight">
                            {m.name}
                          </div>
                          {m.dosage?.dose && (
                            <div className="text-[10px] font-mono tabular-nums text-[#6B7370] truncate">
                              {m.dosage.dose}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
