import type { WeekSample } from "@/app/utils/tools/weight-loss-timeline-projector-compute";
import { fmtDecimal, fmtPercent } from "@/app/utils/tools/health-math";

type Props = {
  rows: WeekSample[];
  unit: "lb" | "kg";
};

export default function MilestoneTable({ rows, unit }: Props) {
  return (
    <div className="tool-card" aria-label="Milestone weights">
      <div className="wltp-milestone-header">
        <span>Week</span>
        <span>Weight</span>
        <span>Change</span>
      </div>
      {rows.map((row) => (
        <div key={row.week} className="wltp-milestone-row">
          <span className="wltp-milestone-muted">{row.week}</span>
          <span>
            {fmtDecimal(row.weight, 1)} {unit}
          </span>
          <span className="wltp-milestone-muted">
            {fmtPercent(row.pct, 1)}
          </span>
        </div>
      ))}
    </div>
  );
}
