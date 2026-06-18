import {
  FUNCTIONAL_OPTIONS,
  SCREEN_ITEM_COUNT,
  SCREEN_MAX_SCORE,
  questions,
  type EatingDisorderDomain,
} from "@/app/data/tools/eating-disorder-test-questions";

export type EatingDisorderAnswers = Record<number, number>;

export type EatingDisorderTierId =
  | "minimal"
  | "mild"
  | "moderate"
  | "elevated"
  | "severe";

export interface EatingDisorderTier {
  id: EatingDisorderTierId;
  label: string;
  range: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export const EATING_DISORDER_TIERS: readonly EatingDisorderTier[] = [
  {
    id: "minimal",
    label: "Few Signs",
    range: "0–14",
    headline:
      "Your responses show very few signs of disordered eating patterns.",
    description:
      "Your answers point to a generally settled relationship with food, weight, and your body. The patterns this screen looks for don't appear to be a meaningful part of what you're working through right now.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "mild",
    label: "Some Signs",
    range: "15–28",
    headline:
      "Your responses show a handful of signs commonly seen with disordered eating.",
    description:
      "You recognised yourself in a few statements — maybe occasional preoccupation with weight, body shape, or eating. Many people experience these without meeting criteria for an eating disorder. If these patterns keep recurring or get heavier, talking to a clinician can clarify what's going on.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "moderate",
    label: "Moderate Signs",
    range: "29–43",
    headline:
      "Your responses include several signs associated with disordered eating.",
    description:
      "A meaningful share of the statements feel familiar. This is not a diagnosis, but it's a reasonable point to share these results with a doctor, therapist, or eating disorder specialist — especially if these patterns are affecting how you feel day to day.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "elevated",
    label: "Many Signs",
    range: "44–57",
    headline:
      "Your responses show a strong overlap with patterns seen in eating disorders.",
    description:
      "Most of the statements feel familiar — preoccupation with weight, episodes of out-of-control eating, restriction, or behaviours that compensate for food. A clinical evaluation can determine what's actually going on and what would help. Treatment works, and the earlier you start, the easier recovery tends to be.",
    badge: "badge-high",
    tone: "warning",
  },
  {
    id: "severe",
    label: "Strong Indicators",
    range: "58–72",
    headline:
      "Your responses align very strongly with patterns seen in eating disorders.",
    description:
      "You endorsed nearly every item on this screen at a meaningful level. This doesn't diagnose anything on its own, but the experiences you described are real, serious, and worth taking to a clinician who specialises in eating disorders. Effective treatments exist for every type of eating disorder, and recovery is possible.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface EatingDisorderDomainScore {
  id: Exclude<EatingDisorderDomain, "functional">;
  label: string;
  description: string;
  score: number;
  max: number;
  percent: number;
}

export interface EatingDisorderResult {
  /** Sum of all 24 scored items, 0–72. Q25 (functional impact) is excluded. */
  score: number;
  maxScore: number; // 72
  percent: number; // 0..100
  answered: number; // screen items answered
  totalScreen: number; // 24
  tier: EatingDisorderTier;
  /** Per-domain score breakdown, sorted highest → lowest percent. */
  domains: EatingDisorderDomainScore[];
  /** Domain with the highest percent contribution, used to personalise narrative. */
  primaryDomain: EatingDisorderDomainScore;
  /** Label for the Q25 functional-impact anchor, if answered. */
  functionalLabel: string | null;
}

const DOMAIN_META: Record<
  Exclude<EatingDisorderDomain, "functional">,
  { label: string; description: string }
> = {
  "body-image": {
    label: "Body image & weight",
    description:
      "Weight and shape preoccupation, fear of weight gain, body dissatisfaction.",
  },
  binge: {
    label: "Binge eating",
    description:
      "Out-of-control eating, eating past full, distress about episodes.",
  },
  compensatory: {
    label: "Compensatory behaviours",
    description:
      "Vomiting, laxative use, excessive exercise, or fasting to control weight.",
  },
  restriction: {
    label: "Restriction & avoidance",
    description:
      "Eating very little, low interest in food, or avoiding foods for sensory or fear-based reasons.",
  },
};

const FUNCTIONAL_ITEM_ID = 25;

export function computeEatingDisorderScore(
  answers: EatingDisorderAnswers,
): number {
  return questions
    .filter((q) => q.scoring === "screen")
    .reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
}

export function getEatingDisorderTier(score: number): EatingDisorderTier {
  if (score <= 14) return EATING_DISORDER_TIERS[0];
  if (score <= 28) return EATING_DISORDER_TIERS[1];
  if (score <= 43) return EATING_DISORDER_TIERS[2];
  if (score <= 57) return EATING_DISORDER_TIERS[3];
  return EATING_DISORDER_TIERS[4];
}

export function eatingDisorderScoreBucket(score: number): string {
  if (score <= 14) return "0-14";
  if (score <= 28) return "15-28";
  if (score <= 43) return "29-43";
  if (score <= 57) return "44-57";
  return "58-72";
}

function computeDomainScores(
  answers: EatingDisorderAnswers,
): EatingDisorderDomainScore[] {
  const domainIds = Object.keys(DOMAIN_META) as Array<
    keyof typeof DOMAIN_META
  >;
  const breakdown = domainIds.map((id) => {
    const items = questions.filter(
      (q) => q.scoring === "screen" && q.domain === id,
    );
    const max = items.length * 3;
    const score = items.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    return {
      id,
      label: DOMAIN_META[id].label,
      description: DOMAIN_META[id].description,
      score,
      max,
      percent: max > 0 ? Math.round((score / max) * 100) : 0,
    };
  });
  return breakdown.sort((a, b) => b.percent - a.percent);
}

export function computeEatingDisorderResult(
  answers: EatingDisorderAnswers,
): EatingDisorderResult {
  const score = computeEatingDisorderScore(answers);
  const answered = questions
    .filter((q) => q.scoring === "screen")
    .reduce((n, q) => (answers[q.id] !== undefined ? n + 1 : n), 0);
  const domains = computeDomainScores(answers);
  const functionalValue = answers[FUNCTIONAL_ITEM_ID];
  const functionalLabel =
    functionalValue === undefined
      ? null
      : FUNCTIONAL_OPTIONS.find((o) => o.value === functionalValue)?.label ??
        null;

  return {
    score,
    maxScore: SCREEN_MAX_SCORE,
    percent: Math.round((score / SCREEN_MAX_SCORE) * 100),
    answered,
    totalScreen: SCREEN_ITEM_COUNT,
    tier: getEatingDisorderTier(score),
    domains,
    primaryDomain: domains[0],
    functionalLabel,
  };
}
