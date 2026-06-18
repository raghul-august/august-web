export interface BipolarOption {
  label: string;
  value: number;
}

export interface BipolarQuestion {
  id: number;
  text: string;
  /** Shared pill rendered above every question. */
  preamble?: string;
  /** When true, the response is reverse-keyed (6 - value) before summing. */
  reverse: boolean;
  options: readonly BipolarOption[];
}

export const LIKERT_OPTIONS: readonly BipolarOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

const PREAMBLE = "How much do you agree?";

export const questions: readonly BipolarQuestion[] = [
  {
    id: 1,
    text: "I occasionally feel so good, or amped-up, that people tell me I don’t seem like myself.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 2,
    text: "I can become so irritated by people that I start arguments with them.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 3,
    text: "There are times when I feel incredibly self-confident.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 4,
    text: "Sometimes I get much less sleep than normal but don’t mind; I almost feel like I don't need it.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 5,
    text: "People sometimes tell me I’m speaking much more, or much faster, than usual.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 6,
    text: "Thoughts sometimes race through my head and I can’t seem to stop them.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 7,
    text: "There are times when I am much more outgoing than usual.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 8,
    text: "It’s rare for me to get so distracted that I can’t concentrate or work.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 9,
    text: "I have made risky or hasty decisions that have gotten me into trouble.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 10,
    text: "I have spent so much money so fast that it has caused problems for me or my family.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 11,
    text: "I sometimes have major mood changes, pivoting from extremely happy to extremely sad or vice versa.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 12,
    text: "I can become intensely focused on a goal, even one that’s not particularly important.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 13,
    text: "I can feel physically restless sometimes but at other times, I can sense myself physically slowing down.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 14,
    text: "I’m pretty cautious; I don’t take foolish risks.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 15,
    text: "I can experience multiple episodes of feeling hyper or manic in a single week or a single day.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 16,
    text: "I can have sharp increases or decreases in appetite that affect my weight.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 17,
    text: "I’m generally content, calm, and hopeful.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 18,
    text: "I sometimes feel a much greater desire for sex.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 19,
    text: "I’ve had depressive episodes for weeks at a time.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 20,
    text: "I have a child, sibling, parent, grandparent, or blood-related aunt or uncle who was diagnosed with manic depression or bipolar disorder.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
] as const;

export const totalQuestions = questions.length; // 20
/** Min and max raw sums. Each item scored 1..5 (reverse keys flip 6 - value). */
export const BIPOLAR_MIN_SCORE = totalQuestions * 1; // 20
export const BIPOLAR_MAX_SCORE = totalQuestions * 5; // 100
/** Score at or above which the screen is considered positive (≥ moderate band). */
export const BIPOLAR_POSITIVE_SCREEN_CUTOFF = 52;
