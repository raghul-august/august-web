import {
  FUNCTIONAL_OPTIONS,
  PHQ9_MAX_SCORE,
  questions,
} from "@/app/data/tools/depression-test-questions";

export type DepressionAnswers = Record<number, number>;

export type DepressionTierId =
  | "minimal"
  | "mild"
  | "moderate"
  | "moderately-severe"
  | "severe";

export interface DepressionTier {
  id: DepressionTierId;
  /** Heading used on the results page (title case). */
  label: string;
  /** Score range shown in the "About your score" disclosure (sentence case). */
  range: string;
  /** One-sentence summary shown directly under the score. */
  headline: string;
  /** Two- to three-sentence narrative shown beneath the headline. */
  description: string;
  badge:
    | "badge-low"
    | "badge-moderate"
    | "badge-significant"
    | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export const DEPRESSION_TIERS: readonly DepressionTier[] = [
  {
    id: "minimal",
    label: "Minimal Depression",
    range: "0–4",
    headline:
      "Your responses don't suggest signs of depression right now.",
    description:
      "Symptoms can come and go. It's a good idea to retake the test in a few days, or whenever things start to feel worse. You deserve mental health support regardless of your result — the resources below can still help you feel better.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "mild",
    label: "Mild Depression",
    range: "5–9",
    headline: "Your responses suggest signs of mild depression.",
    description:
      "Mild depression often responds well to small lifestyle adjustments — regular sleep, movement, time with people you trust — and to talking with someone. If symptoms keep coming back or get heavier, sharing your results with a mental health provider is a good next step.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "moderate",
    label: "Moderate Depression",
    range: "10–14",
    headline:
      "Your responses suggest signs of moderate depression.",
    description:
      "This isn't a diagnosis, but it's a good starting point. People with moderate depression often benefit from talking to a clinician about therapy and, in some cases, medication. Consider sharing these results with a mental health provider or someone you trust.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "moderately-severe",
    label: "Moderately Severe Depression",
    range: "15–19",
    headline:
      "Your responses suggest signs of moderately severe depression.",
    description:
      "This is not a diagnosis, but it's a good starting point. By taking this test, you've already taken the first steps toward getting help and feeling better. Consider sharing these results with a mental health provider, a trusted friend, or family member — it can make a real difference.",
    badge: "badge-high",
    tone: "warning",
  },
  {
    id: "severe",
    label: "Severe Depression",
    range: "20–27",
    headline: "Your responses suggest signs of severe depression.",
    description:
      "Severe depression deserves clinical attention. Reach out to a mental health provider, doctor, or someone you trust as soon as you can — effective treatments exist and recovery is real. If you're in immediate distress, the crisis resources above are open 24/7.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface DepressionResult {
  /** Sum of PHQ-9 items (Q1–Q9), 0–27. Q10 is not included. */
  score: number;
  maxScore: number; // 27
  percent: number; // 0..100 (score / maxScore)
  answered: number; // number of PHQ-9 items answered
  totalPhq9: number; // 9
  tier: DepressionTier;
  /** True when Q9 (self-harm ideation) > 0. Triggers the crisis card. */
  showSelfHarmWarning: boolean;
  /** Label for the Q10 functional-impairment anchor, if answered. */
  functionalLabel: string | null;
  /** Raw Q9 value, for analytics + UI. */
  selfHarmValue: number;
}

export function computePhq9Score(answers: DepressionAnswers): number {
  return questions
    .filter((q) => q.scoring === "phq9")
    .reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
}

export function getDepressionTier(score: number): DepressionTier {
  if (score <= 4) return DEPRESSION_TIERS[0];
  if (score <= 9) return DEPRESSION_TIERS[1];
  if (score <= 14) return DEPRESSION_TIERS[2];
  if (score <= 19) return DEPRESSION_TIERS[3];
  return DEPRESSION_TIERS[4];
}

export function depressionScoreBucket(score: number): string {
  if (score <= 4) return "0-4";
  if (score <= 9) return "5-9";
  if (score <= 14) return "10-14";
  if (score <= 19) return "15-19";
  return "20-27";
}

export function computeDepressionResult(
  answers: DepressionAnswers,
): DepressionResult {
  const score = computePhq9Score(answers);
  const selfHarmValue = answers[9] ?? 0;
  const functionalValue = answers[10];
  const functionalLabel =
    functionalValue === undefined
      ? null
      : FUNCTIONAL_OPTIONS.find((o) => o.value === functionalValue)?.label ??
        null;
  const answered = questions
    .filter((q) => q.scoring === "phq9")
    .reduce((n, q) => (answers[q.id] !== undefined ? n + 1 : n), 0);

  return {
    score,
    maxScore: PHQ9_MAX_SCORE,
    percent: Math.round((score / PHQ9_MAX_SCORE) * 100),
    answered,
    totalPhq9: 9,
    tier: getDepressionTier(score),
    showSelfHarmWarning: selfHarmValue > 0,
    functionalLabel,
    selfHarmValue,
  };
}
