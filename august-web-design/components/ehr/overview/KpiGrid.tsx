'use client';

import { ArrowRight } from 'lucide-react';
import type { EhrLabReportPageItem } from '@/types/ehr';
import { KpiCard } from './KpiCard';

type Observation = NonNullable<EhrLabReportPageItem['observations']>[number];

/** Backend supplies `out_of_range_display` as a free-text direction phrase
 *  ("12.1 above range" / "below range"). Convert that to the same flag
 *  vocabulary the KpiCard expects. */
function obsFlag(obs: Observation): 'high' | 'low' | 'ok' | null {
  if (obs.out_of_range === false) return 'ok';
  if (obs.out_of_range !== true) return null;
  const txt = `${obs.out_of_range_display || ''} ${obs.interpretation || ''}`.toLowerCase();
  if (/\b(above|high|elevated|>)\b/.test(txt)) return 'high';
  if (/\b(below|low|reduced|<)\b/.test(txt)) return 'low';
  return null;
}

/** Strip surrounding whitespace and a stray trailing unit so the value
 *  reads as a number. "5.8 %" becomes "5.8" — we render the unit
 *  separately in the card. */
function cleanValue(raw: string | undefined, unit: string | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (unit && trimmed.endsWith(unit)) {
    return trimmed.slice(0, -unit.length).trim();
  }
  const m = trimmed.match(/^[-+]?\d+(?:\.\d+)?/);
  if (m) return m[0];
  return trimmed;
}

const NUM = /-?\d+(?:\.\d+)?/g;

/** Pull numeric bounds out of a reference-range string. Handles "70 - 99",
 *  "70 to 99", "<200", ">40", and ignores tier hints like "Optimal" or
 *  "Borderline" the same way the lab-reports parser does. Returns null when
 *  the string can't be reduced to a single interpretable bound. */
function parseRefBounds(text: string | null | undefined): { lo: number | null; hi: number | null } | null {
  if (!text) return null;
  const t = String(text).trim();
  // Multi-tier strings have semicolons / commas / "high:" labels; bail out so
  // we don't pick the wrong tier as the reference.
  if (/[;,]|:\s*\d/.test(t)) return null;
  const upper = t.match(/^[<≤]\s*=?\s*(-?\d+(?:\.\d+)?)/);
  if (upper) return { lo: null, hi: parseFloat(upper[1]) };
  const lower = t.match(/^[>≥]\s*=?\s*(-?\d+(?:\.\d+)?)/);
  if (lower) return { lo: parseFloat(lower[1]), hi: null };
  const nums = t.match(NUM);
  if (!nums || nums.length < 2) return null;
  const a = parseFloat(nums[0]);
  const b = parseFloat(nums[1]);
  return { lo: Math.min(a, b), hi: Math.max(a, b) };
}

/** Severity = how far outside the reference band the value sits, normalised
 *  so we can rank markers with different units against each other. We use
 *  distance / max(|bound|, 1) as a rough "% beyond limit" — good enough for
 *  ordering severity within the dashboard. Returns 0 for in-range or
 *  unrankable rows so they sort to the bottom. */
function severity(value: number, bounds: { lo: number | null; hi: number | null } | null): number {
  if (!bounds) return 0;
  if (bounds.hi != null && value > bounds.hi) {
    return (value - bounds.hi) / Math.max(Math.abs(bounds.hi), 1);
  }
  if (bounds.lo != null && value < bounds.lo) {
    return (bounds.lo - value) / Math.max(Math.abs(bounds.lo), 1);
  }
  return 0;
}

/** Unique key for a biomarker across reports. LOINC code is the stable
 *  identifier; fall back to a normalised name for legacy data without it. */
function observationKey(obs: Observation): string {
  const loinc = (obs as Record<string, unknown>).loinc_code as string | undefined;
  return loinc?.trim() || `name:${(obs.name ?? '').trim().toLowerCase()}`;
}

/** Latest reading per unique marker across every report the user has. This
 *  is the same metric the action-items card and hero subline use, so all
 *  three views agree on which markers are "currently out of range". */
function getLatestReadings(reports: EhrLabReportPageItem[]): Map<string, { obs: Observation; date: string }> {
  const latest = new Map<string, { obs: Observation; date: string }>();
  for (const report of reports) {
    const date = report.date ?? '';
    for (const obs of report.observations ?? []) {
      const key = observationKey(obs);
      if (!key || key === 'name:') continue;
      const prev = latest.get(key);
      if (!prev || date.localeCompare(prev.date) > 0) {
        latest.set(key, { obs, date });
      }
    }
  }
  return latest;
}

