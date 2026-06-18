import type { CSSProperties } from "react";

export type BadgeState = "achievable" | "extrapolated" | "early" | "unreachable";

const TONE: Record<BadgeState, { bg: string; fg: string; label: string }> = {
  achievable: {
    bg: "var(--success-50)",
    fg: "var(--success-700)",
    label: "Goal achievable",
  },
  extrapolated: {
    bg: "var(--warning-50)",
    fg: "var(--warning-700)",
    label: "Extrapolated estimate",
  },
  early: {
    bg: "var(--info-50)",
    fg: "var(--info-700)",
    label: "Within first weeks",
  },
  unreachable: {
    bg: "var(--danger-50)",
    fg: "var(--danger-700)",
    label: "Not reachable in trial range",
  },
};

const BASE_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 28,
  padding: "0 12px",
  borderRadius: 9999,
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: 0,
};

export default function ResultBadge({ state }: { state: BadgeState }) {
  const tone = TONE[state];
  return (
    <span
      style={{ ...BASE_STYLE, background: tone.bg, color: tone.fg }}
      role="status"
    >
      {tone.label}
    </span>
  );
}
