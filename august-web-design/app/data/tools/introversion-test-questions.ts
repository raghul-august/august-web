export interface IntroversionOption {
  label: string;
  /** 1–5 Likert raw value. */
  value: number;
}

export interface IntroversionQuestion {
  id: number;
  text: string;
  /**
   * When true, the response is scored as `6 - value` so agreement with a
   * counter-trait statement does not inflate the score.
   */
  reverse: boolean;
}

export const LIKERT_OPTIONS: readonly IntroversionOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const questions: readonly IntroversionQuestion[] = [
  { id: 1, text: "When a stranger talks to me, I consider it an opportunity to make a connection.", reverse: false },
  { id: 2, text: "Being out with a big group of friends all night can be exhausting.", reverse: true },
  { id: 3, text: "I consider myself to be an assertive person.", reverse: false },
  { id: 4, text: "It’s not unusual for me to get lost in thought around other people.", reverse: true },
  { id: 5, text: "I think that being on a reality show would be a nightmare.", reverse: true },
  { id: 6, text: "I don’t mind talking about anything, even if I’m not that knowledgeable about it.", reverse: false },
  { id: 7, text: "I'd rather spend one-on-one time with a close friend than get together with a friend group.", reverse: true },
  { id: 8, text: "It’s better to have a roommate than to live alone.", reverse: false },
  { id: 9, text: "It's disappointing to review my weekly schedule and see that it includes no social plans.", reverse: false },
  { id: 10, text: "At work meetings, I think it’s important to speak up often.", reverse: false },
  { id: 11, text: "I have a lot of fun playing tricks on my friends and family.", reverse: false },
  { id: 12, text: "I like to get my friends and co-workers excited about our plans.", reverse: false },
  { id: 13, text: "I don’t like to feel pushed into dancing at parties.", reverse: true },
  { id: 14, text: "When I'm in charge, I prefer meeting with people one-on-one to holding large brainstorming sessions.", reverse: true },
  { id: 15, text: "When I go to a party, I often think about how early it would be appropriate to leave.", reverse: true },
  { id: 16, text: "If someone is interesting enough, I could happily spend an evening just listening to their stories.", reverse: true },
  { id: 17, text: "In work or in life, I’d rather take some time to consider the next steps even if others are eager to rush ahead.", reverse: true },
  { id: 18, text: "As a kid, I was always the first to volunteer to read aloud.", reverse: false },
  { id: 19, text: "One of the great attractions of travel is the opportunity to meet new people.", reverse: false },
  { id: 20, text: "A day spent alone working on my hobbies sounds perfect.", reverse: true },
] as const;

export const totalQuestions = questions.length;
/** 20 items × 5 = 100, 20 items × 1 = 20. */
export const INTROVERSION_MAX_SCORE = totalQuestions * 5;
export const INTROVERSION_MIN_SCORE = totalQuestions * 1;
