export type Sex = "male" | "female";
export type LifeStage =
  | "none"
  | "pregnant-t1"
  | "pregnant-t2"
  | "pregnant-t3"
  | "lactating-0-6"
  | "lactating-7-12";
export type ActivityLevel =
  | "sedentary"
  | "low-active"
  | "active"
  | "very-active";

export interface NutrientEntry {
  /** Recommended Dietary Allowance OR Adequate Intake. */
  amount: number;
  /** Unit string (mg, mcg, g, L). */
  unit: string;
  /** Whether the value is an AI (vs RDA). */
  isAI?: boolean;
  /** Upper Limit, if any (in same unit). */
  ul?: number;
  /** Human-readable description of the nutrient. */
  notes?: string;
}

export interface NutrientProfile {
  // Macronutrients (per day)
  protein: NutrientEntry; // g/day
  carbohydrate: NutrientEntry; // g/day
  fiber: NutrientEntry; // g/day
  water: NutrientEntry; // L/day (total water from beverages + food)
  // Fat-soluble vitamins
  vitaminA: NutrientEntry; // mcg RAE
  vitaminD: NutrientEntry; // mcg
  vitaminE: NutrientEntry; // mg
  vitaminK: NutrientEntry; // mcg
  // Water-soluble vitamins
  vitaminC: NutrientEntry; // mg
  thiamin: NutrientEntry; // mg (B1)
  riboflavin: NutrientEntry; // mg (B2)
  niacin: NutrientEntry; // mg NE (B3)
  vitaminB6: NutrientEntry; // mg
  folate: NutrientEntry; // mcg DFE
  vitaminB12: NutrientEntry; // mcg
  // Minerals
  calcium: NutrientEntry; // mg
  iron: NutrientEntry; // mg
  magnesium: NutrientEntry; // mg
  zinc: NutrientEntry; // mg
  potassium: NutrientEntry; // mg
  sodium: NutrientEntry; // mg
  iodine: NutrientEntry; // mcg
  selenium: NutrientEntry; // mcg
}

export interface AgeBand {
  /** Inclusive lower bound, in years. */
  min: number;
  /** Inclusive upper bound, in years. Use Infinity for "and up". */
  max: number;
  label: string;
}

/** Coarse age bands used by the calculator UI. The lookup tables below
 *  use the same band edges. */
export const AGE_BANDS: readonly AgeBand[] = [
  { min: 1, max: 3, label: "1–3 years" },
  { min: 4, max: 8, label: "4–8 years" },
  { min: 9, max: 13, label: "9–13 years" },
  { min: 14, max: 18, label: "14–18 years" },
  { min: 19, max: 30, label: "19–30 years" },
  { min: 31, max: 50, label: "31–50 years" },
  { min: 51, max: 70, label: "51–70 years" },
  { min: 71, max: 200, label: "71+ years" },
];

export const AGE_MIN = 1;
export const AGE_MAX = 120;

/**
 * Dietary Reference Intakes from the NIH Office of Dietary Supplements /
 * Institute of Medicine DRI tables (2005 macronutrients, 1997-2011 vitamins
 * & minerals, 2019 sodium/potassium revisions).
 *
 * Keyed by age band index (matches AGE_BANDS), then sex.
 */
// Each band: index 0..7 = AGE_BANDS index
// Values cited per NIH ODS / IOM published DRI tables.
type BandProfile = Record<Sex, NutrientProfile>;

