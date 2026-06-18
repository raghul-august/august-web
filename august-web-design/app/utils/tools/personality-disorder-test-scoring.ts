import {
  BPD_ITEM_COUNT,
  BPD_MAX_SCORE,
  FUNCTIONAL_OPTIONS,
  questions,
} from "@/app/data/tools/personality-disorder-test-questions";

export type PersonalityDisorderAnswers = Record<number, number>;

export type PersonalityDisorderTierId =
  | "minimal"
  | "mild"
  | "moderate"
  | "elevated"
  | "severe";

export interface PersonalityDisorderTier {
  id: PersonalityDisorderTierId;
  /** Heading used on the results page (title case). */
  label: string;
  /** Score range shown in the "About your score" disclosure. */
  range: string;
  /** One-sentence summary shown directly under the score. */
  headline: string;
  /** Two- to three-sentence narrative shown beneath the headline. */
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export const PERSONALITY_DISORDER_TIERS: readonly PersonalityDisorderTier[] = [
  {
    id: "minimal",
    label: "Few BPD Traits",
    range: "0–9",
    headline:
      "Your responses show very few of the patterns associated with BPD.",
    description:
      "Your answers point to a fairly stable sense of self, manageable mood shifts, and steady close relationships. Borderline personality patterns are unlikely to be the right frame for what you're working through right now.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "mild",
    label: "Some BPD Traits",
    range: "10–18",
    headline:
      "Your responses show a handful of traits associated with BPD.",
    description:
      "You recognise yourself in a few of the statements, maybe occasional intense mood swings, fears of being left behind, or impulsive moments. Many people experience these without meeting BPD criteria. If they keep recurring or get heavier, talking to a therapist can clarify what's going on.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "moderate",
    label: "Moderate BPD Traits",
    range: "19–27",
    headline:
      "Your responses include several traits associated with BPD.",
    description:
      "A meaningful share of the statements feel familiar. This is not a diagnosis, but it's a reasonable point to share these results with a mental health provider — especially if the patterns are interfering with relationships, work, or how you feel about yourself.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "elevated",
    label: "Many BPD Traits",
    range: "28–36",
    headline:
      "Your responses show a strong overlap with patterns associated with BPD.",
    description:
      "Most of the statements feel familiar — abandonment fears, relationships that swing between idealising and disappointing, unstable self-image, impulsive moments. A clinical evaluation can determine whether this is BPD, a related condition, or something else, and what would actually help.",
    badge: "badge-high",
    tone: "warning",
  },
  {
    id: "severe",
    label: "Strong Overlap with BPD",
    range: "37–45",
    headline:
      "Your responses align very strongly with patterns associated with BPD.",
    description:
      "You endorsed nearly every statement on this self-screen at a high intensity. This doesn't diagnose anything on its own, but the experiences you described are real, intense, and worth taking to a clinician. BPD is one of the most treatable serious mental health conditions — DBT, MBT, and schema therapy all have strong evidence — and the first step is a real evaluation.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface PersonalityDisorderResult {
  /** Sum of the 15 BPD items (Q1–Q15), 0–45. Q16 functional impact is not included. */
  score: number;
  maxScore: number; // 45
  percent: number; // 0..100 (score / maxScore)
  answered: number; // BPD items answered
  totalBpd: number; // 15
  tier: PersonalityDisorderTier;
  /** True when Q8 (self-harm/suicidality) > 0. Triggers the crisis card. */
  showSelfHarmWarning: boolean;
  /** Label for the Q16 functional-impairment anchor, if answered. */
  functionalLabel: string | null;
  /** Raw self-harm item value, for analytics + UI. */
  selfHarmValue: number;
}

const SELF_HARM_ITEM_ID = 8;
const FUNCTIONAL_ITEM_ID = 16;

export function computeBpdScore(answers: PersonalityDisorderAnswers): number {
  return questions
    .filter((q) => q.scoring === "bpd")
    .reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
}

export function getPersonalityDisorderTier(
  score: number,
): PersonalityDisorderTier {
  if (score <= 9) return PERSONALITY_DISORDER_TIERS[0];
  if (score <= 18) return PERSONALITY_DISORDER_TIERS[1];
  if (score <= 27) return PERSONALITY_DISORDER_TIERS[2];
  if (score <= 36) return PERSONALITY_DISORDER_TIERS[3];
  return PERSONALITY_DISORDER_TIERS[4];
}

export function personalityDisorderScoreBucket(score: number): string {
  if (score <= 9) return "0-9";
  if (score <= 18) return "10-18";
  if (score <= 27) return "19-27";
  if (score <= 36) return "28-36";
  return "37-45";
}

export function computePersonalityDisorderResult(
  answers: PersonalityDisorderAnswers,
): PersonalityDisorderResult {
  const score = computeBpdScore(answers);
  const selfHarmValue = answers[SELF_HARM_ITEM_ID] ?? 0;
  const functionalValue = answers[FUNCTIONAL_ITEM_ID];
  const functionalLabel =
    functionalValue === undefined
      ? null
      : FUNCTIONAL_OPTIONS.find((o) => o.value === functionalValue)?.label ??
        null;
  const answered = questions
    .filter((q) => q.scoring === "bpd")
    .reduce((n, q) => (answers[q.id] !== undefined ? n + 1 : n), 0);

  return {
    score,
    maxScore: BPD_MAX_SCORE,
    percent: Math.round((score / BPD_MAX_SCORE) * 100),
    answered,
    totalBpd: BPD_ITEM_COUNT,
    tier: getPersonalityDisorderTier(score),
    showSelfHarmWarning: selfHarmValue > 0,
    functionalLabel,
    selfHarmValue,
  };
}
