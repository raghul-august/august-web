export interface LonelinessOption {
  label: string;
  /** 1–5 Likert raw value. */
  value: number;
}

export interface LonelinessQuestion {
  id: number;
  text: string;
  /**
   * When true, the response is scored as `6 - value` so agreement with a
   * counter-trait statement does not inflate the score.
   */
  reverse: boolean;
}

export const LIKERT_OPTIONS: readonly LonelinessOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const questions: readonly LonelinessQuestion[] = [
  { id: 1, text: "Most of my relationships feel very surface-level.", reverse: false },
  { id: 2, text: "The people I spend most of my time with (friends, family, coworkers, etc.) value my presence.", reverse: true },
  { id: 3, text: "Even when I’m surrounded by people, I usually feel disconnected from them.", reverse: false },
  { id: 4, text: "There’s no one in my life whom I can really count on.", reverse: false },
  { id: 5, text: "I often feel invisible.", reverse: false },
  { id: 6, text: "My ideas and interests are usually misunderstood by other people.", reverse: false },
  { id: 7, text: "I spend more time alone than I would like.", reverse: false },
  { id: 8, text: "I feel disconnected from the community in which I live.", reverse: false },
  { id: 9, text: "When I’m going through a hard time, I’m able to find support from others.", reverse: true },
  { id: 10, text: "I usually feel like I’m on the outside looking in.", reverse: false },
  { id: 11, text: "My circle of friends feels too limited.", reverse: false },
  { id: 12, text: "I miss the feeling of truly being in tune with others.", reverse: false },
  { id: 13, text: "I often find myself wishing I had someone to share my true self with.", reverse: false },
  { id: 14, text: "The only person I can count on is myself.", reverse: false },
  { id: 15, text: "There are people in my life who really know me.", reverse: true },
  { id: 16, text: "My relationships are unsatisfying overall.", reverse: false },
  { id: 17, text: "I have no one with whom I can share my ideas.", reverse: false },
  { id: 18, text: "Most days, I feel left out.", reverse: false },
  { id: 19, text: "I wish I could depend more on the people around me.", reverse: false },
  { id: 20, text: "I feel like I’m part of a group.", reverse: true },
] as const;

export const totalQuestions = questions.length;
/** 20 items × 5 = 100, 20 items × 1 = 20. */
export const LONELINESS_MAX_SCORE = totalQuestions * 5;
export const LONELINESS_MIN_SCORE = totalQuestions * 1;
