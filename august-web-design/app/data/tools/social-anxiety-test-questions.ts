export interface SocialAnxietyOption {
  label: string;
  value: number;
}

export interface SocialAnxietyQuestion {
  id: number;
  text: string;
  /** Shared pill rendered above every question. */
  preamble?: string;
  /** When true, the response is reverse-keyed (6 - value) before summing. */
  reverse: boolean;
  options: readonly SocialAnxietyOption[];
}

export const LIKERT_OPTIONS: readonly SocialAnxietyOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

const PREAMBLE = "How much do you agree?";

export const questions: readonly SocialAnxietyQuestion[] = [
  {
    id: 1,
    text: "I avoid public speaking.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 2,
    text: "I'm always eager to answer a text or call.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 3,
    text: "I consider myself to be a shy person.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 4,
    text: "I enjoy meeting and talking to new people.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 5,
    text: "Knowing I will attend a party on the weekend stresses me out all week.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 6,
    text: "I think meetings are the worst part of the workday.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 7,
    text: "When I disagree with someone, I usually keep it to myself.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 8,
    text: "I find it difficult to relax at a party unless I've had some alcohol.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 9,
    text: "It's not easy for me to talk to someone I find attractive.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 10,
    text: "I believe other people want to hear what I have to say.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 11,
    text: "At social gatherings, I blush, sweat, and feel my heart race.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 12,
    text: "I always try to speak loudly and clearly.",
    preamble: PREAMBLE,
    reverse: true,
    options: LIKERT_OPTIONS,
  },
  {
    id: 13,
    text: "I can get nervous when I have to speak to a boss or a teacher.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 14,
    text: "I don't like being asked to join in when people are singing or dancing.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 15,
    text: "I'm OK with not having any social plans on the weekend.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 16,
    text: "I get embarrassed easily, even around people I know.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 17,
    text: "I have lied to avoid a social gathering, or to leave one early.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 18,
    text: "I try to avoid restaurants where other people can see me.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 19,
    text: "Before a social event, I spend a lot of time thinking about who I’ll talk to and what I might say.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
  {
    id: 20,
    text: "Direct eye contact can make me uncomfortable.",
    preamble: PREAMBLE,
    reverse: false,
    options: LIKERT_OPTIONS,
  },
] as const;

export const totalQuestions = questions.length; // 20
/** Min and max raw sums. Each item scored 1..5 (reverse keys flip 6 - value). */
export const SAT_MIN_SCORE = totalQuestions * 1; // 20
export const SAT_MAX_SCORE = totalQuestions * 5; // 100
/** Score at or above which the screen is considered positive (≥ moderate band). */
export const SAT_POSITIVE_SCREEN_CUTOFF = 52;
