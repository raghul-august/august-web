export interface EmotionalAvailabilityOption {
  label: string;
  /** 1–5 Likert raw value. */
  value: number;
}

export interface EmotionalAvailabilityQuestion {
  id: number;
  text: string;
  /**
   * When true, the response is scored as `6 - value` so agreement with a
   * counter-trait statement does not inflate the score.
   */
  reverse: boolean;
}

export const LIKERT_OPTIONS: readonly EmotionalAvailabilityOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const questions: readonly EmotionalAvailabilityQuestion[] = [
  { id: 1, text: "When a partner asks me how I’m feeling, I usually say, “Fine,” even if it’s not true.", reverse: false },
  { id: 2, text: "I have had more casual or short-term relationships than long-term committed relationships.", reverse: false },
  { id: 3, text: "When a partner and I are in a conflict, I prefer to go be by myself rather than keep talking about it.", reverse: false },
  { id: 4, text: "It’s important to express my love for my partner often.", reverse: true },
  { id: 5, text: "I would rather work or engage with a hobby than talk about my relationship.", reverse: false },
  { id: 6, text: "I don’t want to depend on anyone, not even a partner.", reverse: false },
  { id: 7, text: "When a partner tells me I’m not emotionally engaged, I think that they’re too emotional, too sensitive, or just wrong.", reverse: false },
  { id: 8, text: "I think the things I do or get for a partner express my love just as much as do words.", reverse: false },
  { id: 9, text: "I sometimes think people expect more emotions from me than I’m able to offer, and that they feel let down.", reverse: false },
  { id: 10, text: "When a partner tells me about their problems or feelings, I assure them it’s not a big deal or that things will be OK.", reverse: false },
  { id: 11, text: "I’m not a fan of public displays of affection.", reverse: false },
  { id: 12, text: "I sometimes worry about getting trapped in a relationship.", reverse: false },
  { id: 13, text: "When a partner asks me to talk about my childhood family relationships, I tell them it was fine and try to talk about something else.", reverse: false },
  { id: 14, text: "When a partner talks about deep feelings, I like to quote from movies, songs, or books instead of sharing my own thoughts.", reverse: false },
  { id: 15, text: "I am comfortable around people who wear their heart on their sleeve.", reverse: true },
  { id: 16, text: "A partner has told me they worry about my capacity for love.", reverse: false },
  { id: 17, text: "I don’t think it’s important to label a relationship that seems to be working.", reverse: false },
  { id: 18, text: "When a partner starts to discuss difficult feelings, I try to make a joke.", reverse: false },
  { id: 19, text: "Being totally open with my feelings makes me deeply uncomfortable.", reverse: false },
  { id: 20, text: "When a partner starts a serious talk, I keep my phone or TV on instead of giving them my complete attention.", reverse: false },
] as const;

export const totalQuestions = questions.length;
/** 20 items × 5 = 100, 20 items × 1 = 20. */
export const EMOTIONAL_AVAILABILITY_MAX_SCORE = totalQuestions * 5;
export const EMOTIONAL_AVAILABILITY_MIN_SCORE = totalQuestions * 1;
