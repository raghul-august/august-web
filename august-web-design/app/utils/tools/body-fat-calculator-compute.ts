// body-fat-calculator-compute.ts — pure functions, no side effects

import {
  type FormData,
  type NavyResult,
  type ArmyResult,
  type Result,
  type AceCategory,
  JP_TABLE,
  ACE_BANDS,
  ARMY_BRACKETS_MALE,
  ARMY_BRACKETS_FEMALE,
} from "@/app/data/tools/body-fat-calculator-config";
import { clamp, lbsToKg, kgToLbs } from "@/app/utils/tools/health-math";

// inline 1-liners not in health-math
const inToCm = (inches: number) => inches * 2.54;
const cmToIn = (cm: number) => cm / 2.54;

// -- re-export for consumers that want them --
export { lbsToKg, kgToLbs };

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationErrors {
  age?: string;
  weight?: string;
  height?: string;
  neck?: string;
  waist?: string;
  hip?: string;
  abdominal?: string;
  _formula?: string; // formula-level error (army out-of-range)
}

export function validate(form: FormData): ValidationErrors {
  const errors: ValidationErrors = {};
  const age = parseFloat(form.age);
  const weight = parseFloat(form.weight);

  if (!form.age || isNaN(age) || age < 1 || age > 99) {
    errors.age = "Age must be between 1 and 99";
  }
  if (!form.weight || isNaN(weight) || weight <= 0) {
    errors.weight = "Enter a value greater than 0";
  }

  if (form.mode === "navy") {
    const height = parseFloat(form.height);
    const neck = parseFloat(form.neck);
    const waist = parseFloat(form.waist);
    const hip = parseFloat(form.hip);

    if (!form.height || isNaN(height) || height <= 0) {
      errors.height = "Height must be a number greater than 0";
    }
    if (!form.neck || isNaN(neck) || neck <= 0) {
      errors.neck = "Enter a value greater than 0";
    }
    if (!form.waist || isNaN(waist) || waist <= 0) {
      errors.waist = "Enter a value greater than 0";
    }

    if (!errors.waist && !errors.neck) {
      if (form.sex === "male" && waist <= neck) {
        errors.waist = "Waist must be greater than neck";
      }
      if (form.sex === "female") {
        if (!form.hip || isNaN(hip) || hip <= 0) {
          errors.hip = "Enter a value greater than 0";
        } else if (waist + hip <= neck) {
          errors.waist = "Waist must be greater than neck";
        }
      }
    }
  } else {
    // army
    const abdominal = parseFloat(form.abdominal);
    if (!form.abdominal || isNaN(abdominal) || abdominal <= 0) {
      errors.abdominal = "Enter a value greater than 0";
    }
  }

  return errors;
}

export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}

// ─── J&P Ideal BF lookup ─────────────────────────────────────────────────────

function lookupIdealBF(age: number, sex: "male" | "female"): number {
  const clamped = clamp(age, 20, 55);
  // find the two bracketing rows
  let lower = JP_TABLE[0];
  let upper = JP_TABLE[JP_TABLE.length - 1];
  for (let i = 0; i < JP_TABLE.length - 1; i++) {
    if (clamped >= JP_TABLE[i].age && clamped <= JP_TABLE[i + 1].age) {
      lower = JP_TABLE[i];
      upper = JP_TABLE[i + 1];
      break;
    }
  }
  const t = lower.age === upper.age
    ? 0
    : (clamped - lower.age) / (upper.age - lower.age);
  const lowerVal = sex === "male" ? lower.men : lower.women;
  const upperVal = sex === "male" ? upper.men : upper.women;
  return lowerVal + t * (upperVal - lowerVal);
}

// ─── ACE category ────────────────────────────────────────────────────────────

function getAceCategory(bfp: number, sex: "male" | "female"): AceCategory {
  for (const band of ACE_BANDS) {
    const min = sex === "male" ? band.menMin : band.womenMin;
    const max = sex === "male" ? band.menMax : band.womenMax;
    if (bfp <= max) {
      // first band whose max >= bfp (bands are ordered low→high)
      if (bfp >= min || band.category === "essential") return band.category;
    }
  }
  return "obese";
}

