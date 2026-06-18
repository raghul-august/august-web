import { parseNumOrNull, resolveWeightKg } from "@/app/utils/tools/health-math";

export type UnitSystem = "metric" | "imperial";
export type Sex = "male" | "female";

export interface DrinkEntry {
  id: string;
  presetId: string;
  volumeOz: string;
  abv: string;
  count: string;
}

export interface BACFormState {
  unitSystem: UnitSystem;
  sex: Sex;
  weightKgRaw: string;
  weightLbRaw: string;
  hoursRaw: string;
  drinks: DrinkEntry[];
}

export const WEIGHT_KG_MIN = 30;
export const WEIGHT_KG_MAX = 300;
export const HOURS_MIN = 0;
export const HOURS_MAX = 24;
export const VOLUME_OZ_MAX = 200;
export const ABV_MAX = 100;
export const DRINKS_MAX = 50;

export const ETHANOL_DENSITY_G_PER_ML = 0.7893;
export const OZ_TO_ML = 29.5735;
export const LEGAL_LIMIT = 0.08;
export const ELIMINATION_RATE_PER_HOUR = 0.015;

export const WIDMARK_R = {
  male: 0.68,
  female: 0.55,
} as const;

export interface DrinkPreset {
  id: string;
  label: string;
  helper: string;
  volumeOz: number;
  abv: number;
}

export const DRINK_PRESETS: readonly DrinkPreset[] = [
  { id: "beer", label: "Beer", helper: "12 oz · 5%", volumeOz: 12, abv: 5 },
  { id: "malt", label: "Malt liquor", helper: "8 oz · 7%", volumeOz: 8, abv: 7 },
  { id: "wine", label: "Wine", helper: "5 oz · 12%", volumeOz: 5, abv: 12 },
  { id: "shot", label: "Hard liquor (shot)", helper: "1.5 oz · 40%", volumeOz: 1.5, abv: 40 },
  { id: "cocktail", label: "Cocktail", helper: "4 oz · 20%", volumeOz: 4, abv: 20 },
  { id: "custom", label: "Custom", helper: "Set your own", volumeOz: 12, abv: 5 },
];

export const DRINK_PRESETS_BY_ID: Record<string, DrinkPreset> = DRINK_PRESETS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<string, DrinkPreset>,
);

export interface BACLevel {
  id: "sober" | "buzzed" | "impaired" | "legally-drunk" | "very-drunk" | "severe";
  label: string;
  range: string;
  description: string;
  tone: "neutral" | "info" | "caution" | "warning" | "danger" | "critical";
  min: number;
  max: number;
}

export const BAC_LEVELS: readonly BACLevel[] = [
  {
    id: "sober",
    label: "Sober",
    range: "0.00 – 0.02",
    description: "Little to no measurable impairment. Mood may lift slightly.",
    tone: "neutral",
    min: 0,
    max: 0.02,
  },
  {
    id: "buzzed",
    label: "Mildly impaired",
    range: "0.02 – 0.05",
    description: "Relaxation, mild loss of judgment, slightly reduced reaction time.",
    tone: "info",
    min: 0.02,
    max: 0.05,
  },
  {
    id: "impaired",
    label: "Impaired",
    range: "0.05 – 0.08",
    description: "Lower alertness, impaired coordination, riskier decisions.",
    tone: "caution",
    min: 0.05,
    max: 0.08,
  },
  {
    id: "legally-drunk",
    label: "Legally intoxicated",
    range: "0.08 – 0.15",
    description: "Over the U.S. driving limit in every state. Significant motor and judgment impairment.",
    tone: "warning",
    min: 0.08,
    max: 0.15,
  },
  {
    id: "very-drunk",
    label: "Severely impaired",
    range: "0.15 – 0.30",
    description: "Major loss of balance, slurred speech, blackouts likely. Medical risk rising.",
    tone: "danger",
    min: 0.15,
    max: 0.3,
  },
  {
    id: "severe",
    label: "Life-threatening",
    range: "0.30+",
    description: "Risk of alcohol poisoning, unconsciousness, and death. Call emergency services.",
    tone: "critical",
    min: 0.3,
    max: Infinity,
  },
];

export interface ComputedDrink {
  id: string;
  presetId: string;
  label: string;
  count: number;
  volumeOz: number;
  abv: number;
  alcoholGrams: number;
  standardDrinks: number;
}

export interface BACResultOk {
  kind: "ok";
  bac: number;
  bacRaw: number;
  totalAlcoholGrams: number;
  totalStandardDrinks: number;
  totalDrinks: number;
  level: BACLevel;
  hoursToLegalLimit: number;
  hoursToSober: number;
  inputs: {
    sex: Sex;
    weightKg: number;
    hours: number;
  };
  drinks: ComputedDrink[];
}

