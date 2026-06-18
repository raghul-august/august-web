export type UsageFrequency =
  | "single-use"
  | "occasional"
  | "moderate"
  | "chronic"
  | "heavy-chronic";

export type TestType = "urine" | "blood" | "saliva" | "hair";

export type BmiCategory = "underweight" | "normal" | "overweight" | "obese";

export interface FrequencyOption {
  value: UsageFrequency;
  label: string;
  helper: string;
}

export const FREQUENCY_OPTIONS: readonly FrequencyOption[] = [
  {
    value: "single-use",
    label: "Single use",
    helper: "First or rare use, less than once a month.",
  },
  {
    value: "occasional",
    label: "Occasional",
    helper: "Up to 2–3 times a month.",
  },
  {
    value: "moderate",
    label: "Moderate",
    helper: "A few times per week.",
  },
  {
    value: "chronic",
    label: "Chronic",
    helper: "Daily or near-daily use.",
  },
  {
    value: "heavy-chronic",
    label: "Heavy chronic",
    helper: "Multiple times per day for months or years.",
  },
];

export interface TestOption {
  value: TestType;
  label: string;
  helper: string;
}

export const TEST_OPTIONS: readonly TestOption[] = [
  {
    value: "urine",
    label: "Urine",
    helper: "Most common employment / clinical drug test.",
  },
  {
    value: "blood",
    label: "Blood",
    helper: "Used for impairment-at-the-time testing.",
  },
  {
    value: "saliva",
    label: "Saliva / oral fluid",
    helper: "Roadside or quick screening tests.",
  },
  {
    value: "hair",
    label: "Hair follicle",
    helper: "Longest window — looks back ~90 days.",
  },
];

export interface BmiOption {
  value: BmiCategory;
  label: string;
  helper: string;
}

export const BMI_OPTIONS: readonly BmiOption[] = [
  { value: "underweight", label: "Underweight (BMI <18.5)", helper: "Less fat tissue to store THC." },
  { value: "normal", label: "Normal (BMI 18.5–24.9)", helper: "Typical clearance rates." },
  { value: "overweight", label: "Overweight (BMI 25–29.9)", helper: "More fat tissue means slower clearance." },
  { value: "obese", label: "Obese (BMI 30+)", helper: "Longer detection windows on average." },
];

/**
 * Detection window in days by test type and usage frequency.
 * These are public-domain ranges commonly cited in cannabis pharmacokinetic
 * literature (Huestis 2007; SAMHSA cutoffs; Mayo Clinic Labs reference ranges).
 * Values are conservative {min, max} ranges, in days.
 */
export const DETECTION_WINDOWS: Record<
  TestType,
  Record<UsageFrequency, { min: number; max: number }>
> = {
  urine: {
    "single-use": { min: 1, max: 3 },
    occasional: { min: 3, max: 7 },
    moderate: { min: 7, max: 21 },
    chronic: { min: 21, max: 30 },
    "heavy-chronic": { min: 30, max: 77 },
  },
  blood: {
    "single-use": { min: 1, max: 2 },
    occasional: { min: 1, max: 2 },
    moderate: { min: 2, max: 7 },
    chronic: { min: 7, max: 14 },
    "heavy-chronic": { min: 14, max: 30 },
  },
  saliva: {
    "single-use": { min: 1, max: 1 },
    occasional: { min: 1, max: 3 },
    moderate: { min: 1, max: 3 },
    chronic: { min: 1, max: 29 },
    "heavy-chronic": { min: 1, max: 29 },
  },
  hair: {
    "single-use": { min: 0, max: 0 }, // rarely detected from single use
    occasional: { min: 7, max: 90 },
    moderate: { min: 7, max: 90 },
    chronic: { min: 7, max: 90 },
    "heavy-chronic": { min: 7, max: 90 },
  },
};

/** Multiplier applied to MAX detection window based on body fat / BMI. */
export const BMI_MULTIPLIER: Record<BmiCategory, number> = {
  underweight: 0.85,
  normal: 1.0,
  overweight: 1.15,
  obese: 1.3,
};

export const FAQ_ITEMS = [
  {
    q: "How accurate is a THC detox calculator?",
    a: "It's an educated estimate, not a guarantee. THC clearance varies widely between individuals, even at the same usage level and body composition. Hydration, metabolism, exercise, age, sex, and cannabis potency all matter. Use ranges as a planning tool, not a pass-the-test guarantee.",
  },
  {
    q: "Why does body fat (BMI) matter?",
    a: "THC and its metabolites are highly fat-soluble — they get stored in fat tissue and slowly released into the bloodstream and urine. People with more body fat tend to have longer detection windows, especially for chronic users.",
  },
  {
    q: "Why do urine, blood, saliva, and hair tests have different windows?",
    a: "Each test measures different things. Blood and saliva detect recent active THC (the impairing parent compound). Urine detects THC-COOH, a metabolite that lingers much longer. Hair traps metabolites in the follicle as it grows, so it captures a 90-day historical window.",
  },
  {
    q: "Can exercise or detox products speed up clearance?",
    a: "Exercise mobilizes fat-stored THC back into the bloodstream — counterintuitively, this can briefly raise urine levels in chronic users right before a test. Most commercial 'detox' products are not clinically proven; the main legitimate factors are time, hydration, and metabolic rate.",
  },
  {
    q: "Is this medical advice?",
    a: "No. This calculator is for educational planning only. It is not a substitute for clinical advice, drug test interpretation, or legal guidance.",
  },
];
