import {
  BURNOUT_MAX_SCORE,
  BURNOUT_MIN_SCORE,
  questions,
  totalQuestions,
} from "@/app/data/tools/burnout-at-work-questions";
import {
  BURNOUT_TIERS,
  type BurnoutTier,
} from "@/app/data/tools/burnout-at-work-config";

export type BurnoutAnswers = Record<number, number>;

export interface BurnoutResult {
  /** Sum of (reverse-adjusted) Likert values, 20–100. */
  score: number;
  minScore: number; // 20
  maxScore: number; // 100
  /** 0–100, ((score - 20) / 80) * 100, rounded. */
  percent: number;
  /** Number of items answered. */
  answered: number;
  totalItems: number; // 20
  tier: BurnoutTier;
}

export function computeBurnoutScore(answers: BurnoutAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    return sum + (q.reverse ? 6 - raw : raw);
  }, 0);
}

export function getBurnoutTier(score: number): BurnoutTier {
  for (const tier of BURNOUT_TIERS) {
    if (score >= tier.min && score <= tier.max) return tier;
  }
  return BURNOUT_TIERS[BURNOUT_TIERS.length - 1];
}

export function burnoutScoreBucket(score: number): string {
  const tier = getBurnoutTier(score);
  return `${tier.min}-${tier.max}`;
}

export function computeBurnoutResult(
  answers: BurnoutAnswers,
): BurnoutResult {
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const raw = computeBurnoutScore(answers);
  // For items the user hasn't answered, fill with the Neutral midpoint (3)
  // so the tier banding stays on the 20–100 scale we describe.
  const score = raw + (totalQuestions - answered) * 3;
  const range = BURNOUT_MAX_SCORE - BURNOUT_MIN_SCORE;
  const percent = Math.round(((score - BURNOUT_MIN_SCORE) / range) * 100);

  return {
    score,
    minScore: BURNOUT_MIN_SCORE,
    maxScore: BURNOUT_MAX_SCORE,
    percent,
    answered,
    totalItems: totalQuestions,
    tier: getBurnoutTier(score),
  };
}
