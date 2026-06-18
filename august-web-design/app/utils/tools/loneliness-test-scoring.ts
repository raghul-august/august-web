import {
  LONELINESS_MAX_SCORE,
  LONELINESS_MIN_SCORE,
  questions,
  totalQuestions,
} from "@/app/data/tools/loneliness-test-questions";
import {
  LONELINESS_TIERS,
  type LonelinessTier,
} from "@/app/data/tools/loneliness-test-config";

export type LonelinessAnswers = Record<number, number>;

export interface LonelinessResult {
  /** Sum of (reverse-adjusted) Likert values, 20–100. */
  score: number;
  minScore: number; // 20
  maxScore: number; // 100
  /** 0–100, ((score - 20) / 80) * 100, rounded. */
  percent: number;
  /** Number of items answered. */
  answered: number;
  totalItems: number; // 20
  tier: LonelinessTier;
}

export function computeLonelinessScore(answers: LonelinessAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    return sum + (q.reverse ? 6 - raw : raw);
  }, 0);
}

export function getLonelinessTier(score: number): LonelinessTier {
  for (const tier of LONELINESS_TIERS) {
    if (score >= tier.min && score <= tier.max) return tier;
  }
  return LONELINESS_TIERS[LONELINESS_TIERS.length - 1];
}

export function lonelinessScoreBucket(score: number): string {
  const tier = getLonelinessTier(score);
  return `${tier.min}-${tier.max}`;
}

export function computeLonelinessResult(
  answers: LonelinessAnswers,
): LonelinessResult {
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const raw = computeLonelinessScore(answers);
  // For items the user hasn't answered, fill with the Neutral midpoint (3)
  // so the tier banding stays on the 20–100 scale we describe.
  const score = raw + (totalQuestions - answered) * 3;
  const range = LONELINESS_MAX_SCORE - LONELINESS_MIN_SCORE;
  const percent = Math.round(((score - LONELINESS_MIN_SCORE) / range) * 100);

  return {
    score,
    minScore: LONELINESS_MIN_SCORE,
    maxScore: LONELINESS_MAX_SCORE,
    percent,
    answered,
    totalItems: totalQuestions,
    tier: getLonelinessTier(score),
  };
}
