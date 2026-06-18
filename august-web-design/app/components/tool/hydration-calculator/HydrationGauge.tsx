"use client";

interface HydrationGaugeProps {
  actualLiters: number;
  recommendedLiters: number;
  isSufficient: boolean;
}

export default function HydrationGauge({ actualLiters, recommendedLiters, isSufficient }: HydrationGaugeProps) {
  const pct = Math.min(100, Math.round((actualLiters / recommendedLiters) * 100));
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const fillColor = isSufficient ? "var(--success)" : "var(--warning)";

  return (
    <div style={{ textAlign: "center" }}>
      <svg
        viewBox="0 0 200 200"
        style={{ maxWidth: 200, width: "100%", margin: "0 auto", display: "block" }}
      >
        {/* Background track */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="12"
        />
        {/* Fill arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        {/* Percentage text */}
        <text
          x="100"
          y="96"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: 36,
            fontWeight: 500,
            fill: "var(--text-primary)",
          }}
        >
          {pct}%
        </text>
        {/* Subtitle */}
        <text
          x="100"
          y="122"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: 11,
            fontWeight: 400,
            fill: "var(--text-tertiary)",
          }}
        >
          of daily need
        </text>
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 32,
          marginTop: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 400, color: "var(--text-tertiary)" }}>
            Current
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>
            {actualLiters.toFixed(2)} L
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 400, color: "var(--text-tertiary)" }}>
            Target
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>
            {recommendedLiters.toFixed(1)} L
          </div>
        </div>
      </div>
    </div>
  );
}
