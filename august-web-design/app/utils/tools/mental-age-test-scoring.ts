import {
  MENTAL_AGE_MAX,
  MENTAL_AGE_MIN,
  questions,
  totalQuestions,
} from "@/app/data/tools/mental-age-test-questions";
import {
  MENTAL_AGE_TIERS,
  type MentalAgeTier,
} from "@/app/data/tools/mental-age-test-config";

export type MentalAgeAnswers = Record<number, number>;

export interface MentalAgeResult {
  /** Rounded average of the selected option age-values. */
  mentalAge: number;
  minAge: number;
  maxAge: number;
  /** Number of items answered. */
  answered: number;
  totalItems: number;
  tier: MentalAgeTier;
}

export function computeMentalAgeRaw(answers: MentalAgeAnswers): {
  sum: number;
  answered: number;
} {
  let sum = 0;
  let answered = 0;
  for (const q of questions) {
    const v = answers[q.id];
    if (v === undefined) continue;
    sum += v;
    answered += 1;
  }
  return { sum, answered };
}

export function getMentalAgeTier(mentalAge: number): MentalAgeTier {
  for (const tier of MENTAL_AGE_TIERS) {
    if (mentalAge >= tier.min && mentalAge <= tier.max) return tier;
  }
  // Off-the-end fallbacks
  if (mentalAge < MENTAL_AGE_TIERS[0].min) return MENTAL_AGE_TIERS[0];
  return MENTAL_AGE_TIERS[MENTAL_AGE_TIERS.length - 1];
}

export function mentalAgeBucket(mentalAge: number): string {
  const tier = getMentalAgeTier(mentalAge);
  return `${tier.min}-${tier.max}`;
}

export function computeMentalAgeResult(
  answers: MentalAgeAnswers,
): MentalAgeResult {
  const { sum, answered } = computeMentalAgeRaw(answers);
  // If nothing answered, fall back to mid-range so UI never NaNs.
  const base =
    answered > 0 ? sum / answered : (MENTAL_AGE_MIN + MENTAL_AGE_MAX) / 2;
  const mentalAge = Math.max(
    MENTAL_AGE_MIN,
    Math.min(MENTAL_AGE_MAX, Math.round(base)),
  );

  return {
    mentalAge,
    minAge: MENTAL_AGE_MIN,
    maxAge: MENTAL_AGE_MAX,
    answered,
    totalItems: totalQuestions,
    tier: getMentalAgeTier(mentalAge),
  };
}
