'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from 'lucide-react';
import { EhrSkeleton } from './ehr-skeleton';
import { useEhrStore } from '@/stores/ehr-store';
import type { EhrLabReportPageItem } from '@/types/ehr';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { enrichObservation } from '@/lib/ehr/enrich-lab-observation';
import { cleanClinicalText } from '@/utils/clean-text';
import { ClampBlock } from './clamp-block';
import {
  formatDate,
} from './shared-display';


// ── Observation row ───────────────────────────────────────────

type Observation = NonNullable<EhrLabReportPageItem['observations']>[number];

/** Parse the lab-supplied reference_range string into numeric bounds for the
 *  range bar. Prefer exact one-band strings, but also tolerate common display
 *  text like "Normal 70-99 mg/dL". Avoid multi-tier ranges because one picked
 *  tier would misrepresent the reference band. */
const NUM_PATTERN = '-?\\d+(?:\\.\\d+)?';
const TRAILING_UNIT = '(?:\\s+[^\\d\\s,;][\\w/^.%µμ°]*)?';
const LABEL_HINTS = /\b(optimal|borderline|desirable|normal|abnormal|elevated|risk|adult|child|pediatric|female|male|reactive|nonreactive|positive|negative|present|absent|trace|deficient|insufficient|sufficient|toxicity|toxic|diabetic|prediabetic|healthy)\b/i;
const RANGE_SIMPLE = new RegExp(`^\\s*\\(?\\s*(${NUM_PATTERN})\\s*(?:[-–—]|[tT][oO])\\s*(${NUM_PATTERN})\\s*\\)?${TRAILING_UNIT}\\s*$`);
const RANGE_UPPER = new RegExp(`^\\s*<\\s*=?\\s*(${NUM_PATTERN})${TRAILING_UNIT}\\s*$`);
const RANGE_LOWER = new RegExp(`^\\s*>\\s*=?\\s*(${NUM_PATTERN})${TRAILING_UNIT}\\s*$`);
const LOOSE_RANGE = new RegExp(`(${NUM_PATTERN})\\s*(?:[-–—]|[tT][oO])\\s*(${NUM_PATTERN})`);
const LOOSE_UPPER = new RegExp(`(?:<=|<|≤)\\s*(${NUM_PATTERN})`);
const LOOSE_LOWER = new RegExp(`(?:>=|>|≥)\\s*(${NUM_PATTERN})`);
const NUMBER_CAPTURE = new RegExp(NUM_PATTERN, 'g');

function parseRefRange(text: string | null | undefined): { lo: number | null; hi: number | null } | null {
  if (!text) return null;
  const t = String(text).trim();
  let m = t.match(RANGE_SIMPLE);
  if (m) {
    const lo = parseFloat(m[1]); const hi = parseFloat(m[2]);
    return { lo: Math.min(lo, hi), hi: Math.max(lo, hi) };
  }
  m = t.match(RANGE_UPPER);
  if (m) return { lo: null, hi: parseFloat(m[1]) };
  m = t.match(RANGE_LOWER);
  if (m) return { lo: parseFloat(m[1]), hi: null };
  const nums = t.match(NUMBER_CAPTURE) ?? [];
  const hasTierLanguage = LABEL_HINTS.test(t);
  if (nums.length === 2) {
    m = t.match(LOOSE_RANGE);
    if (m) {
      const lo = parseFloat(m[1]); const hi = parseFloat(m[2]);
      return { lo: Math.min(lo, hi), hi: Math.max(lo, hi) };
    }
    const lo = parseFloat(nums[0]);
    const hi = parseFloat(nums[1]);
    return { lo: Math.min(lo, hi), hi: Math.max(lo, hi) };
  }
  if (!hasTierLanguage && nums.length === 1) {
    m = t.match(LOOSE_UPPER);
    if (m) return { lo: null, hi: parseFloat(m[1]) };
    m = t.match(LOOSE_LOWER);
    if (m) return { lo: parseFloat(m[1]), hi: null };
  }
  return null;
}

type LabFlag = 'high' | 'low' | 'ok' | 'flagged';

/** Backend is the source of truth for whether a value is out of range.
 *  Read direction from out_of_range_display ("12.1 above range") so the chip
 *  shows HIGH/LOW correctly even when our parser can't recover the band. */
