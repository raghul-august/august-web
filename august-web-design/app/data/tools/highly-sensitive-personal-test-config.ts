export interface HighlySensitiveTier {
  id: "very-low" | "low" | "moderate" | "elevated" | "high";
  label: string;
  /** Inclusive lower bound on the 20–100 raw score. */
  min: number;
  /** Inclusive upper bound on the 20–100 raw score. */
  max: number;
  range: string;
  headline: string;
  description: string;
  badge:
    | "badge-pure"
    | "badge-low"
    | "badge-moderate"
    | "badge-significant"
    | "badge-high";
}

/** Ordered low → high so lookups walk the array once. */
export const HIGHLY_SENSITIVE_TIERS: readonly HighlySensitiveTier[] = [
  {
    id: "very-low",
    label: "Not particularly sensitive",
    min: 20,
    max: 35,
    range: "20–35",
    headline: "Your answers point away from HSP traits.",
    description:
      "You scored well below the midpoint on the HSP-themed items. The picture is one of resilience to noise, light, busy environments, and big emotional inputs — not the same as being unfeeling, just less easily overstimulated.",
    badge: "badge-pure",
  },
  {
    id: "low",
    label: "Mildly sensitive",
    min: 36,
    max: 51,
    range: "36–51",
    headline: "You show mild sensory-processing sensitivity.",
    description:
      "Some items rang true — maybe a need to retreat after busy days, or strong reactions to art and music — but the overall pattern doesn't fit the HSP profile. You're well within average range on sensitivity.",
    badge: "badge-low",
  },
  {
    id: "moderate",
    label: "Moderately sensitive",
    min: 52,
    max: 67,
    range: "52–67",
    headline: "You show moderate sensory-processing sensitivity.",
    description:
      "Around half of the HSP items felt true. You probably notice subtleties others miss, get overstimulated more easily than average, and need solo recharge time — but not to the intensity that fully defines an HSP.",
    badge: "badge-moderate",
  },
  {
    id: "elevated",
    label: "Highly sensitive",
    min: 68,
    max: 83,
    range: "68–83",
    headline: "You fit the HSP profile.",
    description:
      "Most of the items rang true — easily overwhelmed by sensory input, deeply moved by art and music, attuned to others' moods, needing quiet time to recover. Elaine Aron estimates 15–20% of people are HSPs. You appear to be one of them.",
    badge: "badge-significant",
  },
  {
    id: "high",
    label: "Strongly highly sensitive",
    min: 84,
    max: 100,
    range: "84–100",
    headline: "You fit the HSP profile strongly.",
    description:
      "Nearly every item rang true at high intensity — your nervous system processes input more deeply and reacts more strongly than most. This is not a problem to fix — it's a temperament with real upsides (depth, empathy, creativity) and real costs (overstimulation, fatigue). Knowing about it changes how you design your life.",
    badge: "badge-high",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "What is a Highly Sensitive Person (HSP)?",
    a: "An HSP is someone whose nervous system processes sensory and emotional information more deeply than average. The trait, called sensory-processing sensitivity (SPS), was named and operationalised by psychologist Dr. Elaine Aron in the 1990s. About 15–20% of people qualify as HSPs.",
  },
  {
    q: "Is being highly sensitive a disorder?",
    a: "No. SPS is a temperament trait — not a diagnosis, not pathology, and not something to cure. It overlaps with introversion but is distinct: many HSPs are extroverts. Aron's work emphasises that HSPs are a normal variant, not a 'broken' version of non-HSPs.",
  },
  {
    q: "How is the score calculated?",
    a: "Each of the 20 statements is rated 1–5 (Disagree → Agree). Three items are reverse-keyed (where agreeing means lower sensitivity). Your total falls between 20 and 100 and is banded into 5 tiers from 'Not particularly sensitive' to 'Strongly highly sensitive'.",
  },
  {
    q: "What if my score is high?",
    a: "If you fit the HSP profile, the most useful next step is to learn how to design your life around it — building in solo recharge time, limiting overstimulation, and noticing that intense reactions are information, not a flaw. Elaine Aron's book 'The Highly Sensitive Person' is the canonical reference.",
  },
  {
    q: "Can highly sensitive people change?",
    a: "The underlying trait is biologically rooted and stable, but how it shows up is highly modifiable. Many HSPs find that with self-knowledge, boundaries, and the right environment, what felt like a weakness becomes a strength.",
  },
  {
    q: "Sources",
    a: "Items are adapted from Psychology Today's HSP Test (psychologytoday.com) and modelled on Dr. Elaine Aron's Highly Sensitive Person Scale (HSPS, 1997).",
  },
] as const;

export const HOW_STEPS = [
  {
    label: "Read each statement",
    text: "20 short statements drawn from clinical and research instruments on this topic, presented one at a time.",
  },
  {
    label: "Rate your agreement",
    text: "Tap how strongly you agree, from Strongly Disagree to Strongly Agree. The next question appears automatically.",
  },
  {
    label: "See your tier",
    text: "Your responses are scored into a 5-tier banding so you know where on the spectrum you land.",
  },
] as const;

export const EXPECTATIONS = [
  {
    bold: "20 short questions",
    rest: "rated on a 5-point Disagree → Agree scale, one tap per item.",
  },
  {
    bold: "~3 minutes",
    rest: "to complete, totally anonymous, no answer leaves your browser.",
  },
  {
    bold: "Clinically grounded",
    rest: ", every item is adapted from published clinical or research instruments.",
  },
] as const;
