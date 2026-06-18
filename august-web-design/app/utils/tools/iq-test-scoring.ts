import {
  IQ_QUESTIONS,
  IQ_TOTAL,
  type IqCategory,
  type IqQuestion,
} from "@/app/data/tools/iq-test-questions";

/** answers[question.id] = selected option index (0..3) */
export type IqAnswers = Record<number, number>;

export type IqTierId =
  | "lower-extreme"
  | "below-average"
  | "average"
  | "above-average"
  | "gifted"
  | "highly-gifted";

export interface IqTier {
  id: IqTierId;
  label: string;
  range: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-medium" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export interface IqCategoryBreakdown {
  category: IqCategory;
  label: string;
  correct: number;
  total: number;
}

export interface IqResult {
  /** Number of items answered correctly. */
  raw: number;
  /** Total number of items in the test. */
  total: number;
  /** Estimated IQ on the Wechsler scale (mean 100, SD 15), integer. */
  iqScore: number;
  /** Percentile rank (1..99), integer. */
  percentile: number;
  /** Number of items the user actually answered. */
  answered: number;
  tier: IqTier;
  breakdown: IqCategoryBreakdown[];
}

const TIERS: readonly IqTier[] = [
  {
    id: "lower-extreme",
    label: "Lower extreme",
    range: "Below 70",
    headline:
      "Your score on this 20-item screen is in the lower extreme of the Wechsler scale.",
    description:
      "Roughly 2% of people score below 70 on standardized IQ tests. A score this low on a brief, untimed online screen can also reflect distraction, fatigue, or unfamiliarity with the question style, not necessarily underlying ability.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "below-average",
    label: "Below average",
    range: "70–84",
    headline: "Your score on this 20-item screen lands in the below-average band.",
    description:
      "About 14% of adults score in this band on standardized tests. A short online quiz isn't a clinical IQ measure if you're curious about cognitive strengths and challenges, a proctored assessment is the only way to get a meaningful number.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "average",
    label: "Average",
    range: "85–114",
    headline:
      "Your score is in the average band, where roughly two-thirds of adults fall.",
    description:
      "100 is the population median by definition. Scoring here means you reasoned through about as many items as a typical adult would. This 20-item screen is too short to distinguish fine differences inside this large band.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "above-average",
    label: "Above average",
    range: "115–129",
    headline: "Your score lands in the above-average band.",
    description:
      "About 14% of adults score in this range on standardized IQ tests — better than ~84% of the population. You got through most items quickly across all five reasoning domains. Online quizzes tend to score slightly higher than proctored tests, so read this as a directional signal.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "gifted",
    label: "Gifted",
    range: "130–144",
    headline: "Your score is in the gifted range.",
    description:
      "About 2% of adults score 130 or above on standardized tests. A perfect or near-perfect run on a 20-item screen suggests strong fluid and crystallized reasoning, but it doesn't substitute for the cognitive profile a proctored assessment produces.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "highly-gifted",
    label: "Highly gifted",
    range: "145+",
    headline: "Your score is in the highly-gifted range.",
    description:
      "Fewer than 0.1% of adults score 145+ on standardized IQ tests. With only 20 items, this screen tops out quickly, getting them all right pushes you to the ceiling. A proctored test with a wider item bank is needed to estimate ability at this end of the scale.",
    badge: "badge-high",
    tone: "warning",
  },
];

export function getIqTier(iqScore: number): IqTier {
  if (iqScore < 70) return TIERS[0];
  if (iqScore < 85) return TIERS[1];
  if (iqScore < 115) return TIERS[2];
  if (iqScore < 130) return TIERS[3];
  if (iqScore < 145) return TIERS[4];
  return TIERS[5];
}

/**
 * Calibration table: raw correct (0..20) → IQ score.
 *
 * Designed so that:
 *  - raw=10 (50% correct) → 100  (population median)
 *  - raw=16 (80% correct) → 125  (above average)
 *  - raw=20 (100% correct) → 148 (highly gifted ceiling)
 *  - raw=0 → 55  (lower extreme floor)
 *
 * The curve is monotonic and slightly steeper at the tails so the spread looks
 * normal-ish without requiring an inverse-normal calculation.
 */
const IQ_CALIBRATION: readonly number[] = [
  55, // 0
  60, // 1
  66, // 2
  72, // 3
  78, // 4
  82, // 5
  86, // 6
  90, // 7
  93, // 8
  96, // 9
  100, // 10
  104, // 11
  108, // 12
  112, // 13
  116, // 14
  120, // 15
  125, // 16
  130, // 17
  136, // 18
  142, // 19
  148, // 20
] as const;

export function computeIqScore(raw: number): number {
  const clamped = Math.max(0, Math.min(IQ_TOTAL, Math.round(raw)));
  return IQ_CALIBRATION[clamped];
}

/**
 * Standard-normal CDF approximation (Abramowitz & Stegun 26.2.17).
 * Used to derive percentile from an IQ score on the Wechsler scale.
 */
function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  // Polynomial approximation for erf
  const t = 1 / (1 + 0.3275911 * x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf =
    1 -
    (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

export function iqToPercentile(iqScore: number): number {
  const z = (iqScore - 100) / 15;
  const p = normalCdf(z) * 100;
  // Clamp to 1..99 so we never display 0 or 100.
  return Math.max(1, Math.min(99, Math.round(p)));
}

export function computeRawScore(answers: IqAnswers): number {
  let correct = 0;
  for (const q of IQ_QUESTIONS) {
    const picked = answers[q.id];
    if (picked !== undefined && picked === q.correctIndex) correct += 1;
  }
  return correct;
}

function buildBreakdown(answers: IqAnswers): IqCategoryBreakdown[] {
  const map = new Map<
    IqCategory,
    { correct: number; total: number; label: string }
  >();
  for (const q of IQ_QUESTIONS) {
    const entry = map.get(q.category) ?? {
      correct: 0,
      total: 0,
      label: q.categoryLabel,
    };
    entry.total += 1;
    const picked = answers[q.id];
    if (picked !== undefined && picked === q.correctIndex) entry.correct += 1;
    entry.label = q.categoryLabel;
    map.set(q.category, entry);
  }
  // Preserve a stable display order.
  const order: IqCategory[] = [
    "verbal",
    "numerical",
    "pattern",
    "logical",
    "spatial",
  ];
  return order
    .filter((c) => map.has(c))
    .map((c) => {
      const v = map.get(c)!;
      return {
        category: c,
        label: v.label,
        correct: v.correct,
        total: v.total,
      };
    });
}

export function computeIqResult(answers: IqAnswers): IqResult {
  const raw = computeRawScore(answers);
  const iqScore = computeIqScore(raw);
  const percentile = iqToPercentile(iqScore);
  const answered = Object.keys(answers).length;
  return {
    raw,
    total: IQ_TOTAL,
    iqScore,
    percentile,
    answered,
    tier: getIqTier(iqScore),
    breakdown: buildBreakdown(answers),
  };
}

export function iqScoreBucket(iqScore: number): string {
  if (iqScore < 70) return "<70";
  if (iqScore < 85) return "70-84";
  if (iqScore < 115) return "85-114";
  if (iqScore < 130) return "115-129";
  if (iqScore < 145) return "130-144";
  return "145+";
}

/** Tiny re-export so the Quiz component can match question by id without re-importing. */
export type { IqQuestion };
