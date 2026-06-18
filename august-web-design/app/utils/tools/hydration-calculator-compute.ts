// Pure compute for Hydration Calculator tool.
// No React, no side effects.

import type {
  HydrationFormData,
  HydrationResult,
  ConditionalMessage,
  Gender,
  ActivityLevel,
  PregnancyStatus,
} from "@/app/data/tools/hydration-calculator-config";
import {
  BEVERAGES,
  FOOD_WATER_CONTRIBUTION,
  WHO_LIQUID_CALORIE_GUIDELINE,
  ACTIVITY_OPTIONS,
} from "@/app/data/tools/hydration-calculator-config";
import { lbsToKg, clamp } from "./health-math";

// Re-export unit helpers for container convenience.
export { lbsToKg, kgToLbs } from "./health-math";

// --- Reference values (IOM guidelines) ---
const REFERENCE_WEIGHT = { male: 80, female: 65 } as const;
const REFERENCE_HEIGHT = { male: 175, female: 163 } as const;
const BASE_INTAKE = { male: 3.7, female: 2.7 } as const; // liters

// --- Unit conversions ---

export function getWeightInKg(value: number, unit: "kg" | "lbs"): number {
  return unit === "lbs" ? lbsToKg(value) : value;
}

export function getHeightInCm(value: number, unit: "cm" | "in"): number {
  return unit === "in" ? value * 2.54 : value;
}

// --- Core calculations ---

export function calculateRecommendedIntake(params: {
  weightKg: number;
  heightCm: number;
  gender: Gender;
  age: number;
  activityLevel: ActivityLevel;
  pregnancyStatus: PregnancyStatus;
}): number {
  const { weightKg, heightCm, gender, age, activityLevel, pregnancyStatus } = params;

  // Resolve gender-specific references (non-binary uses averaged values)
  const genderKey = gender === "male" ? "male" : "female";
  const refWeight = REFERENCE_WEIGHT[genderKey];
  const refHeight = REFERENCE_HEIGHT[genderKey];
  const base = BASE_INTAKE[genderKey];

  // Weight and height adjustments
  const weightAdj = (weightKg - refWeight) * 0.03;
  const heightAdj = (heightCm - refHeight) * 0.005;

  // Activity multiplier from config
  const activity = ACTIVITY_OPTIONS.find((a) => a.value === activityLevel);
  const activityMultiplier = activity?.multiplier ?? 1.0;

  let intake = (base + weightAdj + heightAdj) * activityMultiplier;

  // Pregnancy/breastfeeding additions
  if (pregnancyStatus === "pregnant") intake += 0.3;
  if (pregnancyStatus === "breastfeeding") intake += 0.7;

  // Age adjustment: seniors have lower total water needs
  if (age > 65) intake -= 0.2;

  // Clamp to physiologically reasonable range
  intake = clamp(intake, 1.5, 5.0);

  return Math.round(intake * 10) / 10;
}

export function calculateActualIntake(beverageIntake: Record<string, number>): number {
  let sum = 0;
  for (const bev of BEVERAGES) {
    const count = beverageIntake[bev.id] ?? 0;
    if (count <= 0) continue;
    sum += count * (bev.glassVolumeCl / 100) * bev.waterContentFactor;
  }
  return Math.round(sum * 100) / 100;
}

export function calculateBeverageCalories(beverageIntake: Record<string, number>): number {
  let sum = 0;
  for (const bev of BEVERAGES) {
    const count = beverageIntake[bev.id] ?? 0;
    if (count <= 0) continue;
    sum += count * bev.caloriesPerGlass;
  }
  return Math.round(sum);
}

// --- Conditional messages ---

const SUGARY_BEVERAGE_IDS = ["soda", "fruit-juice", "energy-drinks", "sport-drinks"];
const ALCOHOL_IDS = ["wine", "beer"];

