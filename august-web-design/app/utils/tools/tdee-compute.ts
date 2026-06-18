// TDEE-specific orchestration. Primitives live in app/utils/tools/health-math.
import type { Gender, ActivityLevel, FormData, TDEEResult } from "@/app/data/tools/tdee-config";
import { ACTIVITY_OPTIONS } from "@/app/data/tools/tdee-config";
import { mifflinStJeor, calculateBMI, lbsToKg, feetInchesToCm } from "./health-math";

// Re-export unit helpers used by FormScreens.tsx so they have one import path.
export { cmToFeetInches, feetInchesToCm, kgToLbs, lbsToKg } from "./health-math";

function getWeightInKg(weight: number, unit: "kg" | "lbs"): number {
  return unit === "kg" ? weight : lbsToKg(weight);
}

function getHeightInCm(height: number, unit: "cm" | "ft"): number {
  if (unit === "cm") return height;
  const feet = Math.floor(height);
  const inches = (height - feet) * 10;
  return feetInchesToCm(feet, inches);
}

function getActivityMultiplier(activityLevel: ActivityLevel): number {
  const activity = ACTIVITY_OPTIONS.find((a) => a.value === activityLevel);
  return activity?.multiplier ?? 1.2;
}

function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * getActivityMultiplier(activityLevel);
}

// Katch-McArdle BMR (body-fat known)
function calculateBMRWithBodyFat(weightKg: number, bodyFatPercent: number): number {
  const leanBodyMass = weightKg * (1 - bodyFatPercent / 100);
  return 370 + 21.6 * leanBodyMass;
}

// Mifflin-St Jeor for all three genders (matches original lib logic)
function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  if (gender === "male" || gender === "female") {
    return mifflinStJeor({ weightKg, heightCm, age, sex: gender });
  }
  // 'other' → average of male and female offsets
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return base + (5 - 161) / 2;
}

function calculateWeightGoals(tdee: number): {
  loseWeight: { slow: number; fast: number };
  gainWeight: { slow: number; fast: number };
} {
  return {
    loseWeight: {
      slow: Math.round(tdee - 500),
      fast: Math.round(tdee - 1000),
    },
    gainWeight: {
      slow: Math.round(tdee + 250),
      fast: Math.round(tdee + 500),
    },
  };
}

export function calculateTDEEResult(formData: FormData): TDEEResult | null {
  const { gender, height, weight, age, activityLevel, bodyFatPercent } = formData;

  if (!gender || !age || !activityLevel) return null;

  const weightKg = getWeightInKg(weight.value, weight.unit);
  const heightCm = getHeightInCm(height.value, height.unit);

  let bmr: number;
  if (bodyFatPercent !== null && bodyFatPercent > 0) {
    bmr = calculateBMRWithBodyFat(weightKg, bodyFatPercent);
  } else {
    bmr = calculateBMR(weightKg, heightCm, age, gender);
  }

  const tdee = calculateTDEE(bmr, activityLevel);
  const bmi = calculateBMI({ weightKg, heightCm });
  const goals = calculateWeightGoals(tdee);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    bmi,
    loseWeight: goals.loseWeight,
    gainWeight: goals.gainWeight,
  };
}

export function calculatePartialTDEE(formData: FormData): Partial<TDEEResult> | null {
  const { gender, height, weight, age, activityLevel } = formData;

  const weightKg = getWeightInKg(weight.value, weight.unit);
  const heightCm = getHeightInCm(height.value, height.unit);
  const bmi = calculateBMI({ weightKg, heightCm });

  if (!age) return { bmi };

  const bmr = calculateBMR(weightKg, heightCm, age, gender || "other");

  if (!activityLevel) {
    return {
      bmr: Math.round(bmr),
      bmi,
    };
  }

  if (!gender) {
    const tdee = calculateTDEE(bmr, activityLevel);
    const goals = calculateWeightGoals(tdee);
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      bmi,
      loseWeight: goals.loseWeight,
      gainWeight: goals.gainWeight,
    };
  }

  return calculateTDEEResult(formData);
}
