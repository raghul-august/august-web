import { feetInchesToCm, lbsToKg, parseNumOrNull } from "@/app/utils/tools/health-math";

export type UnitSystem = "metric" | "imperial";
export type Sex = "male" | "female";
export type SmokingStatus = "never" | "former" | "current";
export type BPCategory = "normal" | "elevated" | "high" | "unknown";

export interface HeartAgeFormState {
  unitSystem: UnitSystem;
  sex: Sex;
  ageRaw: string;
  heightCmRaw: string;
  heightFeetRaw: string;
  heightInchesRaw: string;
  weightKgRaw: string;
  weightLbRaw: string;
  smoking: SmokingStatus;
  diabetes: boolean;
  bpCategory: BPCategory;
  bpTreated: boolean;
  familyHistory: boolean;
}

export const AGE_MIN = 30;
export const AGE_MAX = 74;
export const HEIGHT_CM_MIN = 120;
export const HEIGHT_CM_MAX = 230;
export const WEIGHT_KG_MIN = 30;
export const WEIGHT_KG_MAX = 250;

const SBP_BY_CATEGORY: Record<BPCategory, number> = {
  normal: 115,
  elevated: 130,
  high: 150,
  unknown: 125,
};

const SMOKER_FLAG: Record<SmokingStatus, number> = {
  never: 0,
  former: 0,
  current: 1,
};

interface SexCoeffs {
  age: number;
  bmi: number;
  sbpUntreated: number;
  sbpTreated: number;
  smoker: number;
  diabetes: number;
}

const COEFFS: Record<Sex, SexCoeffs> = {
  male: {
    age: 3.11296,
    bmi: 0.79277,
    sbpUntreated: 1.85508,
    sbpTreated: 1.92672,
    smoker: 0.70953,
    diabetes: 0.5316,
  },
  female: {
    age: 2.72107,
    bmi: 0.51125,
    sbpUntreated: 2.81291,
    sbpTreated: 2.88267,
    smoker: 0.61868,
    diabetes: 0.77763,
  },
};

const BASELINE_SURVIVAL: Record<Sex, number> = {
  male: 0.88431,
  female: 0.94833,
};

const MEAN_LP: Record<Sex, number> = {
  male: 23.9388,
  female: 26.0145,
};

const IDEAL_BMI = 22;
const IDEAL_SBP = 110;

interface HeartAgeBand {
  id: "younger" | "same" | "older" | "much-older";
  label: string;
  description: string;
  tone: "info" | "neutral" | "caution" | "warning";
}

export const HEART_AGE_BANDS: readonly HeartAgeBand[] = [
  {
    id: "younger",
    label: "Heart younger than you",
    description: "Your cardiovascular profile is healthier than your age would suggest. Keep doing what you're doing.",
    tone: "info",
  },
  {
    id: "same",
    label: "On track",
    description: "Your heart age is in line with your chronological age. Small habit changes can pull it even lower.",
    tone: "neutral",
  },
  {
    id: "older",
    label: "Heart older than you",
    description: "Your heart appears older than your age. One or two risk factors are doing most of the work.",
    tone: "caution",
  },
  {
    id: "much-older",
    label: "Significant gap",
    description: "Your heart age is well above your actual age. Worth talking to a clinician about how to bring it down.",
    tone: "warning",
  },
];

export interface ImpactRow {
  id: "quit-smoking" | "lower-bp" | "lower-bmi" | "treat-diabetes";
  label: string;
  helper: string;
  heartAgeYears: number;
  delta: number;
  applicable: boolean;
}

export interface HeartAgeResultOk {
  kind: "ok";
  heartAge: number;
  heartAgeRounded: number;
  age: number;
  delta: number;
  band: HeartAgeBand;
  risk10yr: number;
  bmi: number;
  sbp: number;
  inputs: {
    sex: Sex;
    age: number;
    bmi: number;
    sbp: number;
    bpTreated: boolean;
    smoker: number;
    diabetes: number;
    familyHistory: boolean;
  };
  impacts: ImpactRow[];
}

export interface HeartAgeResultInvalid {
  kind: "invalid";
  reason:
    | "missing_age"
    | "age_out_of_range"
    | "missing_height"
    | "height_out_of_range"
    | "missing_weight"
    | "weight_out_of_range";
}

export type HeartAgeResult = HeartAgeResultOk | HeartAgeResultInvalid;

function resolveHeightCm(state: HeartAgeFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.heightCmRaw);
  const feet = parseNumOrNull(state.heightFeetRaw);
  if (feet == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return feetInchesToCm(feet, inches);
}

function resolveWeightKg(state: HeartAgeFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.weightKgRaw);
  const lb = parseNumOrNull(state.weightLbRaw);
  return lb == null ? null : lbsToKg(lb);
}

function linearPredictor(
  sex: Sex,
  age: number,
  bmi: number,
  sbp: number,
  bpTreated: boolean,
  smoker: number,
  diabetes: number,
): number {
  const c = COEFFS[sex];
  const sbpCoeff = bpTreated ? c.sbpTreated : c.sbpUntreated;
  return (
    c.age * Math.log(age) +
    c.bmi * Math.log(bmi) +
    sbpCoeff * Math.log(sbp) +
    c.smoker * smoker +
    c.diabetes * diabetes
  );
}

