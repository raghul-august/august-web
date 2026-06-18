export interface BodyDysmorphiaOption {
  label: string;
  /** 1–5 Likert raw value. */
  value: number;
}

export interface BodyDysmorphiaQuestion {
  id: number;
  text: string;
  /**
   * When true, the response is scored as `6 - value` so agreement with a
   * counter-trait statement does not inflate the score.
   */
  reverse: boolean;
}

export const LIKERT_OPTIONS: readonly BodyDysmorphiaOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const questions: readonly BodyDysmorphiaQuestion[] = [
  { id: 1, text: "I can spend hours thinking about what I dislike about my appearance.", reverse: false },
  { id: 2, text: "I can spend a long time grooming my hair or face—longer than other people I know.", reverse: false },
  { id: 3, text: "I sometimes repeatedly look in the mirror at my face or parts of my body I don’t like.", reverse: false },
  { id: 4, text: "I am sure that I look unattractive or ugly, even if other people tell me I don’t.", reverse: false },
  { id: 5, text: "Even after spending a lot of time working to fix my appearance, I am still unhappy with it.", reverse: false },
  { id: 6, text: "Thinking about my appearance, or trying to fix it, has interfered with my work, school, social, or family commitments.", reverse: false },
  { id: 7, text: "I feel sure that other people see the same flaws in my appearance that I do.", reverse: false },
  { id: 8, text: "I wish I didn’t spend so much time thinking about my appearance.", reverse: false },
  { id: 9, text: "I regularly ask people if they agree with me that I do not look good.", reverse: false },
  { id: 10, text: "Things I do to deal with my appearance, like picking at my skin, tanning, or changing clothes, cause me a lot of stress.", reverse: false },
  { id: 11, text: "There are aspects of my appearance that I strongly dislike.", reverse: false },
  { id: 12, text: "I have avoided activities because I was concerned about the way I looked.", reverse: false },
  { id: 13, text: "I work hard to cover up with clothes or makeup what I see as flaws in my appearance.", reverse: false },
  { id: 14, text: "I constantly compare my appearance to that of other people.", reverse: false },
  { id: 15, text: "I often feel ashamed about leaving home looking like I do.", reverse: false },
  { id: 16, text: "I have had multiple cosmetic procedures or plastic surgeries, or have spent a lot of time considering having them.", reverse: false },
  { id: 17, text: "I sometimes think people laugh about the way I look.", reverse: false },
  { id: 18, text: "Thinking about what’s wrong with my appearance makes me feel depressed.", reverse: false },
  { id: 19, text: "I have damaged my hair, skin, or face through the actions I’ve taken to try fixing with my appearance.", reverse: false },
  { id: 20, text: "I avoid eye contact with other people so I won’t encourage them to look at me.", reverse: false },
] as const;

export const totalQuestions = questions.length;
/** 20 items × 5 = 100, 20 items × 1 = 20. */
export const BODY_DYSMORPHIA_MAX_SCORE = totalQuestions * 5;
export const BODY_DYSMORPHIA_MIN_SCORE = totalQuestions * 1;
