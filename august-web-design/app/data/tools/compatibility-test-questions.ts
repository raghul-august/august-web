export interface CompatibilityOption {
  label: string;
  value: number;
}

export type CompatibilityDimensionId =
  | "communication"
  | "emotional"
  | "values"
  | "conflict"
  | "lifestyle";

export interface CompatibilityDimension {
  id: CompatibilityDimensionId;
  label: string;
  description: string;
}

export interface CompatibilityQuestion {
  id: number;
  dimension: CompatibilityDimensionId;
  text: string;
  /** When true, agreement counts as low-compatibility (reverse-scored). */
  reverse: boolean;
}

export const COMPATIBILITY_OPTIONS: readonly CompatibilityOption[] = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 },
] as const;

export const COMPATIBILITY_DIMENSIONS: readonly CompatibilityDimension[] = [
  {
    id: "communication",
    label: "Communication",
    description:
      "How safely and clearly you can talk about hard things together.",
  },
  {
    id: "emotional",
    label: "Emotional intimacy",
    description: "How close, safe, and known the two of you feel.",
  },
  {
    id: "values",
    label: "Shared values & goals",
    description: "How aligned your views, priorities, and futures are.",
  },
  {
    id: "conflict",
    label: "Conflict resolution",
    description: "How you fight, repair, and move on.",
  },
  {
    id: "lifestyle",
    label: "Lifestyle & rhythms",
    description: "How your days, energy, and routines fit together.",
  },
] as const;

export const questions: readonly CompatibilityQuestion[] = [
  {
    id: 1,
    dimension: "communication",
    text: "When something bothers me about my partner, I can bring it up without dreading it.",
    reverse: false,
  },
  {
    id: 2,
    dimension: "communication",
    text: "We talk about more than logistics — about what we feel, fear, or hope for.",
    reverse: false,
  },
  {
    id: 3,
    dimension: "communication",
    text: "I often hold back what I really think to keep the peace.",
    reverse: true,
  },
  {
    id: 4,
    dimension: "emotional",
    text: "I feel safe being vulnerable around my partner.",
    reverse: false,
  },
  {
    id: 5,
    dimension: "emotional",
    text: "We are each other's first call when something big happens — good or bad.",
    reverse: false,
  },
  {
    id: 6,
    dimension: "emotional",
    text: "There are sides of me my partner doesn't really know.",
    reverse: true,
  },
  {
    id: 7,
    dimension: "values",
    text: "Our visions for the next five to ten years line up.",
    reverse: false,
  },
  {
    id: 8,
    dimension: "values",
    text: "We agree on what a healthy relationship should look like.",
    reverse: false,
  },
  {
    id: 9,
    dimension: "values",
    text: "We disagree on big things like money, family, or how to spend our time.",
    reverse: true,
  },
  {
    id: 10,
    dimension: "conflict",
    text: "When we disagree, we listen as much as we argue.",
    reverse: false,
  },
  {
    id: 11,
    dimension: "conflict",
    text: "After a fight, we usually reconnect within a day.",
    reverse: false,
  },
  {
    id: 12,
    dimension: "conflict",
    text: "Old fights keep coming back even after we think they're resolved.",
    reverse: true,
  },
  {
    id: 13,
    dimension: "lifestyle",
    text: "Our daily rhythms — sleep, work, downtime — fit together well.",
    reverse: false,
  },
  {
    id: 14,
    dimension: "lifestyle",
    text: "We enjoy spending free time together without it feeling forced.",
    reverse: false,
  },
  {
    id: 15,
    dimension: "lifestyle",
    text: "The way each of us recharges (alone vs. social, slow vs. busy) clashes more than it fits.",
    reverse: true,
  },
];

export const totalQuestions = questions.length;
export const MIN_SCORE = totalQuestions * 1;
export const MAX_SCORE = totalQuestions * 5;
