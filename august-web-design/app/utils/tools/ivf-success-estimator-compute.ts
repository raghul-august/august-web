import { feetInchesToInches, parseNumOrNull } from "@/app/utils/tools/health-math";
import {
  FORMULAS,
  type FormulaBlock,
  type FormulaId,
  type Parity,
  type YesNo,
} from "@/app/data/tools/ivf-success-estimator-formulas";

export type { Parity, YesNo, FormulaId };

export type UnitSystem = "metric" | "imperial";
export type EggSource = "Own" | "Donor";
export type PriorIVF = "0" | "1" | "2";

export type DiagnosisKey =
  | "tubal"
  | "male_factor"
  | "endometriosis"
  | "pco"
  | "diminished_ovarian_reserve"
  | "uterine"
  | "other"
  | "unexplained";

export type DiagnosisFlags = Record<DiagnosisKey, YesNo>;

export interface IVFFormState {
  unitSystem: UnitSystem;
  ageRaw: string;
  weightLbRaw: string;
  weightKgRaw: string;
  heightFeetRaw: string;
  heightInchesRaw: string;
  heightCmRaw: string;
  priorIVF: PriorIVF;
  gravida: Parity;
  previousLiveBirths: Parity;
  eggSource: EggSource;
  donotknow: YesNo;
  diagnoses: DiagnosisFlags;
}

export const AGE_MIN = 20;
export const AGE_MAX = 50;
export const WEIGHT_LB_MIN = 80;
export const WEIGHT_LB_MAX = 300;
export const HEIGHT_IN_MIN = 54;
export const HEIGHT_IN_MAX = 72;
export const BMI_NEW_MIN = 17;
export const BMI_NEW_MAX = 45;

export const DEFAULT_DIAGNOSES: DiagnosisFlags = {
  tubal: "No",
  male_factor: "No",
  endometriosis: "No",
  pco: "No",
  diminished_ovarian_reserve: "No",
  uterine: "No",
  other: "No",
  unexplained: "No",
};

export const DEFAULT_FORM_STATE: IVFFormState = {
  unitSystem: "imperial",
  ageRaw: "",
  weightLbRaw: "",
  weightKgRaw: "",
  heightFeetRaw: "",
  heightInchesRaw: "",
  heightCmRaw: "",
  priorIVF: "0",
  gravida: "0",
  previousLiveBirths: "0",
  eggSource: "Own",
  donotknow: "No",
  diagnoses: DEFAULT_DIAGNOSES,
};

// Mirror of CDC `getBMI_New`: standard BMI using imperial units, then clamp to
// the model's supported range [17, 45].
export function bmiImperial(weightLb: number, heightIn: number): number {
  if (heightIn <= 0) return 0;
  return Math.round((weightLb * 703 * 10) / (heightIn * heightIn)) / 10;
}

