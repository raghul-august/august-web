import { katchMcArdle, mifflinStJeor } from "./health-math";
import {
  ACTIVITIES,
  CALORIE_FLOOR,
  GOALS,
  SPLITS,
  type ActivityId,
  type Formula,
  type GoalId,
  type Sex,
  type SplitId,
} from "@/app/data/tools/macro-calculator-config";

export interface MacroInputs {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  formula: Formula;
  bodyFatPct: number | null;
  activity: ActivityId;
  goal: GoalId;
}

export interface MacroGrams {
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroSplitResult extends MacroGrams {
  id: SplitId;
  label: string;
  blurb: string;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
}

export interface MacroResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  goalDelta: number;
  activityMultiplier: number;
  splits: MacroSplitResult[];
  sugarLimitG: number;
  satFatLimitG: number;
  belowFloor: boolean;
}

function activityMultiplier(id: ActivityId): number {
  return ACTIVITIES.find((a) => a.id === id)?.multiplier ?? 1.2;
}

function goalDelta(id: GoalId): number {
  return GOALS.find((g) => g.id === id)?.calorieDelta ?? 0;
}

function gramsForSplit(target: number, proteinPct: number, carbPct: number, fatPct: number): MacroGrams {
  return {
    protein: (target * proteinPct) / 4,
    carbs: (target * carbPct) / 4,
    fat: (target * fatPct) / 9,
  };
}

export function computeMacros(input: MacroInputs): MacroResult {
  const { sex, age, heightCm, weightKg, formula, bodyFatPct, activity, goal } = input;

  const bmr =
    formula === "katch" && bodyFatPct != null
      ? katchMcArdle({ weightKg, bodyFatPct })
      : mifflinStJeor({ weightKg, heightCm, age, sex });

  const mult = activityMultiplier(activity);
  const tdee = bmr * mult;

  const delta = goalDelta(goal);
  const rawTarget = tdee + delta;
  const target = Math.max(rawTarget, CALORIE_FLOOR);
  const belowFloor = rawTarget < CALORIE_FLOOR;

  const splits: MacroSplitResult[] = SPLITS.map((s) => ({
    id: s.id,
    label: s.label,
    blurb: s.blurb,
    proteinPct: s.proteinPct,
    carbPct: s.carbPct,
    fatPct: s.fatPct,
    ...gramsForSplit(target, s.proteinPct, s.carbPct, s.fatPct),
  }));

  return {
    bmr,
    tdee,
    targetCalories: target,
    goalDelta: delta,
    activityMultiplier: mult,
    splits,
    sugarLimitG: (target * 0.1) / 4,
    satFatLimitG: (target * 0.1) / 9,
    belowFloor,
  };
}
