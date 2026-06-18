import {
  NARCISSISM_MAX_SCORE,
  NARCISSISM_MIN_SCORE,
  questions,
  totalQuestions,
} from "@/app/data/tools/narcissism-test-questions";
import {
  NARCISSISM_TIERS,
  type NarcissismTier,
} from "@/app/data/tools/narcissism-test-config";

export type NarcissismAnswers = Record<number, number>;

export interface NarcissismResult {
  /** Sum of (reverse-adjusted) Likert values, 20–100. */
  score: number;
  minScore: number; // 20
  maxScore: number; // 100
  /** 0–100, ((score - 20) / 80) * 100, rounded. */
  percent: number;
  /** Number of items answered. */
  answered: number;
  totalItems: number; // 20
  tier: NarcissismTier;
}

export function computeNarcissismScore(answers: NarcissismAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    return sum + (q.reverse ? 6 - raw : raw);
  }, 0);
}

export function getNarcissismTier(score: number): NarcissismTier {
  for (const tier of NARCISSISM_TIERS) {
    if (score >= tier.min && score <= tier.max) return tier;
  }
  return NARCISSISM_TIERS[NARCISSISM_TIERS.length - 1];
}

export function narcissismScoreBucket(score: number): string {
  const tier = getNarcissismTier(score);
  return `${tier.min}-${tier.max}`;
}

export function computeNarcissismResult(
  answers: NarcissismAnswers,
): NarcissismResult {
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const raw = computeNarcissismScore(answers);
  // If the user hasn't answered every item, fill missing items as Neutral (3)
  // so the tier banding stays on the 20–100 scale we describe in the FAQ.
  const score = raw + (totalQuestions - answered) * 3;
  const range = NARCISSISM_MAX_SCORE - NARCISSISM_MIN_SCORE;
  const percent = Math.round(((score - NARCISSISM_MIN_SCORE) / range) * 100);

  return {
    score,
    minScore: NARCISSISM_MIN_SCORE,
    maxScore: NARCISSISM_MAX_SCORE,
    percent,
    answered,
    totalItems: totalQuestions,
    tier: getNarcissismTier(score),
  };
}
