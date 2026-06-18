"use client";

import type { NavyResult, ArmyResult, Result } from "@/app/data/tools/body-fat-calculator-config";
import { SPECTRUM_SEGMENTS, CATEGORY_LABELS } from "@/app/data/tools/body-fat-calculator-config";
import { kgToLbs } from "@/app/utils/tools/body-fat-calculator-compute";

function fmt1(n: number): string { return n.toFixed(1); }
function fmtInt(n: number): string { return Math.round(n).toString(); }
function fmtMass(kg: number): string {
  return `${fmt1(kg)} kg / ${fmt1(kgToLbs(kg))} lbs`;
}

// ── spectrum pointer position (0–100%) ────────────────────────────────────

function spectrumPosition(bfp: number, sex: "male" | "female"): number {
  // Five equal segments. Map bfp to a 0–100 position within the bar.
  // Thresholds per ACE bands (male): 0-5, 6-13, 14-17, 18-24, 25+
  // Normalise into 0–100 visual range for the pointer.
  const ranges =
    sex === "male"
      ? [5, 13, 17, 24, 40]    // upper bounds for each segment (Obese capped at 40 for visual)
      : [13, 20, 24, 31, 50];  // female equivalents
  const segWidth = 100 / 5;
  // find which segment
  let segIdx = ranges.length - 1;
  for (let i = 0; i < ranges.length; i++) {
    if (bfp <= ranges[i]) { segIdx = i; break; }
  }
  // within-segment position
  const lo = segIdx === 0 ? 0 : ranges[segIdx - 1];
  const hi = ranges[segIdx];
  const within = hi === lo ? 0.5 : clampFrac((bfp - lo) / (hi - lo));
  return segIdx * segWidth + within * segWidth;
}

function clampFrac(n: number) { return Math.min(1, Math.max(0, n)); }

// ── NavyResultView ────────────────────────────────────────────────────────

function NavyResultView({ r }: { r: NavyResult }) {
  const pct = spectrumPosition(r.bfp, r.sex);
  const sexLabel = r.sex === "male" ? "Male" : "Female";

  return (
    <div className="bfc-result-panel">
      <span className="tool-section-label">BODY FAT</span>
      <div className="bfc-bf-row">
        <div className="bfc-bf-number" key={fmt1(r.bfp)}>{fmt1(r.bfp)}%</div>
        <span className={`bfc-badge bfc-badge--${r.category}`}>
          {CATEGORY_LABELS[r.category]}
        </span>
      </div>
      <div className="bfc-result-sub">
        U.S. Navy method · {sexLabel} · {fmtInt(r.age)}yo
      </div>

      {/* Spectrum bar */}
      <div className="bfc-spectrum-wrap">
        <div
          className="bfc-spectrum-pointer"
          style={{ left: `${pct}%` }}
          aria-hidden="true"
        />
        <div className="bfc-spectrum-bar" role="img" aria-label={`Body fat category: ${CATEGORY_LABELS[r.category]}`}>
          {SPECTRUM_SEGMENTS.map((cat) => (
            <div key={cat} className={`bfc-spectrum-bar__seg bfc-spectrum-bar__seg--${cat}`} />
          ))}
        </div>
        <div className="bfc-spectrum-labels" aria-hidden="true">
          {SPECTRUM_SEGMENTS.map((cat) => (
            <span key={cat}>{CATEGORY_LABELS[cat]}</span>
          ))}
        </div>
      </div>

      {/* Data table */}
      <div>
        <div className="bfc-data-row">
          <span className="bfc-data-row__label">Body fat</span>
          <span className="bfc-data-row__value">{fmt1(r.bfp)}%</span>
        </div>
        <div className="bfc-data-row">
          <span className="bfc-data-row__label">Fat mass</span>
          <span className="bfc-data-row__value">{fmtMass(r.fatMassKg)}</span>
        </div>
        <div className="bfc-data-row">
          <span className="bfc-data-row__label">Lean mass</span>
          <span className="bfc-data-row__value">{fmtMass(r.leanMassKg)}</span>
        </div>
        <div className="bfc-data-row">
          <span className="bfc-data-row__label">Ideal BF (J&amp;P)</span>
          <span className="bfc-data-row__value">{fmt1(r.idealBfp)}%</span>
        </div>
        {r.fatToLoseKg !== null && (
          <div className="bfc-data-row">
            <span className="bfc-data-row__label">Fat to lose</span>
            <span className="bfc-data-row__value">{fmtMass(r.fatToLoseKg)}</span>
          </div>
        )}
      </div>

      <p className="bfc-bmi-note">
        BMI method estimate: {fmt1(r.bmiBfp)}% · BMI-based estimates are less accurate than circumference methods
      </p>
    </div>
  );
}

