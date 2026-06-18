export interface SelfEsteemOption {
  label: string;
  /** 1–5 Likert raw value (Strongly Disagree → Strongly Agree). */
  value: number;
}

export interface SelfEsteemQuestion {
  id: number;
  text: string;
  /**
   * When true, the item is a *negative* self-statement (e.g. "I brood over
   * my flaws"). Agreeing with these should *lower* the self-esteem score,
   * so we apply `6 - raw` before summing.
   */
  reverse: boolean;
}

export const LIKERT_OPTIONS: readonly SelfEsteemOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const questions: readonly SelfEsteemQuestion[] = [
  { id: 1, text: "I have good qualities.", reverse: false },
  { id: 2, text: "I am ashamed of myself when I receive critical feedback.", reverse: true },
  { id: 3, text: "I feel worthy, just like other people.", reverse: false },
  { id: 4, text: "Failure is just part of life.", reverse: false },
  { id: 5, text: "Feeling blue is part of being human.", reverse: false },
  { id: 6, text: "I ruminate about all the things that are wrong in my life.", reverse: true },
  { id: 7, text: "I brood over my flaws.", reverse: true },
  { id: 8, text: "I think positively about myself.", reverse: false },
  { id: 9, text: "I avoid beating myself up. I have self-compassion.", reverse: false },
  { id: 10, text: "I know how to say “no.” Giving too much of myself does no one any good.", reverse: false },
  { id: 11, text: "I avoid being judgmental about myself.", reverse: false },
  { id: 12, text: "I make good decisions.", reverse: false },
  { id: 13, text: "I like who I am.", reverse: false },
  { id: 14, text: "I wish I could be more confident, just like other people.", reverse: true },
  { id: 15, text: "I wonder what people are thinking about me, I know it is negative.", reverse: true },
  { id: 16, text: "I feel attractive much of the time.", reverse: false },
  { id: 17, text: "I shut down because I am not worthy when I feel bad.", reverse: true },
  { id: 18, text: "I am mostly satisfied with myself.", reverse: false },
  { id: 19, text: "I welcome a challenge, I become more single-minded about succeeding.", reverse: false },
  { id: 20, text: "I am effective, not inferior.", reverse: false },
] as const;

export const totalQuestions = questions.length;
export const SELF_ESTEEM_MAX_SCORE = totalQuestions * 5; // 100
export const SELF_ESTEEM_MIN_SCORE = totalQuestions * 1; // 20