function flagFromBackend(obs: Observation): LabFlag | null {
  if (obs.out_of_range === false) return 'ok';
  if (obs.out_of_range !== true) return null;
  const txt = `${obs.out_of_range_display || ''} ${obs.interpretation || ''}`.toLowerCase();
  if (/\b(above|high|elevated|>)\b/.test(txt)) return 'high';
  if (/\b(below|low|reduced|<)\b/.test(txt)) return 'low';
  return 'flagged';
}

function obsAbnormal(obs: Observation): boolean {
  if (obs.out_of_range === true) return true;
  const f = flagFromBackend(obs);
  return f != null && f !== 'ok';
}

/** HD-style reference range: the normal band stays visually prominent even
 *  with a single value. The marker is latest-only; prior values stay in the
 *  trend/history section so the reference slider remains unambiguous. */
function RangeBar({
  value,
  lo,
  hi,
  flag,
}: {
  value: number;
  lo: number | null;
  hi: number | null;
  flag: LabFlag;
}) {
  // Piecewise scale: the reference band always occupies the central
  // [0.28, 0.72] of the track regardless of how far the value sits outside
  // it, so the band reads consistently and extreme values don't strand the
  // dot against a long empty rail.
  let project: (v: number) => number;
  let loFrac: number;
  let hiFrac: number;
  if (lo != null && hi != null) {
    const band = Math.max(hi - lo, Math.abs(hi) * 0.1, 1);
    project = (v: number) => {
      if (v <= lo) {
        const outer = lo - band;
        return 0.28 * Math.max(0, Math.min(1, (v - outer) / (lo - outer)));
      }
      if (v >= hi) {
        return 0.72 + 0.28 * Math.max(0, Math.min(1, (v - hi) / band));
      }
      return 0.28 + 0.44 * ((v - lo) / (hi - lo));
    };
    loFrac = 0.28;
    hiFrac = 0.72;
  } else if (hi != null) {
    const band = Math.max(Math.abs(hi) * 0.4, 1);
    project = (v: number) => (v >= hi ? 0.72 + 0.28 * Math.min(1, (v - hi) / band) : 0.72 * Math.max(0, v / hi));
    loFrac = 0;
    hiFrac = 0.72;
  } else if (lo != null) {
    const band = Math.max(Math.abs(lo) * 0.4, 1);
    project = (v: number) => (v <= lo ? 0.28 * Math.max(0, v / lo) : 0.28 + 0.72 * Math.min(1, (v - lo) / band));
    loFrac = 0.28;
    hiFrac = 1;
  } else {
    return null;
  }
  const valueFrac = Math.max(0, Math.min(1, project(value)));
  const dot = flag === 'high' ? '#C44040' : flag === 'low' ? '#3F5BBF' : flag === 'flagged' ? '#9C6320' : '#206E55';
  return (
    <div
      className="mt-5 mb-3"
      role="img"
      aria-label={`Reference range ${lo ?? 'below'} to ${hi ?? 'above'}, current value ${value}`}
    >
      <div className="relative h-3 rounded-full bg-[#F0EFEC]">
        <div
          className="absolute h-3 bg-[#DDEEE6]"
          style={{ left: `${loFrac * 100}%`, width: `${Math.max((hiFrac - loFrac) * 100, 0)}%` }}
        />
        {lo != null && (
          <div className="absolute top-0 h-3 w-px bg-[#8ABBA5]" style={{ left: `${loFrac * 100}%` }} />
        )}
        {hi != null && (
          <div className="absolute top-0 h-3 w-px bg-[#8ABBA5]" style={{ left: `${hiFrac * 100}%` }} />
        )}
        <div
          className="absolute h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(13,17,23,0.10)]"
          style={{ left: `${valueFrac * 100}%`, top: '50%', background: dot }}
        />
      </div>
      <div className="relative mt-2 h-4 font-mono text-[12px] tabular-nums text-[#6B7370]">
        {lo != null && (
          <span className="absolute -translate-x-1/2" style={{ left: `${loFrac * 100}%` }}>{lo}</span>
        )}
        {hi != null && (
          <span className="absolute -translate-x-1/2" style={{ left: `${hiFrac * 100}%` }}>{hi}</span>
        )}
      </div>
    </div>
  );
}

