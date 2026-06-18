// Enneagram Test scoring — pure functions over the 36-item Likert quiz.

import {
  questions,
  TOTAL_QUESTIONS,
  TYPE_MAX_RAW,
  TYPE_MIN_RAW,
  WING_MAP,
  type EnneagramQuestion,
  type EnneagramType,
} from "@/app/data/tools/enneagram-test-questions";

export type EnneagramAnswers = Record<number, number>;

export type EnneagramTierId = "clear" | "likely" | "exploring";

export interface EnneagramTier {
  id: EnneagramTierId;
  label: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export interface EnneagramRankRow {
  type: EnneagramType;
  raw: number;
  percent: number;
}

export interface EnneagramResult {
  primaryType: EnneagramType;
  wing: EnneagramType | null;
  /** Raw 4-20 score per type. */
  scores: Record<EnneagramType, number>;
  /** 0-100 percent per type. */
  percents: Record<EnneagramType, number>;
  /** Sorted descending by raw, ties broken by lowest type number. */
  ranking: readonly EnneagramRankRow[];
  /** Number of items answered. */
  answered: number;
  total: number;
  tier: EnneagramTier;
  /** Raw gap between primary and runner-up. */
  primaryGap: number;
}

const ALL_TYPES: readonly EnneagramType[] = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const TIERS: Readonly<Record<EnneagramTierId, EnneagramTier>> = {
  clear: {
    id: "clear",
    label: "Clear primary type",
    headline: "Your responses lined up strongly with one type — the others trail behind.",
    description:
      "There's a real gap between your top score and the next one down. The Enneagram is more about the engine underneath your behavior than about the behavior itself — read the description below and see whether the motivation and fear feel like the ones you actually live with.",
    badge: "badge-low",
    tone: "info",
  },
  likely: {
    id: "likely",
    label: "Likely primary type",
    headline: "Your top type led, but a second type ran fairly close behind.",
    description:
      "This is normal — most people have a primary type and a clear runner-up. Read both descriptions and notice which one's deepest motivation feels more like the engine driving you. Behavior can resemble several types; motivation is usually clearer.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  exploring: {
    id: "exploring",
    label: "Worth exploring multiple types",
    headline: "Your top types came in nearly tied.",
    description:
      "A short test can usually narrow you down to your top two or three. From here, reading fuller descriptions of those types — and noticing which one's core motivation and fear feel most uncomfortably familiar — is the more reliable way to land your type than the score itself.",
    badge: "badge-significant",
    tone: "caution",
  },
};

function tierForGap(gap: number): EnneagramTier {
  if (gap >= 4) return TIERS.clear;
  if (gap >= 2) return TIERS.likely;
  return TIERS.exploring;
}

function emptyScores(): Record<EnneagramType, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
}

function clampLikert(v: number): number {
  if (!Number.isFinite(v)) return 3; // treat unanswered as neutral defensively
  if (v < 1) return 1;
  if (v > 5) return 5;
  return v;
}

function toPercent(raw: number): number {
  const range = TYPE_MAX_RAW - TYPE_MIN_RAW; // 16
  return Math.round(((raw - TYPE_MIN_RAW) / range) * 100);
}

/** Sum Likert responses by type, defaulting unanswered items to neutral (3). */
export function computeTypeScores(
  answers: EnneagramAnswers,
): Record<EnneagramType, number> {
  const scores = emptyScores();
  for (const q of questions as readonly EnneagramQuestion[]) {
    const raw = answers[q.id];
    const v = raw === undefined ? 3 : clampLikert(raw);
    scores[q.type] += v;
  }
  return scores;
}

/**
 * Choose the primary type. Highest raw wins; ties broken by lowest type number
 * (deterministic and documented).
 */
function pickPrimary(scores: Record<EnneagramType, number>): EnneagramType {
  let best: EnneagramType = 1;
  let bestScore = scores[1];
  for (const t of ALL_TYPES) {
    if (scores[t] > bestScore) {
      best = t;
      bestScore = scores[t];
    }
  }
  return best;
}

/**
 * Wing = the adjacent type with the higher score. Ties broken by lowest type
 * number. Returns null only if both adjacent scores are at the floor (4) and
 * tied — in which case there's no meaningful wing signal.
 */
function pickWing(
  primary: EnneagramType,
  scores: Record<EnneagramType, number>,
): EnneagramType | null {
  const [a, b] = WING_MAP[primary];
  const sa = scores[a];
  const sb = scores[b];
  if (sa === TYPE_MIN_RAW && sb === TYPE_MIN_RAW) return null;
  if (sa > sb) return a;
  if (sb > sa) return b;
  // tie — lowest type number
  return a < b ? a : b;
}

function buildRanking(
  scores: Record<EnneagramType, number>,
): readonly EnneagramRankRow[] {
  const rows: EnneagramRankRow[] = ALL_TYPES.map((t) => ({
    type: t,
    raw: scores[t],
    percent: toPercent(scores[t]),
  }));
  rows.sort((x, y) => {
    if (y.raw !== x.raw) return y.raw - x.raw;
    return x.type - y.type;
  });
  return rows;
}

export function computeEnneagramResult(
  answers: EnneagramAnswers,
): EnneagramResult {
  const scores = computeTypeScores(answers);
  const primary = pickPrimary(scores);
  const wing = pickWing(primary, scores);

  const ranking = buildRanking(scores);
  const primaryGap =
    ranking.length >= 2 ? ranking[0].raw - ranking[1].raw : 0;

  const percents: Record<EnneagramType, number> = {
    1: toPercent(scores[1]),
    2: toPercent(scores[2]),
    3: toPercent(scores[3]),
    4: toPercent(scores[4]),
    5: toPercent(scores[5]),
    6: toPercent(scores[6]),
    7: toPercent(scores[7]),
    8: toPercent(scores[8]),
    9: toPercent(scores[9]),
  };

  const answered = (questions as readonly EnneagramQuestion[]).reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );

  return {
    primaryType: primary,
    wing,
    scores,
    percents,
    ranking,
    answered,
    total: TOTAL_QUESTIONS,
    tier: tierForGap(primaryGap),
    primaryGap,
  };
}
