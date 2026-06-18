import {
  ACTIVITY_LEVELS,
  harrisBenedict,
  katchMcArdle,
  mifflinStJeor,
  parseNumOrNull,
  resolveHeightCm,
  resolveWeightKg,
  type ActivityLevel,
} from "@/app/utils/tools/health-math";

export type UnitSystem = "metric" | "imperial";
export type Sex = "male" | "female";
export type BMRFormula = "mifflin" | "harris" | "katch";

export interface BMRFormState {
  unitSystem: UnitSystem;
  sex: Sex;
  ageRaw: string;
  heightCmRaw: string;
  heightFeetRaw: string;
  heightInchesRaw: string;
  weightKgRaw: string;
  weightLbRaw: string;
  bodyFatRaw: string;
  formula: BMRFormula;
  activity: ActivityLevel;
}

export const AGE_MIN = 15;
export const AGE_MAX = 100;
export const HEIGHT_CM_MIN = 130;
export const HEIGHT_CM_MAX = 230;
export const WEIGHT_KG_MIN = 30;
export const WEIGHT_KG_MAX = 300;
export const BODY_FAT_MIN = 3;
export const BODY_FAT_MAX = 60;

export interface FormulaMeta {
  id: BMRFormula;
  label: string;
  shortLabel: string;
  blurb: string;
  needsBodyFat: boolean;
}

export const FORMULAS: readonly FormulaMeta[] = [
  {
    id: "mifflin",
    label: "Mifflin-St Jeor",
    shortLabel: "Mifflin",
    blurb: "Most accurate for the general adult population. Default.",
    needsBodyFat: false,
  },
  {
    id: "harris",
    label: "Revised Harris-Benedict",
    shortLabel: "Harris-Benedict",
    blurb: "Classic equation, revised in 1984. Slightly higher estimates.",
    needsBodyFat: false,
  },
  {
    id: "katch",
    label: "Katch-McArdle",
    shortLabel: "Katch-McArdle",
    blurb: "Best if you know your body-fat %. Uses lean body mass.",
    needsBodyFat: true,
  },
];

export interface ActivityMeta {
  id: ActivityLevel;
  label: string;
  helper: string;
  multiplier: number;
  calories?: number;
}

export const ACTIVITIES: readonly ActivityMeta[] = [
  { id: "sedentary", label: "Sedentary", helper: "Little or no exercise", multiplier: ACTIVITY_LEVELS.sedentary, calories: 0 },
  { id: "light", label: "Light", helper: "Exercise 1–3 days / week", multiplier: ACTIVITY_LEVELS.light, calories: 0 },
  { id: "moderate", label: "Moderate", helper: "Exercise 3–5 days / week", multiplier: ACTIVITY_LEVELS.moderate, calories: 0 },
  { id: "active", label: "Active", helper: "Exercise 6–7 days / week", multiplier: ACTIVITY_LEVELS.active, calories: 0 },
  { id: "extreme", label: "Very active", helper: "Hard daily exercise or physical job", multiplier: ACTIVITY_LEVELS.extreme, calories: 0 },
];

export interface ActivityRow {
  id: ActivityLevel;
  label: string;
  helper: string;
  multiplier: number;
  calories: number;
}

export interface WeightGoalRow {
  id: "lose_strong" | "lose_mild" | "maintain" | "gain_mild" | "gain_strong";
  label: string;
  description: string;
  calories: number;
  deltaKcal: number;
}

export interface BMRResultOk {
  kind: "ok";
  bmr: number;
  tdee: number;
  formula: BMRFormula;
  activity: ActivityLevel;
  activityCalories: ActivityRow[];
  goals: WeightGoalRow[];
  inputs: {
    weightKg: number;
    heightCm: number;
    age: number;
    sex: Sex;
    bodyFatPct: number | null;
  };
}

