import { feetInchesToCm, lbsToKg, parseNumOrNull } from "@/app/utils/tools/health-math";

export type UnitSystem = "metric" | "imperial";
export type CycleStatus = "regular" | "irregular" | "stopped";
export type SmokingStatus = "never" | "former" | "current";
export type AlcoholUse = "never" | "occasional" | "regular";
export type Ethnicity = "white" | "black" | "hispanic" | "asian" | "other";

export type MenopauseCondition =
  | "pcos"
  | "autoimmune"
  | "cancer-treatment"
  | "hysterectomy"
  | "both-ovaries-removed";

export interface MenopauseFormState {
  unitSystem: UnitSystem;
  ageRaw: string;
  motherAgeRaw: string;
  ethnicity: Ethnicity;
  heightCmRaw: string;
  heightFeetRaw: string;
  heightInchesRaw: string;
  weightKgRaw: string;
  weightLbRaw: string;
  cycleStatus: CycleStatus;
  smoking: SmokingStatus;
  alcohol: AlcoholUse;
  conditions: MenopauseCondition[];
}

export const AGE_MIN = 18;
export const AGE_MAX = 65;
export const MOTHER_AGE_MIN = 30;
export const MOTHER_AGE_MAX = 65;
export const HEIGHT_CM_MIN = 120;
export const HEIGHT_CM_MAX = 230;
export const WEIGHT_KG_MIN = 30;
export const WEIGHT_KG_MAX = 250;

export const PREDICTED_AGE_MIN = 38;
export const PREDICTED_AGE_MAX = 58;

const BASELINE_AGE = 51;

const ETHNICITY_ADJ: Record<Ethnicity, number> = {
  white: 0,
  black: -0.4,
  hispanic: -0.7,
  asian: 0.2,
  other: 0,
};

const SMOKING_ADJ: Record<SmokingStatus, number> = {
  never: 0,
  former: -0.9,
  current: -1.8,
};

const ALCOHOL_ADJ: Record<AlcoholUse, number> = {
  never: 0,
  occasional: 0.2,
  regular: -0.5,
};

const CYCLE_ADJ: Record<CycleStatus, number> = {
  regular: 0,
  irregular: -0.6,
  stopped: 0,
};

const CONDITION_ADJ: Record<MenopauseCondition, number> = {
  pcos: 0.5,
  autoimmune: -1.5,
  "cancer-treatment": -3.0,
  hysterectomy: -1.0,
  "both-ovaries-removed": 0,
};

export interface MenopauseBand {
  id:
    | "surgical"
    | "already"
    | "imminent"
    | "approaching"
    | "on-track"
    | "many-years";
  label: string;
  description: string;
  tone: "info" | "neutral" | "caution" | "warning";
}

export const MENOPAUSE_BANDS: readonly MenopauseBand[] = [
  {
    id: "surgical",
    label: "Surgical menopause",
    description:
      "Both ovaries removed means menopause has already happened — regardless of natural timing. Symptom care and bone-health planning matter most now.",
    tone: "warning",
  },
  {
    id: "already",
    label: "Already menopausal",
    description:
      "Twelve months without a period meets the clinical definition of menopause. Postmenopausal care (hormones, bone, cardiovascular) is the next focus.",
    tone: "caution",
  },
  {
    id: "imminent",
    label: "Likely within a couple of years",
    description:
      "Your inputs suggest menopause is close. Tracking symptoms and starting conversations about hormone therapy or non-hormonal options is worth it now.",
    tone: "caution",
  },
  {
    id: "approaching",
    label: "Approaching perimenopause",
    description:
      "You're within the window when many people start to notice cycle, sleep, or mood changes. Knowing your baseline today makes spotting shifts easier.",
    tone: "info",
  },
  {
    id: "on-track",
    label: "On the typical track",
    description:
      "Your estimate sits in the typical window. Lifestyle choices over the next decade still meaningfully influence when transitions begin.",
    tone: "neutral",
  },
  {
    id: "many-years",
    label: "Many years out",
    description:
      "Menopause is well over a decade away based on these inputs. Reproductive health choices and lifestyle pattern set the longer-term trajectory.",
    tone: "info",
  },
];

export interface FactorRow {
  id: "maternal" | "smoking" | "bmi" | "alcohol" | "ethnicity" | "conditions";
  label: string;
  description: string;
  yearsImpact: number;
}

export interface ImpactRow {
  id: "quit-smoking" | "ideal-bmi" | "cut-alcohol";
  label: string;
  helper: string;
  predictedAge: number;
  delta: number;
  applicable: boolean;
}

export interface MenopauseResultOk {
  kind: "ok";
  predictedAge: number;
  predictedAgeRounded: number;
  age: number;
  yearsRemaining: number;
  band: MenopauseBand;
  bmi: number | null;
  factors: FactorRow[];
  impacts: ImpactRow[];
  inputs: {
    age: number;
    motherAge: number | null;
    ethnicity: Ethnicity;
    cycleStatus: CycleStatus;
    smoking: SmokingStatus;
    alcohol: AlcoholUse;
    conditions: MenopauseCondition[];
  };
}

