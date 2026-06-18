import {
  BODY_DYSMORPHIA_MAX_SCORE,
  BODY_DYSMORPHIA_MIN_SCORE,
  questions,
  totalQuestions,
} from "@/app/data/tools/body-dysmorphia-test-questions";
import {
  BODY_DYSMORPHIA_TIERS,
  type BodyDysmorphiaTier,
} from "@/app/data/tools/body-dysmorphia-test-config";

export type BodyDysmorphiaAnswers = Record<number, number>;

export interface BodyDysmorphiaResult {
  /** Sum of (reverse-adjusted) Likert values, 20–100. */
  score: number;
  minScore: number; // 20
  maxScore: number; // 100
  /** 0–100, ((score - 20) / 80) * 100, rounded. */
  percent: number;
  /** Number of items answered. */
  answered: number;
  totalItems: number; // 20
  tier: BodyDysmorphiaTier;
}

export function computeBodyDysmorphiaScore(answers: BodyDysmorphiaAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    return sum + (q.reverse ? 6 - raw : raw);
  }, 0);
}

export function getBodyDysmorphiaTier(score: number): BodyDysmorphiaTier {
  for (const tier of BODY_DYSMORPHIA_TIERS) {
    if (score >= tier.min && score <= tier.max) return tier;
  }
  return BODY_DYSMORPHIA_TIERS[BODY_DYSMORPHIA_TIERS.length - 1];
}

export function bodyDysmorphiaScoreBucket(score: number): string {
  const tier = getBodyDysmorphiaTier(score);
  return `${tier.min}-${tier.max}`;
}

export function computeBodyDysmorphiaResult(
  answers: BodyDysmorphiaAnswers,
): BodyDysmorphiaResult {
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const raw = computeBodyDysmorphiaScore(answers);
  // For items the user hasn't answered, fill with the Neutral midpoint (3)
  // so the tier banding stays on the 20–100 scale we describe.
  const score = raw + (totalQuestions - answered) * 3;
  const range = BODY_DYSMORPHIA_MAX_SCORE - BODY_DYSMORPHIA_MIN_SCORE;
  const percent = Math.round(((score - BODY_DYSMORPHIA_MIN_SCORE) / range) * 100);

  return {
    score,
    minScore: BODY_DYSMORPHIA_MIN_SCORE,
    maxScore: BODY_DYSMORPHIA_MAX_SCORE,
    percent,
    answered,
    totalItems: totalQuestions,
    tier: getBodyDysmorphiaTier(score),
  };
}
