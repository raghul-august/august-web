import {
  SELF_ESTEEM_MAX_SCORE,
  SELF_ESTEEM_MIN_SCORE,
  questions,
  totalQuestions,
} from "@/app/data/tools/self-esteem-test-questions";
import {
  SELF_ESTEEM_TIERS,
  type SelfEsteemTier,
} from "@/app/data/tools/self-esteem-test-config";

export type SelfEsteemAnswers = Record<number, number>;

export interface SelfEsteemResult {
  /** Sum of (reverse-adjusted) Likert values, 20–100. Higher = healthier self-esteem. */
  score: number;
  minScore: number;
  maxScore: number;
  /** 0–100, ((score - 20) / 80) * 100, rounded. */
  percent: number;
  answered: number;
  totalItems: number;
  tier: SelfEsteemTier;
}

export function computeSelfEsteemScore(answers: SelfEsteemAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    return sum + (q.reverse ? 6 - raw : raw);
  }, 0);
}

export function getSelfEsteemTier(score: number): SelfEsteemTier {
  for (const tier of SELF_ESTEEM_TIERS) {
    if (score >= tier.min && score <= tier.max) return tier;
  }
  return SELF_ESTEEM_TIERS[SELF_ESTEEM_TIERS.length - 1];
}

export function selfEsteemScoreBucket(score: number): string {
  const tier = getSelfEsteemTier(score);
  return `${tier.min}-${tier.max}`;
}

export function computeSelfEsteemResult(
  answers: SelfEsteemAnswers,
): SelfEsteemResult {
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const raw = computeSelfEsteemScore(answers);
  // Backfill missing items as Neutral (3) so the banding always sits on the 20–100 scale.
  const score = raw + (totalQuestions - answered) * 3;
  const range = SELF_ESTEEM_MAX_SCORE - SELF_ESTEEM_MIN_SCORE;
  const percent = Math.round(((score - SELF_ESTEEM_MIN_SCORE) / range) * 100);

  return {
    score,
    minScore: SELF_ESTEEM_MIN_SCORE,
    maxScore: SELF_ESTEEM_MAX_SCORE,
    percent,
    answered,
    totalItems: totalQuestions,
    tier: getSelfEsteemTier(score),
  };
}
