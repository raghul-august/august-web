// body-fat-calculator-config.ts — pure data, no React

export type Mode = "navy" | "army-abcp";
export type Sex = "male" | "female";
export type Units = "metric" | "us";

export interface FormData {
  mode: Mode;
  sex: Sex;
  units: Units;
  age: string;
  weight: string;
  height: string;
  neck: string;
  waist: string;
  hip: string;
  abdominal: string;
}

export interface NavyResult {
  kind: "navy";
  bfp: number;        // 1 decimal
  fatMassKg: number;
  leanMassKg: number;
  idealBfp: number;
  fatToLoseKg: number | null; // null when already at/below ideal
  bmiBfp: number;
  category: AceCategory;
  sex: Sex;
  age: number;
}

export interface ArmyResult {
  kind: "army";
  bfp: number;        // integer; -1 means <10
  pass: boolean;
  ageBracket: string;
  threshold: number;
  sex: Sex;
  age: number;
  outOfRange?: true;
}

export type Result = NavyResult | ArmyResult;

export type AceCategory = "essential" | "athletes" | "fitness" | "average" | "obese";

export const DEFAULT_FORM_DATA: FormData = {
  mode: "navy",
  sex: "male",
  units: "metric",
  age: "25",
  weight: "70",
  height: "178",
  neck: "38",
  waist: "83",
  hip: "95",
  abdominal: "34",
};

// Jackson & Pollock ideal BF table — 5-year age buckets
export const JP_TABLE: { age: number; men: number; women: number }[] = [
  { age: 20, men: 8.5,  women: 17.7 },
  { age: 25, men: 10.5, women: 18.4 },
  { age: 30, men: 12.7, women: 19.3 },
  { age: 35, men: 13.7, women: 21.5 },
  { age: 40, men: 15.3, women: 22.2 },
  { age: 45, men: 16.4, women: 22.9 },
  { age: 50, men: 18.9, women: 25.2 },
  { age: 55, men: 20.9, women: 26.3 },
];

// ACE body-fat category bands
export const ACE_BANDS: {
  category: AceCategory;
  menMin: number;
  menMax: number;
  womenMin: number;
  womenMax: number;
}[] = [
  { category: "essential", menMin: 2,  menMax: 5,  womenMin: 10, womenMax: 13 },
  { category: "athletes",  menMin: 6,  menMax: 13, womenMin: 14, womenMax: 20 },
  { category: "fitness",   menMin: 14, menMax: 17, womenMin: 21, womenMax: 24 },
  { category: "average",   menMin: 18, menMax: 24, womenMin: 25, womenMax: 31 },
  { category: "obese",     menMin: 25, menMax: 999,womenMin: 32, womenMax: 999 },
];

// Army ABCP max body-fat thresholds
export const ARMY_BRACKETS_MALE: { label: string; ageMin: number; ageMax: number; max: number }[] = [
  { label: "Under 21", ageMin: 0,  ageMax: 20, max: 20 },
  { label: "21–27",    ageMin: 21, ageMax: 27, max: 22 },
  { label: "28–39",    ageMin: 28, ageMax: 39, max: 24 },
  { label: "40+",      ageMin: 40, ageMax: 999,max: 26 },
];

export const ARMY_BRACKETS_FEMALE: { label: string; ageMin: number; ageMax: number; max: number }[] = [
  { label: "Under 21", ageMin: 0,  ageMax: 20, max: 30 },
  { label: "21–27",    ageMin: 21, ageMax: 27, max: 32 },
  { label: "28–39",    ageMin: 28, ageMax: 39, max: 34 },
  { label: "40+",      ageMin: 40, ageMax: 999,max: 36 },
];

export const CATEGORY_LABELS: Record<AceCategory, string> = {
  essential: "Essential",
  athletes:  "Athletes",
  fitness:   "Fitness",
  average:   "Average",
  obese:     "Obese",
};

// Spectrum bar segment order for display
export const SPECTRUM_SEGMENTS: AceCategory[] = [
  "essential", "athletes", "fitness", "average", "obese",
];
