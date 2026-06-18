"use client";

interface TrajectoryChartProps {
  weeksOnMedication: number;
  weeksStalled: number;
  pctLost: number;
  expectedPctAtThisPoint: number;
  expectedPctTotal: number;
}

const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
const W = 520;
const H = 280;
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;
const TOTAL_WEEKS = 72;

function weekToX(week: number): number {
  return PAD.left + (week / TOTAL_WEEKS) * CHART_W;
}

function pctToY(pct: number, maxPct: number): number {
  return PAD.top + CHART_H - (pct / maxPct) * CHART_H;
}

function expectedAtWeek(w: number, total: number): number {
  return total * (1 - Math.exp(-3 * w / TOTAL_WEEKS));
}

export default function TrajectoryChart({
  weeksOnMedication,
  weeksStalled,
  pctLost,
  expectedPctAtThisPoint,
  expectedPctTotal,
}: TrajectoryChartProps) {
  // Y-axis ceiling with breathing room
  const maxPct = Math.max(expectedPctTotal, pctLost, expectedPctAtThisPoint) * 1.15;

  // expected trajectory: ~20 sample points
  const curvePoints: [number, number][] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const w = (i / steps) * TOTAL_WEEKS;
    curvePoints.push([weekToX(w), pctToY(expectedAtWeek(w, expectedPctTotal), maxPct)]);
  }
  const curvePath = curvePoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");

  // filled area under expected curve
  const areaPath =
    curvePath +
    ` L${weekToX(TOTAL_WEEKS).toFixed(1)},${pctToY(0, maxPct).toFixed(1)}` +
    ` L${weekToX(0).toFixed(1)},${pctToY(0, maxPct).toFixed(1)} Z`;

  // actual progress: loss segment then stall segment
  const stallStart = weeksOnMedication - weeksStalled;
  const lossSegment = `M${weekToX(0).toFixed(1)},${pctToY(0, maxPct).toFixed(1)} L${weekToX(stallStart).toFixed(1)},${pctToY(pctLost, maxPct).toFixed(1)}`;
  const stallSegment = `M${weekToX(stallStart).toFixed(1)},${pctToY(pctLost, maxPct).toFixed(1)} L${weekToX(weeksOnMedication).toFixed(1)},${pctToY(pctLost, maxPct).toFixed(1)}`;

  // grid lines: horizontal at regular % intervals
  const gridStep = maxPct <= 10 ? 2 : maxPct <= 20 ? 5 : 10;
  const hLines: number[] = [];
  for (let v = gridStep; v < maxPct; v += gridStep) {
    hLines.push(v);
  }

  // y-axis labels
  const yLabels: { pct: number; y: number }[] = [
    { pct: 0, y: pctToY(0, maxPct) },
    { pct: expectedPctTotal, y: pctToY(expectedPctTotal, maxPct) },
  ];

  // current dot position
  const dotX = weekToX(weeksOnMedication);
  const dotY = pctToY(pctLost, maxPct);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        {/* background */}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={CHART_W}
          height={CHART_H}
          fill="var(--surface-page)"
          rx={4}
        />

        {/* horizontal grid lines */}
        {hLines.map((v) => (
          <line
            key={`h-${v}`}
            x1={PAD.left}
            y1={pctToY(v, maxPct)}
            x2={W - PAD.right}
            y2={pctToY(v, maxPct)}
            stroke="var(--border-subtle, #E5E2DA)"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.5}
          />
        ))}

        {/* vertical line at current week */}
        <line
          x1={weekToX(weeksOnMedication)}
          y1={PAD.top}
          x2={weekToX(weeksOnMedication)}
          y2={PAD.top + CHART_H}
          stroke="var(--border-subtle, #E5E2DA)"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.5}
        />

        {/* stall zone highlight */}
        {weeksStalled > 0 && (
          <rect
            x={weekToX(stallStart)}
            y={PAD.top}
            width={weekToX(weeksOnMedication) - weekToX(stallStart)}
            height={CHART_H}
            fill="var(--warning, #C68E2A)"
            opacity={0.06}
          />
        )}

        {/* expected trajectory fill */}
        <defs>
          <linearGradient id="tc-expected-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-primary, #206E55)" stopOpacity={0.05} />
            <stop offset="100%" stopColor="var(--brand-primary, #206E55)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#tc-expected-fill)" />

        {/* expected trajectory line */}
        <path
          d={curvePath}
          fill="none"
          stroke="var(--brand-primary, #206E55)"
          strokeWidth={2}
          strokeDasharray="6 4"
          opacity={0.3}
        />

        {/* actual loss segment */}
        <path
          d={lossSegment}
          fill="none"
          stroke="var(--brand-primary, #206E55)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* stall segment */}
        {weeksStalled > 0 && (
          <path
            d={stallSegment}
            fill="none"
            stroke="var(--warning, #C68E2A)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* current position outer ring */}
        <circle
          cx={dotX}
          cy={dotY}
          r={9}
          fill="none"
          stroke="var(--brand-primary, #206E55)"
          strokeWidth={1.5}
          opacity={0.2}
        />

        {/* current position dot */}
        <circle
          cx={dotX}
          cy={dotY}
          r={5}
          fill="var(--brand-primary, #206E55)"
        />

        {/* x-axis labels */}
        <text
          x={PAD.left}
          y={H - 8}
          fontSize={10}
          fontWeight={400}
          fill="var(--text-tertiary, #7A7468)"
          textAnchor="start"
        >
          0
        </text>
        <text
          x={weekToX(weeksOnMedication)}
          y={H - 8}
          fontSize={10}
          fontWeight={400}
          fill="var(--text-tertiary, #7A7468)"
          textAnchor="middle"
        >
          {weeksOnMedication}
        </text>
        <text
          x={W - PAD.right}
          y={H - 8}
          fontSize={10}
          fontWeight={400}
          fill="var(--text-tertiary, #7A7468)"
          textAnchor="end"
        >
          72 wk
        </text>

        {/* y-axis labels */}
        {yLabels.map((l) => (
          <text
            key={`y-${l.pct}`}
            x={PAD.left - 8}
            y={l.y + 3}
            fontSize={10}
            fontWeight={400}
            fill="var(--text-tertiary, #7A7468)"
            textAnchor="end"
          >
            {l.pct === 0 ? "0%" : `${l.pct}%`}
          </text>
        ))}
      </svg>

      {/* legend */}
      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          marginTop: 10,
          fontSize: 11,
          fontWeight: 400,
          color: "var(--text-secondary, #5A554A)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <svg width={20} height={8}>
            <line
              x1={0} y1={4} x2={20} y2={4}
              stroke="var(--brand-primary, #206E55)"
              strokeWidth={2}
              strokeDasharray="4 3"
              opacity={0.4}
            />
          </svg>
          Expected
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <svg width={20} height={8}>
            <line
              x1={0} y1={4} x2={20} y2={4}
              stroke="var(--brand-primary, #206E55)"
              strokeWidth={2.5}
            />
          </svg>
          Your progress
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <svg width={20} height={8}>
            <line
              x1={0} y1={4} x2={20} y2={4}
              stroke="var(--warning, #C68E2A)"
              strokeWidth={2.5}
            />
          </svg>
          Stall
        </span>
      </div>
    </div>
  );
}
