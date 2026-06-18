import {
  DOMAIN_LABELS,
  PERIMENOPAUSE_MAX_SCORE,
  PERIMENOPAUSE_QUESTIONS,
  PERIMENOPAUSE_TOTAL,
  type PerimenopauseQuestion,
  type SymptomDomain,
} from "@/app/data/tools/perimenopause-symptom-questions";

export type PerimenopauseAnswers = Record<number, 0 | 1 | 2 | 3>;

export type PerimenopauseTierId =
  | "minimal"
  | "mild"
  | "moderate"
  | "marked"
  | "severe";

export interface PerimenopauseTier {
  id: PerimenopauseTierId;
  label: string;
  range: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-medium" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export interface DomainBreakdown {
  domain: SymptomDomain;
  label: string;
  score: number;
  max: number;
}

export interface PerimenopauseResult {
  score: number;
  maxScore: number;
  total: number;
  answered: number;
  tier: PerimenopauseTier;
  breakdown: DomainBreakdown[];
  /** Single highest scoring item, for the "what stood out" line. */
  topSymptom: { text: string; severity: number } | null;
}

const TIERS: readonly PerimenopauseTier[] = [
  {
    id: "minimal",
    label: "Minimal symptoms",
    range: "0–10",
    headline: "Few perimenopause symptoms are bothering you right now.",
    description:
      "Hormone shifts are still possible, but they're not dominating your day-to-day. Worth re-checking every six months if anything starts to change.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "mild",
    label: "Mild symptoms",
    range: "11–20",
    headline: "Some early perimenopausal symptoms are showing up.",
    description:
      "Sleep, mood, or cycle shifts are noticeable but not yet disruptive. Tracking symptoms in a journal or app makes the next conversation with a clinician much easier.",
    badge: "badge-medium",
    tone: "neutral",
  },
  {
    id: "moderate",
    label: "Moderate symptoms",
    range: "21–30",
    headline: "Perimenopausal symptoms are clearly affecting your life.",
    description:
      "Hot flushes, sleep disruption, mood, and physical symptoms are starting to compound. This is the range where many people first benefit from a conversation about menopause-specific care, including hormone therapy options and lifestyle adjustments.",
    badge: "badge-moderate",
    tone: "caution",
  },
  {
    id: "marked",
    label: "Marked symptoms",
    range: "31–45",
    headline: "Your symptoms are at a level worth getting clinical attention.",
    description:
      "Symptoms are frequent and bothersome across multiple domains. A clinician who specializes in menopause (look for NAMS / IMS credentialing) can help you weigh treatment options including MHT (menopausal hormone therapy), CBT-I for sleep, and SSRIs for vasomotor symptoms.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "severe",
    label: "Severe symptoms",
    range: "46–63",
    headline: "Symptoms are very intense and pervasive.",
    description:
      "Symptoms at this level meaningfully reduce quality of life. Treatment can help, often substantially. A menopause-knowledgeable clinician should be the next step. If you're in mental-health crisis, call or text 988 (Suicide & Crisis Lifeline).",
    badge: "badge-high",
    tone: "warning",
  },
];

export function getPerimenopauseTier(score: number): PerimenopauseTier {
  if (score <= 10) return TIERS[0];
  if (score <= 20) return TIERS[1];
  if (score <= 30) return TIERS[2];
  if (score <= 45) return TIERS[3];
  return TIERS[4];
}

export function perimenopauseScoreBucket(score: number): string {
  if (score <= 10) return "0-10";
  if (score <= 20) return "11-20";
  if (score <= 30) return "21-30";
  if (score <= 45) return "31-45";
  return "46-63";
}

export function computePerimenopauseResult(
  answers: PerimenopauseAnswers,
): PerimenopauseResult {
  const score = PERIMENOPAUSE_QUESTIONS.reduce(
    (sum, q) => sum + (answers[q.id] ?? 0),
    0,
  );
  const answered = PERIMENOPAUSE_QUESTIONS.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );

  const byDomain = (domain: SymptomDomain) => {
    const items = PERIMENOPAUSE_QUESTIONS.filter((q) => q.domain === domain);
    return {
      score: items.reduce((s, q) => s + (answers[q.id] ?? 0), 0),
      max: items.length * 3,
    };
  };

  const breakdown: DomainBreakdown[] = (
    Object.keys(DOMAIN_LABELS) as SymptomDomain[]
  ).map((domain) => ({
    domain,
    label: DOMAIN_LABELS[domain],
    ...byDomain(domain),
  }));

  let topSymptom: PerimenopauseResult["topSymptom"] = null;
  for (const q of PERIMENOPAUSE_QUESTIONS) {
    const v = answers[q.id] ?? 0;
    if (v > 0 && (!topSymptom || v > topSymptom.severity)) {
      topSymptom = { text: q.text, severity: v };
    }
  }

  return {
    score,
    maxScore: PERIMENOPAUSE_MAX_SCORE,
    total: PERIMENOPAUSE_TOTAL,
    answered,
    tier: getPerimenopauseTier(score),
    breakdown,
    topSymptom,
  };
}
