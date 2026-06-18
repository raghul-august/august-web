import type { WeekSample } from "@/app/utils/tools/weight-loss-timeline-projector-compute";
import { fmtDecimal } from "@/app/utils/tools/health-math";

type Props = {
  weeks: WeekSample[];
  goalWeek: number;
  goal: number;
  baseline: number;
  unit: "lb" | "kg";
  maxWeek: number;
  milestoneWeeks: number[];
  extrapolated: boolean;
  weeksOnMed: number | null;
  unreachable: boolean;
};

const VB_W = 320;
const VB_H = 200;
const PAD_L = 40;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 28;

const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;

const LINE_COLOR = "var(--brand-primary)";
const AXIS_COLOR = "var(--text-tertiary)";
const GRID_COLOR = "var(--border-subtle)";
const GOAL_COLOR = "var(--text-secondary)";
const NOW_COLOR = "var(--warning-700)";

export default function ProjectionChart({
  weeks,
  goalWeek,
  goal,
  baseline,
  unit,
  maxWeek,
  milestoneWeeks,
  extrapolated,
  weeksOnMed,
  unreachable,
}: Props) {
  if (weeks.length === 0) return null;

  // X domain: 0 → end of visible weeks (matches what compute gave us).
  const xMax = weeks[weeks.length - 1].week;
  const xMin = 0;

  // Y domain: tight band around the data, with a little headroom.
  const yLow = Math.min(goal, weeks[weeks.length - 1].weight);
  const yHigh = Math.max(baseline, weeks[0].weight);
  const yPad = (yHigh - yLow) * 0.08 || 1;
  const yMin = yLow - yPad;
  const yMax = yHigh + yPad;

  const xScale = (w: number): number =>
    PAD_L + ((w - xMin) / (xMax - xMin || 1)) * PLOT_W;
  const yScale = (kg: number): number =>
    PAD_T + ((yMax - kg) / (yMax - yMin || 1)) * PLOT_H;

  // Split projection into solid-window and dashed-extrapolation segments.
  const solidPoints: WeekSample[] = [];
  const dashedPoints: WeekSample[] = [];
  for (const sample of weeks) {
    if (sample.week <= maxWeek) solidPoints.push(sample);
    else dashedPoints.push(sample);
  }
  // Bridge: include the last solid point at the start of the dashed series so
  // the dash visually continues from where the solid ends.
  if (dashedPoints.length > 0 && solidPoints.length > 0) {
    dashedPoints.unshift(solidPoints[solidPoints.length - 1]);
  }

  const toPath = (pts: WeekSample[]): string =>
    pts.map((p) => `${xScale(p.week).toFixed(2)},${yScale(p.weight).toFixed(2)}`).join(" ");

  // y-axis ticks: baseline, midpoint, goal — with rounded labels.
  const yTickValues = [yHigh, (yHigh + yLow) / 2, yLow];

  const goalX = xScale(Math.min(goalWeek, xMax));
  const goalY = yScale(goal);
  const showGoalMarker = !unreachable;

  // For the "now" marker: interpolate within `weeks` (which is sampled every
  // integer week) to handle any non-integer weeksOnMed gracefully.
  const findWeightAt = (w: number): number | null => {
    if (w < 0) return null;
    const lo = Math.floor(w);
    const hi = Math.ceil(w);
    const a = weeks.find((s) => s.week === lo);
    const b = weeks.find((s) => s.week === hi);
    if (!a) return null;
    if (!b || a === b) return a.weight;
    const t = w - lo;
    return a.weight + (b.weight - a.weight) * t;
  };
  const nowX = weeksOnMed != null ? xScale(weeksOnMed) : null;
  const nowWeight = weeksOnMed != null ? findWeightAt(weeksOnMed) : null;
  const nowY = nowWeight != null ? yScale(nowWeight) : null;

  return (
    <figure className="tool-card wltp-chart" aria-label="Weight projection chart">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="auto"
        role="img"
      >
        <title>Projected weight over weeks</title>

        {/* Y grid lines + labels */}
        {yTickValues.map((y, i) => (
          <g key={`yt-${i}`}>
            <line
              x1={PAD_L}
              x2={VB_W - PAD_R}
              y1={yScale(y)}
              y2={yScale(y)}
              stroke={GRID_COLOR}
              strokeWidth={1}
            />
            <text
              x={PAD_L - 6}
              y={yScale(y) + 3}
              fontSize={9}
              fill={AXIS_COLOR}
              textAnchor="end"
            >
              {fmtDecimal(y, 0)}
            </text>
          </g>
        ))}

        {/* X axis baseline */}
        <line
          x1={PAD_L}
          x2={VB_W - PAD_R}
          y1={VB_H - PAD_B}
          y2={VB_H - PAD_B}
          stroke={AXIS_COLOR}
          strokeWidth={1}
        />

        {/* X ticks — evenly spaced across the full range */}
        {(() => {
          const targetTicks = 5;
          const raw = xMax / targetTicks;
          const mag = Math.pow(10, Math.floor(Math.log10(raw)));
          const nice = [1, 2, 5, 10].map((m) => m * mag);
          const interval = nice.find((n) => xMax / n <= targetTicks + 1) ?? nice[nice.length - 1];
          const ticks: number[] = [];
          for (let t = interval; t <= xMax; t += interval) ticks.push(Math.round(t));
          return ticks;
        })().map((w) => (
          <g key={`xt-${w}`}>
            <line
              x1={xScale(w)}
              x2={xScale(w)}
              y1={VB_H - PAD_B}
              y2={VB_H - PAD_B + 4}
              stroke={AXIS_COLOR}
              strokeWidth={1}
            />
            <text
              x={xScale(w)}
              y={VB_H - PAD_B + 14}
              fontSize={9}
              fill={AXIS_COLOR}
              textAnchor="middle"
            >
              {w}
            </text>
          </g>
        ))}
        <text
          x={(PAD_L + VB_W - PAD_R) / 2}
          y={VB_H - 4}
          fontSize={10}
          fill={AXIS_COLOR}
          textAnchor="middle"
        >
          weeks
        </text>

        {/* Goal horizontal reference line */}
        {showGoalMarker && (
          <line
            x1={PAD_L}
            x2={VB_W - PAD_R}
            y1={goalY}
            y2={goalY}
            stroke={GOAL_COLOR}
            strokeWidth={1}
            strokeDasharray="2 3"
            opacity={0.7}
          />
        )}

        {/* Projection line — solid in trial window */}
        {solidPoints.length > 1 && (
          <polyline
            points={toPath(solidPoints)}
            fill="none"
            stroke={LINE_COLOR}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Projection line — dashed past trial window */}
        {dashedPoints.length > 1 && (
          <polyline
            points={toPath(dashedPoints)}
            fill="none"
            stroke={LINE_COLOR}
            strokeWidth={2}
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        )}

        {/* "Now" marker for already-on-medication mode */}
        {nowX != null && nowY != null && (
          <g>
            <line
              x1={nowX}
              x2={nowX}
              y1={PAD_T}
              y2={VB_H - PAD_B}
              stroke={NOW_COLOR}
              strokeWidth={1}
              strokeDasharray="2 2"
              opacity={0.6}
            />
            <circle cx={nowX} cy={nowY} r={3.5} fill={NOW_COLOR} />
            <text
              x={nowX + 5}
              y={PAD_T + 10}
              fontSize={9}
              fill={NOW_COLOR}
            >
              now
            </text>
          </g>
        )}

        {/* Goal marker */}
        {showGoalMarker && Number.isFinite(goalWeek) && (
          <circle cx={goalX} cy={goalY} r={4} fill={LINE_COLOR} />
        )}
      </svg>

      <figcaption className="wltp-chart-caption">
        Projected weight ({unit}) over weeks
        {extrapolated ? " — solid line is trial data, dashed is extrapolated" : ""}
      </figcaption>
    </figure>
  );
}
