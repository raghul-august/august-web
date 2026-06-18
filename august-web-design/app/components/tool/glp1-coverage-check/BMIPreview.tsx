"use client";

interface BMIPreviewProps {
  bmi: number;
  category: string;
  weightToLose: number;
  unitSystem?: "imperial" | "metric";
}

const weightFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const bmiFormatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const captionCls = "text-[11px] tracking-[0.1em] font-medium text-[#767f7c] mb-[6px]";

export default function BMIPreview({ bmi, category, weightToLose, unitSystem = "imperial" }: BMIPreviewProps) {
  const displayWeight =
    unitSystem === "metric"
      ? Math.round((weightToLose / 2.20462) * 10) / 10
      : weightToLose;
  const weightUnit = unitSystem === "metric" ? "kg" : "lb";

  return (
    <div
      className="glp1-bmi-preview glp1-bmi-pulse"
      role="status"
      aria-live="polite"
    >
      <div>
        <div className={captionCls}>Est. BMI</div>
        <div className="text-[22px] font-normal text-[#1C1917] tracking-[-0.02em] leading-[1.1] tabular-nums">
          {bmiFormatter.format(bmi)}
        </div>
      </div>

      <div className="glp1-bmi-preview-divider" />

      <div>
        <div className={captionCls}>Category</div>
        <div className="text-[18px] font-medium text-[#1C1917] tracking-[-0.02em] leading-[1.1]">
          {category}
        </div>
      </div>

      <div className="glp1-bmi-preview-divider" />

      <div>
        <div className={captionCls}>To Lose</div>
        <div className="text-[22px] font-normal text-[var(--brand-primary)] tracking-[-0.02em] leading-[1.1] tabular-nums">
          {weightFormatter.format(displayWeight)}{" "}
          <span className="text-[13px] font-medium text-[var(--text-tertiary)]">{weightUnit}</span>
        </div>
      </div>
    </div>
  );
}
