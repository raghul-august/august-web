import {
  calculateBMI,
  parseNumOrNull,
  resolveHeightCm,
  resolveWeightKg,
} from "@/app/utils/tools/health-math";
import type { BadgeTone } from "@/app/utils/tools/tool-colors";

export type UnitSystem = "metric" | "imperial";
export type Sex = "male" | "female" | "unspecified";

export type BMICategoryId =
  | "severe_thinness"
  | "moderate_thinness"
  | "mild_thinness"
  | "normal"
  | "overweight"
  | "obese_1"
  | "obese_2"
  | "obese_3";

export interface BMICategory {
  id: BMICategoryId;
  label: string;
  shortLabel: string;
  min: number;
  max: number;
  tone: BadgeTone;
  description: string;
}

export const BMI_CATEGORIES: readonly BMICategory[] = [
  {
    id: "severe_thinness",
    label: "Severe Thinness",
    shortLabel: "Underweight",
    min: 0,
    max: 16,
    tone: "danger",
    description: "BMI below 16 indicates severe thinness and may signal underlying health concerns. Speak with a clinician.",
  },
  {
    id: "moderate_thinness",
    label: "Moderate Thinness",
    shortLabel: "Underweight",
    min: 16,
    max: 17,
    tone: "warning",
    description: "BMI between 16 and 17 falls in the moderate thinness range. Consider a conversation with a healthcare provider.",
  },
  {
    id: "mild_thinness",
    label: "Mild Thinness",
    shortLabel: "Underweight",
    min: 17,
    max: 18.5,
    tone: "info",
    description: "BMI between 17 and 18.5 is classified as mild thinness, slightly below the healthy range.",
  },
  {
    id: "normal",
    label: "Normal",
    shortLabel: "Healthy weight",
    min: 18.5,
    max: 25,
    tone: "success",
    description: "BMI between 18.5 and 24.9 is generally associated with the lowest risk of weight-related health conditions.",
  },
  {
    id: "overweight",
    label: "Overweight",
    shortLabel: "Overweight",
    min: 25,
    max: 30,
    tone: "warning",
    description: "BMI between 25 and 29.9 falls in the overweight range. Lifestyle changes can meaningfully lower long-term risk.",
  },
  {
    id: "obese_1",
    label: "Obese Class I",
    shortLabel: "Obesity",
    min: 30,
    max: 35,
    tone: "danger",
    description: "BMI between 30 and 34.9 is Obese Class I. Talk to a clinician about evidence-based options for sustainable weight management.",
  },
  {
    id: "obese_2",
    label: "Obese Class II",
    shortLabel: "Obesity",
    min: 35,
    max: 40,
    tone: "danger",
    description: "BMI between 35 and 39.9 is Obese Class II. Medical guidance can help identify safe, supported paths forward.",
  },
  {
    id: "obese_3",
    label: "Obese Class III",
    shortLabel: "Severe obesity",
    min: 40,
    max: Number.POSITIVE_INFINITY,
    tone: "danger",
    description: "BMI of 40 or higher is Obese Class III (severe obesity), associated with the highest health risk. Speak with a clinician.",
  },
];

export interface BMIFormState {
  unitSystem: UnitSystem;
  heightCmRaw: string;
  heightFeetRaw: string;
  heightInchesRaw: string;
  weightKgRaw: string;
  weightLbRaw: string;
  ageRaw: string;
  sex: Sex;
}

export const HEIGHT_CM_MIN = 91;
export const HEIGHT_CM_MAX = 274;
export const WEIGHT_KG_MIN = 25;
export const WEIGHT_KG_MAX = 454;
export const AGE_MIN = 20;
export const AGE_MAX = 120;

export interface BMIResultOk {
  kind: "ok";
  bmi: number;
  category: BMICategory;
  bmiPrime: number;
  ponderalIndex: number;
  healthyMinKg: number;
  healthyMaxKg: number;
  heightCm: number;
  weightKg: number;
}

export interface BMIResultInvalid {
  kind: "invalid";
  reason: string;
}

export type BMIResult = BMIResultOk | BMIResultInvalid;

function findCategory(bmi: number): BMICategory {
  for (const cat of BMI_CATEGORIES) {
    if (bmi >= cat.min && bmi < cat.max) return cat;
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

export function computeBMI(state: BMIFormState): BMIResult {
  const heightCm = resolveHeightCm(state);
  const weightKg = resolveWeightKg(state);

  if (heightCm == null || weightKg == null) {
    return { kind: "invalid", reason: "missing" };
  }
  if (heightCm < HEIGHT_CM_MIN || heightCm > HEIGHT_CM_MAX) {
    return { kind: "invalid", reason: "height_out_of_range" };
  }
  if (weightKg < WEIGHT_KG_MIN || weightKg > WEIGHT_KG_MAX) {
    return { kind: "invalid", reason: "weight_out_of_range" };
  }

  const bmi = calculateBMI({ weightKg, heightCm });
  const category = findCategory(bmi);
  const bmiPrime = Math.round((bmi / 25) * 100) / 100;

  const heightM = heightCm / 100;
  const ponderalIndex = Math.round((weightKg / Math.pow(heightM, 3)) * 10) / 10;
  const healthyMinKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const healthyMaxKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  return {
    kind: "ok",
    bmi,
    category,
    bmiPrime,
    ponderalIndex,
    healthyMinKg,
    healthyMaxKg,
    heightCm,
    weightKg,
  };
}

export function bmiBucket(bmi: number): string {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  if (bmi < 35) return "obese_1";
  if (bmi < 40) return "obese_2";
  return "obese_3";
}
