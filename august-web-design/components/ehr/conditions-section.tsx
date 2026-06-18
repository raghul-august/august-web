'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EhrSkeleton } from './ehr-skeleton';
import { useEhrStore } from '@/stores/ehr-store';
import type {
  EhrConditionPageItem,
  EhrConditionStatus,
} from '@/types/ehr';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { pickLatestNote } from './shared-display';

// ── Utilities ──────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Format a free display string that may be ISO-shaped or free text.
 *  Only formats strings starting with YYYY-MM-DD; passes others through. */
function formatPossibleDate(s?: string | null): string {
  if (!s) return '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

const RESOLVED_STATUSES = new Set<EhrConditionStatus>(['inactive', 'remission', 'resolved']);

function isResolved(c: EhrConditionPageItem): boolean {
  return c.status ? RESOLVED_STATUSES.has(c.status) : false;
}

/** Earliest-onset anchor for the card — the "Since X" half of the time phrase. */
function sinceText(c: EhrConditionPageItem): string | null {
  if (c.since) return formatPossibleDate(c.since);
  if (c.period?.display) return formatPossibleDate(c.period.display);
  if (c.period?.start) return formatDate(c.period.start);
  return null;
}

/** Render the card's headline time phrase. Avoids "Since" prefix because it
 *  reads as ongoing — wrong for resolved conditions. The bare date works for
 *  any status; the multi-occurrence count carries its own verb ("Seen N").
 *  - Single occurrence + bounded period → "Mar 2024 – Jun 2024"
 *  - Single occurrence + open onset → "Apr 13, 2018"
 *  - Multi-occurrence → "Apr 13, 2018 · Seen 4 times, latest Mar 15, 2024" */
function timePhrase(c: EhrConditionPageItem): string | null {
  const occCount = c.occurrences?.length ?? 1;
  const hasHistory = occCount > 1;

  if (!hasHistory && c.period?.start && c.period?.end) {
    return `${formatDate(c.period.start)} – ${formatDate(c.period.end)}`;
  }

  const since = sinceText(c);

  if (!hasHistory) {
    return since;
  }

  const latest = c.last_seen ? formatPossibleDate(c.last_seen) : null;
  const seen = `Seen ${occCount} times${latest ? `, latest ${latest}` : ''}`;
  return since ? `${since} · ${seen}` : seen;
}

// ── Badges ─────────────────────────────────────────────────────

type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-[#EAFAF2]', text: 'text-[#1D7A55]', dot: 'bg-[#1D7A55]' },
  amber: { bg: 'bg-[#FFF8EC]', text: 'text-[#B8791A]', dot: 'bg-[#B8791A]' },
  red: { bg: 'bg-[#FEF1F1]', text: 'text-[#C44040]', dot: 'bg-[#C44040]' },
  blue: { bg: 'bg-[#EEF4FF]', text: 'text-[#3B74C4]', dot: 'bg-[#3B74C4]' },
  gray: { bg: 'bg-[#F3F4F4]', text: 'text-[#6B7370]', dot: 'bg-[#6B7370]' },
};

function StatusBadge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${VARIANT_STYLES[variant].bg} ${VARIANT_STYLES[variant].text}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${VARIANT_STYLES[variant].dot}`} />
      {label}
    </span>
  );
}

function statusVariant(status?: EhrConditionStatus): BadgeVariant {
  if (!status) return 'gray';
  if (status === 'active') return 'green';
  if (status === 'recurrence' || status === 'relapse') return 'amber';
  return 'gray';
}

function ConditionRow({ condition }: { condition: EhrConditionPageItem }) {
  const time = timePhrase(condition);
  const meds = condition.medications_or_treatments ?? [];
  const biomarkers = condition.key_biomarkers ?? [];
  const note = pickLatestNote(condition.notes ?? []);
  return (
    <div className="w-full px-4 py-3.5">
      <span className="flex items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight text-[#1A1E1C]">{condition.name}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-[#8A9290]">
          {time && <span>{time}</span>}
          {condition.severity && <span>Severity: {titleCase(condition.severity)}</span>}
          {meds.length > 0 && <span>{meds.length} treatments</span>}
          {biomarkers.length > 0 && <span>{biomarkers.length} biomarkers</span>}
        </span>
        {note && (
          <span className="mt-1.5 block text-[12px] leading-snug text-[#6B7370] line-clamp-2 break-words">
            {note.text}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {condition.status && <StatusBadge label={titleCase(condition.status)} variant={statusVariant(condition.status)} />}
      </span>
    </span>
    </div>
  );
}

// ── Main Section ───────────────────────────────────────────────

export function ConditionsPageSection({ personId }: { personId: string }) {
  const fetchConditionsPage = useEhrStore(s => s.fetchConditionsPage);
  const refreshSeq = useEhrStore(s => s.pageRefreshSeq[personId] ?? 0);
  const [items, setItems] = useState<EhrConditionPageItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPersonId, setLoadedPersonId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchConditionsPage(personId)
      .then(res => {
        if (!cancelled) {
          setItems(res);
          setError(null);
          setLoadedPersonId(personId);
        }
      })
      .catch(err => {
        logger.error('[EHR] Conditions page fetch failed', serializeError(err));
        if (!cancelled) {
          setItems(null);
          setError('Failed to load conditions');
          setLoadedPersonId(personId);
        }
      });

    return () => { cancelled = true; };
  }, [personId, refreshSeq, fetchConditionsPage]);

  const loading = loadedPersonId !== personId;
  const allConditions = items ?? [];
  const activeConditions = allConditions.filter(c => !isResolved(c));
  const resolvedConditions = allConditions.filter(isResolved);
  const resolvedCount = resolvedConditions.length;

  if (loading) {
    return <EhrSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-[#C44040] text-center py-4">{error}</p>;
  }

  if (allConditions.length === 0) {
    return <p className="text-sm text-[#6B7370] text-center py-4">No conditions found</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#6B7370]">
        <span>{activeConditions.length} active / monitoring</span>
        {resolvedCount > 0 && (
          <>
            <span>·</span>
            <span>{resolvedCount} resolved / inactive</span>
          </>
        )}
      </div>

      {activeConditions.length > 0 && (
        <section>
          <header className="flex items-baseline gap-2 mb-2.5">
            <span className="text-[12px] uppercase tracking-[0.14em] text-[#6B7370] font-semibold">
              Active &amp; monitoring
            </span>
            <span className="text-[12px] font-mono tabular-nums text-[#8A9290]">{activeConditions.length}</span>
          </header>
          <div className="bg-white rounded-[14px] shadow-sm divide-y divide-[#EFEDE8]">
            {activeConditions.map(c => (
              <ConditionRow key={c.id} condition={c} />
            ))}
          </div>
        </section>
      )}

      {showResolved && resolvedConditions.length > 0 && (
        <section>
          <header className="flex items-baseline gap-2 mb-2.5">
            <span className="text-[12px] uppercase tracking-[0.14em] text-[#6B7370] font-semibold">
              Resolved &amp; inactive
            </span>
            <span className="text-[12px] font-mono tabular-nums text-[#8A9290]">{resolvedConditions.length}</span>
          </header>
          <div className="bg-white rounded-[14px] shadow-sm divide-y divide-[#EFEDE8]">
            {resolvedConditions.map(c => (
              <ConditionRow key={c.id} condition={c} />
            ))}
          </div>
        </section>
      )}

      {resolvedCount > 0 && (
        <button
          onClick={() => setShowResolved(!showResolved)}
          className="flex items-center gap-1 text-[13px] font-medium text-[#6B7370] hover:text-[#4a5250] transition-colors py-1"
        >
          {showResolved ? 'Hide resolved / inactive' : `Show resolved / inactive (${resolvedCount})`}
          {showResolved ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      )}

    </div>
  );
}
