import {
  SAT_MAX_SCORE,
  SAT_MIN_SCORE,
  SAT_POSITIVE_SCREEN_CUTOFF,
  questions,
} from "@/app/data/tools/social-anxiety-test-questions";

export type SocialAnxietyAnswers = Record<number, number>;

export type SocialAnxietyTierId =
  | "minimal"
  | "mild"
  | "moderate"
  | "severe"
  | "very-severe";

export interface SocialAnxietyTier {
  id: SocialAnxietyTierId;
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

export const SOCIAL_ANXIETY_TIERS: readonly SocialAnxietyTier[] = [
  {
    id: "minimal",
    label: "Minimal Social Anxiety",
    range: "20–35",
    headline:
      "Your responses don't suggest meaningful social anxiety right now.",
    description:
      "Social situations sometimes feel awkward for everyone, but the patterns this screen looks for avoiding interactions, intense self-consciousness, physical anxiety symptoms — don't seem to be a big part of your day-to-day. If something still feels off in specific settings, a clinician can take a closer look.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "mild",
    label: "Mild Social Anxiety",
    range: "36–51",
    headline: "Your responses suggest mild social anxiety.",
    description:
      "Some social situations clearly take more energy for you than others. Mild social anxiety often responds well to small experiments, leaning into slightly uncomfortable interactions, working on assertive habits and to talking with someone. If it keeps coming back or starts limiting things you want to do, it's worth talking to a clinician.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "moderate",
    label: "Moderate Social Anxiety",
    range: "52–67",
    headline:
      "Your responses suggest moderate social anxiety.",
    description:
      "A meaningful number of these statements resonated. Moderate social anxiety is highly treatable, 878 cognitive-behavioural therapy with exposure is the strongest-evidence approach, and medication can help in some cases. Consider sharing these results with a mental health provider so you can think about next steps together.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "severe",
    label: "Severe Social Anxiety",
    range: "68–83",
    headline: "Your responses suggest severe social anxiety.",
    description:
      "Many of these patterns clearly fit, at an intensity that probably shapes daily choices what events you attend, who you talk to, where you eat. This isn't a diagnosis, but it is a strong signal that a clinical assessment with someone who treats social anxiety would be valuable. Effective treatments exist, and earlier engagement tends to be easier.",
    badge: "badge-high",
    tone: "warning",
  },
  {
    id: "very-severe",
    label: "Very Severe Social Anxiety",
    range: "84–100",
    headline:
      "Your responses suggest very severe social anxiety.",
    description:
      "Almost every item on this screen felt familiar at a high intensity. That level of social discomfort deserves clinical attention talk to a mental health provider as soon as you reasonably can. Evidence-based treatments, especially CBT with exposure and, when appropriate, medication, work well for social anxiety disorder; you don't have to keep navigating it alone.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface SocialAnxietyResult {
  /** Sum of (possibly reverse-keyed) item scores, 20..100. */
  score: number;
  maxScore: number; // 100
  minScore: number; // 20
  /** (score - 20) / 80 in percent, 0..100. */
  percent: number;
  answered: number; // 0..20
  total: number; // 20
  tier: SocialAnxietyTier;
  /** True when score is at or above the moderate-tier cutoff (52). */
  positiveScreen: boolean;
  positiveScreenCutoff: number; // 52
}

export function computeSocialAnxietyScore(
  answers: SocialAnxietyAnswers,
): number {
  return questions.reduce((sum, q) => {
    const raw = answers[q.id];
    if (raw === undefined) return sum;
    const eff = q.reverse ? 6 - raw : raw;
    return sum + eff;
  }, 0);
}

export function getSocialAnxietyTier(score: number): SocialAnxietyTier {
  if (score <= 35) return SOCIAL_ANXIETY_TIERS[0];
  if (score <= 51) return SOCIAL_ANXIETY_TIERS[1];
  if (score <= 67) return SOCIAL_ANXIETY_TIERS[2];
  if (score <= 83) return SOCIAL_ANXIETY_TIERS[3];
  return SOCIAL_ANXIETY_TIERS[4];
}

export function socialAnxietyScoreBucket(score: number): string {
  if (score <= 35) return "20-35";
  if (score <= 51) return "36-51";
  if (score <= 67) return "52-67";
  if (score <= 83) return "68-83";
  return "84-100";
}

export function computeSocialAnxietyResult(
  answers: SocialAnxietyAnswers,
): SocialAnxietyResult {
  const score = computeSocialAnxietyScore(answers);
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  const range = SAT_MAX_SCORE - SAT_MIN_SCORE;
  const percent = Math.max(
    0,
    Math.min(100, Math.round(((score - SAT_MIN_SCORE) / range) * 100)),
  );

  return {
    score,
    maxScore: SAT_MAX_SCORE,
    minScore: SAT_MIN_SCORE,
    percent,
    answered,
    total: questions.length,
    tier: getSocialAnxietyTier(score),
    positiveScreen: score >= SAT_POSITIVE_SCREEN_CUTOFF,
    positiveScreenCutoff: SAT_POSITIVE_SCREEN_CUTOFF,
  };
}
