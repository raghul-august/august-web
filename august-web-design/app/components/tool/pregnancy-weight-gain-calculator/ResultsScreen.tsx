"use client";

// NOTE: CorridorChart is generic enough to extract to shared/ when a second
// tool needs a week-indexed range band. Build tool-scoped for now.

import { useState, useCallback } from "react";
import type {
  Result,
  BMICategory,
  CurrentStatus,
} from "@/app/utils/tools/pregnancy-weight-gain-compute";
import {
  CATEGORY_DESCRIPTORS,
  TRIMESTER_RATES,
} from "@/app/utils/tools/pregnancy-weight-gain-compute";
import { track } from "@/app/utils/analytics";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import { useDownloadResult } from "@/app/components/tool/shared/hooks/useDownloadResult";
import DownloadResultButton from "@/app/components/tool/shared/DownloadResultButton";

const TOOL_ID = "pregnancy-weight-gain-calculator";
const CHAT_MSG = "I just used the pregnancy weight gain calculator and want to discuss my results.";

interface ResultsScreenProps {
  result: Result;
  formData: {
    gestationalWeek: number;
    twins: boolean;
  };
  onRestart: () => void;
}

// ── Sub-components ─────────────────────────────────────────────────────────

// SVG corridor chart (inline, zero deps)
function CorridorChart({
  corridor,
  week,
  gain,
  unit,
}: {
  corridor: Result["weeklyCorridor"];
  week: number;
  gain: number | null;
  unit: "lbs" | "kg";
}) {
  if (corridor.length === 0) return null;

  const W = 460;
  const H = 200;
  const PAD = { top: 12, right: 16, bottom: 32, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxGain = corridor[corridor.length - 1].high;
  const minGain = 0;

  const xScale = (w: number) => PAD.left + ((w - 1) / 39) * chartW;
  const yScale = (g: number) =>
    PAD.top + chartH - ((g - minGain) / (maxGain - minGain || 1)) * chartH;

  const highPts = corridor.map((r) => `${xScale(r.week)},${yScale(r.high)}`).join(" ");
  const lowPts = corridor.map((r) => `${xScale(r.week)},${yScale(r.low)}`).join(" ");
  const lowPtsRev = [...corridor]
    .reverse()
    .map((r) => `${xScale(r.week)},${yScale(r.low)}`)
    .join(" ");

  const bandPath = `M ${corridor.map((r) => `${xScale(r.week)},${yScale(r.high)}`).join(" L ")} L ${[...corridor].reverse().map((r) => `${xScale(r.week)},${yScale(r.low)}`).join(" L ")} Z`;

  const weekX = xScale(week);
  const weekRowIdx = week - 1;
  const dotY =
    gain !== null && weekRowIdx >= 0 && weekRowIdx < corridor.length
      ? yScale(corridor[weekRowIdx].low + gain)
      : null;

  // Y-axis labels
  const midGain = Math.round((maxGain + minGain) / 2);
  const yLabels = [
    { val: minGain, y: yScale(minGain) },
    { val: midGain, y: yScale(midGain) },
    { val: Math.round(maxGain), y: yScale(maxGain) },
  ];
  // X-axis labels at trimester boundaries
  const xLabels = [
    { val: 0, x: xScale(1) },
    { val: 13, x: xScale(13) },
    { val: 26, x: xScale(26) },
    { val: 40, x: xScale(40) },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {/* Corridor band */}
      <path d={bandPath} fill="var(--brand-subtle, #e8f2ed)" fillOpacity={0.35} />
      {/* High edge */}
      <polyline
        points={highPts}
        fill="none"
        stroke="var(--brand-primary)"
        strokeOpacity={0.6}
        strokeWidth={1.5}
      />
      {/* Low edge */}
      <polyline
        points={lowPts}
        fill="none"
        stroke="var(--brand-primary)"
        strokeOpacity={0.6}
        strokeWidth={1.5}
      />
      {/* Current week dashed line */}
      <line
        x1={weekX}
        y1={PAD.top}
        x2={weekX}
        y2={PAD.top + chartH}
        stroke="var(--text-tertiary)"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      {/* Actual gain dot */}
      {gain !== null && dotY !== null && (
        <circle cx={weekX} cy={dotY} r={5} fill="var(--brand-primary)" />
      )}
      {/* Y-axis labels */}
      {yLabels.map(({ val, y }) => (
        <text
          key={val}
          x={PAD.left - 6}
          y={y + 4}
          textAnchor="end"
          fontSize={10}
          fill="var(--text-tertiary)"
        >
          {val}
        </text>
      ))}
      {/* X-axis labels */}
      {xLabels.map(({ val, x }) => (
        <text
          key={val}
          x={x}
          y={H - 8}
          textAnchor="middle"
          fontSize={10}
          fill="var(--text-tertiary)"
        >
          {val}
        </text>
      ))}
      {/* Unit label on Y axis */}
      <text
        x={8}
        y={PAD.top + chartH / 2}
        fontSize={9}
        fill="var(--text-tertiary)"
        textAnchor="middle"
        transform={`rotate(-90, 8, ${PAD.top + chartH / 2})`}
      >
        gain ({unit})
      </text>
    </svg>
  );
}

// Week table with expand/collapse
function WeekTable({
  corridor,
  week,
  unit,
}: {
  corridor: Result["weeklyCorridor"];
  week: number;
  unit: "lbs" | "kg";
}) {
  const [expanded, setExpanded] = useState(false);

  const visibleRows = expanded
    ? corridor
    : corridor.filter((r) => Math.abs(r.week - week) <= 2);

  return (
    <div>
      <table className="pwg-tbl" aria-label="Week-by-week weight gain breakdown">
        <thead>
          <tr>
            <th>Week</th>
            <th>Low ({unit})</th>
            <th>High ({unit})</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((r) => (
            <tr key={r.week} className={r.week === week ? "pwg-row-current" : ""}>
              <td>
                {r.week}
                {r.week === week && (
                  <span className="pwg-here-label">→ You are here</span>
                )}
              </td>
              <td>{r.low.toFixed(1)}</td>
              <td>{r.high.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="pwg-table-toggle"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Show less ↑" : "View all 40 weeks ↓"}
      </button>
    </div>
  );
}

// ── Status label helpers ───────────────────────────────────────────────────

function statusCssModifier(status: CurrentStatus): string {
  if (status === "on-track") return "pwg-status--ok";
  if (status === "above") return "pwg-status--above";
  return "pwg-status--below";
}

function statusHeading(status: CurrentStatus): string {
  if (status === "on-track") return "On track ✓";
  if (status === "above") return "Above range";
  return "Below range";
}

function statusBody(
  status: CurrentStatus,
  gain: number,
  deviation: number,
  week: number,
  category: BMICategory,
  low: number,
  high: number,
  unit: "lbs" | "kg",
): string {
  const g = gain.toFixed(1);
  const d = Math.abs(deviation).toFixed(1);
  const l = low.toFixed(1);
  const h = high.toFixed(1);
  if (status === "on-track") {
    return `You've gained ${g} ${unit}. At week ${week}, the recommended gain for ${category} is between ${l} and ${h} ${unit}.`;
  }
  if (status === "above") {
    return `You've gained ${g} ${unit}, which is ${d} ${unit} above the upper end of ${h} ${unit} for week ${week}. Small variations are normal — bring this up at your next appointment.`;
  }
  return `You've gained ${g} ${unit}, which is ${d} ${unit} below the lower end of ${l} ${unit} for week ${week}. Many pregnancies catch up — your provider can help interpret this in context.`;
}

// ── Main ResultsScreen ─────────────────────────────────────────────────────

export default function ResultsScreen({ result, formData, onRestart }: ResultsScreenProps) {
  const {
    bmi,
    category,
    totalRange,
    isEdgeTwinsUnderweight,
    weeklyCorridor,
    currentGain,
    currentStatus,
    currentDeviation,
    unit,
  } = result;

  const { gestationalWeek, twins } = formData;

  const categoryLabel: Record<BMICategory, string> = {
    underweight: "Underweight",
    normal: "Normal weight",
    overweight: "Overweight",
    obese: "Obese",
  };

  const weekRow = weeklyCorridor[gestationalWeek - 1];
  const weekLow = weekRow?.low ?? 0;
  const weekHigh = weekRow?.high ?? 0;

  const handleChatClick = useCallback(() => {
    track("tool_cta_clicked", { tool: TOOL_ID, target: "chat" });
    openAugustChat(CHAT_MSG);
  }, []);

  const { resultRef, handleDownload } = useDownloadResult({
    toolId: TOOL_ID,
    filename: `pregnancy-weight-gain-${category}`,
    heading: "Pregnancy Weight Gain Plan",
    subtitle: `Weight Gain Report • ${category}`,
    toolName: "Pregnancy Weight Gain Calculator",
    maxPageHeight : 1370
  });

  // Total range display
  const totalLowDisplay = unit === "lbs" ? totalRange.lowLbs : totalRange.lowKg;
  const totalHighDisplay = unit === "lbs" ? totalRange.highLbs : totalRange.highKg;
  const totalLowOther = unit === "lbs" ? totalRange.lowKg : totalRange.lowLbs;
  const totalHighOther = unit === "lbs" ? totalRange.highKg : totalRange.highLbs;
  const otherUnit = unit === "lbs" ? "kg" : "lbs";

  const rates = TRIMESTER_RATES[category];
  const t1Display = unit === "lbs" ? rates.t1Lbs : rates.t1Kg;
  const t23Display = unit === "lbs" ? rates.t23Lbs : rates.t23Kg;

  return (
    <div ref={resultRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="flex items-center justify-between" data-skip-screenshot="true">
        <button type="button" className="pwg-recalc-link" onClick={onRestart}>
          ← Recalculate
        </button>
        <DownloadResultButton onClick={handleDownload} />
      </div>

      {/* Card 1: BMI badge */}
      <div className="tool-card" style={{ animation: "toolFadeIn 0.4s ease both" }}>
        <p className="tool-section-label" style={{ marginBottom: 4 }}>
          Your pre-pregnancy BMI
        </p>
        <div className="pwg-bmi-row">
          <span className="pwg-bmi-number">{bmi.toFixed(1)}</span>
          <span className="pwg-bmi-badge">{categoryLabel[category]}</span>
        </div>
        <p className="pwg-bmi-descriptor">{CATEGORY_DESCRIPTORS[category]}</p>
      </div>

      {/* Edge case: twins + underweight — replaces status + range cards */}
      {isEdgeTwinsUnderweight ? (
        <>
          <div className="tool-card pwg-consult-card" style={{ animation: "toolFadeIn 0.4s ease 0.1s both" }}>
            <p className="tool-section-label" style={{ marginBottom: 8 }}>
              A note on twins + underweight BMI
            </p>
            <h3 className="pwg-consult-heading">
              We can&apos;t give you a number for this combination
            </h3>
            <p className="pwg-consult-body">
              The Institute of Medicine 2009 guidelines don&apos;t publish a recommended weight-gain
              range for women carrying twins who started pregnancy underweight. Your healthcare
              provider can give you an individualized target based on your medical history.
            </p>
          </div>
          {/* CTAs */}
          <div className="flex justify-center" style={{ animation: "toolFadeIn 0.4s ease 0.15s both", marginTop: 0 }} data-skip-screenshot="true">
            <button
              type="button"
              className="tool-btn tool-btn--primary"
              onClick={handleChatClick}
            >
              Talk to august
            </button>
            <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
              Start over
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Card 2: Status callout (only if current weight provided) */}
          {currentStatus && currentGain !== null && currentStatus !== "edge-twins-underweight" && (
            <div
              className={`tool-card pwg-status ${statusCssModifier(currentStatus)}`}
              role="status"
              aria-live="polite"
              style={{ animation: "toolFadeIn 0.4s ease 0.1s both" }}
            >
              <p className="tool-section-label" style={{ marginBottom: 8 }}>
                Week {gestationalWeek} status
              </p>
              <h3 className="pwg-status-heading">{statusHeading(currentStatus)}</h3>
              <p className="pwg-status-body">
                {statusBody(
                  currentStatus,
                  currentGain,
                  currentDeviation ?? 0,
                  gestationalWeek,
                  category,
                  weekLow,
                  weekHigh,
                  unit,
                )}
              </p>
              <span className="pwg-status-pill">
                {currentGain.toFixed(1)} {unit} gained this pregnancy
              </span>
            </div>
          )}

          {/* CTAs — placed early so they appear in first viewport */}
          <div className="flex justify-center gap-4" style={{ animation: "toolFadeIn 0.4s ease 0.15s both", marginTop: 0 }} data-skip-screenshot="true">
            <button
              type="button"
              className="tool-btn tool-btn--primary"
              onClick={handleChatClick}
            >
              Talk to august
            </button>
            <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
              Start over
            </button>
          </div>

          {/* Card 3: Total recommended gain */}
          <div
            className="tool-card"
            style={{ animation: "toolFadeIn 0.4s ease 0.2s both" }}
          >
            <p className="tool-section-label" style={{ marginBottom: 4 }}>
              Total recommended gain
            </p>
            <p className="pwg-range-value">
              {totalLowDisplay}–{totalHighDisplay} {unit}
            </p>
            <p className="pwg-range-sub">
              {totalLowOther}–{totalHighOther} {otherUnit} · {categoryLabel[category]} ·{" "}
              {twins ? "Twins" : "Singleton"} pregnancy
            </p>
            <p className="pwg-trimester-inline">
              T1: {t1Display}/wk · T2–T3: {t23Display}/wk
            </p>
          </div>

          {/* Card 4: 40-week corridor chart */}
          <div
            className="tool-card"
            style={{ animation: "toolFadeIn 0.4s ease 0.3s both" }}
          >
            <p className="tool-section-label" style={{ marginBottom: 8 }}>
              40-week corridor
            </p>
            <div className="pwg-chart">
              <CorridorChart
                corridor={weeklyCorridor}
                week={gestationalWeek}
                gain={currentGain}
                unit={unit}
              />
            </div>
            <p className="pwg-chart-caption">
              40-week weight gain corridor · Week {gestationalWeek} highlighted
            </p>
          </div>

          {/* Card 5: Week-by-week table */}
          <div
            className="tool-card"
            style={{ animation: "toolFadeIn 0.4s ease 0.35s both" }}
          >
            <p className="tool-section-label" style={{ marginBottom: 12 }}>
              Week-by-week breakdown
            </p>
            <WeekTable
              corridor={weeklyCorridor}
              week={gestationalWeek}
              unit={unit}
            />
          </div>
        </>
      )}

      {/* Disclaimer */}
      <p className="tool-disclaimer" style={{ textAlign: "center" }} data-skip-screenshot="true">
        Estimates based on IOM 2009 guidelines. Not medical advice. Talk to your healthcare provider about your specific needs.
      </p>
    </div>
  );
}
