// Pure scoring for the Attachment Style Test.
// Two-axis model: anxiety + avoidance → one of four quadrants.

import {
  AXIS_HIGH_THRESHOLD,
  AXIS_MAX_RAW,
  AXIS_MIN_RAW,
  MAX_LIKERT,
  MIN_LIKERT,
  questions,
  TOTAL_QUESTIONS,
  type AttachmentQuestion,
} from "@/app/data/tools/attachment-style-questions";
import {
  STYLE_DEFINITIONS,
  type AttachmentStyleDef,
  type AttachmentStyleId,
} from "@/app/data/tools/attachment-style-landing";

export type AttachmentAnswers = Record<number, number>;

export type AttachmentTierId = "clear" | "mixed" | "borderline";

export interface AttachmentTier {
  id: AttachmentTierId;
  label: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
}

export interface AxisScore {
  raw: number;
  /** 0–100 normalized to the axis range. */
  percent: number;
  /** True when the axis crossed the "high" threshold. */
  high: boolean;
}

export interface StyleBreakdownRow {
  id: AttachmentStyleId;
  name: string;
  /** Distance-based score: higher = closer to this quadrant. */
  affinity: number;
  /** 0–100, scaled so the closest quadrant sits at 100. */
  percent: number;
}

export interface AttachmentResult {
  /** Primary attachment style (the quadrant the user landed in). */
  primary: AttachmentStyleId;
  /** Definition for the primary style. */
  primaryDef: AttachmentStyleDef;
  /** Runner-up — the next-closest style. */
  secondary: AttachmentStyleId;
  secondaryDef: AttachmentStyleDef;
  anxiety: AxisScore;
  avoidance: AxisScore;
  answered: number;
  total: number;
  /** Sorted list of all four styles by affinity. */
  ranking: readonly StyleBreakdownRow[];
  tier: AttachmentTier;
}

const TIERS: Readonly<Record<AttachmentTierId, AttachmentTier>> = {
  clear: {
    id: "clear",
    label: "Clear primary style",
    headline: "Your responses lined up clearly with one attachment style.",
    description:
      "Your scores fell solidly inside one quadrant of the anxiety X avoidance map. The description below is the most useful starting point for understanding how you tend to show up in close relationships.",
    badge: "badge-low",
  },
  mixed: {
    id: "mixed",
    label: "Likely primary style",
    headline: "Your primary style led, but a second style ran close behind.",
    description:
      "This is very normal most people are not pure types. Read your primary description first, then skim your runner-up. The version of you that lives at the boundary between two styles is often the most accurate self-portrait.",
    badge: "badge-moderate",
  },
  borderline: {
    id: "borderline",
    label: "Sits between styles",
    headline: "Your scores sit close to the boundary between two styles.",
    description:
      "Your anxiety and avoidance scores are close to the midpoint, which often means context matters a lot for you. For example, you may move between styles depending on the relationship, the person, and how safe things feel. Read your top two descriptions and notice where each one fits.",
    badge: "badge-significant",
  },
};

function clampLikert(v: number): number {
  if (!Number.isFinite(v)) return 3;
  if (v < MIN_LIKERT) return MIN_LIKERT;
  if (v > MAX_LIKERT) return MAX_LIKERT;
  return v;
}

function scoreFor(q: AttachmentQuestion, raw: number): number {
  const v = clampLikert(raw);
  return q.reverse ? MAX_LIKERT + MIN_LIKERT - v : v;
}

function axisRange(): { min: number; max: number } {
  return { min: AXIS_MIN_RAW, max: AXIS_MAX_RAW };
}

function toAxisPercent(raw: number): number {
  const { min, max } = axisRange();
  return Math.max(
    0,
    Math.min(100, Math.round(((raw - min) / (max - min)) * 100)),
  );
}

function pickPrimary(
  anxietyHigh: boolean,
  avoidanceHigh: boolean,
): AttachmentStyleId {
  if (anxietyHigh && avoidanceHigh) return "fearful-avoidant";
  if (anxietyHigh) return "anxious";
  if (avoidanceHigh) return "avoidant";
  return "secure";
}

/**
 * Quadrant "centers" used for measuring affinity (distance) for each style.
 * Each center is the (anxiety, avoidance) anchor point of a quadrant on a
 * 0–100 scale.
 */