export function bmiMetric(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function clampBMI(bmi: number): number {
  if (bmi < BMI_NEW_MIN) return BMI_NEW_MIN;
  if (bmi > BMI_NEW_MAX) return BMI_NEW_MAX;
  return bmi;
}

export type BMICategory = "under-weight" | "normal-weight" | "over-weight" | "obese";

export function bmiCategory(bmi: number): BMICategory {
  if (bmi < 18.5) return "under-weight";
  if (bmi < 25) return "normal-weight";
  if (bmi < 30) return "over-weight";
  return "obese";
}

export const BMI_CATEGORY_LABEL: Record<BMICategory, string> = {
  "under-weight": "Underweight",
  "normal-weight": "Normal weight",
  "over-weight": "Overweight",
  obese: "Obese",
};

export type Scenario = 1 | 2 | 3;

export interface FormulaChoice {
  formulaId: FormulaId;
  scenario: Scenario;
  ageClamp: { min: number; max: number } | null;
}

// Branching logic from CDC `parseInput()` / slider handlers.
//   Own eggs, no prior IVF, known reasons       -> f1-3   (scenario 1, age 20..80)
//   Own eggs, no prior IVF, "I don't know"      -> f4-6   (scenario 1, age 20..80)
//   Own eggs, prior IVF, known reasons          -> f7-8   (scenario 2, age 24..48)
//   Own eggs, prior IVF, "I don't know"         -> f9-10  (scenario 2, age 24..48)
//   Donor eggs, known reasons                   -> f11-13 (scenario 3, no clamp)
//   Donor eggs, "I don't know"                  -> f14-16 (scenario 3, no clamp)
export function chooseFormula(state: IVFFormState): FormulaChoice {
  const hasPriorIVF = state.priorIVF !== "0";
  if (state.eggSource === "Own") {
    if (!hasPriorIVF) {
      return state.donotknow === "Yes"
        ? { formulaId: "f4-6", scenario: 1, ageClamp: { min: 20, max: 80 } }
        : { formulaId: "f1-3", scenario: 1, ageClamp: { min: 20, max: 80 } };
    }
    return state.donotknow === "Yes"
      ? { formulaId: "f9-10", scenario: 2, ageClamp: { min: 24, max: 48 } }
      : { formulaId: "f7-8", scenario: 2, ageClamp: { min: 24, max: 48 } };
  }
  return state.donotknow === "Yes"
    ? { formulaId: "f14-16", scenario: 3, ageClamp: null }
    : { formulaId: "f11-13", scenario: 3, ageClamp: null };
}

function logistic(x: number): number {
  const e = Math.exp(x);
  if (!Number.isFinite(e)) return x > 0 ? 1 : 0;
  return e / (1 + e);
}

interface ComputeArgs {
  formula: FormulaBlock;
  age: number;
  bmi: number;
  diagnoses: DiagnosisFlags;
  gravida: Parity;
  previousLiveBirths: Parity;
}

function computePerCycle({
  formula,
  age,
  bmi,
  diagnoses,
  gravida,
  previousLiveBirths,
}: ComputeArgs): number[] {
  const n = formula.intercept.length;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    let s = formula.intercept[i] + formula.age[i] * age + formula.BMI[i] * bmi;
    if (formula.age_power_coefficient && formula.age_power_factor) {
      s += formula.age_power_coefficient[i] * Math.pow(age, formula.age_power_factor[i]);
    }
    if (formula.bmi_power_coefficient && formula.bmi_power_factor) {
      s += formula.bmi_power_coefficient[i] * Math.pow(bmi, formula.bmi_power_factor[i]);
    }
    if (formula.tubal) s += formula.tubal[diagnoses.tubal][i];
    if (formula.male_factor) s += formula.male_factor[diagnoses.male_factor][i];
    if (formula.endometriosis) s += formula.endometriosis[diagnoses.endometriosis][i];
    if (formula.pco) s += formula.pco[diagnoses.pco][i];
    if (formula.diminished_ovarian_reserve)
      s += formula.diminished_ovarian_reserve[diagnoses.diminished_ovarian_reserve][i];
    if (formula.uterine) s += formula.uterine[diagnoses.uterine][i];
    if (formula.other) s += formula.other[diagnoses.other][i];
    if (formula.unexplained) s += formula.unexplained[diagnoses.unexplained][i];
    s += formula.gravida[gravida][i];
    s += formula.previous_live_births[previousLiveBirths][i];
    out.push(logistic(s));
  }
  return out;
}

function cumulative(perCycle: number[]): number[] {
  const cp: number[] = [];
  for (let i = 0; i < perCycle.length; i++) {
    if (i === 0) cp.push(perCycle[0]);
    else cp.push(cp[i - 1] + perCycle[i] * (1 - cp[i - 1]));
  }
  return cp;
}

function labelForCycle(scenario: Scenario, cycle: number): string {
  const plural = cycle > 1 ? "s" : "";
  switch (scenario) {
    case 1:
      return `After ${cycle} retrieval${plural} and all transfers`;
    case 2:
      if (cycle === 1) return "After 1 additional retrieval and all transfers";
      return `After ${cycle} additional retrievals and all transfers`;
    case 3:
      return `After ${cycle} transfer${plural} using donor eggs`;
  }
}

export interface CycleResult {
  cycle: number;
  label: string;
  probability: number;
  percentText: string;
}

export interface ResultOk {
  kind: "ok";
  formulaId: FormulaId;
  scenario: Scenario;
  cycles: CycleResult[];
  bmi: number;
  bmiClamped: number;
  bmiCategory: BMICategory;
  ageUsed: number;
  smallSampleWarning: boolean;
  inputs: {
    age: number;
    bmi: number;
    weightLb: number;
    heightIn: number;
    priorIVF: PriorIVF;
    gravida: Parity;
    previousLiveBirths: Parity;
    eggSource: EggSource;
    donotknow: YesNo;
    diagnoses: DiagnosisFlags;
  };
}

export type ResultReason =
  | "missing_age"
  | "age_out_of_range"
  | "missing_weight"
  | "weight_out_of_range"
  | "missing_height"
  | "height_out_of_range";

export interface ResultInvalid {
  kind: "invalid";
  reason: ResultReason;
}

export type IVFResult = ResultOk | ResultInvalid;

