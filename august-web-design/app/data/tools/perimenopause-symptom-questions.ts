export type SymptomDomain =
  | "vasomotor"
  | "psychological"
  | "physical"
  | "sleep"
  | "sexual";

export interface PerimenopauseOption {
  label: string;
  value: 0 | 1 | 2 | 3;
}

export interface PerimenopauseQuestion {
  id: number;
  text: string;
  domain: SymptomDomain;
}

/** 0 = Not at all → 3 = Extremely. Greene Climacteric Scale scoring. */
export const PERIMENOPAUSE_OPTIONS: readonly PerimenopauseOption[] = [
  { label: "Not at all", value: 0 },
  { label: "A little", value: 1 },
  { label: "Quite a bit", value: 2 },
  { label: "Extremely", value: 3 },
] as const;

/**
 * 21-item perimenopause symptom inventory modelled on the Greene
 * Climacteric Scale (Greene 1998) plus commonly-tracked perimenopausal
 * concerns. Wording is everyday-English; semantics map back to the 21
 * Greene items across psychological, somatic, vasomotor, sleep, and
 * sexual symptom domains.
 */
export const PERIMENOPAUSE_QUESTIONS: readonly PerimenopauseQuestion[] = [
  // Vasomotor (Greene "vasomotor" subscale, items 1-2)
  { id: 1, text: "Hot flushes during the day", domain: "vasomotor" },
  { id: 2, text: "Night sweats", domain: "vasomotor" },

  // Psychological — anxiety (items 3-7 in Greene)
  { id: 3, text: "Heart beating quickly or strongly", domain: "psychological" },
  { id: 4, text: "Feeling tense or nervous", domain: "psychological" },
  { id: 5, text: "Difficulty in sleeping", domain: "sleep" },
  { id: 6, text: "Excitable", domain: "psychological" },
  { id: 7, text: "Attacks of panic", domain: "psychological" },

  // Psychological — depression (items 8-11 in Greene)
  { id: 8, text: "Difficulty in concentrating", domain: "psychological" },
  { id: 9, text: "Feeling tired or lacking energy", domain: "psychological" },
  { id: 10, text: "Loss of interest in most things", domain: "psychological" },
  { id: 11, text: "Feeling unhappy or depressed", domain: "psychological" },
  { id: 12, text: "Crying spells", domain: "psychological" },
  { id: 13, text: "Irritability", domain: "psychological" },

  // Somatic (items 14-20 in Greene)
  { id: 14, text: "Feeling dizzy or faint", domain: "physical" },
  {
    id: 15,
    text: "Pressure or tightness in head, or parts of body",
    domain: "physical",
  },
  { id: 16, text: "Parts of body feel numb or tingling", domain: "physical" },
  { id: 17, text: "Headaches", domain: "physical" },
  { id: 18, text: "Muscle and joint pains", domain: "physical" },
  {
    id: 19,
    text: "Loss of feeling in hands or feet",
    domain: "physical",
  },
  { id: 20, text: "Breathing difficulties", domain: "physical" },

  // Sexual (item 21)
  { id: 21, text: "Loss of interest in sex", domain: "sexual" },
] as const;

export const PERIMENOPAUSE_TOTAL = PERIMENOPAUSE_QUESTIONS.length; // 21
export const PERIMENOPAUSE_MAX_SCORE = PERIMENOPAUSE_TOTAL * 3; // 63

export const DOMAIN_LABELS: Record<SymptomDomain, string> = {
  vasomotor: "Vasomotor (hot flushes, night sweats)",
  psychological: "Psychological (mood, anxiety, focus)",
  physical: "Physical (aches, dizziness, headaches)",
  sleep: "Sleep",
  sexual: "Sexual",
};