function StatusChip({ flag }: { flag: LabFlag }) {
  const map: Record<LabFlag, { label: string; bg: string; fg: string }> = {
    high: { label: 'HIGH', bg: '#FEF1F1', fg: '#C44040' },
    low: { label: 'LOW', bg: '#EFF3FB', fg: '#3F5BBF' },
    ok: { label: 'IN RANGE', bg: '#EAF4EE', fg: '#206E55' },
    flagged: { label: 'FLAGGED', bg: '#FEF6EC', fg: '#9C6320' },
  };
  const s = map[flag];
  return (
    <span
      className="px-1.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}


// ── Lab marker grouping ───────────────────────────────────────

/** Defensive UX dedupe for observation rows the backend ships twice. Keys on
 *  more than (name, value, unit) so we don't collapse legit repeats with
 *  different reference ranges, interpretations, or notes (e.g. fasting vs
 *  post-load glucose). Real fix is backend stable identity. */
function dedupeObservations(obs: Observation[]): Observation[] {
  const seen = new Set<string>();
  const out: Observation[] = [];
  for (const o of obs) {
    const key = [
      (o.name || '').trim().toLowerCase(),
      String(o.value ?? '').trim(),
      (o.unit || '').trim(),
      (o.reference_range || '').trim(),
      (o.interpretation || '').trim(),
      (o.loinc_code || '').trim(),
      (o.description || '').trim(),
      (o.clinical_note || '').trim(),
      String(o.out_of_range ?? ''),
      (o.notes || '').trim(),
    ].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
}

type LabMarkerPoint = {
  id: string;
  obs: Observation;
  report: Pick<EhrLabReportPageItem, 'id' | 'name' | 'date' | 'status' | 'conclusion' | 'encounter'>;
  valueNum: number | null;
  flag: LabFlag | null;
  parsedRange: { lo: number | null; hi: number | null } | null;
};

type LabMarkerGroup = {
  key: string;
  name: string;
  loincCode?: string;
  points: LabMarkerPoint[];
};

function normalizeToken(s?: string | null): string {
  return (s || '').trim().toLowerCase();
}

function numericValue(value?: string): number | null {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!/^-?\d/.test(trimmed)) return null;
  const n = parseFloat(trimmed);
  return Number.isFinite(n) ? n : null;
}

function markerKey(obs: Observation): string {
  const unit = normalizeToken(obs.unit);
  const code = normalizeToken(obs.loinc_code);
  if (code) return `loinc:${code}|unit:${unit}`;
  return `name:${normalizeToken(obs.name)}|unit:${unit}`;
}

/** The lab endpoint is still report-shaped because FHIR DiagnosticReport owns
 *  the source document. The UI is marker-shaped: group every observation by
 *  LOINC + unit, then fall back to normalized name + unit for uncoded rows.
 *  Unit is part of the key because we do not do mmol/L <-> mg/dL conversion. */
function buildMarkerGroups(reports: EhrLabReportPageItem[]): LabMarkerGroup[] {
  const byKey = new Map<string, LabMarkerGroup>();
  for (const report of reports) {
    for (const obs of dedupeObservations(report.observations ?? [])) {
      const key = markerKey(obs);
      const existing = byKey.get(key);
      const point: LabMarkerPoint = {
        id: `${report.id}:${key}:${byKey.get(key)?.points.length ?? 0}`,
        obs,
        report,
        valueNum: numericValue(obs.value),
        flag: flagFromBackend(obs),
        parsedRange: parseRefRange(obs.reference_range),
      };

      if (existing) {
        existing.points.push(point);
        continue;
      }

      byKey.set(key, {
        key,
        name: obs.name,
        loincCode: obs.loinc_code,
        points: [point],
      });
    }
  }

  return [...byKey.values()]
    .map(group => ({
      ...group,
      points: group.points.sort((a, b) => (b.report.date ?? '').localeCompare(a.report.date ?? '') || a.report.id.localeCompare(b.report.id)),
    }))
    .sort((a, b) => {
      const aFlag = a.points[0]?.flag && a.points[0]?.flag !== 'ok' ? 0 : 1;
      const bFlag = b.points[0]?.flag && b.points[0]?.flag !== 'ok' ? 0 : 1;
      if (aFlag !== bFlag) return aFlag - bFlag;
      const dateSort = (b.points[0]?.report.date ?? '').localeCompare(a.points[0]?.report.date ?? '');
      if (dateSort !== 0) return dateSort;
      return a.name.localeCompare(b.name);
    });
}

const TREND_COLOR: Record<LabFlag, string> = {
  high: '#C44040',
  low: '#3B74C4',
  flagged: '#B8791A',
  ok: '#1D7A55',
};

function TrendChart({ points }: { points: LabMarkerPoint[] }) {
  const numeric = points
    .filter((p): p is LabMarkerPoint & { valueNum: number } => p.valueNum != null)
    .sort((a, b) => (a.report.date ?? '').localeCompare(b.report.date ?? '') || a.report.id.localeCompare(b.report.id));
  if (numeric.length < 2) return null;

  const range = [...numeric].reverse().find(p => p.parsedRange)?.parsedRange ?? null;
  const lo = range?.lo ?? null;
  const hi = range?.hi ?? null;
  const values = numeric.map(p => p.valueNum);
  const bounds = [...values, ...(lo != null ? [lo] : []), ...(hi != null ? [hi] : [])];
  const dMin = Math.min(...bounds);
  const dMax = Math.max(...bounds);
  const span = dMax - dMin || Math.abs(dMax) || 1;
  const yMin = dMin - span * 0.22;
  const yMax = dMax + span * 0.22;

  const width = 480;
  const height = 150;
  const padL = 14;
  const padR = 50;
  const padT = 18;
  const padB = 26;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const xAt = (i: number) => padL + (i / (numeric.length - 1)) * plotW;
  const yAt = (v: number) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const xy = numeric.map((p, i) => ({ ...p, x: xAt(i), y: yAt(p.valueNum) }));
  const path = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const refLoY = lo != null ? yAt(lo) : null;
  const refHiY = hi != null ? yAt(hi) : null;

  return (
    <svg
      className="w-full h-auto"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Lab trend"
    >
      {refLoY != null && refHiY != null && (
        <>
          <rect
            x={padL}
            y={Math.min(refLoY, refHiY)}
            width={plotW}
            height={Math.max(Math.abs(refLoY - refHiY), 2)}
            rx="3"
            fill="#EDF6F0"
          />
          <line x1={padL} x2={padL + plotW} y1={refHiY} y2={refHiY} stroke="#C3DDD0" strokeDasharray="3 3" />
          <line x1={padL} x2={padL + plotW} y1={refLoY} y2={refLoY} stroke="#C3DDD0" strokeDasharray="3 3" />
          <text x={padL + plotW + 6} y={refHiY + 3} fontSize="9" fill="#9AA39F" className="font-mono tabular-nums">{hi}</text>
          <text x={padL + plotW + 6} y={refLoY + 3} fontSize="9" fill="#9AA39F" className="font-mono tabular-nums">{lo}</text>
        </>
      )}
      <path d={path} fill="none" stroke="#C2CBC7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {xy.map((p, i) => {
        const c = TREND_COLOR[p.flag ?? 'ok'];
        const last = i === xy.length - 1;
        return (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={last ? 4 : 3} fill={c} stroke="#FFFFFF" strokeWidth="1.5" />
            <text
              x={p.x}
              y={p.y - 9}
              fontSize="10"
              fontWeight="600"
              textAnchor={i === 0 ? 'start' : last ? 'end' : 'middle'}
              fill={c}
              className="font-mono tabular-nums"
            >
              {p.valueNum}
            </text>
          </g>
        );
      })}
      {[0, xy.length - 1].map((idx, k) => {
        const p = xy[idx];
        if (!p?.report.date) return null;
        return (
          <text
            key={p.id}
            x={p.x}
            y={height - 8}
            fontSize="10"
            textAnchor={k === 0 ? 'start' : 'end'}
            fill="#6B7370"
            className="font-mono"
          >
            {formatDate(p.report.date).replace(/, \d{4}$/, '')}
          </text>
        );
      })}
    </svg>
  );
}