export interface KpiGridProps {
  reports: EhrLabReportPageItem[];
  onViewAll?: () => void;
}

/** Renders the top-4 currently-out-of-range markers, ranked by normalised
 *  severity. Replaces the curated hs-CRP/LDL/HbA1c/Weight grid — a curated
 *  list inside a "key markers" card felt like hiding the bad news when a
 *  user has many things flagged. See codex discussion (Option D). */
export function KpiGrid({ reports, onViewAll }: KpiGridProps) {
  const latest = getLatestReadings(reports);

  const flagged = [...latest.values()]
    .map(({ obs, date }) => {
      const valueNum = obs.value != null ? parseFloat(obs.value) : NaN;
      const bounds = parseRefBounds(obs.reference_range);
      const sev = Number.isFinite(valueNum) ? severity(valueNum, bounds) : 0;
      return { obs, date, sev };
    })
    .filter(({ obs }) => obs.out_of_range === true)
    .sort((a, b) => (b.sev - a.sev) || b.date.localeCompare(a.date));

  const cards = flagged.slice(0, 4).map(({ obs }) => ({
    key: observationKey(obs),
    label: obs.name,
    value: cleanValue(obs.value, obs.unit),
    unit: obs.unit || undefined,
    refRange: obs.reference_range || undefined,
    flag: obsFlag(obs),
  }));

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-[14px] border border-dashed border-[#E4E8E6] p-6 flex items-center justify-center h-full min-h-[180px]">
        <p className="text-[13px] text-[#6B7370] text-center max-w-[220px]">
          Nothing is currently out of range. Once a marker flags, it&rsquo;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[14px] font-semibold text-[#1A1E1C]">
          {flagged.length === 1 ? '1 marker out of range' : `${flagged.length} markers out of range`}
        </h3>
        {flagged.length > cards.length && onViewAll && (
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#206E55] hover:text-[#1a5a46] transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        {cards.map(c => (
          <KpiCard
            key={c.key}
            iconKey="droplet"
            label={c.label}
            value={c.value}
            unit={c.unit}
            refRange={c.refRange}
            flag={c.flag}
          />
        ))}
      </div>
    </div>
  );
}

/** Count of out-of-range observations across the latest lab report. Used by
 *  the hero summary strip's "flagged" badge. Latest report only — counting
 *  every flagged historic value would double-count old reports that have
 *  since been retested. */
export function countFlaggedInLatest(reports: EhrLabReportPageItem[]): number {
  if (reports.length === 0) return 0;
  const sorted = [...reports].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  const latest = sorted[0];
  return (latest.observations ?? []).filter(o => o.out_of_range === true).length;
}

/** "Currently out of range" — for each unique biomarker the user has been
 *  tested for, look at the latest reading and count it if it's out of
 *  range. This is the right answer to "what's wrong with me right now":
 *  it ignores stale readings that got retested, doesn't double-count a
 *  marker that's been high across multiple draws, and surfaces markers
 *  from old reports that haven't been re-checked.
 *
 *  Group key is the LOINC code when present (stable identifier), with a
 *  case-insensitive normalised name as fallback so legacy data without
 *  LOINC still groups sanely. */
export function countUniqueFlaggedCurrent(reports: EhrLabReportPageItem[]): number {
  type LatestReading = { date: string; outOfRange: boolean };
  const latestByMarker = new Map<string, LatestReading>();

  for (const report of reports) {
    const reportDate = report.date ?? '';
    for (const obs of report.observations ?? []) {
      const loinc = (obs as Record<string, unknown>).loinc_code as string | undefined;
      const key = (loinc ?? `name:${(obs.name ?? '').trim().toLowerCase()}`).trim();
      if (!key || key === 'name:') continue;
      const prev = latestByMarker.get(key);
      if (!prev || reportDate.localeCompare(prev.date) > 0) {
        latestByMarker.set(key, { date: reportDate, outOfRange: obs.out_of_range === true });
      }
    }
  }

  let count = 0;
  for (const reading of latestByMarker.values()) {
    if (reading.outOfRange) count += 1;
  }
  return count;
}

/** The latest report, used by the action-items deeplink. */
export function getLatestReport(reports: EhrLabReportPageItem[]): EhrLabReportPageItem | null {
  if (reports.length === 0) return null;
  const sorted = [...reports].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  return sorted[0];
}
