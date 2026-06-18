// Spectrum-based sexual orientation self-reflection quiz.
// Each question rates a single dimension on a 5-point Likert agreement scale.
// Answer values: 0 (Strongly disagree) → 4 (Strongly agree).
// 12 questions across 4 dimensions: 4 same-gender, 4 different-gender,
// 2 asexual spectrum, 2 multi-gender.

export type Dimension =
  | "same-gender"
  | "different-gender"
  | "asexual"
  | "multi-gender";

export type AttractionType = "sexual" | "romantic" | null;

export interface OrientationOption {
  label: string;
  value: number;
}

export interface OrientationQuestion {
  id: number;
  text: string;
  dimension: Dimension;
  attractionType: AttractionType;
  helper?: { title: string; body: string };
}

export const likertOptions: OrientationOption[] = [
  { label: "Strongly disagree", value: 0 },
  { label: "Disagree", value: 1 },
  { label: "Neutral", value: 2 },
  { label: "Agree", value: 3 },
  { label: "Strongly agree", value: 4 },
];

export const orientationQuestions: OrientationQuestion[] = [
  {
    id: 1,
    text: "I feel sexually attracted to people of the same gender as me.",
    dimension: "same-gender",
    attractionType: "sexual",
  },
  {
    id: 2,
    text: "I feel sexually attracted to people of a different gender from me.",
    dimension: "different-gender",
    attractionType: "sexual",
  },
  {
    id: 3,
    text: "My sexual fantasies include people of the same gender.",
    dimension: "same-gender",
    attractionType: "sexual",
  },
  {
    id: 4,
    text: "My sexual fantasies include people of a different gender.",
    dimension: "different-gender",
    attractionType: "sexual",
  },
  {
    id: 5,
    text: "I can picture myself falling in love with someone of the same gender.",
    dimension: "same-gender",
    attractionType: "romantic",
  },
  {
    id: 6,
    text: "I can picture myself falling in love with someone of a different gender.",
    dimension: "different-gender",
    attractionType: "romantic",
  },
  {
    id: 7,
    text: "I imagine building a long-term relationship with someone of the same gender.",
    dimension: "same-gender",
    attractionType: "romantic",
  },
  {
    id: 8,
    text: "I imagine building a long-term relationship with someone of a different gender.",
    dimension: "different-gender",
    attractionType: "romantic",
  },
  {
    id: 9,
    text: "I rarely experience sexual attraction toward others.",
    dimension: "asexual",
    attractionType: null,
    helper: {
      title: "Asexual spectrum",
      body: "Some people feel little or no sexual attraction to others. That's the asexual spectrum, and it includes asexual, graysexual, and other identities where sex sits in the background.",
    },
  },
  {
    id: 10,
    text: "I value emotional connection before I can feel sexual attraction.",
    dimension: "asexual",
    attractionType: null,
    helper: {
      title: "Demisexual lean",
      body: "Demisexuality means feeling sexual attraction only after a strong emotional bond. It's a real position on the asexual spectrum, not a personality preference.",
    },
  },
  {
    id: 11,
    text: "When I'm drawn to someone, gender feels secondary to who they are.",
    dimension: "multi-gender",
    attractionType: null,
    helper: {
      title: "Pansexual lean",
      body: "Pansexuality describes attraction that doesn't filter heavily by gender. It's distinct from bisexuality but overlaps in practice for many people.",
    },
  },
  {
    id: 12,
    text: "My attractions have shifted or expanded over time.",
    dimension: "multi-gender",
    attractionType: null,
    helper: {
      title: "Fluidity",
      body: "Orientation can change across a lifetime. A shift doesn't mean an earlier identity was wrong — it often just means more of yourself has come into view.",
    },
  },
];

export const totalQuestions = orientationQuestions.length;
