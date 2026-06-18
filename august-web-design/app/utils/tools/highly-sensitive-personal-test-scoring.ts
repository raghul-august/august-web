import {
  HIGHLY_SENSITIVE_MAX_SCORE,
  HIGHLY_SENSITIVE_MIN_SCORE,
  questions,
  totalQuestions,
} from "@/app/data/tools/highly-sensitive-personal-test-questions";
import {
  HIGHLY_SENSITIVE_TIERS,
  type HighlySensitiveTier,
} from "@/app/data/tools/highly-sensitive-personal-test-config";

export type HighlySensitiveAnswers = Record<number, number>;

export interface HighlySensitiveResult {
  /** Sum of (reverse-adjusted) Likert values, 20–100. */
  score: number;
  minScore: number; // 20
  maxScore: number; // 100
  /** 0–100, ((score - 20) / 80) * 100, rounded. */
  percent: number;
  /** Number of items answered. */
  answered: number;
  totalItems: number; // 20
  tier: HighlySensitiveTier;
}

export function computeHighlySensitiveScore(answers: HighlySensitiveAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    return sum + (q.reverse ? 6 - raw : raw);
  }, 0);
}

export function getHighlySensitiveTier(score: number): HighlySensitiveTier {
  for (const tier of HIGHLY_SENSITIVE_TIERS) {
    if (score >= tier.min && score <= tier.max) return tier;
  }
  return HIGHLY_SENSITIVE_TIERS[HIGHLY_SENSITIVE_TIERS.length - 1];
}

export function highlySensitiveScoreBucket(score: number): string {
  const tier = getHighlySensitiveTier(score);
  return `${tier.min}-${tier.max}`;
}

export function computeHighlySensitiveResult(
  answers: HighlySensitiveAnswers,
): HighlySensitiveResult {
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const raw = computeHighlySensitiveScore(answers);
  // For items the user hasn't answered, fill with the Neutral midpoint (3)
  // so the tier banding stays on the 20–100 scale we describe.
  const score = raw + (totalQuestions - answered) * 3;
  const range = HIGHLY_SENSITIVE_MAX_SCORE - HIGHLY_SENSITIVE_MIN_SCORE;
  const percent = Math.round(((score - HIGHLY_SENSITIVE_MIN_SCORE) / range) * 100);

  return {
    score,
    minScore: HIGHLY_SENSITIVE_MIN_SCORE,
    maxScore: HIGHLY_SENSITIVE_MAX_SCORE,
    percent,
    answered,
    totalItems: totalQuestions,
    tier: getHighlySensitiveTier(score),
  };
}
