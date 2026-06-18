export interface AutismOption {
  label: string;
  value: number;
  /** Whether this response counts as the "agree" side for scoring. */
  isAgree: boolean;
}

export interface AutismQuestion {
  id: number;
  text: string;
  /**
   * If true, the autism-direction response is AGREE — picking
   * Definitely/Slightly Agree scores 1.
   * If false, the autism-direction response is DISAGREE — picking
   * Definitely/Slightly Disagree scores 1.
   */
  scoreOnAgree: boolean;
}

export const AUTISM_OPTIONS: readonly AutismOption[] = [
  { label: "Definitely Agree", value: 1, isAgree: true },
  { label: "Slightly Agree", value: 2, isAgree: true },
  { label: "Slightly Disagree", value: 3, isAgree: false },
  { label: "Definitely Disagree", value: 4, isAgree: false },
] as const;

/**
 * The AQ-10 (Autism Spectrum Quotient — 10 item) adult screener.
 * Allison, Auyeung & Baron-Cohen (2012). Public-domain instrument
 * used by NHS / NICE for adult autism screening.
 *
 * Each item is scored 0 or 1 — the test is effectively binary even though
 * four response options are presented (per the original paper, "Slightly"
 * and "Definitely" responses on the same side yield the same score).
 */
export const questions: readonly AutismQuestion[] = [
  {
    id: 1,
    text: "I often notice small sounds when others do not.",
    scoreOnAgree: true,
  },
  {
    id: 2,
    text: "When I'm reading a story, I find it difficult to work out the characters' intentions.",
    scoreOnAgree: true,
  },
  {
    id: 3,
    text: "I find it easy to 'read between the lines' when someone is talking to me.",
    scoreOnAgree: false,
  },
  {
    id: 4,
    text: "I usually concentrate more on the whole picture, rather than the small details.",
    scoreOnAgree: false,
  },
  {
    id: 5,
    text: "I know how to tell if someone listening to me is getting bored.",
    scoreOnAgree: false,
  },
  {
    id: 6,
    text: "I find it easy to do more than one thing at once.",
    scoreOnAgree: false,
  },
  {
    id: 7,
    text: "I find it easy to work out what someone is thinking or feeling just by looking at their face.",
    scoreOnAgree: false,
  },
  {
    id: 8,
    text: "If there is an interruption, I can switch back to what I was doing very quickly.",
    scoreOnAgree: false,
  },
  {
    id: 9,
    text: "I like to collect information about categories of things.",
    scoreOnAgree: true,
  },
  {
    id: 10,
    text: "I find it difficult to work out people's intentions.",
    scoreOnAgree: true,
  },
];

export const totalQuestions = questions.length;
export const MIN_SCORE = 0;
export const MAX_SCORE = totalQuestions;
export const REFERRAL_CUTOFF = 6;
