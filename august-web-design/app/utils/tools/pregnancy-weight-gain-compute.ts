// Pure compute for Pregnancy Weight Gain Calculator.
// No React, no side effects. Imports only from health-math.ts.

import { calculateBMI, feetInchesToCm, lbsToKg, kgToLbs } from "./health-math";

// ── Types ──────────────────────────────────────────────────────────────────

export type UnitSystem = "imperial" | "metric";
export type BMICategory = "underweight" | "normal" | "overweight" | "obese";
export type CurrentStatus = "on-track" | "above" | "below" | "edge-twins-underweight";

export interface FormData {
  unitSystem: UnitSystem;
  // height
  heightFt: number | null;
  heightIn: number | null;
  heightCm: number | null;
  // weight
  preWeight: number | null;    // lbs or kg per unitSystem
  currentWeight: number | null; // optional
  gestationalWeek: number;     // 1–40
  twins: boolean;
}

export interface GainRange {
  lowLbs: number;
  highLbs: number;
  lowKg: number;
  highKg: number;
}

export interface WeekRow {
  week: number;
  low: number;  // in display unit (lbs or kg), cumulative gain above preWeight
  high: number; // in display unit
}

export interface Result {
  bmi: number;
  category: BMICategory;
  totalRange: GainRange;
  isEdgeTwinsUnderweight: boolean;
  weeklyCorridor: WeekRow[];     // 40 rows, display unit, cumulative gain from 0
  currentGain: number | null;   // currentWeight − preWeight, display unit
  currentStatus: CurrentStatus | null;
  currentDeviation: number | null; // signed distance from corridor
  unit: "lbs" | "kg";
}

// ── Constants ──────────────────────────────────────────────────────────────

export const LBS_PER_KG = 2.20462;

// T1 phase proportions (two-phase linear model, reproduced from calculator.net)
const T1_PCT_LOW = 0.10;
const T1_PCT_HIGH = 0.114;

// IOM 2009 total gain ranges. twins=null means no IOM recommendation (edge case).
const IOM_RANGES_LBS: Record<
  BMICategory,
  { singleton: [number, number]; twins: [number, number] | null }
> = {
  underweight: { singleton: [28, 40], twins: null },
  normal:      { singleton: [25, 35], twins: [37, 54] },
  overweight:  { singleton: [15, 25], twins: [31, 50] },
  obese:       { singleton: [11, 20], twins: [25, 42] },
};

// BMI category descriptors
export const CATEGORY_DESCRIPTORS: Record<BMICategory, string> = {
  underweight:
    "A BMI below 18.5 before pregnancy is associated with a slightly higher recommended weight gain to support fetal growth.",
  normal:
    "A BMI between 18.5 and 24.9 before pregnancy is associated with the lowest risk of pregnancy complications.",
  overweight:
    "A BMI between 25 and 29.9 before pregnancy means a lower recommended total gain is generally advised.",
  obese:
    "A BMI of 30 or higher before pregnancy means a smaller total gain is typically recommended; talk with your provider about your individual target.",
};

// Trimester rate copy (per category)
// T1 is identical across categories; T2/T3 rates differ.
export const TRIMESTER_RATES: Record<
  BMICategory,
  { t1Lbs: string; t1Kg: string; t23Lbs: string; t23Kg: string }
> = {
  underweight: {
    t1Lbs: "1.1 – 4.4 lbs",
    t1Kg: "0.5 – 2.0 kg",
    t23Lbs: "~1.0 – 1.3 lbs/wk",
    t23Kg: "0.44 – 0.58 kg/wk",
  },
  normal: {
    t1Lbs: "1.1 – 4.4 lbs",
    t1Kg: "0.5 – 2.0 kg",
    t23Lbs: "~0.8 – 1.0 lbs/wk",
    t23Kg: "0.35 – 0.50 kg/wk",
  },
  overweight: {
    t1Lbs: "1.1 – 4.4 lbs",
    t1Kg: "0.5 – 2.0 kg",
    t23Lbs: "~0.6 – 0.7 lbs/wk",
    t23Kg: "0.23 – 0.33 kg/wk",
  },
  obese: {
    t1Lbs: "1.1 – 4.4 lbs",
    t1Kg: "0.5 – 2.0 kg",
    t23Lbs: "~0.4 – 0.6 lbs/wk",
    t23Kg: "0.17 – 0.27 kg/wk",
  },
};