const STYLE_CENTERS: Readonly<Record<AttachmentStyleId, { anxiety: number; avoidance: number }>> = {
  secure: { anxiety: 20, avoidance: 20 },
  anxious: { anxiety: 80, avoidance: 20 },
  avoidant: { anxiety: 20, avoidance: 80 },
  "fearful-avoidant": { anxiety: 80, avoidance: 80 },
};

const ALL_STYLE_IDS: readonly AttachmentStyleId[] = [
  "secure",
  "anxious",
  "avoidant",
  "fearful-avoidant",
];

function buildRanking(
  anxietyPercent: number,
  avoidancePercent: number,
): readonly StyleBreakdownRow[] {
  const rows = ALL_STYLE_IDS.map((id) => {
    const c = STYLE_CENTERS[id];
    const dx = c.anxiety - anxietyPercent;
    const dy = c.avoidance - avoidancePercent;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Convert distance → affinity (closer = higher). Max meaningful distance
    // on a 100×100 grid is ~141.
    const affinity = Math.max(0, Math.round(141 - distance));
    const def = STYLE_DEFINITIONS.find((s) => s.id === id)!;
    return { id, name: def.name, affinity, percent: 0 };
  });
  const topAffinity = Math.max(1, ...rows.map((r) => r.affinity));
  for (const r of rows) {
    r.percent = Math.round((r.affinity / topAffinity) * 100);
  }
  rows.sort((a, b) => b.affinity - a.affinity);
  return rows;
}

function pickTier(
  anxietyPercent: number,
  avoidancePercent: number,
  ranking: readonly StyleBreakdownRow[],
): AttachmentTier {
  const gap = ranking.length >= 2 ? ranking[0].affinity - ranking[1].affinity : 0;
  const nearMidAnxiety = Math.abs(anxietyPercent - 50) <= 10;
  const nearMidAvoidance = Math.abs(avoidancePercent - 50) <= 10;
  if (nearMidAnxiety && nearMidAvoidance) return TIERS.borderline;
  if (gap >= 25) return TIERS.clear;
  if (gap >= 10) return TIERS.mixed;
  return TIERS.borderline;
}

export function computeAttachmentResult(
  answers: AttachmentAnswers,
): AttachmentResult {
  let anxietyRaw = 0;
  let avoidanceRaw = 0;
  let answered = 0;

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined) continue;
    answered++;
    const v = scoreFor(q, raw);
    if (q.axis === "anxiety") anxietyRaw += v;
    else avoidanceRaw += v;
  }

  // Treat unanswered items as neutral (3) on their axis so the scale doesn't
  // collapse if someone exits early. This matches how the ECR-R is handled
  // in research when items are skipped.
  const anxietyCount = questions.filter((q) => q.axis === "anxiety").length;
  const avoidanceCount = questions.filter((q) => q.axis === "avoidance").length;
  for (const q of questions) {
    if (answers[q.id] !== undefined) continue;
    const neutral = scoreFor(q, 3);
    if (q.axis === "anxiety") anxietyRaw += neutral;
    else avoidanceRaw += neutral;
  }
  void anxietyCount;
  void avoidanceCount;

  const anxietyPercent = toAxisPercent(anxietyRaw);
  const avoidancePercent = toAxisPercent(avoidanceRaw);
  const anxietyHigh = anxietyRaw >= AXIS_HIGH_THRESHOLD;
  const avoidanceHigh = avoidanceRaw >= AXIS_HIGH_THRESHOLD;

  const primary = pickPrimary(anxietyHigh, avoidanceHigh);
  const ranking = buildRanking(anxietyPercent, avoidancePercent);
  const secondary =
    ranking.find((r) => r.id !== primary)?.id ?? ranking[1]?.id ?? "secure";

  const primaryDef = STYLE_DEFINITIONS.find((s) => s.id === primary)!;
  const secondaryDef = STYLE_DEFINITIONS.find((s) => s.id === secondary)!;

  return {
    primary,
    primaryDef,
    secondary,
    secondaryDef,
    anxiety: {
      raw: anxietyRaw,
      percent: anxietyPercent,
      high: anxietyHigh,
    },
    avoidance: {
      raw: avoidanceRaw,
      percent: avoidancePercent,
      high: avoidanceHigh,
    },
    answered,
    total: TOTAL_QUESTIONS,
    ranking,
    tier: pickTier(anxietyPercent, avoidancePercent, ranking),
  };
}
