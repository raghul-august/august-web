import {
  COMPATIBILITY_DIMENSIONS,
  type CompatibilityDimensionId,
  MAX_SCORE,
  MIN_SCORE,
  questions,
} from "@/app/data/tools/compatibility-test-questions";

export type CompatibilityAnswers = Record<number, number>;

export interface CompatibilityTier {
  id: "limited" | "building" | "strong" | "exceptional";
  label: string;
  range: string;
  headline: (a: string, b: string) => string;
  description: (a: string, b: string) => string;
  badge: "badge-significant" | "badge-moderate" | "badge-low" | "badge-pure";
  tone: "warning" | "caution" | "info" | "neutral";
}

export const COMPATIBILITY_TIERS: readonly CompatibilityTier[] = [
  {
    id: "limited",
    label: "Limited alignment",
    range: "0–30%",
    headline: (a, b) =>
      `Right now, ${a || "you"} and ${b || "your partner"} are pulling in noticeably different directions.`,
    description: (a, b) =>
      `Across most of the dimensions you rated, the picture is one of distance — fewer easy wins, more friction, and patterns that tend to repeat. That doesn't mean ${a || "you"} and ${b || "your partner"} can't work; many couples in this range rebuild trust and rhythm with intentional effort or a therapist's help. But pretending the gaps aren't there usually makes them wider.`,
    badge: "badge-significant",
    tone: "warning",
  },
  {
    id: "building",
    label: "Foundation in progress",
    range: "31–55%",
    headline: (a, b) =>
      `${a || "You"} and ${b || "your partner"} have real building blocks — and some honest work still to do.`,
    description: (a, b) =>
      `There are dimensions where ${a || "you"} and ${b || "your partner"} clearly click, alongside areas that look stuck or unspoken. Mid-range scores almost always cluster around one or two themes — communication, conflict, or routines — that, when named, unlock most of the rest. The dimension breakdown below will tell you where to start.`,
    badge: "badge-moderate",
    tone: "caution",
  },
  {
    id: "strong",
    label: "Strong compatibility",
    range: "56–80%",
    headline: (a, b) =>
      `${a || "You"} and ${b || "your partner"} look genuinely well-matched.`,
    description: (a, b) =>
      `Across the five dimensions, you're describing a relationship with real foundations — trust, repair, shared values, and rhythms that mostly fit. That doesn't make every season effortless, but it does mean ${a || "you"} and ${b || "your partner"} are starting from a strong base. Pay attention to the lowest-scoring dimension below — that's usually where strong couples have their next growth chapter.`,
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "exceptional",
    label: "Exceptional partnership",
    range: "81–100%",
    headline: (a, b) =>
      `${a || "You"} and ${b || "your partner"} score in the range of unusually well-matched couples.`,
    description: (a, b) =>
      `Almost every dimension lit up strongly — safe communication, deep intimacy, aligned values, healthy conflict, and routines that fit. Relationships in this range still hit hard seasons, but you have the toolkit most couples spend years building. The risk to watch for is complacency: keep doing the small repair and check-in habits that got you here.`,
    badge: "badge-pure",
    tone: "neutral",
  },
];

export interface CompatibilityDimensionResult {
  id: CompatibilityDimensionId;
  label: string;
  description: string;
  raw: number;
  max: number;
  percent: number;
  count: number;
}

export interface CompatibilityResult {
  score: number;
  minScore: number;
  maxScore: number;
  percent: number;
  answered: number;
  total: number;
  tier: CompatibilityTier;
  dimensions: CompatibilityDimensionResult[];
  topDimension: CompatibilityDimensionResult | null;
  bottomDimension: CompatibilityDimensionResult | null;
}

export function scoreItem(questionId: number, chosenValue: number): number {
  const q = questions.find((x) => x.id === questionId);
  if (!q) return 0;
  return q.reverse ? 6 - chosenValue : chosenValue;
}

export function computeRawScore(answers: CompatibilityAnswers): number {
  return Object.entries(answers).reduce((sum, [id, value]) => {
    return sum + scoreItem(Number(id), value ?? 0);
  }, 0);
}

export function compatibilityTierForPercent(percent: number): CompatibilityTier {
  if (percent <= 30) return COMPATIBILITY_TIERS[0];
  if (percent <= 55) return COMPATIBILITY_TIERS[1];
  if (percent <= 80) return COMPATIBILITY_TIERS[2];
  return COMPATIBILITY_TIERS[3];
}

export function computeCompatibilityResult(
  answers: CompatibilityAnswers,
): CompatibilityResult {
  const score = computeRawScore(answers);
  const answered = Object.keys(answers).length;
  const range = MAX_SCORE - MIN_SCORE;
  const percent =
    range > 0 ? Math.round(((score - MIN_SCORE) / range) * 100) : 0;

  const dimensions: CompatibilityDimensionResult[] = COMPATIBILITY_DIMENSIONS.map(
    (dim) => {
      const items = questions.filter((q) => q.dimension === dim.id);
      const raw = items.reduce(
        (sum, q) => sum + scoreItem(q.id, answers[q.id] ?? 0),
        0,
      );
      const dimMax = items.length * 5;
      const dimMin = items.length * 1;
      const dimRange = dimMax - dimMin;
      const dimPercent =
        dimRange > 0 ? Math.round(((raw - dimMin) / dimRange) * 100) : 0;
      return {
        id: dim.id,
        label: dim.label,
        description: dim.description,
        raw,
        max: dimMax,
        percent: dimPercent,
        count: items.length,
      };
    },
  );

  const sortedByPercent = [...dimensions].sort((a, b) => b.percent - a.percent);
  const topDimension = sortedByPercent[0] ?? null;
  const bottomDimension = sortedByPercent[sortedByPercent.length - 1] ?? null;

  return {
    score,
    minScore: MIN_SCORE,
    maxScore: MAX_SCORE,
    percent,
    answered,
    total: questions.length,
    tier: compatibilityTierForPercent(percent),
    dimensions,
    topDimension,
    bottomDimension,
  };
}

export function compatibilityScoreBucket(percent: number): string {
  if (percent <= 30) return "0-30";
  if (percent <= 55) return "31-55";
  if (percent <= 80) return "56-80";
  return "81-100";
}
