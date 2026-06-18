export interface HighlySensitiveOption {
  label: string;
  /** 1–5 Likert raw value. */
  value: number;
}

export interface HighlySensitiveQuestion {
  id: number;
  text: string;
  /**
   * When true, the response is scored as `6 - value` so agreement with a
   * counter-trait statement does not inflate the score.
   */
  reverse: boolean;
}

export const LIKERT_OPTIONS: readonly HighlySensitiveOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const questions: readonly HighlySensitiveQuestion[] = [
  { id: 1, text: "I’m easily overwhelmed by strong sensory input.", reverse: false },
  { id: 2, text: "Other people’s moods strongly affect me.", reverse: false },
  { id: 3, text: "I tend to be sensitive to pain.", reverse: false },
  { id: 4, text: "I’m easily overwhelmed by things like bright lights, strong smells, coarse fabrics, or sirens.", reverse: false },
  { id: 5, text: "I notice when small things have changed in my environment.", reverse: false },
  { id: 6, text: "I have a rich, complex inner life.", reverse: false },
  { id: 7, text: "I enjoy violent films, TV shows, and movies.", reverse: true },
  { id: 8, text: "I am deeply moved by the arts and music.", reverse: false },
  { id: 9, text: "Loud noises make me feel uncomfortable.", reverse: false },
  { id: 10, text: "My nervous system sometimes feels so frazzled that I have to be alone.", reverse: false },
  { id: 11, text: "I’m highly conscientious.", reverse: false },
  { id: 12, text: "I get scared easily.", reverse: false },
  { id: 13, text: "When people are physically uncomfortable I tend to know what would help (like changing the lighting or seating).", reverse: false },
  { id: 14, text: "I thrive when I have a lot to do in a short amount of time.", reverse: true },
  { id: 15, text: "I notice and enjoy delicate scents, tastes, sounds, and works of art.", reverse: false },
  { id: 16, text: "I make it a high priority to arrange my life to avoid upsetting or overwhelming situations.", reverse: false },
  { id: 17, text: "On busy days, I need to leave, lie down, and look for a dark room or another place where I can find relief from stimulation.", reverse: false },
  { id: 18, text: "Intense stimuli, like loud noises or chaotic scenes, don’t bother me.", reverse: true },
  { id: 19, text: "I get annoyed when people try to get me to do too many things at once.", reverse: false },
  { id: 20, text: "When I was a child, my parents or teachers saw me as sensitive.", reverse: false },
] as const;

export const totalQuestions = questions.length;
/** 20 items × 5 = 100, 20 items × 1 = 20. */
export const HIGHLY_SENSITIVE_MAX_SCORE = totalQuestions * 5;
export const HIGHLY_SENSITIVE_MIN_SCORE = totalQuestions * 1;
