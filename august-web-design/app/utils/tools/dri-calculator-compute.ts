import { feetInchesToCm, lbsToKg, parseNumOrNull } from "@/app/utils/tools/health-math";
import {
  AGE_MAX,
  AGE_MIN,
  ACTIVITY_LABEL,
  PAL_MULTIPLIER,
  getProfile,
  type ActivityLevel,
  type LifeStage,
  type NutrientProfile,
  type Sex,
} from "@/app/data/tools/dri-calculator-config";

export type UnitSystem = "metric" | "imperial";

export interface DriFormState {
  unitSystem: UnitSystem;
  sex: Sex;
  ageRaw: string;
  heightCmRaw: string;
  heightFeetRaw: string;
  heightInchesRaw: string;
  weightKgRaw: string;
  weightLbRaw: string;
  activity: ActivityLevel;
  lifeStage: LifeStage;
}

export const HEIGHT_CM_MIN = 60;
export const HEIGHT_CM_MAX = 230;
export const WEIGHT_KG_MIN = 10;
export const WEIGHT_KG_MAX = 250;

export interface DriResultOk {
  kind: "ok";
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  bmi: number;
  activity: ActivityLevel;
  activityLabel: string;
  lifeStage: LifeStage;
  /** Mifflin–St Jeor REE in kcal/day. */
  reeKcal: number;
  /** Estimated Energy Requirement (REE × PAL) in kcal/day. */
  eerKcal: number;
  /** Macro grams targets at the calculated EER. */
  macros: {
    carbsGrams: number; // 45-65% of EER → midpoint
    proteinGrams: number; // AMDR midpoint
    fatGrams: number; // 20-35% of EER → midpoint
    fiberGrams: number; // 14 g per 1000 kcal
    waterLiters: number;
  };
  /** Full DRI profile from the IOM tables for this age/sex/life-stage. */
  profile: NutrientProfile;
}

export interface DriResultInvalid {
  kind: "invalid";
  reason:
    | "missing_age"
    | "age_out_of_range"
    | "missing_height"
    | "height_out_of_range"
    | "missing_weight"
    | "weight_out_of_range"
    | "lifestage_requires_female";
}

export type DriResult = DriResultOk | DriResultInvalid;

function resolveHeightCm(state: DriFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.heightCmRaw);
  const feet = parseNumOrNull(state.heightFeetRaw);
  if (feet == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return feetInchesToCm(feet, inches);
}

function resolveWeightKg(state: DriFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.weightKgRaw);
  const lb = parseNumOrNull(state.weightLbRaw);
  return lb == null ? null : lbsToKg(lb);
}

/** Mifflin-St Jeor resting energy expenditure (REE). */
function mifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function computeDri(state: DriFormState): DriResult {
  const age = parseNumOrNull(state.ageRaw);
  if (age == null) return { kind: "invalid", reason: "missing_age" };
  if (age < AGE_MIN || age > AGE_MAX) {
    return { kind: "invalid", reason: "age_out_of_range" };
  }
  const heightCm = resolveHeightCm(state);
  if (heightCm == null) return { kind: "invalid", reason: "missing_height" };
  if (heightCm < HEIGHT_CM_MIN || heightCm > HEIGHT_CM_MAX) {
    return { kind: "invalid", reason: "height_out_of_range" };
  }
  const weightKg = resolveWeightKg(state);
  if (weightKg == null) return { kind: "invalid", reason: "missing_weight" };
  if (weightKg < WEIGHT_KG_MIN || weightKg > WEIGHT_KG_MAX) {
    return { kind: "invalid", reason: "weight_out_of_range" };
  }
  if (state.lifeStage !== "none" && state.sex !== "female") {
    return { kind: "invalid", reason: "lifestage_requires_female" };
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  const reeKcal = Math.max(0, mifflinStJeor(weightKg, heightCm, age, state.sex));
  const eerKcal = reeKcal * (1 + PAL_MULTIPLIER[state.activity] - 1) * PAL_MULTIPLIER[state.activity] / PAL_MULTIPLIER[state.activity];
  // (PAL multiplier is already the total — keep it simple)
  const totalKcal = reeKcal * PAL_MULTIPLIER[state.activity];

  // AMDR midpoints (IOM)
  const carbsGrams = (totalKcal * 0.55) / 4; // 45-65% → 55% midpoint, 4 kcal/g
  const fatGrams = (totalKcal * 0.275) / 9; // 20-35% → 27.5%, 9 kcal/g
  const fiberGrams = (totalKcal / 1000) * 14; // 14 g per 1000 kcal

  const profile = getProfile(age, state.sex, state.lifeStage);

  return {
    kind: "ok",
    age,
    sex: state.sex,
    heightCm,
    weightKg,
    bmi,
    activity: state.activity,
    activityLabel: ACTIVITY_LABEL[state.activity],
    lifeStage: state.lifeStage,
    reeKcal: Math.round(reeKcal),
    eerKcal: Math.round(totalKcal),
    macros: {
      carbsGrams: Math.round(carbsGrams),
      proteinGrams: Math.round(profile.protein.amount),
      fatGrams: Math.round(fatGrams),
      fiberGrams: Math.round(fiberGrams),
      waterLiters: Math.round(profile.water.amount * 10) / 10,
    },
    profile,
  };
}

export function driBucket(result: DriResultOk): string {
  return `${result.sex}|${result.activity}|${result.lifeStage}|kcal:${Math.round(result.eerKcal / 250) * 250}`;
}