const PROFILES: BandProfile[] = [
  // 1-3 years (same for both sexes through age 8)
  {
    male: bandValues(13, 130, 19, 1.3, 300, 15, 6, 30, 15, 0.5, 0.5, 6, 0.5, 150, 0.9, 700, 7, 80, 3, 2000, 800, 90, 20),
    female: bandValues(13, 130, 19, 1.3, 300, 15, 6, 30, 15, 0.5, 0.5, 6, 0.5, 150, 0.9, 700, 7, 80, 3, 2000, 800, 90, 20),
  },
  // 4-8 years
  {
    male: bandValues(19, 130, 25, 1.7, 400, 15, 7, 55, 25, 0.6, 0.6, 8, 0.6, 200, 1.2, 1000, 10, 130, 5, 2300, 1000, 90, 30),
    female: bandValues(19, 130, 25, 1.7, 400, 15, 7, 55, 25, 0.6, 0.6, 8, 0.6, 200, 1.2, 1000, 10, 130, 5, 2300, 1000, 90, 30),
  },
  // 9-13 years (male)
  {
    male: bandValues(34, 130, 31, 2.4, 600, 15, 11, 60, 45, 0.9, 0.9, 12, 1.0, 300, 1.8, 1300, 8, 240, 8, 2500, 1200, 120, 40),
    female: bandValues(34, 130, 26, 2.1, 600, 15, 11, 60, 45, 0.9, 0.9, 12, 1.0, 300, 1.8, 1300, 8, 240, 8, 2300, 1200, 120, 40),
  },
  // 14-18 years
  {
    male: bandValues(52, 130, 38, 3.3, 900, 15, 15, 75, 75, 1.2, 1.3, 16, 1.3, 400, 2.4, 1300, 11, 410, 11, 3000, 1500, 150, 55),
    female: bandValues(46, 130, 26, 2.3, 700, 15, 15, 75, 65, 1.0, 1.0, 14, 1.2, 400, 2.4, 1300, 15, 360, 9, 2300, 1500, 150, 55),
  },
  // 19-30
  {
    male: bandValues(56, 130, 38, 3.7, 900, 15, 15, 120, 90, 1.2, 1.3, 16, 1.3, 400, 2.4, 1000, 8, 400, 11, 3400, 1500, 150, 55),
    female: bandValues(46, 130, 25, 2.7, 700, 15, 15, 90, 75, 1.1, 1.1, 14, 1.3, 400, 2.4, 1000, 18, 310, 8, 2600, 1500, 150, 55),
  },
  // 31-50
  {
    male: bandValues(56, 130, 38, 3.7, 900, 15, 15, 120, 90, 1.2, 1.3, 16, 1.3, 400, 2.4, 1000, 8, 420, 11, 3400, 1500, 150, 55),
    female: bandValues(46, 130, 25, 2.7, 700, 15, 15, 90, 75, 1.1, 1.1, 14, 1.3, 400, 2.4, 1000, 18, 320, 8, 2600, 1500, 150, 55),
  },
  // 51-70
  {
    male: bandValues(56, 130, 30, 3.7, 900, 15, 15, 120, 90, 1.2, 1.3, 16, 1.7, 400, 2.4, 1000, 8, 420, 11, 3400, 1500, 150, 55),
    female: bandValues(46, 130, 21, 2.7, 700, 15, 15, 90, 75, 1.1, 1.1, 14, 1.5, 400, 2.4, 1200, 8, 320, 8, 2600, 1500, 150, 55),
  },
  // 71+
  {
    male: bandValues(56, 130, 30, 3.7, 900, 20, 15, 120, 90, 1.2, 1.3, 16, 1.7, 400, 2.4, 1200, 8, 420, 11, 3400, 1500, 150, 55),
    female: bandValues(46, 130, 21, 2.7, 700, 20, 15, 90, 75, 1.1, 1.1, 14, 1.5, 400, 2.4, 1200, 8, 320, 8, 2600, 1500, 150, 55),
  },
];

// Helper to build a NutrientProfile from a positional arg list.
function bandValues(
  protein: number,
  carbohydrate: number,
  fiber: number,
  water: number,
  vitaminA: number,
  vitaminD: number,
  vitaminE: number,
  vitaminK: number,
  vitaminC: number,
  thiamin: number,
  riboflavin: number,
  niacin: number,
  vitaminB6: number,
  folate: number,
  vitaminB12: number,
  calcium: number,
  iron: number,
  magnesium: number,
  zinc: number,
  potassium: number,
  sodium: number,
  iodine: number,
  selenium: number,
): NutrientProfile {
  return {
    protein: { amount: protein, unit: "g" },
    carbohydrate: { amount: carbohydrate, unit: "g" },
    fiber: { amount: fiber, unit: "g", isAI: true },
    water: { amount: water, unit: "L", isAI: true },
    vitaminA: { amount: vitaminA, unit: "mcg RAE", ul: 3000 },
    vitaminD: { amount: vitaminD, unit: "mcg", ul: 100 },
    vitaminE: { amount: vitaminE, unit: "mg", ul: 1000 },
    vitaminK: { amount: vitaminK, unit: "mcg", isAI: true },
    vitaminC: { amount: vitaminC, unit: "mg", ul: 2000 },
    thiamin: { amount: thiamin, unit: "mg" },
    riboflavin: { amount: riboflavin, unit: "mg" },
    niacin: { amount: niacin, unit: "mg NE", ul: 35 },
    vitaminB6: { amount: vitaminB6, unit: "mg", ul: 100 },
    folate: { amount: folate, unit: "mcg DFE", ul: 1000 },
    vitaminB12: { amount: vitaminB12, unit: "mcg" },
    calcium: { amount: calcium, unit: "mg", ul: 2500 },
    iron: { amount: iron, unit: "mg", ul: 45 },
    magnesium: { amount: magnesium, unit: "mg", ul: 350 },
    zinc: { amount: zinc, unit: "mg", ul: 40 },
    potassium: { amount: potassium, unit: "mg", isAI: true },
    sodium: { amount: sodium, unit: "mg", isAI: true, ul: 2300 },
    iodine: { amount: iodine, unit: "mcg", ul: 1100 },
    selenium: { amount: selenium, unit: "mcg", ul: 400 },
  };
}

