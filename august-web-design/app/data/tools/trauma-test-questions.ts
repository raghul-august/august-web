export interface TraumaOption {
  label: string;
  value: 0 | 1;
}

export type TraumaScoring = "gate" | "symptom";

export type TraumaCriterion =
  | "trauma-exposure"
  | "re-experiencing"
  | "avoidance"
  | "hyperarousal"
  | "numbing"
  | "negative-cognitions";

export interface TraumaQuestion {
  id: number;
  text: string;
  /** Optional clarifier shown beneath the main question. */
  subtext?: string;
  /** Pill rendered above the question text. */
  preamble?: string;
  scoring: TraumaScoring;
  criterion: TraumaCriterion;
  options: readonly TraumaOption[];
}

export const YN_OPTIONS: readonly TraumaOption[] = [
  { label: "Yes", value: 1 },
  { label: "No", value: 0 },
] as const;

const SYMPTOM_PREAMBLE = "In the past month, have you";
const GATE_PREAMBLE = "First, a question about your history";

export const questions: readonly TraumaQuestion[] = [
  {
    id: 1,
    text: "Have you ever experienced an event like the ones below?",
    subtext:
      "A serious accident or fire; a physical or sexual assault or abuse; an earthquake or flood; a war; seeing someone be killed or seriously injured; or having a loved one die through homicide or suicide.",
    preamble: GATE_PREAMBLE,
    scoring: "gate",
    criterion: "trauma-exposure",
    options: YN_OPTIONS,
  },
  {
    id: 2,
    text: "Had nightmares about the event(s) or thought about the event(s) when you did not want to?",
    preamble: SYMPTOM_PREAMBLE,
    scoring: "symptom",
    criterion: "re-experiencing",
    options: YN_OPTIONS,
  },
  {
    id: 3,
    text: "Tried hard not to think about the event(s) or went out of your way to avoid situations that reminded you of the event(s)?",
    preamble: SYMPTOM_PREAMBLE,
    scoring: "symptom",
    criterion: "avoidance",
    options: YN_OPTIONS,
  },
  {
    id: 4,
    text: "Been constantly on guard, watchful, or easily startled?",
    preamble: SYMPTOM_PREAMBLE,
    scoring: "symptom",
    criterion: "hyperarousal",
    options: YN_OPTIONS,
  },
  {
    id: 5,
    text: "Felt numb or detached from people, activities, or your surroundings?",
    preamble: SYMPTOM_PREAMBLE,
    scoring: "symptom",
    criterion: "numbing",
    options: YN_OPTIONS,
  },
  {
    id: 6,
    text: "Felt guilty or unable to stop blaming yourself or others for the event(s) or any problems the event(s) may have caused?",
    preamble: SYMPTOM_PREAMBLE,
    scoring: "symptom",
    criterion: "negative-cognitions",
    options: YN_OPTIONS,
  },
] as const;

export const TRAUMA_GATE_ID = 1;
export const PCPTSD5_ITEM_COUNT = 5;
export const PCPTSD5_MAX_SCORE = 5;
export const PCPTSD5_POSITIVE_CUTOFF = 3;

export const totalQuestions = questions.length; // 6
