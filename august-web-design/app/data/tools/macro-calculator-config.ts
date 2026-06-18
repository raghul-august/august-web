import type { UnitSystem } from "@/app/utils/tools/health-math";

export type Sex = "male" | "female";
export type Formula = "mifflin" | "katch";
export type ActivityId =
  | "bmr"
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "veryActive"
  | "extraActive";
export type GoalId = "maintain" | "mildLoss" | "loss" | "extremeLoss" | "mildGain" | "gain" | "extremeGain";
export type SplitId = "balanced" | "lowFat" | "lowCarb" | "highProtein";

export const AGE_MIN = 18;
export const AGE_MAX = 80;
export const HEIGHT_CM_MIN = 120;
export const HEIGHT_CM_MAX = 230;
export const WEIGHT_KG_MIN = 30;
export const WEIGHT_KG_MAX = 300;
export const BODY_FAT_MIN = 3;
export const BODY_FAT_MAX = 60;
export const CALORIE_FLOOR = 1200;

export interface ActivityMeta {
  id: ActivityId;
  label: string;
  helper: string;
  multiplier: number;
}

export const ACTIVITIES: readonly ActivityMeta[] = [
  { id: "bmr", label: "Basal Metabolic Rate", helper: "Just your BMR (rest, no activity)", multiplier: 1.0 },
  { id: "sedentary", label: "Sedentary", helper: "Little or no exercise", multiplier: 1.2 },
  { id: "light", label: "Lightly Active", helper: "Exercise 1-3 times per week", multiplier: 1.375 },
  { id: "moderate", label: "Moderately Active", helper: "Exercise 4-5 times per week", multiplier: 1.465 },
  { id: "active", label: "Active", helper: "Daily or intense exercise 3-4 times per week", multiplier: 1.55 },
  { id: "veryActive", label: "Very Active", helper: "Intense exercise 6-7 times per week", multiplier: 1.725 },
  { id: "extraActive", label: "Extra Active", helper: "Very intense exercise daily, or physical job", multiplier: 1.9 },
];

export interface GoalMeta {
  id: GoalId;
  label: string;
  helper: string;
  calorieDelta: number;
}

export const GOALS: readonly GoalMeta[] = [
  { id: "maintain", label: "Maintain weight", helper: "Stay at current weight", calorieDelta: 0 },
  { id: "mildLoss", label: "Mild weight loss", helper: "About 0.5 lb (0.25 kg) per week", calorieDelta: -250 },
  { id: "loss", label: "Weight loss", helper: "About 1 lb (0.5 kg) per week", calorieDelta: -500 },
  { id: "extremeLoss", label: "Extreme weight loss", helper: "About 2 lb (1 kg) per week", calorieDelta: -1000 },
  { id: "mildGain", label: "Mild weight gain", helper: "About 0.5 lb (0.25 kg) per week", calorieDelta: 250 },
  { id: "gain", label: "Weight gain", helper: "About 1 lb (0.5 kg) per week", calorieDelta: 500 },
  { id: "extremeGain", label: "Extreme weight gain", helper: "About 2 lb (1 kg) per week", calorieDelta: 1000 },
];

export interface SplitMeta {
  id: SplitId;
  label: string;
  blurb: string;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
}

// Sums >100% by design — displayed grams round up to give a small buffer.
export const SPLITS: readonly SplitMeta[] = [
  {
    id: "balanced",
    label: "Balanced",
    blurb: "A flexible split that works for most goals.",
    proteinPct: 0.2439,
    carbPct: 0.5333,
    fatPct: 0.2557,
  },
  {
    id: "lowFat",
    label: "Low Fat",
    blurb: "Higher carbs, lower fat — common for endurance training.",
    proteinPct: 0.2683,
    carbPct: 0.56,
    fatPct: 0.2045,
  },
  {
    id: "lowCarb",
    label: "Low Carb",
    blurb: "Trims carbs, lifts fat. Often used for body recomposition.",
    proteinPct: 0.2927,
    carbPct: 0.4267,
    fatPct: 0.3068,
  },
  {
    id: "highProtein",
    label: "High Protein",
    blurb: "Maximizes protein at the top of the safe range.",
    proteinPct: 0.3415,
    carbPct: 0.4533,
    fatPct: 0.2301,
  },
];

export interface MacroFormState {
  unitSystem: UnitSystem;
  sex: Sex;
  ageRaw: string;
  heightCmRaw: string;
  heightFeetRaw: string;
  heightInchesRaw: string;
  weightKgRaw: string;
  weightLbRaw: string;
  formula: Formula;
  bodyFatRaw: string;
  activity: ActivityId;
  goal: GoalId;
}

export const DEFAULT_STATE: MacroFormState = {
  unitSystem: "imperial",
  sex: "male",
  ageRaw: "",
  heightCmRaw: "",
  heightFeetRaw: "",
  heightInchesRaw: "",
  weightKgRaw: "",
  weightLbRaw: "",
  formula: "mifflin",
  bodyFatRaw: "",
  activity: "moderate",
  goal: "maintain",
};
