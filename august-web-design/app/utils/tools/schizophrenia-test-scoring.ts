import {
  PQB_MAX_DISTRESS,
  PQB_POSITIVE_SCREEN_THRESHOLD,
  questions,
  totalQuestions,
  type SchizophreniaDomain,
} from "@/app/data/tools/schizophrenia-test-questions";

export type SchizophreniaAnswers = Record<number, number>;

export type SchizophreniaTierId =
  | "minimal"
  | "mild"
  | "moderate"
  | "elevated"
  | "significant";

export interface SchizophreniaTier {
  id: SchizophreniaTierId;
  label: string;
  range: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export const SCHIZOPHRENIA_TIERS: readonly SchizophreniaTier[] = [
  {
    id: "minimal",
    label: "Minimal Indicators",
    range: "0–5",
    headline:
      "Your responses show very few signs of psychosis-spectrum experiences.",
    description:
      "Almost none of the experiences this screen asks about are part of your last month. The patterns the PQ-B looks for don't appear to be a meaningful part of what you're working through right now.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "mild",
    label: "Some Indicators",
    range: "6–19",
    headline:
      "Your responses include a handful of unusual experiences with low distress.",
    description:
      "A few of the items felt familiar, but they don't seem to be bothering you much. These kinds of experiences are surprisingly common and don't necessarily point to a clinical condition. If they get more frequent, more intense, or start interfering with daily life, it's worth talking to a clinician.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "moderate",
    label: "Moderate Indicators",
    range: "20–39",
    headline:
      "Your responses include several psychosis-spectrum experiences that are causing distress.",
    description:
      "A meaningful share of the items resonated, and they're starting to bother you. This is not a diagnosis, but it's a reasonable point to share these results with a doctor or mental health professional trained in early psychosis — especially if they're affecting work, school, sleep, or relationships.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "elevated",
    label: "Elevated Indicators",
    range: "40–64",
    headline:
      "Your responses show a strong overlap with experiences seen in early psychosis.",
    description:
      "Many of the items feel familiar and are causing real distress. A clinical evaluation by a psychiatrist, psychologist, or early-psychosis specialist can determine what's actually going on. Early intervention is one of the most important predictors of good outcomes — earlier is better.",
    badge: "badge-high",
    tone: "warning",
  },
  {
    id: "significant",
    label: "Strong Indicators",
    range: "65–105",
    headline:
      "Your responses align very strongly with experiences seen in psychosis.",
    description:
      "You endorsed most items at a meaningfully distressing level. This doesn't diagnose anything on its own, but the experiences you described are real and worth taking seriously. Please reach out to a mental health professional trained in early psychosis. If you're in crisis, call or text 988.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface SchizophreniaDomainScore {
  id: SchizophreniaDomain;
  label: string;
  description: string;
  score: number;
  max: number;
  percent: number;
  endorsedCount: number;
  itemCount: number;
}

export interface SchizophreniaResult {
  /** Sum of all 21 item values (each 0–5). Range 0–105. */
  score: number;
  maxScore: number; // 105
  percent: number; // 0..100
  /** Number of items the user endorsed (value >= 1). Range 0–21. */
  endorsedCount: number;
  totalItems: number; // 21
  answered: number;
  /** True when endorsedCount >= 3 (Loewy 2011, sensitivity 0.89). */
  positiveScreen: boolean;
  positiveScreenThreshold: number; // 3
  tier: SchizophreniaTier;
  /** Per-symptom-domain breakdown sorted highest → lowest percent. */
  domains: SchizophreniaDomainScore[];
  primaryDomain: SchizophreniaDomainScore;
}

const DOMAIN_META: Record<
  SchizophreniaDomain,
  { label: string; description: string }
> = {
  perceptual: {
    label: "Perceptual experiences",
    description:
      "Unusual sounds, sights, sensations, or feelings about what's real around you.",
  },
  paranoia: {
    label: "Unusual beliefs & paranoia",
    description:
      "Mistrust, suspicion, the sense of being watched, or strong beliefs others find unusual.",
  },
  disorganization: {
    label: "Thought & speech changes",
    description:
      "Trouble getting your point across, racing thoughts, or feeling that thoughts aren't fully your own.",
  },
  "self-reality": {
    label: "Self & reality changes",
    description:
      "Feeling unreal, unsure if something happened, or that parts of your body work differently.",
  },
};

export function computeSchizophreniaScore(answers: SchizophreniaAnswers): number {
  return questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
}

export function getSchizophreniaTier(score: number): SchizophreniaTier {
  if (score <= 5) return SCHIZOPHRENIA_TIERS[0];
  if (score <= 19) return SCHIZOPHRENIA_TIERS[1];
  if (score <= 39) return SCHIZOPHRENIA_TIERS[2];
  if (score <= 64) return SCHIZOPHRENIA_TIERS[3];
  return SCHIZOPHRENIA_TIERS[4];
}

export function schizophreniaScoreBucket(score: number): string {
  if (score <= 5) return "0-5";
  if (score <= 19) return "6-19";
  if (score <= 39) return "20-39";
  if (score <= 64) return "40-64";
  return "65-105";
}

function computeDomainScores(
  answers: SchizophreniaAnswers,
): SchizophreniaDomainScore[] {
  const domainIds = Object.keys(DOMAIN_META) as SchizophreniaDomain[];
  const breakdown = domainIds.map((id) => {
    const items = questions.filter((q) => q.domain === id);
    const max = items.length * 5;
    const score = items.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    const endorsedCount = items.reduce(
      (n, q) => ((answers[q.id] ?? 0) >= 1 ? n + 1 : n),
      0,
    );
    return {
      id,
      label: DOMAIN_META[id].label,
      description: DOMAIN_META[id].description,
      score,
      max,
      percent: max > 0 ? Math.round((score / max) * 100) : 0,
      endorsedCount,
      itemCount: items.length,
    };
  });
  return breakdown.sort((a, b) => b.percent - a.percent);
}

export function computeSchizophreniaResult(
  answers: SchizophreniaAnswers,
): SchizophreniaResult {
  const score = computeSchizophreniaScore(answers);
  const endorsedCount = questions.reduce(
    (n, q) => ((answers[q.id] ?? 0) >= 1 ? n + 1 : n),
    0,
  );
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const domains = computeDomainScores(answers);

  return {
    score,
    maxScore: PQB_MAX_DISTRESS,
    percent: Math.round((score / PQB_MAX_DISTRESS) * 100),
    endorsedCount,
    totalItems: totalQuestions,
    answered,
    positiveScreen: endorsedCount >= PQB_POSITIVE_SCREEN_THRESHOLD,
    positiveScreenThreshold: PQB_POSITIVE_SCREEN_THRESHOLD,
    tier: getSchizophreniaTier(score),
    domains,
    primaryDomain: domains[0],
  };
}
