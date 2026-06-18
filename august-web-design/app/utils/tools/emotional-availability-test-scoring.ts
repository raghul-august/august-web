import {
  EMOTIONAL_AVAILABILITY_MAX_SCORE,
  EMOTIONAL_AVAILABILITY_MIN_SCORE,
  questions,
  totalQuestions,
} from "@/app/data/tools/emotional-availability-test-questions";
import {
  EMOTIONAL_AVAILABILITY_TIERS,
  type EmotionalAvailabilityTier,
} from "@/app/data/tools/emotional-availability-test-config";

export type EmotionalAvailabilityAnswers = Record<number, number>;

export interface EmotionalAvailabilityResult {
  /** Sum of (reverse-adjusted) Likert values, 20–100. */
  score: number;
  minScore: number; // 20
  maxScore: number; // 100
  /** 0–100, ((score - 20) / 80) * 100, rounded. */
  percent: number;
  /** Number of items answered. */
  answered: number;
  totalItems: number; // 20
  tier: EmotionalAvailabilityTier;
}

export function computeEmotionalAvailabilityScore(answers: EmotionalAvailabilityAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    return sum + (q.reverse ? 6 - raw : raw);
  }, 0);
}

export function getEmotionalAvailabilityTier(score: number): EmotionalAvailabilityTier {
  for (const tier of EMOTIONAL_AVAILABILITY_TIERS) {
    if (score >= tier.min && score <= tier.max) return tier;
  }
  return EMOTIONAL_AVAILABILITY_TIERS[EMOTIONAL_AVAILABILITY_TIERS.length - 1];
}

export function emotionalAvailabilityScoreBucket(score: number): string {
  const tier = getEmotionalAvailabilityTier(score);
  return `${tier.min}-${tier.max}`;
}

export function computeEmotionalAvailabilityResult(
  answers: EmotionalAvailabilityAnswers,
): EmotionalAvailabilityResult {
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const raw = computeEmotionalAvailabilityScore(answers);
  // For items the user hasn't answered, fill with the Neutral midpoint (3)
  // so the tier banding stays on the 20–100 scale we describe.
  const score = raw + (totalQuestions - answered) * 3;
  const range = EMOTIONAL_AVAILABILITY_MAX_SCORE - EMOTIONAL_AVAILABILITY_MIN_SCORE;
  const percent = Math.round(((score - EMOTIONAL_AVAILABILITY_MIN_SCORE) / range) * 100);

  return {
    score,
    minScore: EMOTIONAL_AVAILABILITY_MIN_SCORE,
    maxScore: EMOTIONAL_AVAILABILITY_MAX_SCORE,
    percent,
    answered,
    totalItems: totalQuestions,
    tier: getEmotionalAvailabilityTier(score),
  };
}
