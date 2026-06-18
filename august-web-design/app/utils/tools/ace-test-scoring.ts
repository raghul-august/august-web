import {
  ACE_CATEGORIES,
  ACE_MAX_SCORE,
  ACE_QUESTIONS,
  ACE_TOTAL,
  type AceQuestion,
} from "@/app/data/tools/ace-test-questions";

export type AceAnswers = Record<number, 0 | 1>;

export type AceTierId = "none" | "low" | "moderate" | "high" | "very-high";

export interface AceTier {
  id: AceTierId;
  label: string;
  range: string;
  headline: string;
  description: string;
  /** What this means at a population-research level. */
  populationNote: string;
  badge: "badge-low" | "badge-medium" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export interface AceCategoryBreakdown {
  category: AceQuestion["category"];
  label: string;
  description: string;
  score: number;
  max: number;
}

export interface AceResult {
  score: number;
  maxScore: number;
  answered: number;
  total: number;
  tier: AceTier;
  breakdown: AceCategoryBreakdown[];
}

const TIERS: readonly AceTier[] = [
  {
    id: "none",
    label: "No reported ACEs",
    range: "0",
    headline: "You reported none of the ten experiences.",
    description:
      "A score of 0 doesn't mean a stress-free childhood. It means none of these specific categories applied to you before age 18.",
    populationNote:
      "In the original CDC-Kaiser sample, roughly one in three adults scored 0.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "low",
    label: "Low ACE score",
    range: "1–2",
    headline: "You reported one or two adverse experiences before age 18.",
    description:
      "Most adults score in this range. Single ACEs are common; the long-term health correlations rise sharply once multiple categories pile up.",
    populationNote:
      "About 40% of adults in the original study scored 1–2.",
    badge: "badge-medium",
    tone: "neutral",
  },
  {
    id: "moderate",
    label: "Moderate ACE score",
    range: "3",
    headline: "You reported three categories of adverse childhood experiences.",
    description:
      "A score of 3 is where research consistently shows risk of long-term physical and mental health effects beginning to compound. Talking with a clinician who understands trauma can be useful, even if you feel fine now.",
    populationNote:
      "About 10% of adults score 3 in large epidemiological samples.",
    badge: "badge-moderate",
    tone: "caution",
  },
  {
    id: "high",
    label: "High ACE score",
    range: "4–5",
    headline: "Your ACE score is in the range research links to elevated long-term risk.",
    description:
      "Research links a score of 4 or higher with meaningfully higher rates of depression, substance use, and chronic disease in adulthood. This is a risk signal, not a destiny. Connection, therapy, and trauma-informed care can change the trajectory.",
    populationNote:
      "Roughly 12% of adults score 4 or 5 in the original study.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "very-high",
    label: "Very high ACE score",
    range: "6–10",
    headline: "Your ACE score is well above the 'high-risk' research threshold.",
    description:
      "Scores of 6+ have been linked, at a population level, with the largest jumps in long-term health risks. None of that erases who you are, but it's a strong signal that finding trauma-informed support, whether therapy, peer recovery, or a primary care team that screens for ACEs, is worth real effort.",
    populationNote:
      "Adults scoring 6+ are a smaller share of any population (~5%), and the research applies to averages, not individuals.",
    badge: "badge-high",
    tone: "warning",
  },
];

export function getAceTier(score: number): AceTier {
  if (score <= 0) return TIERS[0];
  if (score <= 2) return TIERS[1];
  if (score <= 3) return TIERS[2];
  if (score <= 5) return TIERS[3];
  return TIERS[4];
}

export function aceScoreBucket(score: number): string {
  if (score <= 0) return "0";
  if (score <= 2) return "1-2";
  if (score <= 3) return "3";
  if (score <= 5) return "4-5";
  return "6-10";
}

export function computeAceResult(answers: AceAnswers): AceResult {
  const score = ACE_QUESTIONS.reduce(
    (sum, q) => sum + (answers[q.id] ?? 0),
    0,
  );
  const answered = ACE_QUESTIONS.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );

  const byCategory = (cat: AceQuestion["category"]) => {
    const items = ACE_QUESTIONS.filter((q) => q.category === cat);
    return {
      score: items.reduce((s, q) => s + (answers[q.id] ?? 0), 0),
      max: items.length,
    };
  };

  const breakdown: AceCategoryBreakdown[] = (
    Object.keys(ACE_CATEGORIES) as AceQuestion["category"][]
  ).map((cat) => ({
    category: cat,
    label: ACE_CATEGORIES[cat].label,
    description: ACE_CATEGORIES[cat].description,
    ...byCategory(cat),
  }));

  return {
    score,
    maxScore: ACE_MAX_SCORE,
    answered,
    total: ACE_TOTAL,
    tier: getAceTier(score),
    breakdown,
  };
}