/** Pregnancy & lactation adjustments (delta added to female adult profile). */
const PREGNANCY_DELTAS: Record<
  Exclude<LifeStage, "none">,
  Partial<Record<keyof NutrientProfile, number>>
> = {
  "pregnant-t1": {
    protein: 25,
    folate: 200,
    iron: 9, // total 27 mg
    iodine: 70, // total 220 mcg
    calcium: 0,
    vitaminA: 70,
  },
  "pregnant-t2": {
    protein: 25,
    folate: 200,
    iron: 9,
    iodine: 70,
    vitaminA: 70,
  },
  "pregnant-t3": {
    protein: 25,
    folate: 200,
    iron: 9,
    iodine: 70,
    vitaminA: 70,
  },
  "lactating-0-6": {
    protein: 25,
    folate: 100,
    iodine: 140, // total 290 mcg
    vitaminA: 600, // total 1300 mcg RAE
    vitaminC: 45,
    zinc: 4,
  },
  "lactating-7-12": {
    protein: 25,
    folate: 100,
    iodine: 140,
    vitaminA: 600,
    vitaminC: 45,
    zinc: 4,
  },
};

export function getProfile(
  age: number,
  sex: Sex,
  lifeStage: LifeStage,
): NutrientProfile {
  const bandIndex = AGE_BANDS.findIndex((b) => age >= b.min && age <= b.max);
  const safeIndex = bandIndex < 0 ? AGE_BANDS.length - 1 : bandIndex;
  const base = PROFILES[safeIndex][sex];
  if (sex !== "female" || lifeStage === "none") return base;

  const deltas = PREGNANCY_DELTAS[lifeStage];
  const merged: NutrientProfile = { ...base };
  for (const key of Object.keys(deltas) as (keyof NutrientProfile)[]) {
    const delta = deltas[key] ?? 0;
    merged[key] = { ...base[key], amount: base[key].amount + delta };
  }
  return merged;
}

/** Mifflin-St Jeor REE + PAL-based estimated energy requirement. */
export const PAL_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.0,
  "low-active": 1.12,
  active: 1.27,
  "very-active": 1.45,
};

export const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  "low-active": "Low active",
  active: "Active",
  "very-active": "Very active",
};

export const ACTIVITY_HELPER: Record<ActivityLevel, string> = {
  sedentary: "Typical daily living, no extra exercise.",
  "low-active": "Walking the equivalent of ~1.5–3 miles a day at 3–4 mph.",
  active: "Walking ~3–10 miles a day or equivalent moderate-vigorous activity.",
  "very-active": "Daily heavy training or physically demanding job.",
};

export const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

export const LIFE_STAGE_OPTIONS: { value: LifeStage; label: string }[] = [
  { value: "none", label: "Not pregnant / lactating" },
  { value: "pregnant-t1", label: "Pregnant, 1st trimester" },
  { value: "pregnant-t2", label: "Pregnant, 2nd trimester" },
  { value: "pregnant-t3", label: "Pregnant, 3rd trimester" },
  { value: "lactating-0-6", label: "Lactating, 0–6 months postpartum" },
  { value: "lactating-7-12", label: "Lactating, 7–12 months postpartum" },
];

export const FAQ_ITEMS = [
  {
    q: "Where do these numbers come from?",
    a: "From the Institute of Medicine / National Academies' Dietary Reference Intake (DRI) tables. These are the same numbers the USDA and NIH Office of Dietary Supplements publish for use in clinical and nutritional guidance.",
  },
  {
    q: "What's the difference between an RDA and an AI?",
    a: "An RDA (Recommended Dietary Allowance) covers the nutrient needs of ~97% of healthy people in a group. An AI (Adequate Intake) is used when there isn't enough evidence to set an RDA, it's the observed average intake of healthy populations. Both are functionally daily targets.",
  },
  {
    q: "Why are calorie needs so different across ages and activity levels?",
    a: "Basal metabolic rate (the energy you burn at rest) tracks body size and age, while activity adds 12–45% on top depending on how much you move. We use the IOM EER equations behind the scenes — the same method the FNB uses.",
  },
  {
    q: "Why do iron and calcium needs change so much by sex and age?",
    a: "Iron tracks menstrual blood loss (peaking 19–50 in females) and pregnancy. Calcium needs rise for adolescents and postmenopausal women due to bone-building and bone-loss risk.",
  },
  {
    q: "Are these targets the same as the Daily Value on food labels?",
    a: "No. Daily Values (DVs) on US food labels are a simplified, age- and sex-neutral version. The DRI values shown here are the underlying age-and-sex-specific targets that the DVs are derived from.",
  },
  {
    q: "Is this a substitute for personalized nutrition advice?",
    a: "No. This is a general DRI lookup. If you have a medical condition, are pregnant, or are on medications that affect nutrient absorption, work with a registered dietitian or your clinician.",
  },
];