// ── Core functions ─────────────────────────────────────────────────────────

export function getBmiCategory(bmi: number): BMICategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25.0) return "normal";
  if (bmi < 30.0) return "overweight";
  return "obese";
}

export function lookupGainRange(category: BMICategory, twins: boolean): GainRange | null {
  const entry = IOM_RANGES_LBS[category];
  const rangeLbs = twins ? entry.twins : entry.singleton;
  if (!rangeLbs) return null; // edge: underweight + twins

  const [lowLbs, highLbs] = rangeLbs;
  // Round to 1 decimal matching published values
  const lowKg = Math.round((lowLbs / LBS_PER_KG) * 10) / 10;
  const highKg = Math.round((highLbs / LBS_PER_KG) * 10) / 10;
  return { lowLbs, highLbs, lowKg, highKg };
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

// Two-phase linear corridor. Returns 40 rows of *cumulative gain* in display unit.
// Phase 1 (weeks 1–13): linear ramp from 0 to T1 total gain.
// Phase 2 (weeks 14–40): linear from T1 end to total range.
export function computeCorridor(
  totalLow: number,  // total gain low bound, display unit
  totalHigh: number, // total gain high bound, display unit
): WeekRow[] {
  const T1_LOW = totalLow * T1_PCT_LOW;
  const T1_HIGH = totalHigh * T1_PCT_HIGH;
  const RATE_LOW = (totalLow - T1_LOW) / 27;
  const RATE_HIGH = (totalHigh - T1_HIGH) / 27;

  const rows: WeekRow[] = [];
  for (let week = 1; week <= 40; week++) {
    let addLow: number, addHigh: number;
    if (week <= 13) {
      addLow = (T1_LOW / 13) * week;
      addHigh = (T1_HIGH / 13) * week;
    } else {
      addLow = T1_LOW + RATE_LOW * (week - 13);
      addHigh = T1_HIGH + RATE_HIGH * (week - 13);
    }
    rows.push({ week, low: round1(addLow), high: round1(addHigh) });
  }
  return rows;
}

// Computes status at the given week given the current weight and corridor.
// corridor rows are cumulative gain, not absolute weight.
export function computeStatus(
  preWeightDisplay: number,
  currentWeightDisplay: number,
  corridor: WeekRow[],
  week: number,
): { status: CurrentStatus; deviation: number; gain: number } {
  const row = corridor[week - 1];
  const gain = round1(currentWeightDisplay - preWeightDisplay);
  // corridor values are gain offsets from pre-weight
  const lowAbs = round1(preWeightDisplay + row.low);
  const highAbs = round1(preWeightDisplay + row.high);
  if (currentWeightDisplay < lowAbs)
    return { status: "below", deviation: round1(lowAbs - currentWeightDisplay), gain };
  if (currentWeightDisplay > highAbs)
    return { status: "above", deviation: round1(currentWeightDisplay - highAbs), gain };
  return { status: "on-track", deviation: 0, gain };
}

// ── Validation ─────────────────────────────────────────────────────────────

export interface ValidationErrors {
  heightFt?: string;
  heightCm?: string;
  preWeight?: string;
  currentWeight?: string;
}

export function validateFormData(form: FormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (form.unitSystem === "imperial") {
    const ft = form.heightFt;
    if (ft == null || ft <= 0) {
      errors.heightFt = "Enter a height between 3 and 8 ft.";
    } else if (ft < 3 || ft > 8) {
      errors.heightFt = "Enter a height between 3 and 8 ft.";
    }
  } else {
    const cm = form.heightCm;
    if (cm == null || cm <= 0) {
      errors.heightCm = "Enter a height between 100 and 250 cm.";
    } else if (cm < 100 || cm > 250) {
      errors.heightCm = "Enter a height between 100 and 250 cm.";
    }
  }

  if (form.preWeight == null || form.preWeight <= 0) {
    errors.preWeight = "Enter your weight before pregnancy.";
  } else if (form.unitSystem === "imperial") {
    if (form.preWeight < 60 || form.preWeight > 550) {
      errors.preWeight = "Enter a weight between 60 and 550 lbs.";
    }
  } else {
    if (form.preWeight < 30 || form.preWeight > 250) {
      errors.preWeight = "Enter a weight between 30 and 250 kg.";
    }
  }

  if (form.currentWeight != null && form.currentWeight > 0) {
    if (form.unitSystem === "imperial") {
      if (form.currentWeight < 60 || form.currentWeight > 550) {
        errors.currentWeight = "Enter a weight between 60 and 550 lbs.";
      }
    } else {
      if (form.currentWeight < 30 || form.currentWeight > 250) {
        errors.currentWeight = "Enter a weight between 30 and 250 kg.";
      }
    }
  }

  return errors;
}

// ── Main orchestrator ──────────────────────────────────────────────────────

export function calculatePregnancyWeightResult(form: FormData): Result | null {
  // Height normalization
  let heightCm: number;
  if (form.unitSystem === "metric") {
    if (form.heightCm == null || form.heightCm <= 0) return null;
    heightCm = form.heightCm;
  } else {
    if (form.heightFt == null || form.heightFt <= 0) return null;
    heightCm = feetInchesToCm(form.heightFt, form.heightIn ?? 0);
  }

  if (form.preWeight == null || form.preWeight <= 0) return null;

  // Normalize weight to kg for BMI
  const preKg =
    form.unitSystem === "metric" ? form.preWeight : lbsToKg(form.preWeight);
  const currentKg =
    form.currentWeight == null
      ? null
      : form.unitSystem === "metric"
        ? form.currentWeight
        : lbsToKg(form.currentWeight);

  const bmi = calculateBMI({ weightKg: preKg, heightCm });
  const category = getBmiCategory(bmi);
  const isEdgeTwinsUnderweight = category === "underweight" && form.twins;

  const totalRange = lookupGainRange(category, form.twins);
  // For edge case, totalRange is null — create a placeholder (suppressed in UI)
  const effectiveRange: GainRange = totalRange ?? { lowLbs: 0, highLbs: 0, lowKg: 0, highKg: 0 };

  const unit: "lbs" | "kg" = form.unitSystem === "imperial" ? "lbs" : "kg";
  const totalLow = unit === "lbs" ? effectiveRange.lowLbs : effectiveRange.lowKg;
  const totalHigh = unit === "lbs" ? effectiveRange.highLbs : effectiveRange.highKg;

  const weeklyCorridor =
    isEdgeTwinsUnderweight || totalRange == null
      ? []
      : computeCorridor(totalLow, totalHigh);

  // Current status (only if current weight provided)
  let currentGain: number | null = null;
  let currentStatus: CurrentStatus | null = null;
  let currentDeviation: number | null = null;

  if (isEdgeTwinsUnderweight) {
    currentStatus = "edge-twins-underweight";
  } else if (form.currentWeight != null && form.currentWeight > 0 && weeklyCorridor.length > 0) {
    const preDisplay = form.preWeight;
    const curDisplay = form.currentWeight;
    const statusResult = computeStatus(
      preDisplay,
      curDisplay,
      weeklyCorridor,
      form.gestationalWeek,
    );
    currentGain = statusResult.gain;
    currentStatus = statusResult.status;
    currentDeviation = statusResult.deviation;
  }

  return {
    bmi,
    category,
    totalRange: effectiveRange,
    isEdgeTwinsUnderweight,
    weeklyCorridor,
    currentGain,
    currentStatus,
    currentDeviation,
    unit,
  };
}

// Re-export conversion helpers for convenience
export { lbsToKg, kgToLbs, feetInchesToCm };
