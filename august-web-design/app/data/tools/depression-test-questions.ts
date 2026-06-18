export interface DepressionOption {
  label: string;
  value: number;
}

export type DepressionScoring = "phq9" | "functional";

export interface DepressionQuestion {
  id: number;
  text: string;
  /** Optional clarifier shown beneath the main question. */
  subtext?: string;
  /** Same preamble pill rendered above every PHQ-9 question. */
  preamble?: string;
  scoring: DepressionScoring;
  options: readonly DepressionOption[];
}

export const PHQ9_OPTIONS: readonly DepressionOption[] = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
] as const;

export const FUNCTIONAL_OPTIONS: readonly DepressionOption[] = [
  { label: "Not difficult at all", value: 0 },
  { label: "Somewhat difficult", value: 1 },
  { label: "Very difficult", value: 2 },
  { label: "Extremely difficult", value: 3 },
] as const;

const PHQ9_PREAMBLE = "Over the last 2 weeks";

export const questions: readonly DepressionQuestion[] = [
  {
    id: 1,
    text: "Little interest or pleasure in doing things",
    preamble: PHQ9_PREAMBLE,
    scoring: "phq9",
    options: PHQ9_OPTIONS,
  },
  {
    id: 2,
    text: "Feeling down, depressed, or hopeless",
    preamble: PHQ9_PREAMBLE,
    scoring: "phq9",
    options: PHQ9_OPTIONS,
  },
  {
    id: 3,
    text: "Trouble falling or staying asleep, or sleeping too much",
    preamble: PHQ9_PREAMBLE,
    scoring: "phq9",
    options: PHQ9_OPTIONS,
  },
  {
    id: 4,
    text: "Feeling tired or having little energy",
    preamble: PHQ9_PREAMBLE,
    scoring: "phq9",
    options: PHQ9_OPTIONS,
  },
  {
    id: 5,
    text: "Poor appetite or overeating",
    preamble: PHQ9_PREAMBLE,
    scoring: "phq9",
    options: PHQ9_OPTIONS,
  },
  {
    id: 6,
    text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    preamble: PHQ9_PREAMBLE,
    scoring: "phq9",
    options: PHQ9_OPTIONS,
  },
  {
    id: 7,
    text: "Trouble concentrating on things, such as reading the newspaper or watching television",
    preamble: PHQ9_PREAMBLE,
    scoring: "phq9",
    options: PHQ9_OPTIONS,
  },
  {
    id: 8,
    text: "Moving or speaking so slowly that other people could have noticed",
    subtext:
      "Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual.",
    preamble: PHQ9_PREAMBLE,
    scoring: "phq9",
    options: PHQ9_OPTIONS,
  },
  {
    id: 9,
    text: "Thoughts that you would be better off dead, or of hurting yourself in some way",
    preamble: PHQ9_PREAMBLE,
    scoring: "phq9",
    options: PHQ9_OPTIONS,
  },
  {
    id: 10,
    text: "If you checked off any problems, how difficult have these problems made it for you at work, home, or with other people?",
    preamble: "One last question",
    scoring: "functional",
    options: FUNCTIONAL_OPTIONS,
  },
] as const;

export const totalQuestions = questions.length; // 10
export const PHQ9_MAX_SCORE = 27; // 9 items × 3
