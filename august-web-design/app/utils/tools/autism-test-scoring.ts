import {
  AUTISM_OPTIONS,
  MAX_SCORE,
  MIN_SCORE,
  questions,
  REFERRAL_CUTOFF,
} from "@/app/data/tools/autism-test-questions";

export type AutismAnswers = Record<number, number>;

export interface AutismTier {
  id: "very-low" | "some" | "elevated" | "high";
  label: string;
  range: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export const AUTISM_TIERS: readonly AutismTier[] = [
  {
    id: "very-low",
    label: "Very few autistic traits",
    range: "0–2",
    headline:
      "Your answers show very few of the traits this screener looks for",
    description:
      "On the AQ-10, scores in this range are typical of the non-autistic population (the average in validation studies sits around 2). Sensory sensitivity, social-cognition difficulty, and a pull toward systemizing are not strongly endorsed in what you described.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "some",
    label: "Some autistic traits",
    range: "3–5",
    headline:
      "Your answers show a handful of traits this screener looks for — but below the screening cut-off",
    description:
      "Many non-autistic people relate to a few items on the AQ-10 without meeting criteria for autism. If specific patterns you recognised here : sensory sensitivity, social fatigue, difficulty switching attention are interfering with daily life, that is still worth talking to a professional about regardless of the screening cut-off.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  {
    id: "elevated",
    label: "Above the screening threshold",
    range: "6–7",
    headline:
      "Your score is at or above the AQ-10 referral threshold (6+)",
    description:
      "In the validation studies, around 80% of adults who scored 6 or more went on to be diagnosed with autism. This isn't a diagnosis, it's a signal that a full assessment with a clinician trained in adult autism is likely worth your time. Bring this score with you; it's exactly the kind of evidence GPs use to make a referral.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "high",
    label: "Strong endorsement of autistic traits",
    range: "8–10",
    headline:
      "Your answers strongly align with the patterns the AQ-10 screens for",
    description:
      "You endorsed almost every item in the autism-direction. The AQ-10 isn't diagnostic on its own, but a score this high is the clearest possible nudge to seek a formal evaluation. Many adults who score in this range describe a profound 'finally this explains it' feeling on diagnosis; many also score this high while having lived without diagnosis for decades.",
    badge: "badge-high",
    tone: "warning",
  },
];

export interface AutismResult {
  score: number;
  minScore: number;
  maxScore: number;
  percent: number;
  answered: number;
  total: number;
  tier: AutismTier;
  meetsReferralCutoff: boolean;
  /** Items the respondent answered in the autism-direction. */
  endorsedItems: { id: number; text: string; answerLabel: string }[];
}

export function scoreItem(questionId: number, chosenValue: number): number {
  if (!chosenValue) return 0;
  const q = questions.find((x) => x.id === questionId);
  if (!q) return 0;
  const option = AUTISM_OPTIONS.find((o) => o.value === chosenValue);
  if (!option) return 0;
  return option.isAgree === q.scoreOnAgree ? 1 : 0;
}

export function computeScore(answers: AutismAnswers): number {
  return Object.entries(answers).reduce((sum, [id, value]) => {
    return sum + scoreItem(Number(id), value ?? 0);
  }, 0);
}

export function getAutismTier(score: number): AutismTier {
  if (score <= 2) return AUTISM_TIERS[0];
  if (score <= 5) return AUTISM_TIERS[1];
  if (score <= 7) return AUTISM_TIERS[2];
  return AUTISM_TIERS[3];
}

export function computeAutismResult(answers: AutismAnswers): AutismResult {
  const score = computeScore(answers);
  const tier = getAutismTier(score);
  const answered = Object.keys(answers).length;
  const range = MAX_SCORE - MIN_SCORE;
  const percent =
    range > 0 ? Math.round(((score - MIN_SCORE) / range) * 100) : 0;

  const endorsedItems = questions
    .map((q) => {
      const chosen = answers[q.id];
      const point = scoreItem(q.id, chosen ?? 0);
      const option = AUTISM_OPTIONS.find((o) => o.value === chosen);
      return {
        id: q.id,
        text: q.text,
        answerLabel: option?.label ?? "",
        scored: point === 1,
      };
    })
    .filter((row) => row.scored)
    .map(({ id, text, answerLabel }) => ({ id, text, answerLabel }));

  return {
    score,
    minScore: MIN_SCORE,
    maxScore: MAX_SCORE,
    percent,
    answered,
    total: questions.length,
    tier,
    meetsReferralCutoff: score >= REFERRAL_CUTOFF,
    endorsedItems,
  };
}

export function autismScoreBucket(score: number): string {
  if (score <= 2) return "0-2";
  if (score <= 5) return "3-5";
  if (score <= 7) return "6-7";
  return "8-10";
}