// ── ArmyResultView ────────────────────────────────────────────────────────

function ArmyResultView({ r }: { r: ArmyResult }) {
  const isSubTen = r.bfp === -1;
  const bfpDisplay = isSubTen ? "<10%" : `${fmtInt(r.bfp)}%`;
  const verdictClass = r.pass ? "bfc-verdict-block--pass" : "bfc-verdict-block--fail";
  const verdictLabel = r.pass ? "PASS" : "Requirements not met";
  const badgeClass = r.pass ? "bfc-badge--pass" : "bfc-badge--fail";

  // threshold bar: position fill at min(bfp/threshold, 1), tick at threshold/maxDisplay
  const maxDisplay = Math.max(r.threshold + 10, isSubTen ? r.threshold + 10 : r.bfp + 5);
  const fillPct = isSubTen ? (5 / maxDisplay) * 100 : clampFrac(r.bfp / maxDisplay) * 100;
  const tickPct = clampFrac(r.threshold / maxDisplay) * 100;
  const fillClass = r.pass ? "bfc-threshold-bar__fill--pass" : "bfc-threshold-bar__fill--fail";

  const marginPp = isSubTen
    ? `Below 10% — you meet requirements`
    : r.pass
      ? `${fmtInt(r.threshold - r.bfp)} pp below your limit`
      : `${fmtInt(r.bfp - r.threshold)} pp over your limit`;

  return (
    <div className="bfc-result-panel">
      <span className="tool-section-label">ASSESSMENT</span>

      <div className={`bfc-verdict-block ${verdictClass}`}>
        <div className="bfc-verdict-label">Result</div>
        <div className="bfc-bf-number">{bfpDisplay}</div>
        <span className={`bfc-badge ${badgeClass}`}>{verdictLabel}</span>
      </div>

      <div className="bfc-data-row">
        <span className="bfc-data-row__label">Age bracket</span>
        <span className="bfc-data-row__value">{r.ageBracket}</span>
      </div>
      <div className="bfc-data-row">
        <span className="bfc-data-row__label">Your limit</span>
        <span className="bfc-data-row__value">{r.threshold}%</span>
      </div>

      <p className="bfc-verdict-margin-note">{marginPp}</p>

      {/* Position vs limit bar */}
      <div className="bfc-threshold-wrap">
        <span className="tool-section-label" style={{ display: "block", marginBottom: 6 }}>POSITION VS. LIMIT</span>
        <div className="bfc-threshold-bar">
          <div
            className={`bfc-threshold-bar__fill ${fillClass}`}
            style={{ width: `${fillPct}%` }}
          />
          <div
            className="bfc-threshold-bar__tick"
            style={{ left: `${tickPct}%` }}
            aria-label={`Limit: ${r.threshold}%`}
          />
        </div>
        <p className="bfc-threshold-note">Tick marks your limit ({r.threshold}%)</p>
      </div>
    </div>
  );
}

// ── Pending ───────────────────────────────────────────────────────────────

function PendingView({ message }: { message?: string }) {
  return (
    <div className="bfc-pending">
      <span className="bfc-pending__dash" aria-hidden="true">—</span>
      <p className="bfc-pending__text">
        {message ?? "Fix the errors in the form to see your result"}
      </p>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────

interface ResultPanelProps {
  result: Result | null;
  formulaError?: string;
}

export default function ResultPanel({ result, formulaError }: ResultPanelProps) {
  if (!result || formulaError) {
    return (
      <div className="tool-card" style={{ minHeight: 240 }}>
        <PendingView message={formulaError} />
      </div>
    );
  }

  return (
    <div className="tool-card">
      {result.kind === "navy" ? (
        <NavyResultView r={result} />
      ) : (
        <ArmyResultView r={result} />
      )}
    </div>
  );
}
