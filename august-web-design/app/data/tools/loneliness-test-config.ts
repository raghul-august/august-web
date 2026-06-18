export interface LonelinessTier {
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
export const LONELINESS_TIERS: readonly LonelinessTier[] = [
  {
    id: "very-low",
    label: "Well connected",
    min: 20,
    max: 35,
    range: "20–35",
    headline: "Your answers point to strong social connectedness.",
    description:
      "You scored well below the midpoint on the loneliness items. The picture is one of people in your life who really know you, a sense of belonging in your community, and reliable support when life gets hard. Loneliness isn't your everyday experience.",
    badge: "badge-pure",
  },
  {
    id: "low",
    label: "Occasionally lonely",
    min: 36,
    max: 51,
    range: "36–51",
    headline: "You experience occasional loneliness.",
    description:
      "A handful of items rang true moments of feeling disconnected, wishing for more depth in your relationships but the overall pattern is one of meaningful connection. This is the band most people sit in.",
    badge: "badge-low",
  },
  {
    id: "moderate",
    label: "Moderately lonely",
    min: 52,
    max: 67,
    range: "52–67",
    headline: "Your answers show moderate loneliness.",
    description:
      "You endorsed enough loneliness-themed items to suggest a persistent thread of disconnection even if you have people around you. This is more common than it feels (research finds a third of adults regularly feel lonely) and it responds well to focused effort on depth, not just frequency, of contact.",
    badge: "badge-moderate",
  },
  {
    id: "elevated",
    label: "Notably lonely",
    min: 68,
    max: 83,
    range: "68–83",
    headline: "Your answers show notably elevated loneliness.",
    description:
      "Most of the items rang true — feeling unseen, missing being in tune with others, lacking people you can rely on for the real stuff. Loneliness at this level is associated with measurable effects on sleep, immunity, and mood. It's worth taking seriously.",
    badge: "badge-significant",
  },
  {
    id: "high",
    label: "Profoundly lonely",
    min: 84,
    max: 100,
    range: "84–100",
    headline: "Your answers align with profound loneliness.",
    description:
      "You endorsed nearly every item at high intensity feeling invisible, disconnected even when surrounded by people, with no one you can truly rely on. This level of loneliness often co-occurs with depression and has documented health effects comparable to smoking. Please talk to someone a friend, a clinician, a helpline.",
    badge: "badge-high",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "Is loneliness the same as being alone?",
    a: "No. Loneliness is the felt gap between the connection you want and the connection you have. People can be alone without being lonely, and people can be lonely in a crowded room or a long marriage. This test measures the felt experience, not the headcount.",
  },
  {
    q: "Is loneliness a mental illness?",
    a: "No. Loneliness is a normal human experience every adult feels it sometimes. But chronic, unrelenting loneliness has real health consequences (higher risk of depression, anxiety, cardiovascular disease, and earlier mortality) and is increasingly treated as a public health issue.",
  },
  {
    q: "How is the score calculated?",
    a: "Each of the 20 statements is rated 1–5 (Strongly Disagree → Strongly Agree). Three items are reverse-keyed (statements about feeling valued, supported, or known). Your total falls between 20 and 100 and is banded into 5 tiers from 'Well connected' to 'Profoundly lonely'.",
  },
  {
    q: "What helps with loneliness?",
    a: "Counter-intuitively, the most effective interventions aren't 'more people, more often.' They're usually about increasing the depth and frequency of contact with people who already feel safe, reducing maladaptive social cognition (assuming others don't want you), and addressing co-occurring depression or anxiety when present.",
  },
  {
    q: "What should I do if my score is high?",
    a: "Take it as a signal worth acting on, not a permanent label. Talking to a clinician especially if depression is also in the picture — is the highest-leverage step. You can also chat with August in this page to talk through what you're experiencing in a low-stakes way.",
  },
  {
    q: "Sources",
    a: "Items are adapted from Psychology Today's Loneliness Test (psychologytoday.com) and align thematically with the UCLA Loneliness Scale (Russell, 1996), one of the most widely used instruments in loneliness research.",
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
    rest: "rated on a 5-point Strongly Disagree → Strongly Agree scale, one tap per item.",
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
