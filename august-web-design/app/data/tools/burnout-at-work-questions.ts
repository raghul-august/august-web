export interface BurnoutOption {
  label: string;
  /** 1–5 Likert raw value. */
  value: number;
}

export interface BurnoutQuestion {
  id: number;
  text: string;
  /**
   * When true, the response is scored as `6 - value` so agreement with a
   * counter-trait statement does not inflate the score.
   */
  reverse: boolean;
}

export const LIKERT_OPTIONS: readonly BurnoutOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const questions: readonly BurnoutQuestion[] = [
  { id: 1, text: "I dread going to work each day.", reverse: false },
  { id: 2, text: "I often don’t really care what happens to my colleagues or customers.", reverse: false },
  { id: 3, text: "I feel dissatisfied with my job more often than not.", reverse: false },
  { id: 4, text: "Starting a new project often feels pointless.", reverse: false },
  { id: 5, text: "No matter how hard I work, I don’t feel appreciated.", reverse: false },
  { id: 6, text: "Having to interact with people at my job just feels like a burden.", reverse: false },
  { id: 7, text: "The work I do makes a real difference in the world.", reverse: true },
  { id: 8, text: "Even \"normal\" workdays leave me feeling completely mentally drained.", reverse: false },
  { id: 9, text: "I’m proud of what I’ve accomplished over the course of my career.", reverse: true },
  { id: 10, text: "Even when work is tough, I’m able to stay upbeat.", reverse: true },
  { id: 11, text: "I often feel incapable of handling the tasks required by my job.", reverse: false },
  { id: 12, text: "It's hard to be there for my loved ones because I’m so drained by work.", reverse: false },
  { id: 13, text: "I’m often dissatisfied with the quality of my work but don’t have the energy to improve it.", reverse: false },
  { id: 14, text: "The frustrations of my job have turned me into a cynical person.", reverse: false },
  { id: 15, text: "Whenever anyone asks me about my job, all I can do is complain.", reverse: false },
  { id: 16, text: "Being asked to take on a new task fills me with dread.", reverse: false },
  { id: 17, text: "The pressures of my job feel impossible to manage.", reverse: false },
  { id: 18, text: "I often feel like a robot, doing my job without thought.", reverse: false },
  { id: 19, text: "I have control over how I spend my time at work.", reverse: true },
  { id: 20, text: "I quickly feel overwhelmed when a new problem comes up at work.", reverse: false },
] as const;

export const totalQuestions = questions.length;
/** 20 items × 5 = 100, 20 items × 1 = 20. */
export const BURNOUT_MAX_SCORE = totalQuestions * 5;
export const BURNOUT_MIN_SCORE = totalQuestions * 1;
