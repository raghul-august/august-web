export interface AnxietyOption {
  label: string;
  value: number;
}

export interface AnxietyQuestion {
  id: number;
  text: string;
  /** Shared pill rendered above every question. */
  preamble?: string;
  /** When true, the response is reverse-keyed (6 - value) before summing. */
  reverse: boolean;
  options: readonly AnxietyOption[];
}

export const LIKERT_OPTIONS: readonly AnxietyOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

const PREAMBLE = "How much do you agree?";

export const questions: readonly AnxietyQuestion[] = [
  {
    id: 1,
    text: "I often feel as if something bad will happen soon.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 2,
    text: "I think I worry too much but I can't seem to stop.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 3,
    text: "I find it hard to relax.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 4,
    text: "I sometimes feel so restless that it's hard to keep still.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 5,
    text: "I worry sometimes, but it doesn't get in the way of my work or personal life.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 6,
    text: "I get easily annoyed with people.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 7,
    text: "I can fall asleep pretty easily and usually stay asleep once I do.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 8,
    text: "I often find myself getting sweaty and feeling nauseous.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 9,
    text: "I can be easily startled.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 10,
    text: "I can usually concentrate on tasks without much trouble.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 11,
    text: "I have frequent headaches that can be accompanied by neck pain.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 12,
    text: "I can think about an issue for hours and still not feel like I've made any progress toward solving it.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 13,
    text: "Sometimes I start shaking or trembling or feel my heart racing.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 14,
    text: "I worry more than I think I should about little things such as being a bit late.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 15,
    text: "I have more days filled with worry than days when I don't worry about much.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 16,
    text: "My muscles regularly tense up and it makes me achy.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 17,
    text: "Sometimes I feel short of breath or feel like it's hard to swallow.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 18,
    text: "The amount of time that I worry is itself making me feel worried and stressed.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 19,
    text: "I don't spend much time dwelling on things I haven't done or achieved.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 20,
    text: "Sometimes my mind seems to go blank.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
] as const;

export const totalQuestions = questions.length; // 20
/** Min and max raw sums. Each item scored 1..5 (reverse keys flip 6 - value). */
export const GAD_MIN_SCORE = totalQuestions * 1; // 20
export const GAD_MAX_SCORE = totalQuestions * 5; // 100
/** Score at or above which the screen is considered positive (≥ moderate band). */
export const GAD_POSITIVE_SCREEN_CUTOFF = 52;
