// Pure data config for the Weight Loss Timeline Projector tool.
// No React.

export type Medication = "tirzepatide" | "semaglutide" | "retatrutide";

export type Milestone = { week: number; pct: number }; // pct is negative for loss

export type MedicationDef = {
  id: Medication;
  label: string;        // user-facing dropdown label
  brand: string;        // brand context line, displayed under chart
  trialSource: string;  // citation rendered as caveat in result region
  maxWeek: number;      // last published trial week
  // Compute prepends {week:0, pct:0}; do not include it here.
  milestones: Milestone[];
  // Calorie deficit percentage applied when computing the optional macro panel.
  // Tirz / reta = 25%, sema = 20%, mirroring class-level published guidance.
  deficitPct: number;
};

export const MEDICATIONS: Record<Medication, MedicationDef> = {
  tirzepatide: {
    id: "tirzepatide",
    label: "Tirzepatide",
    brand: "Mounjaro / Zepbound",
    trialSource: "SURMOUNT-5 on-treatment estimand (72 weeks)",
    maxWeek: 72,
    milestones: [
      { week: 4, pct: -3.1 },
      { week: 12, pct: -8.3 },
      { week: 24, pct: -14.5 },
      { week: 36, pct: -17.9 },
      { week: 48, pct: -19.9 },
      { week: 60, pct: -20.9 },
      { week: 72, pct: -21.6 },
    ],
    deficitPct: 0.25,
  },
  semaglutide: {
    id: "semaglutide",
    label: "Semaglutide",
    brand: "Ozempic / Wegovy",
    trialSource: "SURMOUNT-5 on-treatment estimand (72 weeks)",
    maxWeek: 72,
    milestones: [
      { week: 4, pct: -2.6 },
      { week: 12, pct: -5.9 },
      { week: 24, pct: -10.5 },
      { week: 36, pct: -13.1 },
      { week: 48, pct: -14.9 },
      { week: 60, pct: -15.2 },
      { week: 72, pct: -15.4 },
    ],
    deficitPct: 0.20,
  },
  retatrutide: {
    id: "retatrutide",
    label: "Retatrutide 12 mg",
    brand: "Investigational (Lilly)",
    trialSource: "Retatrutide Phase 2 (48 weeks, 12 mg dose)",
    maxWeek: 48,
    milestones: [
      { week: 4, pct: -5.1 },
      { week: 12, pct: -12.9 },
      { week: 24, pct: -17.5 },
      { week: 36, pct: -21.3 },
      { week: 48, pct: -24.2 },
    ],
    deficitPct: 0.25,
  },
};

export const MEDICATION_ORDER: Medication[] = [
  "tirzepatide",
  "semaglutide",
  "retatrutide",
];

// --- Activity options (calorie panel) ---

export type ActivityKey = "sedentary" | "light" | "moderate" | "active" | "extreme";

export type ActivityOption = {
  key: ActivityKey;
  label: string;
  description: string;
};

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  { key: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { key: "light", label: "Light", description: "Exercise 1–3 days a week" },
  { key: "moderate", label: "Moderate", description: "Exercise 3–5 days a week" },
  { key: "active", label: "Active", description: "Hard exercise 6–7 days a week" },
  { key: "extreme", label: "Very active", description: "Very hard exercise + physical job" },
];