function riskFromLP(sex: Sex, lp: number): number {
  const exponent = Math.exp(lp - MEAN_LP[sex]);
  return 1 - Math.pow(BASELINE_SURVIVAL[sex], exponent);
}

function heartAgeFromInputs(
  sex: Sex,
  age: number,
  bmi: number,
  sbp: number,
  bpTreated: boolean,
  smoker: number,
  diabetes: number,
): number {
  const c = COEFFS[sex];
  const sbpCoeff = bpTreated ? c.sbpTreated : c.sbpUntreated;
  const actualNonAge =
    c.bmi * Math.log(bmi) +
    sbpCoeff * Math.log(sbp) +
    c.smoker * smoker +
    c.diabetes * diabetes;
  const idealNonAge =
    c.bmi * Math.log(IDEAL_BMI) + c.sbpUntreated * Math.log(IDEAL_SBP);
  const delta = actualNonAge - idealNonAge;
  return age * Math.exp(delta / c.age);
}

function classifyBand(delta: number): HeartAgeBand {
  if (delta <= -2) return HEART_AGE_BANDS[0];
  if (delta < 3) return HEART_AGE_BANDS[1];
  if (delta < 10) return HEART_AGE_BANDS[2];
  return HEART_AGE_BANDS[3];
}

export function computeHeartAge(state: HeartAgeFormState): HeartAgeResult {
  const age = parseNumOrNull(state.ageRaw);
  if (age == null) return { kind: "invalid", reason: "missing_age" };
  if (age < AGE_MIN || age > AGE_MAX) return { kind: "invalid", reason: "age_out_of_range" };

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

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const sbp = SBP_BY_CATEGORY[state.bpCategory];
  const bpTreated = state.bpCategory !== "unknown" && state.bpTreated;
  const smoker = SMOKER_FLAG[state.smoking];
  const diabetes = state.diabetes ? 1 : 0;

  const lp = linearPredictor(state.sex, age, bmi, sbp, bpTreated, smoker, diabetes);
  let risk = riskFromLP(state.sex, lp);
  if (state.familyHistory) risk = Math.min(0.95, risk * 1.15);

  const heartAge = heartAgeFromInputs(state.sex, age, bmi, sbp, bpTreated, smoker, diabetes);
  const heartAgeRounded = Math.round(heartAge);
  const delta = heartAgeRounded - age;
  const band = classifyBand(delta);

  const impactSeed: ImpactRow[] = [
    {
      id: "quit-smoking",
      label: "Quit smoking",
      helper: smoker ? "If you stop smoking" : "Already a non-smoker",
      heartAgeYears: heartAgeFromInputs(state.sex, age, bmi, sbp, bpTreated, 0, diabetes),
      delta: 0,
      applicable: smoker === 1,
    },
    {
      id: "lower-bp",
      label: "Reach normal blood pressure",
      helper: state.bpCategory === "normal" ? "Already in range" : "If systolic BP drops to 115 mmHg",
      heartAgeYears: heartAgeFromInputs(state.sex, age, bmi, 115, false, smoker, diabetes),
      delta: 0,
      applicable: state.bpCategory !== "normal",
    },
    {
      id: "lower-bmi",
      label: "Reach a BMI of 22",
      helper: bmi <= 23 ? "Already near target" : "If BMI drops to 22",
      heartAgeYears: heartAgeFromInputs(state.sex, age, 22, sbp, bpTreated, smoker, diabetes),
      delta: 0,
      applicable: bmi > 23,
    },
    {
      id: "treat-diabetes",
      label: "Manage diabetes",
      helper: diabetes ? "Hypothetical: without diabetes" : "No diabetes reported",
      heartAgeYears: heartAgeFromInputs(state.sex, age, bmi, sbp, bpTreated, smoker, 0),
      delta: 0,
      applicable: diabetes === 1,
    },
  ];
  const impacts: ImpactRow[] = impactSeed.map((row) => ({
    ...row,
    delta: heartAgeRounded - Math.round(row.heartAgeYears),
  }));

  return {
    kind: "ok",
    heartAge,
    heartAgeRounded,
    age,
    delta,
    band,
    risk10yr: risk,
    bmi,
    sbp,
    inputs: {
      sex: state.sex,
      age,
      bmi,
      sbp,
      bpTreated,
      smoker,
      diabetes,
      familyHistory: state.familyHistory,
    },
    impacts,
  };
}

export function heartAgeBucket(heartAge: number): string {
  if (heartAge < 35) return "<35";
  if (heartAge < 45) return "35-44";
  if (heartAge < 55) return "45-54";
  if (heartAge < 65) return "55-64";
  return "65+";
}

export function fmtYears(years: number): string {
  const rounded = Math.round(Math.abs(years));
  if (rounded === 0) return "the same";
  return `${rounded} year${rounded === 1 ? "" : "s"}`;
}
