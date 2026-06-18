export interface EmotionalAvailabilityTier {
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
export const EMOTIONAL_AVAILABILITY_TIERS: readonly EmotionalAvailabilityTier[] = [
  {
    id: "very-low",
    label: "Highly emotionally available",
    min: 20,
    max: 35,
    range: "20–35",
    headline: "Your answers point to high emotional availability.",
    description:
      "You answered with a strong willingness to share feelings, sit with conflict, and lean into intimacy. The picture is one of openness — partners likely experience you as engaged, attentive, and easy to reach.",
    badge: "badge-pure",
  },
  {
    id: "low",
    label: "Mostly emotionally available",
    min: 36,
    max: 51,
    range: "36–51",
    headline: "Your answers point to mostly available patterns.",
    description:
      "Most of the items pointing to closeness rang true, with the occasional impulse to retreat or shut down. This is the band where most warm, healthy partners sit — willing to engage, with normal limits.",
    badge: "badge-low",
  },
  {
    id: "moderate",
    label: "Mixed — some availability, some distance",
    min: 52,
    max: 67,
    range: "52–67",
    headline: "Your answers show a mix of openness and avoidance.",
    description:
      "Some items signalling closeness rang true, but a meaningful cluster pointing toward distance or self-protection did too. This isn't a problem on its own — it often signals that intimacy works better with some people than others, or in some seasons than others.",
    badge: "badge-moderate",
  },
  {
    id: "elevated",
    label: "Notably guarded",
    min: 68,
    max: 83,
    range: "68–83",
    headline: "Your answers show notably guarded patterns.",
    description:
      "Most of the avoidance-themed statements felt true — preferring distance during conflict, downplaying feelings, deflecting deep talks. This doesn't make you a bad partner, but it can make partners feel like they're working harder than you to stay close. A therapist (especially one familiar with attachment work) can help.",
    badge: "badge-significant",
  },
  {
    id: "high",
    label: "Significantly emotionally unavailable",
    min: 84,
    max: 100,
    range: "84–100",
    headline: "Your answers align strongly with emotional unavailability.",
    description:
      "You endorsed nearly every avoidance-themed item — discomfort with vulnerability, distancing during conflict, difficulty receiving emotional bids. People who score here often describe feeling 'shut down' in love, and partners frequently feel lonely beside them. Attachment-focused therapy has real evidence behind it.",
    badge: "badge-high",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "What does 'emotional availability' actually mean?",
    a: "Emotional availability is the willingness and ability to share your feelings and stay present with someone else's. It's the day-to-day capacity to lean in during a hard conversation, hold someone else's mood without bolting, and let yourself be seen instead of performing.",
  },
  {
    q: "Is this a diagnosis?",
    a: "No. Emotional availability is a relationship pattern, not a disorder. There's no diagnostic code for being 'unavailable' — this screener describes a tendency, not a clinical condition.",
  },
  {
    q: "How is the score calculated?",
    a: "Each of the 20 statements is rated 1–5 (Strongly Disagree → Strongly Agree). A couple of items are reverse-keyed so agreement with openness statements doesn't inflate the score. Higher totals point to more guarded patterns; lower totals to more open ones.",
  },
  {
    q: "Can emotional availability change?",
    a: "Yes — meaningfully. Most patterns here have roots in early attachment, but they aren't fixed. Therapy (especially emotion-focused or attachment-based), a secure partner, and intentional practice can all shift where you sit on the scale.",
  },
  {
    q: "What should I do if my score is high?",
    a: "If the description fits and you'd like more closeness than you currently experience, talking to a therapist is a useful next step. Attachment-based and emotion-focused therapies have evidence for exactly this kind of pattern. You can also chat with August in this page to think it through without committing to anything.",
  },
  {
    q: "Sources",
    a: "Items are adapted from Psychology Today's Emotional Availability Test (psychologytoday.com) and align with the literature on adult attachment styles (Hazan & Shaver), emotional availability (Biringen), and avoidant attachment patterns.",
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