export interface BMRResultInvalid {
  kind: "invalid";
  reason:
    | "missing"
    | "age_out_of_range"
    | "height_out_of_range"
    | "weight_out_of_range"
    | "body_fat_out_of_range"
    | "needs_body_fat";
}

export type BMRResult = BMRResultOk | BMRResultInvalid;

function round(n: number): number {
  return Math.round(n);
}

export function computeBMR(state: BMRFormState): BMRResult {
  const age = parseNumOrNull(state.ageRaw);
  const heightCm = resolveHeightCm(state);
  const weightKg = resolveWeightKg(state);
  const bodyFatPct = parseNumOrNull(state.bodyFatRaw);

  if (age == null || heightCm == null || weightKg == null) {
    return { kind: "invalid", reason: "missing" };
  }
  if (age < AGE_MIN || age > AGE_MAX) {
    return { kind: "invalid", reason: "age_out_of_range" };
  }
  if (heightCm < HEIGHT_CM_MIN || heightCm > HEIGHT_CM_MAX) {
    return { kind: "invalid", reason: "height_out_of_range" };
  }
  if (weightKg < WEIGHT_KG_MIN || weightKg > WEIGHT_KG_MAX) {
    return { kind: "invalid", reason: "weight_out_of_range" };
  }

  let bmr: number;
  if (state.formula === "katch") {
    if (bodyFatPct == null) return { kind: "invalid", reason: "needs_body_fat" };
    if (bodyFatPct < BODY_FAT_MIN || bodyFatPct > BODY_FAT_MAX) {
      return { kind: "invalid", reason: "body_fat_out_of_range" };
    }
    bmr = katchMcArdle({ weightKg, bodyFatPct });
  } else if (state.formula === "harris") {
    bmr = harrisBenedict({ weightKg, heightCm, age, sex: state.sex });
  } else {
    bmr = mifflinStJeor({ weightKg, heightCm, age, sex: state.sex });
  }

  bmr = round(bmr);

  const activityCalories: ActivityRow[] = ACTIVITIES.map((a) => ({
    id: a.id,
    label: a.label,
    helper: a.helper,
    multiplier: a.multiplier,
    calories: round(bmr * a.multiplier),
  }));

  const selected = activityCalories.find((a) => a.id === state.activity) ?? activityCalories[0];
  const tdee = selected.calories;

  const goals: WeightGoalRow[] = [
    {
      id: "lose_strong",
      label: "Lose 1 lb / week",
      description: "Aggressive cut, ~500 kcal deficit",
      calories: Math.max(1200, tdee - 500),
      deltaKcal: -500,
    },
    {
      id: "lose_mild",
      label: "Lose 0.5 lb / week",
      description: "Mild cut, ~250 kcal deficit",
      calories: Math.max(1200, tdee - 250),
      deltaKcal: -250,
    },
    {
      id: "maintain",
      label: "Maintain weight",
      description: "Match your daily expenditure",
      calories: tdee,
      deltaKcal: 0,
    },
    {
      id: "gain_mild",
      label: "Gain 0.5 lb / week",
      description: "Lean bulk, ~250 kcal surplus",
      calories: tdee + 250,
      deltaKcal: 250,
    },
    {
      id: "gain_strong",
      label: "Gain 1 lb / week",
      description: "Aggressive bulk, ~500 kcal surplus",
      calories: tdee + 500,
      deltaKcal: 500,
    },
  ];

  return {
    kind: "ok",
    bmr,
    tdee,
    formula: state.formula,
    activity: state.activity,
    activityCalories,
    goals,
    inputs: { weightKg, heightCm, age, sex: state.sex, bodyFatPct: state.formula === "katch" ? bodyFatPct : null },
  };
}

export function bmrBucket(bmr: number): string {
  if (bmr < 1200) return "very_low";
  if (bmr < 1500) return "low";
  if (bmr < 1800) return "moderate";
  if (bmr < 2100) return "above_average";
  return "high";
}
