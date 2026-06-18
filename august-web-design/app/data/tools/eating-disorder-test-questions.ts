export interface EatingDisorderOption {
  label: string;
  value: number;
}

export type EatingDisorderScoring = "screen" | "functional";

export type EatingDisorderDomain =
  | "body-image"
  | "binge"
  | "compensatory"
  | "restriction"
  | "functional";

export interface EatingDisorderQuestion {
  id: number;
  text: string;
  /** Optional clarifier shown beneath the main question. */
  subtext?: string;
  /** Pill rendered above the question text. */
  preamble?: string;
  scoring: EatingDisorderScoring;
  domain: EatingDisorderDomain;
  options: readonly EatingDisorderOption[];
}

export const FREQUENCY_OPTIONS: readonly EatingDisorderOption[] = [
  { label: "Not at all", value: 0 },
  { label: "Some of the time", value: 1 },
  { label: "Most of the time", value: 2 },
  { label: "Almost all the time", value: 3 },
] as const;

export const FUNCTIONAL_OPTIONS: readonly EatingDisorderOption[] = [
  { label: "Not difficult at all", value: 0 },
  { label: "Somewhat difficult", value: 1 },
  { label: "Very difficult", value: 2 },
  { label: "Extremely difficult", value: 3 },
] as const;

const PREAMBLE_3M = "Over the last three months";
const PREAMBLE_BINGE = "During an episode of out-of-control eating";

export const questions: readonly EatingDisorderQuestion[] = [
  // ── A. Body image & weight ────────────────────────────────
  {
    id: 1,
    text: "Other people have expressed concern that I'm much too thin",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "body-image",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 2,
    text: "I feel bad about myself because I think I'm fat or overweight",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "body-image",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 3,
    text: "I'm preoccupied with thoughts of food, eating, or weight",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "body-image",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 4,
    text: "I worry about my weight and body shape more than other people my age",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "body-image",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 5,
    text: "I'm afraid of gaining even a small amount of weight",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "body-image",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 6,
    text: "I'm actively dieting or restricting what I eat to lose weight",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "body-image",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 7,
    text: "My weight feels like one of the most important things in my life",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "body-image",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 8,
    text: "I feel fat",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "body-image",
    options: FREQUENCY_OPTIONS,
  },

  // ── B. Binge eating ───────────────────────────────────────
  {
    id: 9,
    text: "I have episodes of eating an unusually large amount of food with a sense of loss of control",
    subtext:
      "Eating definitely more than most people would eat under similar circumstances, paired with feeling unable to stop.",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "binge",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 10,
    text: "I eat much more rapidly than normal",
    preamble: PREAMBLE_BINGE,
    scoring: "screen",
    domain: "binge",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 11,
    text: "I eat until I feel uncomfortably full",
    preamble: PREAMBLE_BINGE,
    scoring: "screen",
    domain: "binge",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 12,
    text: "I eat large amounts of food when I don't feel physically hungry",
    preamble: PREAMBLE_BINGE,
    scoring: "screen",
    domain: "binge",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 13,
    text: "I eat alone because I feel embarrassed by how much I'm eating",
    preamble: PREAMBLE_BINGE,
    scoring: "screen",
    domain: "binge",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 14,
    text: "I feel disgusted, depressed, or very guilty afterward",
    preamble: PREAMBLE_BINGE,
    scoring: "screen",
    domain: "binge",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 15,
    text: "These episodes leave me feeling distressed or upset",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "binge",
    options: FREQUENCY_OPTIONS,
  },

  // ── C. Compensatory behaviours ────────────────────────────
  {
    id: 16,
    text: "I make myself throw up to control my weight or shape",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "compensatory",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 17,
    text: "I use diuretics or laxatives to control my weight or shape",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "compensatory",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 18,
    text: "I exercise excessively to control my weight or shape",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "compensatory",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 19,
    text: "I fast (go 8+ hours without eating when I could eat) to control my weight or shape",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "compensatory",
    options: FREQUENCY_OPTIONS,
  },

  // ── D. Restriction & avoidant eating ──────────────────────
  {
    id: 20,
    text: "I eat very little (less than ~1200 calories a day) to influence my shape or weight",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "restriction",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 21,
    text: "I struggle with a lack of interest in eating or in food itself",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "restriction",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 22,
    text: "I avoid certain foods because of their texture, consistency, temperature, or smell",
    subtext:
      "Including foods other people have suggested you might be avoiding for these reasons.",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "restriction",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 23,
    text: "I avoid certain foods because I'm afraid of choking, vomiting, or some other negative consequence",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "restriction",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 24,
    text: "I've lost significant weight (or stay at a low weight for my age and height), but I'm not very concerned about my body size or shape",
    preamble: PREAMBLE_3M,
    scoring: "screen",
    domain: "restriction",
    options: FREQUENCY_OPTIONS,
  },

  // ── E. Functional impact (not part of trait score) ────────
  {
    id: 25,
    text: "If you checked off any of the things above, how difficult have they made it for you at work, home, or with other people?",
    preamble: "One last question",
    scoring: "functional",
    domain: "functional",
    options: FUNCTIONAL_OPTIONS,
  },
] as const;

export const totalQuestions = questions.length; // 25
export const SCREEN_ITEM_COUNT = questions.filter((q) => q.scoring === "screen").length; // 24
export const SCREEN_MAX_SCORE = SCREEN_ITEM_COUNT * 3; // 72