export interface MenopauseResultInvalid {
  kind: "invalid";
  reason: "missing_age" | "age_out_of_range";
}

export type MenopauseResult = MenopauseResultOk | MenopauseResultInvalid;

function resolveHeightCm(state: MenopauseFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.heightCmRaw);
  const feet = parseNumOrNull(state.heightFeetRaw);
  if (feet == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return feetInchesToCm(feet, inches);
}

function resolveWeightKg(state: MenopauseFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.weightKgRaw);
  const lb = parseNumOrNull(state.weightLbRaw);
  return lb == null ? null : lbsToKg(lb);
}

function bmiAdjustment(bmi: number | null): number {
  if (bmi == null) return 0;
  if (bmi < 18.5) return -1.0;
  if (bmi > 30) return 0.5;
  return 0;
}

interface CoreInputs {
  motherAge: number | null;
  ethnicity: Ethnicity;
  cycleStatus: CycleStatus;
  smoking: SmokingStatus;
  alcohol: AlcoholUse;
  bmi: number | null;
  conditions: MenopauseCondition[];
}

function predictedAgeFromCore(c: CoreInputs): number {
  let base: number;
  if (c.motherAge != null) {
    base = 0.45 * BASELINE_AGE + 0.55 * c.motherAge;
  } else {
    base = BASELINE_AGE;
  }
  base += ETHNICITY_ADJ[c.ethnicity];
  base += SMOKING_ADJ[c.smoking];
  base += ALCOHOL_ADJ[c.alcohol];
  base += CYCLE_ADJ[c.cycleStatus];
  base += bmiAdjustment(c.bmi);
  for (const cond of c.conditions) {
    base += CONDITION_ADJ[cond];
  }
  return Math.max(PREDICTED_AGE_MIN, Math.min(PREDICTED_AGE_MAX, base));
}

function classifyBand(
  age: number,
  predictedAge: number,
  cycleStatus: CycleStatus,
  conditions: MenopauseCondition[],
): MenopauseBand {
  if (conditions.includes("both-ovaries-removed")) return MENOPAUSE_BANDS[0];
  if (cycleStatus === "stopped" && age >= 40) return MENOPAUSE_BANDS[1];
  if (age >= predictedAge) return MENOPAUSE_BANDS[1];
  const gap = predictedAge - age;
  if (gap <= 2) return MENOPAUSE_BANDS[2];
  if (gap <= 7) return MENOPAUSE_BANDS[3];
  if (gap <= 15) return MENOPAUSE_BANDS[4];
  return MENOPAUSE_BANDS[5];
}

function buildFactors(c: CoreInputs): FactorRow[] {
  const rows: FactorRow[] = [];

  const motherDelta = c.motherAge != null ? 0.55 * (c.motherAge - BASELINE_AGE) : 0;
  rows.push({
    id: "maternal",
    label: "Family history",
    description:
      c.motherAge != null
        ? `Mother's menopause at ${c.motherAge} ${motherDelta === 0 ? "matches" : motherDelta > 0 ? "pulls your estimate later" : "pulls your estimate earlier"}`
        : "Not provided — the strongest single predictor is missing",
    yearsImpact: motherDelta,
  });

  const smokingImpact = SMOKING_ADJ[c.smoking];
  if (smokingImpact !== 0) {
    rows.push({
      id: "smoking",
      label: "Smoking history",
      description:
        c.smoking === "current"
          ? "Smoking is well-documented to bring menopause forward"
          : "Past smoking has a smaller, lingering effect",
      yearsImpact: smokingImpact,
    });
  }

  const bmiImpact = bmiAdjustment(c.bmi);
  if (bmiImpact !== 0 && c.bmi != null) {
    rows.push({
      id: "bmi",
      label: `BMI of ${c.bmi.toFixed(1)}`,
      description:
        c.bmi < 18.5
          ? "Lower body fat lowers circulating estrogen reserves"
          : "Higher BMI tends to nudge menopause slightly later",
      yearsImpact: bmiImpact,
    });
  }

  const alcoholImpact = ALCOHOL_ADJ[c.alcohol];
  if (alcoholImpact !== 0) {
    rows.push({
      id: "alcohol",
      label: "Alcohol pattern",
      description:
        c.alcohol === "regular"
          ? "Regular drinking is linked to earlier transitions in some studies"
          : "Light intake shows a small, mixed effect",
      yearsImpact: alcoholImpact,
    });
  }

  const ethnicityImpact = ETHNICITY_ADJ[c.ethnicity];
  if (ethnicityImpact !== 0) {
    rows.push({
      id: "ethnicity",
      label: "Background",
      description:
        "Population studies (SWAN) show small average differences in menopause timing across ethnic groups",
      yearsImpact: ethnicityImpact,
    });
  }

  const conditionsImpact = c.conditions.reduce(
    (sum, k) => sum + CONDITION_ADJ[k],
    0,
  );
  if (conditionsImpact !== 0) {
    rows.push({
      id: "conditions",
      label: "Health history",
      description: c.conditions
        .map((k) => CONDITION_LABELS[k])
        .join(", "),
      yearsImpact: conditionsImpact,
    });
  }

  return rows;
}

