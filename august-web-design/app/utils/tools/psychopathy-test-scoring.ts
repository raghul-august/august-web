import {
  PSYCHOPATHY_MAX_SCORE,
  PSYCHOPATHY_MIN_SCORE,
  questions,
  totalQuestions,
} from "@/app/data/tools/psychopathy-test-questions";
import {
  PSYCHOPATHY_TIERS,
  type PsychopathyTier,
} from "@/app/data/tools/psychopathy-test-config";

export type PsychopathyAnswers = Record<number, number>;

export interface PsychopathyResult {
  /** Sum of (reverse-adjusted) Likert values, 20–100. */
  score: number;
  minScore: number;
  maxScore: number;
  /** 0–100, ((score - 20) / 80) * 100, rounded. */
  percent: number;
  answered: number;
  totalItems: number;
  tier: PsychopathyTier;
}

export function computePsychopathyScore(answers: PsychopathyAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    return sum + (q.reverse ? 6 - raw : raw);
  }, 0);
}

export function getPsychopathyTier(score: number): PsychopathyTier {
  for (const tier of PSYCHOPATHY_TIERS) {
    if (score >= tier.min && score <= tier.max) return tier;
  }
  return PSYCHOPATHY_TIERS[PSYCHOPATHY_TIERS.length - 1];
}

export function psychopathyScoreBucket(score: number): string {
  const tier = getPsychopathyTier(score);
  return `${tier.min}-${tier.max}`;
}

export function computePsychopathyResult(
  answers: PsychopathyAnswers,
): PsychopathyResult {
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const raw = computePsychopathyScore(answers);
  const score = raw + (totalQuestions - answered) * 3;
  const range = PSYCHOPATHY_MAX_SCORE - PSYCHOPATHY_MIN_SCORE;
  const percent = Math.round(((score - PSYCHOPATHY_MIN_SCORE) / range) * 100);

  return {
    score,
    minScore: PSYCHOPATHY_MIN_SCORE,
    maxScore: PSYCHOPATHY_MAX_SCORE,
    percent,
    answered,
    totalItems: totalQuestions,
    tier: getPsychopathyTier(score),
  };
}
