export interface PsychopathyOption {
  label: string;
  /** 1–5 Likert raw value (Strongly Disagree → Strongly Agree). */
  value: number;
}

export interface PsychopathyQuestion {
  id: number;
  text: string;
  /**
   * When true, the statement is *empathic / conscientious*. Agreeing with it
   * should *lower* the psychopathy score, so we apply `6 - raw` before summing.
   */
  reverse: boolean;
}

export const LIKERT_OPTIONS: readonly PsychopathyOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const questions: readonly PsychopathyQuestion[] = [
  { id: 1, text: "I’ve always found it easy to convince people to do favors for me.", reverse: false },
  { id: 2, text: "When I know someone is struggling, I think of them often and hope they’re doing OK.", reverse: true },
  { id: 3, text: "Other people make so many stupid mistakes compared to me.", reverse: false },
  { id: 4, text: "I don’t see a problem with lying if it helps me get what I want.", reverse: false },
  { id: 5, text: "If someone told me that I hurt their feelings, I would feel badly.", reverse: true },
  { id: 6, text: "In truth, I find most people boring or stupid.", reverse: false },
  { id: 7, text: "People often blame me for things that are actually their fault.", reverse: false },
  { id: 8, text: "People who refuse to break rules out of principle are foolish; they’ll never get ahead.", reverse: false },
  { id: 9, text: "Seeing someone cry has little effect on me, other than maybe irritating me.", reverse: false },
  { id: 10, text: "It's fun to antagonize people just to see how upset they get.", reverse: false },
  { id: 11, text: "I get uncomfortable at the thought of committing a crime.", reverse: true },
  { id: 12, text: "I usually know just what to say to make other people do what I want.", reverse: false },
  { id: 13, text: "I'll do whatever it takes to feel a thrill.", reverse: false },
  { id: 14, text: "It is important to honor financial obligations.", reverse: true },
  { id: 15, text: "Everyone else seems emotional and whiny compared to me.", reverse: false },
  { id: 16, text: "Helping other people instead of focusing on myself is usually a waste of time.", reverse: false },
  { id: 17, text: "I don’t understand people who are anxious or fearful all the time because nothing really scares me.", reverse: false },
  { id: 18, text: "Some people just aren’t meant to succeed in life, and that’s not my problem.", reverse: false },
  { id: 19, text: "I wear my heart on my sleeve.", reverse: true },
  { id: 20, text: "If a rule or law would get in the way of my goals, I feel justified in breaking it.", reverse: false },
] as const;

export const totalQuestions = questions.length;
export const PSYCHOPATHY_MAX_SCORE = totalQuestions * 5; // 100
export const PSYCHOPATHY_MIN_SCORE = totalQuestions * 1; // 20
