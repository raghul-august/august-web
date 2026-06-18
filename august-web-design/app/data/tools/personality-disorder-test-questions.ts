export interface PersonalityDisorderOption {
  label: string;
  value: number;
}

export type PersonalityDisorderScoring = "bpd" | "functional";

export type PersonalityDisorderCriterion =
  | "abandonment"
  | "relationships"
  | "identity"
  | "impulsivity"
  | "self-harm"
  | "affective"
  | "emptiness"
  | "anger"
  | "paranoia"
  | "functional";

export interface PersonalityDisorderQuestion {
  id: number;
  text: string;
  /** Optional clarifier shown beneath the main question. */
  subtext?: string;
  /** Pill rendered above the question text. */
  preamble?: string;
  scoring: PersonalityDisorderScoring;
  criterion: PersonalityDisorderCriterion;
  options: readonly PersonalityDisorderOption[];
}

export const BPD_OPTIONS: readonly PersonalityDisorderOption[] = [
  { label: "Not at all", value: 0 },
  { label: "Some of the time", value: 1 },
  { label: "Most of the time", value: 2 },
  { label: "Almost all the time", value: 3 },
] as const;

export const FUNCTIONAL_OPTIONS: readonly PersonalityDisorderOption[] = [
  { label: "Not difficult at all", value: 0 },
  { label: "Somewhat difficult", value: 1 },
  { label: "Very difficult", value: 2 },
  { label: "Extremely difficult", value: 3 },
] as const;

const BPD_PREAMBLE = "Over the last year";

export const questions: readonly PersonalityDisorderQuestion[] = [
  {
    id: 1,
    text: "I make frantic efforts to avoid being abandoned by people who matter to me",
    subtext:
      "Calling repeatedly, begging someone to stay, or making promises you wouldn't otherwise make.",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "abandonment",
    options: BPD_OPTIONS,
  },
  {
    id: 2,
    text: "I worry that people close to me will leave, even when there is no real sign of it",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "abandonment",
    options: BPD_OPTIONS,
  },
  {
    id: 3,
    text: "My closest relationships swing between feeling intensely close and intensely disappointing",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "relationships",
    options: BPD_OPTIONS,
  },
  {
    id: 4,
    text: "I go from seeing someone as wonderful to feeling like they have completely let me down",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "relationships",
    options: BPD_OPTIONS,
  },
  {
    id: 5,
    text: "My sense of who I am — my values, goals, or how I see myself — feels unstable or unclear",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "identity",
    options: BPD_OPTIONS,
  },
  {
    id: 6,
    text: "I act impulsively in ways that could hurt me",
    subtext:
      "For example: spending, risky sex, substance use, reckless driving, binge eating.",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "impulsivity",
    options: BPD_OPTIONS,
  },
  {
    id: 7,
    text: "I do things on impulse that I later regret",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "impulsivity",
    options: BPD_OPTIONS,
  },
  {
    id: 8,
    text: "I have thoughts of hurting myself, or have made gestures or threats toward self-harm or suicide",
    subtext:
      "Including cutting, burning, or thoughts of ending your life.",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "self-harm",
    options: BPD_OPTIONS,
  },
  {
    id: 9,
    text: "My mood shifts intensely and quickly — strong reactions that last hours rather than days",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "affective",
    options: BPD_OPTIONS,
  },
  {
    id: 10,
    text: "I move between feeling fine and feeling deeply down, anxious, or irritable in a short span of time",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "affective",
    options: BPD_OPTIONS,
  },
  {
    id: 11,
    text: "I feel empty inside — like something is missing that I can't quite name",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "emptiness",
    options: BPD_OPTIONS,
  },
  {
    id: 12,
    text: "My anger feels disproportionate to the situation, or is hard to control once it starts",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "anger",
    options: BPD_OPTIONS,
  },
  {
    id: 13,
    text: "I get into intense arguments or physical fights when I'm upset",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "anger",
    options: BPD_OPTIONS,
  },
  {
    id: 14,
    text: "When I'm stressed, I have brief moments of feeling suspicious or like people are out to harm me",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "paranoia",
    options: BPD_OPTIONS,
  },
  {
    id: 15,
    text: "When I'm stressed, I feel disconnected from myself — like I'm watching from outside or in a fog",
    preamble: BPD_PREAMBLE,
    scoring: "bpd",
    criterion: "paranoia",
    options: BPD_OPTIONS,
  },
  {
    id: 16,
    text: "If you checked off any of the things above, how difficult have they made it for you at work, home, or with other people?",
    preamble: "One last question",
    scoring: "functional",
    criterion: "functional",
    options: FUNCTIONAL_OPTIONS,
  },
] as const;

export const totalQuestions = questions.length; // 16
export const BPD_ITEM_COUNT = 15;
export const BPD_MAX_SCORE = 45; // 15 items × 3