export interface BACResultInvalid {
  kind: "invalid";
  reason:
    | "missing_weight"
    | "weight_out_of_range"
    | "missing_hours"
    | "hours_out_of_range"
    | "no_drinks";
}

export type BACResult = BACResultOk | BACResultInvalid;

const STANDARD_DRINK_GRAMS = 14;

export function alcoholGramsFromDrink(volumeOz: number, abv: number, count: number): number {
  if (!Number.isFinite(volumeOz) || !Number.isFinite(abv) || !Number.isFinite(count)) return 0;
  if (volumeOz <= 0 || abv <= 0 || count <= 0) return 0;
  return volumeOz * (abv / 100) * OZ_TO_ML * ETHANOL_DENSITY_G_PER_ML * count;
}

function findLevel(bac: number): BACLevel {
  for (const lvl of BAC_LEVELS) {
    if (bac >= lvl.min && bac < lvl.max) return lvl;
  }
  return BAC_LEVELS[BAC_LEVELS.length - 1];
}

export function computeBAC(state: BACFormState): BACResult {
  const weightKg = resolveWeightKg(state);
  const hours = parseNumOrNull(state.hoursRaw);

  if (weightKg == null) return { kind: "invalid", reason: "missing_weight" };
  if (weightKg < WEIGHT_KG_MIN || weightKg > WEIGHT_KG_MAX) {
    return { kind: "invalid", reason: "weight_out_of_range" };
  }
  if (hours == null) return { kind: "invalid", reason: "missing_hours" };
  if (hours < HOURS_MIN || hours > HOURS_MAX) {
    return { kind: "invalid", reason: "hours_out_of_range" };
  }

  const computedDrinks: ComputedDrink[] = [];
  for (const d of state.drinks) {
    const volumeOz = parseNumOrNull(d.volumeOz);
    const abv = parseNumOrNull(d.abv);
    const count = parseNumOrNull(d.count);
    if (volumeOz == null || abv == null || count == null) continue;
    if (volumeOz <= 0 || abv <= 0 || count <= 0) continue;
    if (volumeOz > VOLUME_OZ_MAX || abv > ABV_MAX || count > DRINKS_MAX) continue;
    const grams = alcoholGramsFromDrink(volumeOz, abv, count);
    const preset = DRINK_PRESETS_BY_ID[d.presetId];
    computedDrinks.push({
      id: d.id,
      presetId: d.presetId,
      label: preset?.label ?? "Custom drink",
      count,
      volumeOz,
      abv,
      alcoholGrams: grams,
      standardDrinks: grams / STANDARD_DRINK_GRAMS,
    });
  }

  if (computedDrinks.length === 0) {
    return { kind: "invalid", reason: "no_drinks" };
  }

  const totalAlcoholGrams = computedDrinks.reduce((sum, d) => sum + d.alcoholGrams, 0);
  const totalStandardDrinks = totalAlcoholGrams / STANDARD_DRINK_GRAMS;
  const totalDrinks = computedDrinks.reduce((sum, d) => sum + d.count, 0);

  const r = WIDMARK_R[state.sex];
  const weightGrams = weightKg * 1000;
  const peakBac = (totalAlcoholGrams / (weightGrams * r)) * 100;
  const bacRaw = peakBac - ELIMINATION_RATE_PER_HOUR * hours;
  const bac = Math.max(0, bacRaw);

  const hoursToLegalLimit = bac > LEGAL_LIMIT ? (bac - LEGAL_LIMIT) / ELIMINATION_RATE_PER_HOUR : 0;
  const hoursToSober = bac / ELIMINATION_RATE_PER_HOUR;

  return {
    kind: "ok",
    bac,
    bacRaw,
    totalAlcoholGrams,
    totalStandardDrinks,
    totalDrinks,
    level: findLevel(bac),
    hoursToLegalLimit,
    hoursToSober,
    inputs: { sex: state.sex, weightKg, hours },
    drinks: computedDrinks,
  };
}

export function bacBucket(bac: number): string {
  return findLevel(bac).id;
}

export function fmtBac(bac: number): string {
  return bac.toFixed(3);
}

export function fmtHours(hours: number): string {
  if (hours <= 0) return "0 min";
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins} min`;
  }
  const wholeHours = Math.floor(hours);
  const remainderMin = Math.round((hours - wholeHours) * 60);
  if (remainderMin === 0) return `${wholeHours} hr`;
  if (remainderMin === 60) return `${wholeHours + 1} hr`;
  return `${wholeHours} hr ${remainderMin} min`;
}
