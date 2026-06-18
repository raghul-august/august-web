import {
  MAX_SCORE,
  MIN_SCORE,
  questions,
} from "@/app/data/tools/borderline-personality-test-questions";

export type BpdAnswers = Record<number, number>;

export interface BpdTier {
  id: "very-low" | "low" | "moderate" | "elevated" | "high";
  label: string;
  range: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export const BPD_TIERS: readonly BpdTier[] = [
  {
    id: "very-low",
    label: "Very few BPD traits",
    range: "20–36",
    headline: "Your responses show very few patterns associated with BPD.",
    description:
      "Your answers suggest a stable sense of identity, steady relationships, and an emotional baseline that tolerates everyday stress well. Patterns associated with borderline personality disorder are unlikely to be a meaningful concern based on this self-reflection.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "low",
    label: "Few BPD traits",
    range: "37–52",
    headline: "Your responses show a small number of traits people associate with BPD.",
    description:
      "You may relate to a handful of the statements — perhaps fears of being left behind, the occasional mood swing, or moments of self-doubt — but the broader pattern of intense, persistent borderline traits is not present in what you described.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "moderate",
    label: "Some BPD traits",
    range: "53–68",
    headline: "Your responses include several traits associated with BPD.",
    description:
      "You recognise yourself in a meaningful share of the statements. Many people experience these patterns without meeting the criteria for borderline personality disorder, but if the intensity or duration of these feelings is interfering with relationships, work, or self-esteem, talking to a therapist can clarify what's going on.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "elevated",
    label: "Many BPD traits",
    range: "69–84",
    headline: "Your responses show a strong overlap with patterns associated with BPD.",
    description:
      "Most of the statements feel familiar — the abandonment fears, the swings between idealising and disappointing people, the unstable self-image, the impulsive moments. This is a level at which a clinical evaluation is worth your time. A mental-health professional can determine whether this is BPD, a related condition, or something else entirely, and what would actually help.",
    badge: "badge-high",
    tone: "warning",
  },
  {
    id: "high",
    label: "Strong overlap with BPD traits",
    range: "85–100",
    headline: "Your responses align strongly with patterns associated with BPD.",
    description:
      "You endorsed nearly every statement on this self-test. This level of overlap doesn't diagnose anything on its own, but it does mean the experiences you described are real, intense, and worth taking to a clinician. Borderline personality disorder is one of the most treatable serious mental-health conditions — DBT, MBT, and schema therapy all have strong evidence — but the first step is a real evaluation.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface BpdResult {
  score: number;
  minScore: number;
  maxScore: number;
  percent: number;
  answered: number;
  total: number;
  tier: BpdTier;
  topDomains: { id: number; text: string; value: number }[];
}

export function scoreItem(questionId: number, chosenValue: number): number {
  const q = questions.find((x) => x.id === questionId);
  if (!q) return 0;
  return q.reverse ? 6 - chosenValue : chosenValue;
}

export function computeScore(answers: BpdAnswers): number {
  return Object.entries(answers).reduce((sum, [id, value]) => {
    return sum + scoreItem(Number(id), value ?? 0);
  }, 0);
}

export function getBpdTier(score: number): BpdTier {
  if (score <= 36) return BPD_TIERS[0];
  if (score <= 52) return BPD_TIERS[1];
  if (score <= 68) return BPD_TIERS[2];
  if (score <= 84) return BPD_TIERS[3];
  return BPD_TIERS[4];
}

export function computeBpdResult(answers: BpdAnswers): BpdResult {
  const score = computeScore(answers);
  const tier = getBpdTier(score);
  const answered = Object.keys(answers).length;
  const range = MAX_SCORE - MIN_SCORE;
  const percent = range > 0 ? Math.round(((score - MIN_SCORE) / range) * 100) : 0;
  const topDomains = questions
    .map((q) => ({
      id: q.id,
      text: q.text,
      value: scoreItem(q.id, answers[q.id] ?? 0),
    }))
    .filter((row) => row.value >= 4)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
  return {
    score,
    minScore: MIN_SCORE,
    maxScore: MAX_SCORE,
    percent,
    answered,
    total: questions.length,
    tier,
    topDomains,
  };
}

export function bpdScoreBucket(score: number): string {
  if (score <= 36) return "20-36";
  if (score <= 52) return "37-52";
  if (score <= 68) return "53-68";
  if (score <= 84) return "69-84";
  return "85-100";
}