export function buildConditionalMessages(params: {
  gender: Gender;
  pregnancyStatus: PregnancyStatus;
  age: number;
  beverageIntake: Record<string, number>;
}): ConditionalMessage[] {
  const { pregnancyStatus, age, beverageIntake } = params;
  const messages: ConditionalMessage[] = [];

  if (pregnancyStatus === "pregnant") {
    messages.push({
      type: "info",
      text: "Staying well hydrated during pregnancy supports healthy amniotic fluid levels and helps your body manage increased blood volume.",
    });
  }

  if (pregnancyStatus === "breastfeeding") {
    messages.push({
      type: "info",
      text: "Breastfeeding increases your daily fluid needs. Drink a glass of water each time you nurse to keep up with milk production.",
    });
  }

  if (age >= 65) {
    messages.push({
      type: "warning",
      text: "As you get older, your sense of thirst may become less reliable. Consider drinking on a schedule rather than waiting until you feel thirsty.",
    });
  }

  // Sugary beverages check
  const sugaryTotal = SUGARY_BEVERAGE_IDS.reduce(
    (acc, id) => acc + (beverageIntake[id] ?? 0),
    0,
  );
  if (sugaryTotal > 2) {
    messages.push({
      type: "warning",
      text: "Sugary drinks add hydration but also significant calories. Replacing some with water would improve your overall intake quality.",
    });
  }

  // Alcohol check
  const alcoholTotal = ALCOHOL_IDS.reduce(
    (acc, id) => acc + (beverageIntake[id] ?? 0),
    0,
  );
  if (alcoholTotal > 0) {
    messages.push({
      type: "info",
      text: "Alcohol acts as a mild diuretic. For every alcoholic drink, consider matching it with a glass of water.",
    });
  }

  // Liquid calorie excess
  const totalCalories = calculateBeverageCalories(beverageIntake);
  const calorieExcess = totalCalories - WHO_LIQUID_CALORIE_GUIDELINE;
  if (calorieExcess > 0) {
    messages.push({
      type: "info",
      text: `Your beverages account for ${totalCalories} kcal, which is ${Math.round(calorieExcess)} kcal above the WHO guideline of ${WHO_LIQUID_CALORIE_GUIDELINE} kcal from liquids. Swapping some for zero-calorie options can help.`,
    });
  }

  return messages;
}

// --- Main orchestrator ---

export function calculateHydrationResult(
  formData: HydrationFormData,
): HydrationResult | null {
  const {
    gender,
    age,
    weightValue,
    weightUnit,
    heightValue,
    heightUnit,
    activityLevel,
    pregnancyStatus,
    beverageIntake,
  } = formData;

  // Bail if any required field is missing
  if (
    gender == null ||
    age == null ||
    weightValue == null ||
    heightValue == null ||
    activityLevel == null
  ) {
    return null;
  }

  const weightKg = getWeightInKg(weightValue, weightUnit);
  const heightCm = getHeightInCm(heightValue, heightUnit);

  const recommendedIntake = calculateRecommendedIntake({
    weightKg,
    heightCm,
    gender,
    age,
    activityLevel,
    pregnancyStatus: pregnancyStatus ?? "none",
  });

  const actualIntake = calculateActualIntake(beverageIntake);

  // Total daily water turnover includes food contribution
  const dailyWaterLoss = recommendedIntake + FOOD_WATER_CONTRIBUTION;

  // Sufficient if beverage + food intake meets recommendation
  const isSufficientlyHydrated =
    actualIntake + FOOD_WATER_CONTRIBUTION >= recommendedIntake;

  const totalCalories = calculateBeverageCalories(beverageIntake);
  const isWithinCalorieGuideline = totalCalories <= WHO_LIQUID_CALORIE_GUIDELINE;
  const calorieExcess = Math.max(0, totalCalories - WHO_LIQUID_CALORIE_GUIDELINE);

  const conditionalMessages = buildConditionalMessages({
    gender,
    pregnancyStatus: pregnancyStatus ?? "none",
    age,
    beverageIntake,
  });

  return {
    recommendedIntakeLiters: recommendedIntake,
    actualIntakeLiters: actualIntake,
    dailyWaterLossLiters: dailyWaterLoss,
    foodWaterContributionLiters: FOOD_WATER_CONTRIBUTION,
    isSufficientlyHydrated,
    totalCaloriesFromBeverages: totalCalories,
    isWithinCalorieGuideline,
    calorieExcess,
    conditionalMessages,
  };
}