function resolveWeightLb(state: IVFFormState): number | null {
  if (state.unitSystem === "metric") {
    const kg = parseNumOrNull(state.weightKgRaw);
    return kg == null ? null : kg * 2.20462;
  }
  return parseNumOrNull(state.weightLbRaw);
}

function resolveHeightIn(state: IVFFormState): number | null {
  if (state.unitSystem === "metric") {
    const cm = parseNumOrNull(state.heightCmRaw);
    return cm == null ? null : cm / 2.54;
  }
  const ft = parseNumOrNull(state.heightFeetRaw);
  if (ft == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return feetInchesToInches(ft, inches);
}

function smallSampleNote(scenario: Scenario, age: number, bmi: number): boolean {
  if (scenario === 1) return age <= 21 || age >= 44;
  if (scenario === 2) return age <= 24 || age >= 45 || bmi >= 42;
  return age <= 26 || bmi >= 41;
}

export function computeIVFResult(state: IVFFormState): IVFResult {
  const ageNum = parseNumOrNull(state.ageRaw);
  const weightLb = resolveWeightLb(state);
  const heightIn = resolveHeightIn(state);

  if (ageNum == null) return { kind: "invalid", reason: "missing_age" };
  if (ageNum < AGE_MIN || ageNum > AGE_MAX) {
    return { kind: "invalid", reason: "age_out_of_range" };
  }
  if (weightLb == null) return { kind: "invalid", reason: "missing_weight" };
  if (weightLb < WEIGHT_LB_MIN || weightLb > WEIGHT_LB_MAX) {
    return { kind: "invalid", reason: "weight_out_of_range" };
  }
  if (heightIn == null) return { kind: "invalid", reason: "missing_height" };
  if (heightIn < HEIGHT_IN_MIN || heightIn > HEIGHT_IN_MAX) {
    return { kind: "invalid", reason: "height_out_of_range" };
  }

  const bmi = bmiImperial(weightLb, heightIn);
  const bmiClamped = clampBMI(bmi);
  const choice = chooseFormula(state);
  const ageUsed = choice.ageClamp
    ? Math.min(choice.ageClamp.max, Math.max(choice.ageClamp.min, ageNum))
    : ageNum;

  const formula = FORMULAS[choice.formulaId];
  const perCycle = computePerCycle({
    formula,
    age: ageUsed,
    bmi: bmiClamped,
    diagnoses: state.diagnoses,
    gravida: state.gravida,
    previousLiveBirths: state.previousLiveBirths,
  });
  const cp = cumulative(perCycle);

  const cycles: CycleResult[] = cp.map((p, idx) => {
    const cycle = idx + 1;
    const safe = Number.isFinite(p) ? Math.max(0, Math.min(1, p)) : 0;
    return {
      cycle,
      label: labelForCycle(choice.scenario, cycle),
      probability: safe,
      percentText: `${Math.round(safe * 100)}%`,
    };
  });

  return {
    kind: "ok",
    formulaId: choice.formulaId,
    scenario: choice.scenario,
    cycles,
    bmi,
    bmiClamped,
    bmiCategory: bmiCategory(bmi),
    ageUsed,
    smallSampleWarning: smallSampleNote(choice.scenario, ageNum, bmiClamped),
    inputs: {
      age: ageNum,
      bmi: bmiClamped,
      weightLb,
      heightIn,
      priorIVF: state.priorIVF,
      gravida: state.gravida,
      previousLiveBirths: state.previousLiveBirths,
      eggSource: state.eggSource,
      donotknow: state.donotknow,
      diagnoses: state.diagnoses,
    },
  };
}

export function successBucket(p: number): string {
  if (p >= 0.7) return "very_high";
  if (p >= 0.5) return "high";
  if (p >= 0.3) return "moderate";
  if (p >= 0.15) return "low";
  return "very_low";
}

export const DIAGNOSIS_OPTIONS: { key: DiagnosisKey; label: string }[] = [
  { key: "male_factor", label: "Male factor infertility" },
  { key: "endometriosis", label: "Endometriosis" },
  { key: "tubal", label: "Tubal factor" },
  { key: "pco", label: "Ovulatory disorder (including PCOS)" },
  { key: "diminished_ovarian_reserve", label: "Diminished ovarian reserve" },
  { key: "uterine", label: "Uterine factor" },
  { key: "other", label: "Other reason" },
];

export const UNEXPLAINED_OPTION = {
  key: "unexplained" as DiagnosisKey,
  label: "Unexplained (Idiopathic) infertility",
};

export const DONT_KNOW_LABEL = "I don't know / no reason";