function LabMarkerCard({ group, defaultExpanded = false, noun = 'test' }: { group: LabMarkerGroup; defaultExpanded?: boolean; noun?: string }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const latest = group.points[0];
  const obs = latest.obs;
  const flag = latest.flag;
  const enriched = enrichObservation(obs.name, flag);
  const titleText = enriched.friendly || group.name;
  const subtitleText = enriched.technical || obs.description;
  const interpretationText = obs.clinical_note || enriched.interpretation || obs.interpretation;
  const showRange = latest.valueNum != null && latest.parsedRange != null;
  const numericPoints = group.points
    .filter((p): p is LabMarkerPoint & { valueNum: number } => p.valueNum != null)
    .sort((a, b) => (a.report.date ?? '').localeCompare(b.report.date ?? '') || a.report.id.localeCompare(b.report.id));
  const prior = numericPoints.length >= 2 ? numericPoints[numericPoints.length - 2] : null;
  const delta = prior && latest.valueNum != null ? +(latest.valueNum - prior.valueNum).toFixed(2) : null;
  const DeltaIcon = delta != null && delta < 0 ? TrendingDown : TrendingUp;

  return (
    <div className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-[#1A1E1C] leading-tight break-words">{titleText}</h3>
          {titleText !== group.name && (
            <p className="text-[12px] text-[#6B7370] mt-0.5 break-words">{group.name}</p>
          )}
        </div>
        {latest.report.date && (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide bg-[#F0EFEC] text-[#6B7370]">
            {formatDate(latest.report.date)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
        {obs.value ? (
          <span className={`text-[26px] font-semibold tabular-nums leading-none ${obs.out_of_range ? 'text-[#B5605F]' : 'text-[#37413E]'}`}>
            {obs.value}
          </span>
        ) : (
          <span className="text-[18px] font-semibold text-[#1A1E1C]">No value</span>
        )}
        {obs.unit && <span className="text-[14px] font-mono text-[#6B7370]">{obs.unit}</span>}
        {delta != null && delta !== 0 && (
          <span className="inline-flex items-center gap-1 text-[12px] text-[#8A9290]">
            <DeltaIcon className="h-3.5 w-3.5" />
            {Math.abs(delta)} from previous
          </span>
        )}
      </div>

      {showRange && latest.valueNum != null && latest.parsedRange && (
        <RangeBar
          value={latest.valueNum}
          lo={latest.parsedRange.lo}
          hi={latest.parsedRange.hi}
          flag={flag ?? 'ok'}
        />
      )}

      {interpretationText && (
        <p
          className={`mt-3 leading-relaxed break-words ${
            obs.out_of_range
              ? 'text-[14px] font-medium text-[#37413E]'
              : 'text-[13px] text-[#4a5250]'
          }`}
        >
          {interpretationText}
        </p>
      )}

      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-3 flex items-center gap-1 text-[12px] font-medium text-[#206E55] hover:text-[#1a5a46] transition-colors"
        >
          about the {noun}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}

      {expanded && (
        <>
          <div className="mt-3 border-t border-[#F0F1F1] pt-3 space-y-3">
            {subtitleText && (
              <p className="text-[13px] text-[#4a5250] leading-relaxed break-words">{subtitleText}</p>
            )}

            <TrendChart points={group.points} />

            <div className="divide-y divide-[#EFEDE8]">
              {group.points.map(point => (
                <div key={point.id} className="py-3 first:pt-0">
                  {point.obs.notes && (
                    <p className="text-[12px] text-[#4a5250] mt-1.5 leading-snug break-words">{point.obs.notes}</p>
                  )}
                  {point.report.conclusion && (
                    <p className="text-[12px] text-[#4a5250] mt-1.5 leading-snug break-words">{point.report.conclusion}</p>
                  )}
                  {point.report.encounter && (
                    <p className="text-[11px] text-[#8A9290] mt-1.5 break-words">Encounter: {point.report.encounter.name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setExpanded(false)}
            className="mt-3 flex items-center gap-1 text-[12px] font-medium text-[#206E55] hover:text-[#1a5a46] transition-colors"
          >
            Less about the {noun}
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

function FindingLine({ obs, abnormal }: { obs: Observation; abnormal: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(110px,0.42fr)_1fr] gap-x-5 gap-y-0.5 py-2">
      <span className="text-[12px] text-[#6B7370] break-words">{obs.name}</span>
      <span
        className={`text-[13px] break-words whitespace-pre-line ${
          abnormal ? 'text-[#B5605F] font-medium' : 'text-[#37413E]'
        }`}
      >
        {cleanClinicalText(obs.value)}
      </span>
    </div>
  );
}

/** A non-numeric report (echo/EEG/x-ray): one card per source
 *  DiagnosticReport. Collapsed shows the impression (or top findings);
 *  expanded splits abnormal "key findings" from everything else. We do not
 *  classify context/normal beyond the backend's abnormal flag. */
function LabReportCard({ report }: { report: EhrLabReportPageItem }) {
  const findings = (report.observations ?? []).filter(
    o => numericValue(o.value) == null && (o.value ?? '').trim(),
  );
  const key = findings.filter(obsAbnormal);
  const other = findings.filter(o => !obsAbnormal(o));
  const conclusion = cleanClinicalText(report.conclusion);
  const dateStr = report.date ? formatDate(report.date) : null;
  const needsReview = key.length > 0;

  return (
    <div className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[#1A1E1C] leading-tight break-words">{report.name}</h3>
          {dateStr && <p className="text-[12px] text-[#8A9290] mt-0.5">{dateStr}</p>}
        </div>
        {needsReview && <StatusChip flag="flagged" />}
      </div>

      <ClampBlock maxHeight={280}>
        <div className="mt-3 space-y-4">
          {conclusion && (
            <p className="text-[13px] leading-relaxed text-[#37413E] break-words whitespace-pre-line">{conclusion}</p>
          )}
          {key.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A9290] font-semibold mb-0.5">Key findings</p>
              <div className="divide-y divide-[#EFEDE8]">
                {key.map((o, i) => (
                  <FindingLine key={i} obs={o} abnormal />
                ))}
              </div>
            </div>
          )}
          {other.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A9290] font-semibold mb-0.5">Findings</p>
              <div className="divide-y divide-[#EFEDE8]">
                {other.map((o, i) => (
                  <FindingLine key={i} obs={o} abnormal={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </ClampBlock>
    </div>
  );
}

/** One body-system panel: out-of-range markers are always shown; in-range
 *  markers collapse behind a toggle. A panel with nothing flagged shows
 *  everything (no pointless expand). */
function LabPanelSection({ section }: { section: { name: string; groups: LabMarkerGroup[] } }) {
  const flagged = section.groups.filter(g => g.points[0]?.flag && g.points[0]?.flag !== 'ok');
  const inRange = section.groups.filter(g => !(g.points[0]?.flag && g.points[0]?.flag !== 'ok'));
  const allClear = flagged.length === 0;
  const [collapsed, setCollapsed] = useState(false);
  const [showInRange, setShowInRange] = useState(false);
  const visible = allClear ? inRange : showInRange ? [...flagged, ...inRange] : flagged;

  return (
    <div className="mt-6 first:mt-4">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="group mb-2.5 mt-10 flex w-full items-center gap-2 text-left"
      >
        <ChevronDown
          className={`h-4 w-4 text-[#9AA39F] transition-transform group-hover:text-[#6B7370] ${
            collapsed ? '' : 'rotate-180'
          }`}
        />
        <span className="text-[14px] uppercase tracking-[0.14em] text-[#6B7370] font-semibold">
          {section.name}
        </span>
      </button>
      {!collapsed && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {visible.map(group => (
              <LabMarkerCard key={group.key} group={group} noun={section.name === 'Other results' ? 'result' : 'test'} />
            ))}
          </div>
          {!allClear && inRange.length > 0 && (
            <button
              onClick={() => setShowInRange(!showInRange)}
              className="mt-3 flex items-center gap-1 text-[12px] font-medium text-[#206E55] hover:text-[#1a5a46] transition-colors"
            >
              {showInRange
                ? 'Hide in-range results'
                : `Show ${inRange.length} in-range ${inRange.length === 1 ? 'result' : 'results'}`}
              {showInRange ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Section ───────────────────────────────────────────────

export function LabReportsPageSection({ personId }: { personId: string }) {
  const fetchLabReportsPage = useEhrStore(s => s.fetchLabReportsPage);
  const refreshSeq = useEhrStore(s => s.pageRefreshSeq[personId] ?? 0);
  const [items, setItems] = useState<EhrLabReportPageItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPersonId, setLoadedPersonId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchLabReportsPage(personId)
      .then(res => {
        if (!cancelled) {
          setItems(res);
          setError(null);
          setLoadedPersonId(personId);
        }
      })
      .catch(err => {
        logger.error('[EHR] Lab reports page fetch failed', serializeError(err));
        if (!cancelled) {
          setItems(null);
          setError('Failed to load lab reports');
          setLoadedPersonId(personId);
        }
      });

    return () => { cancelled = true; };
  }, [personId, refreshSeq, fetchLabReportsPage]);

  const loading = loadedPersonId !== personId;

  if (loading) {
    return <EhrSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-[#C44040] text-center py-4">{error}</p>;
  }

  if (!items || items.length === 0) {
    return <p className="text-sm text-[#6B7370] text-center py-4">No lab reports found</p>;
  }

  const groups = buildMarkerGroups(items);
  // The big-number marker card (value, range bar, trend) is only meaningful
  // for numeric results. Non-numeric observations are clinical free-text
  // (echo/x-ray narratives, impressions) and get a readable text card instead.
  const numericGroups = groups.filter(g => g.points.some(p => p.valueNum != null));
  // Non-numeric observations are facets of a single report, not trackable
  // markers — keep them grouped by their source report.
  const narrativeReports = items.filter(r =>
    (r.observations ?? []).some(o => numericValue(o.value) == null && (o.value ?? '').trim()),
  );
  const flaggedCount = numericGroups.filter(g => {
    const flag = g.points[0]?.flag;
    return flag && flag !== 'ok';
  }).length;

  // A biomarker may belong to multiple panels; bucket under its first
  // (primary) panel to avoid duplication, unpaneled markers last.
  const OTHER_PANEL = 'Other results';
  const panelMap = new Map<string, { name: string; groups: LabMarkerGroup[] }>();
  for (const g of numericGroups) {
    const name = g.points[0]?.obs.panels?.[0]?.name?.trim() || OTHER_PANEL;
    let section = panelMap.get(name);
    if (!section) {
      section = { name, groups: [] };
      panelMap.set(name, section);
    }
    section.groups.push(g);
  }
  const flaggedIn = (groups: LabMarkerGroup[]) =>
    groups.filter(g => g.points[0]?.flag && g.points[0]?.flag !== 'ok').length;
  const panelSections = [...panelMap.values()].sort((a, b) => {
    if (a.name === OTHER_PANEL) return 1;
    if (b.name === OTHER_PANEL) return -1;
    const diff = flaggedIn(b.groups) - flaggedIn(a.groups);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });

  if (groups.length === 0) {
    return <p className="text-sm text-[#6B7370] text-center py-4">No lab markers found</p>;
  }

  const flaggedPanels = panelSections.filter(s => flaggedIn(s.groups) > 0);
  const clearPanels = panelSections.filter(s => flaggedIn(s.groups) === 0);

  return (
    <div className="space-y-8">
      {numericGroups.length > 0 && (
        <div>
          <div className="mb-12 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#8A9290]">
            <span>
              {items.length} {items.length === 1 ? 'report' : 'reports'} uploaded
            </span>
            <span>
              {numericGroups.length} {numericGroups.length === 1 ? 'marker' : 'markers'} tracked
            </span>
            {flaggedCount > 0 ? (
              <span>
                {flaggedCount} out of range {flaggedCount === 1 ? 'marker' : 'markers'}
              </span>
            ) : (
              <span>All markers in range</span>
            )}
          </div>
          {flaggedPanels.map(section => (
            <LabPanelSection key={section.name} section={section} />
          ))}
        </div>
      )}

      {clearPanels.length > 0 && (
        <div>{clearPanels.map(section => (
          <LabPanelSection key={section.name} section={section} />
        ))}</div>
      )}

      {narrativeReports.length > 0 && (
        <div>
          <div className="mb-3 text-[14px] uppercase tracking-[0.14em] text-[#6B7370] font-semibold">
            Reports &amp; findings
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {narrativeReports.map(report => (
              <LabReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
