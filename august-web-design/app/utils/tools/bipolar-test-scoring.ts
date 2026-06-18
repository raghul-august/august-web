import {
  BIPOLAR_MAX_SCORE,
  BIPOLAR_MIN_SCORE,
  BIPOLAR_POSITIVE_SCREEN_CUTOFF,
  questions,
} from "@/app/data/tools/bipolar-test-questions";

export type BipolarAnswers = Record<number, number>;

export type BipolarTierId =
  | "minimal"
  | "mild"
  | "moderate"
  | "significant"
  | "very-high";

export interface BipolarTier {
  id: BipolarTierId;
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

export const BIPOLAR_TIERS: readonly BipolarTier[] = [
  {
    id: "minimal",
    label: "Minimal Bipolar Signs",
    range: "20–35",
    headline:
      "Your responses don’t suggest meaningful signs of bipolar disorder right now.",
    description:
      "Everyone has up-and-down days. The patterns this screen looks for — repeated manic-feeling stretches, mood swings that get in the way of life, depressive episodes lasting weeks — don’t seem to be a big part of your day-to-day. If something specific still feels off, a clinician can take a closer look.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "mild",
    label: "Mild Bipolar Signs",
    range: "36–51",
    headline:
      "Your responses suggest mild signs that overlap with the bipolar spectrum.",
    description:
      "Some of these statements clearly resonated. Mood fluctuations can come from a lot of places stress, sleep loss, life transitions, ADHD, anxiety, or early-stage mood disorders. If these patterns keep coming back or start to limit things you want to do, talking with a clinician who treats mood disorders is a reasonable next step.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "moderate",
    label: "Moderate Bipolar Signs",
    range: "52–67",
    headline:
      "Your responses suggest a moderate pattern of bipolar-spectrum symptoms.",
    description:
      "A meaningful number of manic-side and depressive-side items resonated. This isn’t a diagnosis, but bipolar disorder is highly treatable once recognized — mood-stabilizing medication and therapy together work well, and getting it identified early tends to make care easier. Consider sharing these results with a mental health provider.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "significant",
    label: "Significant Bipolar Signs",
    range: "68–83",
    headline:
      "Your responses suggest a significant pattern of bipolar-spectrum symptoms.",
    description:
      "Many of the manic, mixed, and depressive features in this screen clearly fit, at an intensity that probably shapes daily life — sleep, decisions, relationships, work. This isn’t a diagnosis, but a clinical assessment with someone who treats bipolar disorder would be valuable. Effective treatments exist and outcomes are best when care starts sooner.",
    badge: "badge-high",
    tone: "warning",
  },
  {
    id: "very-high",
    label: "Very High Bipolar Signs",
    range: "84–100",
    headline:
      "Your responses suggest a very high level of bipolar-spectrum symptoms.",
    description:
      "Almost every item on this screen felt familiar at a high intensity, across both manic-side and depressive-side experiences. That deserves clinical attention — talk to a mental health provider as soon as you reasonably can. Mood stabilizers, structured therapy, and a stable routine work together well for bipolar disorder; you don’t have to navigate this on your own.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface BipolarResult {
  /** Sum of (possibly reverse-keyed) item scores, 20..100. */
  score: number;
  maxScore: number; // 100
  minScore: number; // 20
  /** (score - 20) / 80 in percent, 0..100. */
  percent: number;
  answered: number; // 0..20
  total: number; // 20
  tier: BipolarTier;
  /** True when score is at or above the moderate-tier cutoff (52). */
  positiveScreen: boolean;
  positiveScreenCutoff: number; // 52
}

export function computeBipolarScore(answers: BipolarAnswers): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    const eff = q.reverse ? 6 - raw : raw;
    return sum + eff;
  }, 0);
}

export function getBipolarTier(score: number): BipolarTier {
  if (score <= 35) return BIPOLAR_TIERS[0];
  if (score <= 51) return BIPOLAR_TIERS[1];
  if (score <= 67) return BIPOLAR_TIERS[2];
  if (score <= 83) return BIPOLAR_TIERS[3];
  return BIPOLAR_TIERS[4];
}

export function bipolarScoreBucket(score: number): string {
  if (score <= 35) return "20-35";
  if (score <= 51) return "36-51";
  if (score <= 67) return "52-67";
  if (score <= 83) return "68-83";
  return "84-100";
}

export function computeBipolarResult(answers: BipolarAnswers): BipolarResult {
  const score = computeBipolarScore(answers);
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const range = BIPOLAR_MAX_SCORE - BIPOLAR_MIN_SCORE;
  const percent = Math.max(
    0,
    Math.min(100, Math.round(((score - BIPOLAR_MIN_SCORE) / range) * 100)),
  );

  return {
    score,
    maxScore: BIPOLAR_MAX_SCORE,
    minScore: BIPOLAR_MIN_SCORE,
    percent,
    answered,
    total: questions.length,
    tier: getBipolarTier(score),
    positiveScreen: score >= BIPOLAR_POSITIVE_SCREEN_CUTOFF,
    positiveScreenCutoff: BIPOLAR_POSITIVE_SCREEN_CUTOFF,
  };
}
