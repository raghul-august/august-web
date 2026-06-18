'use client';

import { Activity, Droplet, Heart, Scale } from 'lucide-react';

/** Status chip variant matches the same vocabulary used in the lab-reports
 *  section (HIGH / LOW / IN RANGE). Kept local because the dashboard pill
 *  in shared-display is a different shape — colored dot + uppercase text
 *  pill — and we want the same compact pill here, not a full status badge. */
type KpiFlag = 'high' | 'low' | 'ok';

const FLAG_STYLE: Record<KpiFlag, { label: string; bg: string; fg: string }> = {
  high: { label: 'HIGH', bg: '#FEF1F1', fg: '#C44040' },
  low: { label: 'LOW', bg: '#EFF3FB', fg: '#3F5BBF' },
  ok: { label: 'IN RANGE', bg: '#EAF4EE', fg: '#206E55' },
};

type IconKey = 'heart' | 'activity' | 'droplet' | 'scale';

const ICONS: Record<IconKey, typeof Heart> = {
  heart: Heart,
  activity: Activity,
  droplet: Droplet,
  scale: Scale,
};

const ICON_TONE: Record<IconKey, { bg: string; fg: string; ring: string }> = {
  heart: { bg: '#FBEDED', fg: '#C44040', ring: 'rgba(196,64,64,0.18)' },
  activity: { bg: '#EEF1FB', fg: '#3F5BBF', ring: 'rgba(63,91,191,0.18)' },
  droplet: { bg: '#EEF1FB', fg: '#3F5BBF', ring: 'rgba(63,91,191,0.18)' },
  scale: { bg: '#E7F2EC', fg: '#206E55', ring: 'rgba(32,110,85,0.18)' },
};

export interface KpiCardProps {
  iconKey: IconKey;
  label: string;
  value: string;
  unit?: string;
  refRange?: string;
  flag: KpiFlag | null;
}

/** Compact KPI card for the overview grid. Renders the lab marker hero:
 *  large value + unit, status chip, ref-range subtitle. No sparkline in v1
 *  (per spec — history wiring is non-trivial against the lab page contract). */
export function KpiCard({ iconKey, label, value, unit, refRange, flag }: KpiCardProps) {
  const Icon = ICONS[iconKey];
  const tone = ICON_TONE[iconKey];
  const chip = flag ? FLAG_STYLE[flag] : null;

  return (
    <div className="bg-white rounded-[14px] border border-[#E4E8E6] p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center justify-center shrink-0"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: tone.bg,
              color: tone.fg,
              boxShadow: `inset 0 0 0 1px ${tone.ring}`,
            }}
            aria-hidden
          >
            <Icon size={14} strokeWidth={1.85} />
          </span>
          <span className="text-[13px] font-medium text-[#4A5250] truncate">{label}</span>
        </div>
        {chip && (
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide shrink-0"
            style={{ background: chip.bg, color: chip.fg }}
          >
            {chip.label}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] leading-none font-semibold text-[#1A1E1C] tabular-nums tracking-[-0.02em]">
            {value}
          </span>
          {unit && (
            <span className="text-[13px] text-[#6B7370] font-mono">{unit}</span>
          )}
        </div>
        {refRange && (
          <div className="text-[11px] text-[#6B7370] mt-1.5 font-mono tabular-nums">
            ref {refRange}
          </div>
        )}
      </div>
    </div>
  );
}