// ─── Navy compute ────────────────────────────────────────────────────────────

export function computeNavy(form: FormData): NavyResult {
  const age = parseFloat(form.age);
  const sex = form.sex;
  const isMetric = form.units === "metric";

  const weightKg = isMetric ? parseFloat(form.weight) : lbsToKg(parseFloat(form.weight));

  // Convert all lengths to cm internally
  const toCm = (v: string) => isMetric ? parseFloat(v) : inToCm(parseFloat(v));

  const heightCm = toCm(form.height);
  const neckCm   = toCm(form.neck);
  const waistCm  = toCm(form.waist);
  const hipCm    = toCm(form.hip);

  let bfp: number;
  if (sex === "male") {
    bfp = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    bfp = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
  }
  bfp = parseFloat(bfp.toFixed(1));

  const fatMassKg = (bfp / 100) * weightKg;
  const leanMassKg = weightKg - fatMassKg;
  const idealBfp = lookupIdealBF(age, sex);
  const fatToLoseKg_raw = ((bfp - idealBfp) / 100) * weightKg;
  const fatToLoseKg = fatToLoseKg_raw > 0 ? fatToLoseKg_raw : null;

  // BMI cross-check
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  const bmiBfp_raw = sex === "male"
    ? 1.20 * bmi + 0.23 * age - 16.2
    : 1.20 * bmi + 0.23 * age - 5.4;
  const bmiBfp = clamp(bmiBfp_raw, 0, 100);

  const category = getAceCategory(bfp, sex);

  return {
    kind: "navy",
    bfp,
    fatMassKg,
    leanMassKg,
    idealBfp,
    fatToLoseKg,
    bmiBfp,
    category,
    sex,
    age,
  };
}

// ─── Army compute ────────────────────────────────────────────────────────────

export function computeArmy(form: FormData): ArmyResult | null {
  const age = parseFloat(form.age);
  const sex = form.sex;

  // Army always uses lbs and inches — convert if metric
  const isMetric = form.units === "metric";
  const weightLbs = isMetric ? kgToLbs(parseFloat(form.weight)) : parseFloat(form.weight);
  const abdominalIn = parseFloat(form.abdominal); // already in inches (field is always inches)

  let y: number;
  if (sex === "male") {
    y = -26.97 - 0.12 * weightLbs + 1.99 * abdominalIn;
  } else {
    y = -9.15 - 0.015 * weightLbs + 1.27 * abdominalIn;
  }

  const yRounded = Math.round(y);

  if (yRounded > 75) {
    return null; // triggers formula error in validate layer
  }

  // find bracket
  const brackets = sex === "male" ? ARMY_BRACKETS_MALE : ARMY_BRACKETS_FEMALE;
  const bracket = brackets.find((b) => age >= b.ageMin && age <= b.ageMax)
    ?? brackets[brackets.length - 1];

  if (yRounded < 10) {
    return {
      kind: "army",
      bfp: -1, // sentinel for <10%
      pass: true,
      ageBracket: bracket.label,
      threshold: bracket.max,
      sex,
      age,
    };
  }

  const pass = yRounded <= bracket.max;

  return {
    kind: "army",
    bfp: yRounded,
    pass,
    ageBracket: bracket.label,
    threshold: bracket.max,
    sex,
    age,
  };
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export function computeResult(form: FormData): { result: Result | null; errors: ValidationErrors } {
  const errors = validate(form);
  if (!isValid(errors)) return { result: null, errors };

  if (form.mode === "army-abcp") {
    const armyResult = computeArmy(form);
    if (!armyResult) {
      return {
        result: null,
        errors: { _formula: "Measurement out of valid range" },
      };
    }
    return { result: armyResult, errors: {} };
  }

  const navyResult = computeNavy(form);
  return { result: navyResult, errors: {} };
}
