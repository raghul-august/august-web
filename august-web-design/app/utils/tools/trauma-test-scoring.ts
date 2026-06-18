import {
  PCPTSD5_ITEM_COUNT,
  PCPTSD5_MAX_SCORE,
  PCPTSD5_POSITIVE_CUTOFF,
  TRAUMA_GATE_ID,
  questions,
} from "@/app/data/tools/trauma-test-questions";

export type TraumaAnswers = Record<number, 0 | 1>;

export type TraumaTierId = "no-trauma" | "negative" | "subthreshold" | "positive";

export interface TraumaTier {
  id: TraumaTierId;
  /** Heading used on the results page. */
  label: string;
  /** Score range shown alongside the badge. */
  range: string;
  /** One-sentence summary shown directly under the score. */
  headline: string;
  /** Two- to three-sentence narrative shown beneath the headline. */
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export const TRAUMA_TIERS: readonly TraumaTier[] = [
  {
    id: "no-trauma",
    label: "No Qualifying Trauma",
    range: "—",
    headline:
      "Based on your answer, you may not have experienced an event the PC-PTSD-5 screens for.",
    description:
      "PTSD is specifically tied to exposure to a traumatic event. You may still be working through other very stressful experiences. There are mental health problems related to stress, like depression, anxiety, sleep difficulty, or substance use, that respond well to support — even when PTSD isn't the right frame.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "negative",
    label: "Negative Screen",
    range: "0–2",
    headline:
      "Your responses don't suggest signs of PTSD on this brief screen.",
    description:
      "A small number of symptoms can show up after trauma without meeting the threshold the PC-PTSD-5 uses for a positive screen. If you notice your symptoms aren't improving or are getting worse, talking to a health care provider is a reasonable next step — effective support exists whether or not the label fits.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "subthreshold",
    label: "Borderline Screen",
    range: "2",
    headline:
      "Your responses sit just below the PC-PTSD-5 positive threshold.",
    description:
      "You endorsed enough symptoms that the patterns are worth taking seriously, but not enough to be considered a positive screen. People in this range often benefit from talking to a clinician — especially if these symptoms are interfering with sleep, relationships, or how you feel day to day.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "positive",
    label: "Positive Screen",
    range: "3–5",
    headline:
      "Your responses suggest signs consistent with PTSD on this brief screen.",
    description:
      "A score of 3 or more is the standard cutoff the PC-PTSD-5 uses to flag a possible PTSD presentation. This is not a diagnosis, only a trained provider can do tha, but sharing these results with a mental health provider is a good next step. PTSD is treatable, often substantially, with evidence-based therapies like prolonged exposure, cognitive processing therapy, or EMDR.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface TraumaResult {
  /** Sum of the 5 PC-PTSD-5 yes/no items (Q2–Q6), 0–5. Gate answer not included. */
  score: number;
  maxScore: number; // 5
  percent: number; // 0..100 (score / maxScore)
  answered: number; // PC-PTSD-5 items answered
  totalItems: number; // 5
  tier: TraumaTier;
  /** True when the trauma gate (Q1) was answered "No" — symptom items are skipped. */
  noTrauma: boolean;
  /** Positive PC-PTSD-5 screen (score >= 3 and gate was Yes). */
  isPositive: boolean;
  /** Cutoff used (3 for adults per PC-PTSD-5). */
  cutoff: number;
}

export function computePcptsd5Score(answers: TraumaAnswers): number {
  return questions
    .filter((q) => q.scoring === "symptom")
    .reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
}

export function getTraumaTier(
  noTrauma: boolean,
  score: number,
): TraumaTier {
  if (noTrauma) return TRAUMA_TIERS[0];
  if (score >= PCPTSD5_POSITIVE_CUTOFF) return TRAUMA_TIERS[3];
  if (score === 2) return TRAUMA_TIERS[2];
  return TRAUMA_TIERS[1];
}

export function traumaScoreBucket(noTrauma: boolean, score: number): string {
  if (noTrauma) return "no-trauma";
  if (score >= PCPTSD5_POSITIVE_CUTOFF) return "3-5";
  if (score === 2) return "2";
  return "0-1";
}

export function computeTraumaResult(answers: TraumaAnswers): TraumaResult {
  const gateValue = answers[TRAUMA_GATE_ID];
  const noTrauma = gateValue === 0;
  const score = noTrauma ? 0 : computePcptsd5Score(answers);
  const answered = questions
    .filter((q) => q.scoring === "symptom")
    .reduce((n, q) => (answers[q.id] !== undefined ? n + 1 : n), 0);

  return {
    score,
    maxScore: PCPTSD5_MAX_SCORE,
    percent: Math.round((score / PCPTSD5_MAX_SCORE) * 100),
    answered,
    totalItems: PCPTSD5_ITEM_COUNT,
    tier: getTraumaTier(noTrauma, score),
    noTrauma,
    isPositive: !noTrauma && score >= PCPTSD5_POSITIVE_CUTOFF,
    cutoff: PCPTSD5_POSITIVE_CUTOFF,
  };
}
