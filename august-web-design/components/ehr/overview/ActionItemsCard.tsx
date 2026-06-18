'use client';

import { AlertTriangle, ArrowRight, FileText, Heart, Pill, Upload } from 'lucide-react';
import type {
  EhrConditionPageItem,
  EhrLabReportPageItem,
  EhrMedicationPageItem,
} from '@/types/ehr';
import { countUniqueFlaggedCurrent } from './KpiGrid';

type IconKey = 'lab' | 'refill' | 'condition' | 'upload';

const ICONS: Record<IconKey, typeof FileText> = {
  lab: FileText,
  refill: Pill,
  condition: Heart,
  upload: Upload,
};

const ICON_TONE: Record<IconKey, { bg: string; fg: string }> = {
  lab: { bg: '#FBEDED', fg: '#C44040' },
  refill: { bg: '#E7F2EC', fg: '#206E55' },
  condition: { bg: '#FEF6EC', fg: '#9C6320' },
  upload: { bg: '#EEF1FB', fg: '#3F5BBF' },
};

export interface ActionItem {
  id: string;
  iconKey: IconKey;
  title: string;
  detail: string;
  /** Optional callback. When present the row is clickable and gets a chevron. */
  onClick?: () => void;
}

/** Derive up to four action items from real EHR data. Order is priority
 *  descending: flagged labs → refills (when we have dispense data) →
 *  active conditions → upload affordance. */
export function deriveActionItems({
  reports,
  medications,
  conditions,
  onViewLatestReport,
  onUploadReport,
}: {
  reports: EhrLabReportPageItem[];
  medications: EhrMedicationPageItem[];
  conditions: EhrConditionPageItem[];
  onViewLatestReport?: () => void;
  onUploadReport?: () => void;
}): ActionItem[] {
  const out: ActionItem[] = [];

  // 1) Markers currently out of range, computed across all reports per
  //    unique biomarker (latest reading per marker). This avoids the
  //    "latest report only" trap where a marker that hasn't been retested
  //    in 6 months gets ignored, and the "all reports" trap where the
  //    same high reading gets counted across every draw.
  const flaggedCurrent = countUniqueFlaggedCurrent(reports);
  if (flaggedCurrent > 0) {
    out.push({
      id: 'flagged-current',
      iconKey: 'lab',
      title: `${flaggedCurrent} marker${flaggedCurrent === 1 ? '' : 's'} currently out of range`,
      detail: 'Latest reading of each biomarker',
      onClick: onViewLatestReport,
    });
  }

  // 2) Refill reminder. We don't have real dispense duration on the page
  //    item, so this only fires for active medications and reads as a
  //    generic "review next refill" nudge. Once we get supply data the
  //    detail line can show "in Xd". Capped at one row.
  const activeMeds = medications.filter(m => m.status === 'active');
  if (activeMeds.length > 0) {
    const first = activeMeds[0];
    out.push({
      id: `refill-${first.id}`,
      iconKey: 'refill',
      title: `Plan next refill for ${first.name}`,
      detail: activeMeds.length > 1
        ? `+ ${activeMeds.length - 1} other active medication${activeMeds.length - 1 === 1 ? '' : 's'}`
        : 'Active prescription',
    });
  }

  // 3) Active conditions worth a check-in. Match resolved-status set used
  //    elsewhere in the codebase so we never surface things the user has
  //    moved past.
  const RESOLVED = new Set(['inactive', 'remission', 'resolved']);
  const active = conditions.filter(c => !c.status || !RESOLVED.has(c.status));
  if (active.length > 0) {
    const first = active[0];
    out.push({
      id: `condition-${first.id}`,
      iconKey: 'condition',
      title: `${first.name} — review with provider`,
      detail: active.length > 1
        ? `+ ${active.length - 1} other active condition${active.length - 1 === 1 ? '' : 's'}`
        : 'Active condition',
    });
  }

  // Upload was previously a fallback fourth row, but a generic "Upload a
  // new report" CTA inside Action Items diluted trust ("is this real or
  // filler?") and duplicated the global "+" FAB. Only surface upload here
  // when there's literally nothing else to act on — empty-state nudge.
  if (out.length === 0 && onUploadReport) {
    out.push({
      id: 'upload',
      iconKey: 'upload',
      title: 'Upload a new report',
      detail: 'Lab, imaging, or prescription',
      onClick: onUploadReport,
    });
  }

  return out.slice(0, 4);
}

export interface ActionItemsCardProps {
  items: ActionItem[];
  /** Callback for the footer "View all reminders" button. When the section
   *  modal for raw reminders exists we wire this; for now the click can
   *  open the hamburger. */
  onViewAll?: () => void;
}

export function ActionItemsCard({ items, onViewAll }: ActionItemsCardProps) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E4E8E6] p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-[#9C6320]" strokeWidth={2} />
          <h2 className="text-[14px] font-semibold tracking-[-0.005em] text-[#1A1E1C]">
            Action Items
          </h2>
        </div>
        <span className="text-[12px] text-[#6B7370] font-mono tabular-nums">
          {items.length} open
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-[#6B7370] text-center max-w-[200px]">
            Nothing needs your attention right now.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 flex-1">
          {items.map(a => {
            const Icon = ICONS[a.iconKey];
            const tone = ICON_TONE[a.iconKey];
            const Wrapper = a.onClick ? 'button' : 'div';
            return (
              <li key={a.id}>
                <Wrapper
                  type={a.onClick ? 'button' : undefined}
                  onClick={a.onClick}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg bg-[#F8FAF9] text-left ${
                    a.onClick ? 'hover:bg-[#F0F4F2] transition-colors cursor-pointer' : ''
                  }`}
                >
                  <span
                    className="inline-flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: tone.bg,
                      color: tone.fg,
                    }}
                    aria-hidden
                  >
                    <Icon size={14} strokeWidth={1.85} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#1A1E1C] leading-tight line-clamp-2">
                      {a.title}
                    </div>
                    <div className="text-[11px] text-[#6B7370] mt-0.5 truncate">
                      {a.detail}
                    </div>
                  </div>
                  {a.onClick && (
                    <ArrowRight className="h-3.5 w-3.5 text-[#6B7370] shrink-0 mt-1" />
                  )}
                </Wrapper>
              </li>
            );
          })}
        </ul>
      )}

      {onViewAll && items.length > 0 && (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#6B7370] hover:text-[#1A1E1C] py-2 rounded-lg transition-colors bg-[#F0F1F1]"
        >
          View all reminders
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
