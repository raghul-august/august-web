import { MAX_SCORE, questions } from "@/app/data/tools/anger-management-test-questions";

export type AngerAnswers = Record<number, number>;

export interface AngerTier {
  id: "low" | "average" | "above-average" | "high" | "very-high";
  label: string;
  range: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export const ANGER_TIERS: readonly AngerTier[] = [
  {
    id: "low",
    label: "Lower than average",
    range: "0–45",
    headline: "Your anger response is markedly below average.",
    description:
      "The amount of anger and annoyance you experience day to day is much less than the average person reports. You take frustrations in stride and rarely let small irritants escalate.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "average",
    label: "Average",
    range: "46–55",
    headline: "Your anger response is in the typical range.",
    description:
      "You react to life's annoyances with about as much anger as most people. Some situations get under your skin, others roll off, and the balance is normal for adults.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "above-average",
    label: "Above average",
    range: "56–75",
    headline: "Your anger response is somewhat higher than typical.",
    description:
      "Anger comes to you more readily than it does for most people. You may find yourself irritated by situations that wouldn't bother others, and the intensity tends to be stronger.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "high",
    label: "High",
    range: "76–85",
    headline: "Your anger response is noticeably elevated.",
    description:
      "You experience frequent, intense anger reactions to everyday frustrations. This level of reactivity often spills over into relationships, work, and physical health.",
    badge: "badge-high",
    tone: "warning",
  },
  {
    id: "very-high",
    label: "Very high",
    range: "86–100",
    headline: "Your anger response is at the top of the scale.",
    description:
      "You report anger reactions that are stronger and longer-lasting than nearly anyone else. Talking to a clinician or therapist who specialises in anger work would likely help meaningfully.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface AngerResult {
  score: number;
  maxScore: number;
  percent: number;
  answered: number;
  total: number;
  tier: AngerTier;
  topTriggers: { id: number; text: string; value: number }[];
}

export function computeScore(answers: AngerAnswers): number {
  return Object.values(answers).reduce((sum, v) => sum + (v ?? 0), 0);
}

export function getAngerTier(score: number): AngerTier {
  if (score <= 45) return ANGER_TIERS[0];
  if (score <= 55) return ANGER_TIERS[1];
  if (score <= 75) return ANGER_TIERS[2];
  if (score <= 85) return ANGER_TIERS[3];
  return ANGER_TIERS[4];
}

export function computeAngerResult(answers: AngerAnswers): AngerResult {
  const score = computeScore(answers);
  const tier = getAngerTier(score);
  const answered = Object.keys(answers).length;
  const topTriggers = questions
    .map((q) => ({ id: q.id, text: q.text, value: answers[q.id] ?? 0 }))
    .filter((row) => row.value >= 3)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
  return {
    score,
    maxScore: MAX_SCORE,
    percent: Math.round((score / MAX_SCORE) * 100),
    answered,
    total: questions.length,
    tier,
    topTriggers,
  };
}

export function angerScoreBucket(score: number): string {
  if (score <= 45) return "0-45";
  if (score <= 55) return "46-55";
  if (score <= 75) return "56-75";
  if (score <= 85) return "76-85";
  return "86-100";
}
