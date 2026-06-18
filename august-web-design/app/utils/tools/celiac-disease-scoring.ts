import {
  CELIAC_DOMAIN_LABELS,
  CELIAC_QUESTIONS,
  CELIAC_TOTAL,
  type CeliacDomain,
  type CeliacQuestion,
} from "@/app/data/tools/celiac-disease-questions";

export type CeliacAnswers = Record<number, 0 | 1 | 2 | 3>;

export type CeliacTierId =
  | "low"
  | "possible"
  | "elevated"
  | "high"
  | "very-high";

export interface CeliacTier {
  id: CeliacTierId;
  label: string;
  range: string;
  headline: string;
  description: string;
  recommendation: string;
  badge: "badge-low" | "badge-medium" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export interface CeliacDomainBreakdown {
  domain: CeliacDomain;
  label: string;
  score: number;
  max: number;
}

export interface CeliacResult {
  score: number;
  maxScore: number;
  total: number;
  answered: number;
  tier: CeliacTier;
  breakdown: CeliacDomainBreakdown[];
  /** True if any risk-weighted item (family hx, T1D, dermatitis herpetiformis) was endorsed. */
  highRiskFlags: { id: number; text: string }[];
}

function maxForQuestion(q: CeliacQuestion): number {
  const baseMax = 3;
  return baseMax * (q.weight ?? 1);
}

function pointsForAnswer(q: CeliacQuestion, raw: number | undefined): number {
  const v = raw ?? 0;
  return v * (q.weight ?? 1);
}

export const CELIAC_MAX_SCORE = CELIAC_QUESTIONS.reduce(
  (sum, q) => sum + maxForQuestion(q),
  0,
);

const TIERS: readonly CeliacTier[] = [
  {
    id: "low",
    label: "Low likelihood",
    range: "0–15%",
    headline: "Few celiac-pattern symptoms or risk factors right now.",
    description:
      "On the items in this checklist, you scored low. Celiac is not impossible it can present silently but the symptoms and risk factors that most often prompt testing aren't strongly endorsed.",
    recommendation:
      "If anything still feels off, especially long-running digestive issues, keep tracking and mention them at your next physical.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "possible",
    label: "Possible — worth tracking",
    range: "15–30%",
    headline: "Some symptoms in the celiac pattern, but no strong signal.",
    description:
      "You endorsed a handful of symptoms that overlap with celiac, IBS, food intolerances, and other conditions. The next step is usually a primary-care visit to talk through what you're noticing.",
    recommendation:
      "Talk to your primary care provider about your symptoms. If celiac is on the differential, the first-line test is a tTG-IgA blood test (you must still be eating gluten).",
    badge: "badge-medium",
    tone: "neutral",
  },
  {
    id: "elevated",
    label: "Elevated likelihood",
    range: "30–50%",
    headline: "Your symptom pattern is consistent with celiac.",
    description:
      "Multiple symptom domains are involved. Celiac is one of several conditions that could explain this, and it's worth specifically ruling in or out left untreated, celiac causes long-term damage to the small intestine and absorption of nutrients.",
    recommendation:
      "Ask for celiac blood testing (tTG-IgA + total IgA). Keep eating gluten until you've been tested.",
    badge: "badge-moderate",
    tone: "caution",
  },
  {
    id: "high",
    label: "High likelihood",
    range: "50–70%",
    headline: "Symptom pattern + risk factors strongly suggest celiac testing.",
    description:
      "Either you have many celiac-pattern symptoms, or you have notable risk factors (family history, type 1 diabetes, dermatitis herpetiformis). This is the kind of profile gastroenterologists look at and want to test.",
    recommendation:
      "Don't go gluten-free yet that can mask the diagnosis. Schedule a visit and ask explicitly about celiac testing. If blood work is positive, the standard confirmation is an endoscopy with small-bowel biopsy.",
    badge: "badge-significant",
    tone: "warning",
  },
  {
    id: "very-high",
    label: "Very high — get tested",
    range: "70–100%",
    headline: "Your profile is the kind that should prompt celiac testing.",
    description:
      "You endorsed both extensive symptoms and one or more strong celiac risk markers. Untreated celiac causes ongoing intestinal damage and significantly increases long-term risk of nutrient deficiency, bone loss, and certain cancers.",
    recommendation:
      "See a clinician soon. Get celiac serology (tTG-IgA + total IgA) before changing your diet going gluten-free first can hide the disease on testing.",
    badge: "badge-high",
    tone: "warning",
  },
];

export function getCeliacTier(score: number, maxScore: number): CeliacTier {
  const pct = maxScore === 0 ? 0 : score / maxScore;
  if (pct < 0.15) return TIERS[0];
  if (pct < 0.3) return TIERS[1];
  if (pct < 0.5) return TIERS[2];
  if (pct < 0.7) return TIERS[3];
  return TIERS[4];
}

export function celiacScoreBucket(score: number, maxScore: number): string {
  const pct = maxScore === 0 ? 0 : score / maxScore;
  if (pct < 0.15) return "0-15";
  if (pct < 0.3) return "15-30";
  if (pct < 0.5) return "30-50";
  if (pct < 0.7) return "50-70";
  return "70-100";
}

export function computeCeliacResult(answers: CeliacAnswers): CeliacResult {
  let score = 0;
  let answered = 0;
  for (const q of CELIAC_QUESTIONS) {
    const raw = answers[q.id];
    score += pointsForAnswer(q, raw);
    if (raw !== undefined) answered += 1;
  }

  const byDomain = (domain: CeliacDomain) => {
    const items = CELIAC_QUESTIONS.filter((q) => q.domain === domain);
    return {
      score: items.reduce((s, q) => s + pointsForAnswer(q, answers[q.id]), 0),
      max: items.reduce((s, q) => s + maxForQuestion(q), 0),
    };
  };

  const breakdown: CeliacDomainBreakdown[] = (
    Object.keys(CELIAC_DOMAIN_LABELS) as CeliacDomain[]
  ).map((domain) => ({
    domain,
    label: CELIAC_DOMAIN_LABELS[domain],
    ...byDomain(domain),
  }));

  const highRiskFlags = CELIAC_QUESTIONS.filter(
    (q) => (q.weight ?? 1) >= 2 && (answers[q.id] ?? 0) > 0,
  ).map((q) => ({ id: q.id, text: q.text }));

  return {
    score,
    maxScore: CELIAC_MAX_SCORE,
    total: CELIAC_TOTAL,
    answered,
    tier: getCeliacTier(score, CELIAC_MAX_SCORE),
    breakdown,
    highRiskFlags,
  };
}
