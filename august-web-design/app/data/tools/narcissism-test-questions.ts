export interface NarcissismOption {
  label: string;
  /** 1–5 Likert raw value (Strongly Disagree → Strongly Agree). */
  value: number;
}

export interface NarcissismQuestion {
  id: number;
  text: string;
  /**
   * When true, the response is scored as `6 - value` so that agreement with
   * counter-narcissistic statements doesn't inflate the score.
   */
  reverse: boolean;
}

export const LIKERT_OPTIONS: readonly NarcissismOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const questions: readonly NarcissismQuestion[] = [
  { id: 1, text: "I often fantasize about having unlimited success, power, or beauty.", reverse: false },
  { id: 2, text: "I deserve to be treated with the utmost respect and deference, regardless of the circumstances.", reverse: false },
  { id: 3, text: "I can’t stand it if another person is the center of attention.", reverse: false },
  { id: 4, text: "I don’t know if I’d make a good leader.", reverse: true },
  { id: 5, text: "I get angry when I don’t get what I want from others.", reverse: false },
  { id: 6, text: "I get annoyed if another person steals the show from me.", reverse: false },
  { id: 7, text: "It’s hard to show my vulnerabilities to others.", reverse: false },
  { id: 8, text: "I like to show off.", reverse: false },
  { id: 9, text: "I have a lot to learn from other people.", reverse: true },
  { id: 10, text: "I’m not satisfied until I get everything I deserve.", reverse: false },
  { id: 11, text: "I take pleasure in the failure of my rivals.", reverse: false },
  { id: 12, text: "I expect special treatment from others.", reverse: false },
  { id: 13, text: "I start to feel badly about myself when I go unnoticed.", reverse: false },
  { id: 14, text: "I think I’ll be famous someday.", reverse: false },
  { id: 15, text: "All I want is to be reasonably happy.", reverse: true },
  { id: 16, text: "I find it easy to manipulate people.", reverse: false },
  { id: 17, text: "I tend to disregard the feelings and needs of others.", reverse: false },
  { id: 18, text: "Having authority over others is important to me.", reverse: false },
  { id: 19, text: "When others get a sense of my true needs, I feel anxious and ashamed.", reverse: false },
  { id: 20, text: "If I ruled the world, it would be a better place.", reverse: false },
] as const;

export const totalQuestions = questions.length;
/** 20 items × 5 = 100, 20 items × 1 = 20. */
export const NARCISSISM_MAX_SCORE = totalQuestions * 5;
export const NARCISSISM_MIN_SCORE = totalQuestions * 1;