const CONDITION_LABELS: Record<MenopauseCondition, string> = {
  pcos: "PCOS",
  autoimmune: "Autoimmune condition",
  "cancer-treatment": "Cancer treatment",
  hysterectomy: "Hysterectomy (ovaries intact)",
  "both-ovaries-removed": "Both ovaries removed",
};

export function computeMenopause(state: MenopauseFormState): MenopauseResult {
  const age = parseNumOrNull(state.ageRaw);
  if (age == null) return { kind: "invalid", reason: "missing_age" };
  if (age < AGE_MIN || age > AGE_MAX) {
    return { kind: "invalid", reason: "age_out_of_range" };
  }

  const motherAgeRaw = parseNumOrNull(state.motherAgeRaw);
  const motherAge =
    motherAgeRaw != null && motherAgeRaw >= MOTHER_AGE_MIN && motherAgeRaw <= MOTHER_AGE_MAX
      ? motherAgeRaw
      : null;

  const heightCm = resolveHeightCm(state);
  const weightKg = resolveWeightKg(state);
  let bmi: number | null = null;
  if (
    heightCm != null &&
    weightKg != null &&
    heightCm >= HEIGHT_CM_MIN &&
    heightCm <= HEIGHT_CM_MAX &&
    weightKg >= WEIGHT_KG_MIN &&
    weightKg <= WEIGHT_KG_MAX
  ) {
    const heightM = heightCm / 100;
    bmi = weightKg / (heightM * heightM);
  }

  const core: CoreInputs = {
    motherAge,
    ethnicity: state.ethnicity,
    cycleStatus: state.cycleStatus,
    smoking: state.smoking,
    alcohol: state.alcohol,
    bmi,
    conditions: state.conditions,
  };

  const predictedAge = predictedAgeFromCore(core);
  const predictedAgeRounded = Math.round(predictedAge);
  const yearsRemaining = Math.max(0, predictedAgeRounded - age);
  const band = classifyBand(age, predictedAge, state.cycleStatus, state.conditions);

  const factors = buildFactors(core).sort(
    (a, b) => Math.abs(b.yearsImpact) - Math.abs(a.yearsImpact),
  );

  const impactSeed: ImpactRow[] = [
    {
      id: "quit-smoking",
      label: "Stop smoking now",
      helper:
        state.smoking === "current"
          ? "Quitting today removes the active acceleration"
          : "Already a non-smoker",
      predictedAge: predictedAgeFromCore({ ...core, smoking: "former" }),
      delta: 0,
      applicable: state.smoking === "current",
    },
    {
      id: "ideal-bmi",
      label: "Reach a BMI of 22",
      helper:
        bmi == null
          ? "Add height & weight to model this"
          : bmi < 18.5
            ? "If BMI moves into the healthy range"
            : bmi > 30
              ? "If BMI drops to 22"
              : "Already in the healthy range",
      predictedAge: predictedAgeFromCore({ ...core, bmi: 22 }),
      delta: 0,
      applicable: bmi != null && (bmi < 18.5 || bmi > 30),
    },
    {
      id: "cut-alcohol",
      label: "Cut back on alcohol",
      helper:
        state.alcohol === "regular"
          ? "If regular drinking drops to occasional"
          : "Already light or no intake",
      predictedAge: predictedAgeFromCore({ ...core, alcohol: "occasional" }),
      delta: 0,
      applicable: state.alcohol === "regular",
    },
  ];

  const impacts: ImpactRow[] = impactSeed.map((row) => ({
    ...row,
    delta: Math.round(row.predictedAge) - predictedAgeRounded,
  }));

  return {
    kind: "ok",
    predictedAge,
    predictedAgeRounded,
    age,
    yearsRemaining,
    band,
    bmi,
    factors,
    impacts,
    inputs: {
      age,
      motherAge,
      ethnicity: state.ethnicity,
      cycleStatus: state.cycleStatus,
      smoking: state.smoking,
      alcohol: state.alcohol,
      conditions: state.conditions,
    },
  };
}

export function menopauseAgeBucket(predictedAge: number): string {
  if (predictedAge < 42) return "<42";
  if (predictedAge < 47) return "42-46";
  if (predictedAge < 52) return "47-51";
  if (predictedAge < 56) return "52-55";
  return "56+";
}

export function fmtYears(years: number): string {
  const n = Math.round(Math.abs(years));
  if (n === 0) return "the same";
  return `${n} year${n === 1 ? "" : "s"}`;
}

export { CONDITION_LABELS };
