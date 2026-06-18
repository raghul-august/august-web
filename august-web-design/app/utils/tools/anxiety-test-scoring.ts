import {
  GAD_MAX_SCORE,
  GAD_MIN_SCORE,
  GAD_POSITIVE_SCREEN_CUTOFF,
  questions,
} from "@/app/data/tools/anxiety-test-questions";

export type AnxietyAnswers = Record<number, number>;

export type AnxietyTierId =
  | "minimal"
  | "mild"
  | "moderate"
  | "severe"
  | "very-severe";

export interface AnxietyTier {
  id: AnxietyTierId;
  /** Heading used on the results page (title case). */
  label: string;
  /** Inclusive score range, shown in the bands list (sum is 20–100). */
  range: string;
  /** One-sentence summary directly under the score. */
  headline: string;
  /** Two- to three-sentence narrative shown beneath the headline. */
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export const ANXIETY_TIERS: readonly AnxietyTier[] = [
  {
    id: "minimal",
    label: "Minimal Anxiety",
    range: "20–35",
    headline:
      "Your responses don't suggest meaningful generalized anxiety right now.",
    description:
      "Everyone worries from time to time, but the patterns this screen looks for — chronic worry, restlessness, physical anxiety symptoms like trouble sleeping or muscle tension — don't seem to be a big part of your day-to-day. If something still feels off in a specific area, a clinician can take a closer look.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "mild",
    label: "Mild Anxiety",
    range: "36–51",
    headline: "Your responses suggest mild generalized anxiety.",
    description:
      "Some of these statements clearly landed for you. Mild anxiety often responds well to lifestyle tools (sleep, movement, structured worry time) and brief skills-based therapy. If it keeps coming back or starts limiting things you want to do, it's worth talking to a clinician.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "moderate",
    label: "Moderate Anxiety",
    range: "52–67",
    headline:
      "Your responses suggest moderate generalized anxiety.",
    description:
      "A meaningful number of these worry, restlessness, and physical-symptom patterns resonated. Moderate anxiety is highly treatable cognitive-behavioural therapy (CBT) has the strongest evidence base, and medication can help in some cases. Consider sharing these results with a mental health provider so you can think about next steps together.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "severe",
    label: "Severe Anxiety",
    range: "68–83",
    headline: "Your responses suggest severe generalized anxiety.",
    description:
      "Many of these patterns clearly fit, at an intensity that probably shapes daily choices — how you sleep, how you concentrate, how much energy chronic worry consumes. This isn't a diagnosis, but it is a strong signal that a clinical assessment with someone who treats anxiety would be valuable. Effective treatments exist, and earlier engagement tends to be easier.",
    badge: "badge-high",
    tone: "warning",
  },
  {
    id: "very-severe",
    label: "Very Severe Anxiety",
    range: "84–100",
    headline:
      "Your responses suggest very severe generalized anxiety.",
    description:
      "Almost every item on this screen felt familiar at a high intensity. That level of chronic worry and physical anxiety deserves clinical attention — talk to a mental health provider as soon as you reasonably can. Evidence-based treatments, especially CBT and, when appropriate, SSRIs or SNRIs, work well for generalized anxiety disorder; you don't have to keep navigating it alone.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface AnxietyResult {
  /** Sum of (possibly reverse-keyed) item scores, 20..100. */
  score: number;
  maxScore: number; // 100
  minScore: number; // 20
  /** (score - 20) / 80 in percent, 0..100. */
  percent: number;
  answered: number; // 0..20
  total: number; // 20
  tier: AnxietyTier;
  /** True when score is at or above the moderate-tier cutoff (52). */
  positiveScreen: boolean;
  positiveScreenCutoff: number; // 52
}

export function computeAnxietyScore(answers: AnxietyAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    const eff = q.reverse ? 6 - raw : raw;
    return sum + eff;
  }, 0);
}

export function getAnxietyTier(score: number): AnxietyTier {
  if (score <= 35) return ANXIETY_TIERS[0];
  if (score <= 51) return ANXIETY_TIERS[1];
  if (score <= 67) return ANXIETY_TIERS[2];
  if (score <= 83) return ANXIETY_TIERS[3];
  return ANXIETY_TIERS[4];
}

export function anxietyScoreBucket(score: number): string {
  if (score <= 35) return "20-35";
  if (score <= 51) return "36-51";
  if (score <= 67) return "52-67";
  if (score <= 83) return "68-83";
  return "84-100";
}

export function computeAnxietyResult(answers: AnxietyAnswers): AnxietyResult {
  const score = computeAnxietyScore(answers);
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const range = GAD_MAX_SCORE - GAD_MIN_SCORE;
  const percent = Math.max(
    0,
    Math.min(100, Math.round(((score - GAD_MIN_SCORE) / range) * 100)),
  );

  return {
    score,
    maxScore: GAD_MAX_SCORE,
    minScore: GAD_MIN_SCORE,
    percent,
    answered,
    total: questions.length,
    tier: getAnxietyTier(score),
    positiveScreen: score >= GAD_POSITIVE_SCREEN_CUTOFF,
    positiveScreenCutoff: GAD_POSITIVE_SCREEN_CUTOFF,
  };
}
