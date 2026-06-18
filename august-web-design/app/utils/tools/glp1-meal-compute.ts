// Pure compute for GLP-1 Meal Planner tool.
// No React, no side effects.

import type { Meal, MealSlot } from "@/app/data/tools/glp1-meal-planner-config";
import {
  ACTIVITY_LEVELS,
  GLP1_PHASES,
  MEAL_DATABASE,
} from "@/app/data/tools/glp1-meal-planner-config";
import { ACTIVITY_OPTIONS } from "@/app/data/tools/tdee-config";
import { mifflinStJeor, lbsToKg } from "./health-math";

export type Sex = "male" | "female";

export type MealInput = {
  weightLbs: number;
  heightIn: number;
  age: number;
  sex: Sex;
  activity: string; // activity level id
  strengthTraining: boolean;
  mealsPerDay: 3 | 4 | 5;
  diet: string; // diet option string
  phase: string; // phase id
};

export type MealPlanWarning =
  | "protein_below_target"
  | "calories_below_target"
  | "calories_above_target"
  | "very_low_calories"
  | "elderly_protein_note";

export type MealResult = {
  proteinTarget: number; // daily grams
  dailyCalories: number;
  perMealProtein: number;
  meals: Meal[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
  warnings: MealPlanWarning[];
};

export const SLOT_DISTRIBUTIONS: Record<3 | 4 | 5, MealSlot[]> = {
  3: ["breakfast", "lunch", "dinner"],
  4: ["breakfast", "morning-snack", "lunch", "dinner"],
  5: ["breakfast", "morning-snack", "lunch", "afternoon-snack", "dinner"],
};

const MIN_ADULT_WEIGHT_LBS = 70;
const MAX_ADULT_WEIGHT_LBS = 700;

const DIET_TAGS_BY_OPTION: Record<string, string[] | "all"> = {
  standard: "all",
  vegetarian: ["vegetarian"],
  pescatarian: ["pescatarian", "vegetarian"],
  "dairy-free": ["dairy-free"],
  "gluten-free": ["gluten-free"],
};

// Standard TDEE activity multipliers (Mifflin-St Jeor convention), derived from canonical ACTIVITY_OPTIONS
const ACTIVITY_MULTIPLIERS: Record<string, number> = Object.fromEntries(
  ACTIVITY_OPTIONS.map((o) => [o.value, o.multiplier]),
);

function assertRange(value: number, min: number, max: number, label: string): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${label} must be between ${min} and ${max}.`);
  }
}

function validateInput(input: MealInput): void {
  assertRange(input.weightLbs, MIN_ADULT_WEIGHT_LBS, MAX_ADULT_WEIGHT_LBS, "Weight");
  assertRange(input.heightIn, 48, 96, "Height");
  assertRange(input.age, 18, 100, "Age");
  if (input.sex !== "male" && input.sex !== "female") throw new RangeError("Sex must be 'male' or 'female'.");
  if (!SLOT_DISTRIBUTIONS[input.mealsPerDay]) throw new RangeError("Meals per day must be 3, 4, or 5.");
  if (!ACTIVITY_LEVELS.some((l) => l.id === input.activity)) throw new RangeError(`Unknown activity level: ${input.activity}`);
  if (!GLP1_PHASES.some((p) => p.id === input.phase)) throw new RangeError(`Unknown GLP-1 phase: ${input.phase}`);
  if (!DIET_TAGS_BY_OPTION[input.diet.toLowerCase()]) throw new RangeError(`Unknown diet option: ${input.diet}`);
}

function getDietPool(diet: string): Meal[] {
  const tags = DIET_TAGS_BY_OPTION[diet.toLowerCase()];
  if (tags === "all") return [...MEAL_DATABASE];
  return MEAL_DATABASE.filter((m) => tags.some((tag) => m.dietTags.includes(tag)));
}

// FNV-1a hash of an input string → deterministic 32-bit seed
function hashInputs(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Mulberry32 seeded PRNG — returns a () => number factory
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle using a seeded PRNG
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function matchMeals(
  diet: string,
  count: 3 | 4 | 5,
  targetProtein: number,
  targetCalories: number,
  rng: () => number,
): Meal[] {
  const pool = getDietPool(diet);
  const slots = SLOT_DISTRIBUTIONS[count];
  const candidatesBySlot = slots.map((slot) => {
    const isSnack = slot === "morning-snack" || slot === "afternoon-snack";
    const candidates = pool.filter((m) => {
      if (isSnack) {
        return m.mealSlot === "morning-snack" || m.mealSlot === "afternoon-snack";
      }
      return m.mealSlot === slot;
    });

    if (!candidates.length) {
      throw new Error(`No meals available for ${diet} ${slot}.`);
    }

    // Shuffle candidates deterministically using seeded rng
    return shuffle(candidates, rng);
  });

  let bestMeals: Meal[] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  function scoreMeals(meals: Meal[]): number {
    const totals = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
      }),
      { calories: 0, protein: 0 },
    );
    const proteinGap = Math.abs(totals.protein - targetProtein);
    const calorieGap = Math.abs(totals.calories - targetCalories) / 25;

    return proteinGap * 4 + calorieGap;
  }

  function walk(slotIndex: number, usedNames: Set<string>, picked: Meal[]) {
    if (slotIndex === candidatesBySlot.length) {
      const score = scoreMeals(picked);
      if (score < bestScore) {
        bestScore = score;
        bestMeals = [...picked];
      }
      return;
    }

    // Limit candidates per slot to top 5 (already shuffled) to keep combinatorics bounded
    const candidates = candidatesBySlot[slotIndex].slice(0, 5);
    for (const candidate of candidates) {
      if (usedNames.has(candidate.name)) continue;
      usedNames.add(candidate.name);
      picked.push(candidate);
      walk(slotIndex + 1, usedNames, picked);
      picked.pop();
      usedNames.delete(candidate.name);
    }
  }

  walk(0, new Set<string>(), []);

  const finalMeals = bestMeals as Meal[] | null;
  if (!finalMeals || finalMeals.length !== count) {
    throw new Error(`Unable to build a complete ${count}-meal plan for ${diet}.`);
  }

  return finalMeals;
}

export type MealPlanOptions = {
  /** Override the shuffle seed. Pass Date.now() from the regenerate button to get a fresh plan. */
  seed?: number;
};

export function computeMealPlan(input: MealInput, options: MealPlanOptions = {}): MealResult {
  validateInput(input);

  const { weightLbs, heightIn, age, sex, activity, strengthTraining, mealsPerDay, diet, phase } =
    input;

  // Build deterministic seed from inputs unless caller overrides (e.g. regenerate)
  const seed = options.seed !== undefined
    ? options.seed
    : hashInputs(`${weightLbs}|${age}|${sex}|${diet}|${phase}`);
  const rng = mulberry32(seed);

  const weightKg = lbsToKg(weightLbs);
  const heightCm = heightIn * 2.54;

  // Protein multiplier from activity level
  const level = ACTIVITY_LEVELS.find((l) => l.id === activity);
  let proteinMultiplier = level!.multiplier;
  if (strengthTraining && proteinMultiplier < 1.5) {
    proteinMultiplier = 1.5;
  }
  const proteinTarget = Math.round(weightKg * proteinMultiplier);

  // Mifflin-St Jeor BMR via shared kit
  const bmr = mifflinStJeor({ weightKg, heightCm, age, sex });

  // TDEE = BMR × activity multiplier
  const activityMult = ACTIVITY_MULTIPLIERS[activity] ?? 1.375;
  let dailyCalories = bmr * activityMult;

  // Apply GLP-1 phase portion multiplier
  const phaseObj = GLP1_PHASES.find((p) => p.id === phase);
  dailyCalories *= phaseObj!.portionMultiplier;

  // Weight-relative floor and ceiling
  const calorieFloor = Math.max(weightKg * 12, 800);
  const calorieCeiling = Math.min(Math.max(2000, weightKg * 26), 2800);
  dailyCalories = Math.round(Math.min(calorieCeiling, Math.max(calorieFloor, dailyCalories)));

  const perMealProtein = Math.round(proteinTarget / mealsPerDay);
  const meals = matchMeals(diet, mealsPerDay, proteinTarget, dailyCalories, rng);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const warnings: MealPlanWarning[] = [];
  if (totals.protein < proteinTarget * 0.9) {
    warnings.push("protein_below_target");
  }
  if (totals.calories < dailyCalories * 0.8) {
    warnings.push("calories_below_target");
  }
  if (totals.calories > dailyCalories * 1.15) {
    warnings.push("calories_above_target");
  }
  if (dailyCalories < 1000) {
    warnings.push("very_low_calories");
  }
  if (age >= 65) {
    warnings.push("elderly_protein_note");
  }

  return {
    proteinTarget,
    dailyCalories,
    perMealProtein,
    meals,
    totals,
    warnings,
  };
}
