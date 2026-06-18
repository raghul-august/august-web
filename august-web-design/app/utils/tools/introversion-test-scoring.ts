import {
  INTROVERSION_MAX_SCORE,
  INTROVERSION_MIN_SCORE,
  questions,
  totalQuestions,
} from "@/app/data/tools/introversion-test-questions";
import {
  INTROVERSION_TIERS,
  type IntroversionTier,
} from "@/app/data/tools/introversion-test-config";

export type IntroversionAnswers = Record<number, number>;

export interface IntroversionResult {
  /** Sum of (reverse-adjusted) Likert values, 20–100. */
  score: number;
  minScore: number; // 20
  maxScore: number; // 100
  /** 0–100, ((score - 20) / 80) * 100, rounded. */
  percent: number;
  /** Number of items answered. */
  answered: number;
  totalItems: number; // 20
  tier: IntroversionTier;
}

export function computeIntroversionScore(answers: IntroversionAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    return sum + (q.reverse ? 6 - raw : raw);
  }, 0);
}

export function getIntroversionTier(score: number): IntroversionTier {
  for (const tier of INTROVERSION_TIERS) {
    if (score >= tier.min && score <= tier.max) return tier;
  }
  return INTROVERSION_TIERS[INTROVERSION_TIERS.length - 1];
}

export function introversionScoreBucket(score: number): string {
  const tier = getIntroversionTier(score);
  return `${tier.min}-${tier.max}`;
}

export function computeIntroversionResult(
  answers: IntroversionAnswers,
): IntroversionResult {
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const raw = computeIntroversionScore(answers);
  // For items the user hasn't answered, fill with the Neutral midpoint (3)
  // so the tier banding stays on the 20–100 scale we describe.
  const score = raw + (totalQuestions - answered) * 3;
  const range = INTROVERSION_MAX_SCORE - INTROVERSION_MIN_SCORE;
  const percent = Math.round(((score - INTROVERSION_MIN_SCORE) / range) * 100);

  return {
    score,
    minScore: INTROVERSION_MIN_SCORE,
    maxScore: INTROVERSION_MAX_SCORE,
    percent,
    answered,
    totalItems: totalQuestions,
    tier: getIntroversionTier(score),
  };
}
