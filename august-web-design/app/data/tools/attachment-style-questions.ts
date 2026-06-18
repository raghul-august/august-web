// Attachment Style Test — 30 Likert statements scored on two axes:
// anxiety and avoidance (Bartholomew & Horowitz 1991; Brennan, Clark &
// Shaver 1998 ECR-R framework). Each item loads onto one axis, with a
// `reverse` flag for items where agreement signals security on that axis.
// All prose is author-original.
//
// NO React, NO JSX in this file. Pure data + types.

export type AttachmentAxis = "anxiety" | "avoidance";

export interface LikertOption {
  label: string;
  /** Always 1–5. The scoring file inverts when item.reverse is true. */
  value: number;
}

export interface AttachmentQuestion {
  id: number;
  text: string;
  axis: AttachmentAxis;
  /**
   * When true, the item is phrased so that *agreement* signals secure (low
   * anxiety / low avoidance). Scoring reverses 1 ↔ 5, 2 ↔ 4.
   */
  reverse?: boolean;
}

export const LIKERT_OPTIONS: readonly LikertOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const MIN_LIKERT = 1;
export const MAX_LIKERT = 5;

/**
 * Items are interleaved across the two axes so the same theme doesn't appear
 * twice in a row. 15 anxiety items + 15 avoidance items = 30 total.
 */
export const questions: readonly AttachmentQuestion[] = [
  // Round 1
  {
    id: 1,
    text: "I worry that people I'm close to won't care about me as much as I care about them.",
    axis: "anxiety",
  },
  {
    id: 2,
    text: "I'm comfortable depending on the people I'm close to.",
    axis: "avoidance",
    reverse: true,
  },
  {
    id: 3,
    text: "I get anxious when the people closest to me feel distant for any reason.",
    axis: "anxiety",
  },
  {
    id: 4,
    text: "It's easy for me to be emotionally open with the people I love.",
    axis: "avoidance",
    reverse: true,
  },

  // Round 2
  {
    id: 5,
    text: "I often need a lot of reassurance that I'm loved.",
    axis: "anxiety",
  },
  {
    id: 6,
    text: "I prefer to handle things on my own rather than lean on someone else.",
    axis: "avoidance",
  },
  {
    id: 7,
    text: "When my partner is out of touch for a while, I start worrying that something is wrong between us.",
    axis: "anxiety",
  },
  {
    id: 8,
    text: "I find it hard to fully trust the people closest to me.",
    axis: "avoidance",
  },

  // Round 3
  {
    id: 9,
    text: "I sometimes feel like the people I love don't really want to get as close as I do.",
    axis: "anxiety",
  },
  {
    id: 10,
    text: "I'm comfortable having other people depend on me.",
    axis: "avoidance",
    reverse: true,
  },
  {
    id: 11,
    text: "I'm afraid I'll lose the love of someone I care about.",
    axis: "anxiety",
  },
  {
    id: 12,
    text: "I find it relatively easy to get close to other people.",
    axis: "avoidance",
    reverse: true,
  },

  // Round 4
  {
    id: 13,
    text: "Small signs of disinterest from a partner can ruin my whole day.",
    axis: "anxiety",
  },
  {
    id: 14,
    text: "I'd rather not share my deepest feelings with anyone — even people close to me.",
    axis: "avoidance",
  },
  {
    id: 15,
    text: "I sometimes feel angry or hurt for reasons I can't fully explain to my partner.",
    axis: "anxiety",
  },
  {
    id: 16,
    text: "I get uncomfortable when people want to be very emotionally close to me.",
    axis: "avoidance",
  },

  // Round 5
  {
    id: 17,
    text: "I worry a lot about whether my partner truly loves me.",
    axis: "anxiety",
  },
  {
    id: 18,
    text: "I find it easy to ask for help from the people closest to me when I need it.",
    axis: "avoidance",
    reverse: true,
  },
  {
    id: 19,
    text: "I tend to overanalyze what people say to me, looking for hidden meaning.",
    axis: "anxiety",
  },
  {
    id: 20,
    text: "I value my independence so much that closeness can start to feel suffocating.",
    axis: "avoidance",
  },

  // Round 6
  {
    id: 21,
    text: "I find myself getting jealous more easily than the people around me.",
    axis: "anxiety",
  },
  {
    id: 22,
    text: "I tend to pull back when someone starts to get really close to me.",
    axis: "avoidance",
  },
  {
    id: 23,
    text: "When a conflict starts, my first instinct is to fix it right away because I can't stand the uncertainty.",
    axis: "anxiety",
  },
  {
    id: 24,
    text: "I tell my partner just about everything that's going on inside me.",
    axis: "avoidance",
    reverse: true,
  },

  // Round 7
  {
    id: 25,
    text: "I sometimes feel I'd be better off if I needed people less.",
    axis: "anxiety",
  },
  {
    id: 26,
    text: "I prefer not to show people how I feel deep down.",
    axis: "avoidance",
  },
  {
    id: 27,
    text: "It bothers me when my partner spends too much time apart from me.",
    axis: "anxiety",
  },
  {
    id: 28,
    text: "I rarely turn to other people for emotional support.",
    axis: "avoidance",
  },

  // Round 8
  {
    id: 29,
    text: "I think about my relationship a lot — sometimes more than I'd like to.",
    axis: "anxiety",
  },
  {
    id: 30,
    text: "I prefer to keep my problems to myself rather than burden others with them.",
    axis: "avoidance",
  },
] as const;

export const TOTAL_QUESTIONS = questions.length; // 30
export const ANXIETY_ITEMS = questions.filter((q) => q.axis === "anxiety").length;
export const AVOIDANCE_ITEMS = questions.filter((q) => q.axis === "avoidance").length;
export const AXIS_MAX_RAW = ANXIETY_ITEMS * MAX_LIKERT; // 75 — both axes have 15 items
export const AXIS_MIN_RAW = ANXIETY_ITEMS * MIN_LIKERT; // 15

/**
 * The threshold the per-axis score must cross to count as "high" on that axis.
 * We chose the midpoint of the per-item Likert range (3.0), expressed as a
 * total — i.e. >= 45 out of 75 on a 15-item axis.
 */
export const AXIS_HIGH_THRESHOLD = ANXIETY_ITEMS * 3; // 45
