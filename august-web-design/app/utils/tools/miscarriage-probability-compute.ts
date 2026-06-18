import { parseNumOrNull } from "@/app/utils/tools/health-math";

/* ─────────────────────────────────────────────────────────────────────────
   Miscarriage Probability / Reassurer — verbatim Datayze model.

   Recovered from `datayze.com/js/datayze.2023170.pregnancy.js` and the
   inline driver on datayze.com/miscarriage-reassurer. Everything below —
   the lookup table, the factor buckets, and the *arithmetic-mean* (not
   product) factor combination — matches the live tool exactly. See
   research/miscarriage-probability/datayze-reassurer/findings/03-…

   The result is the cumulative probability of miscarriage from the
   current gestational age through end of week 20.
   ─────────────────────────────────────────────────────────────────────── */

export type UnitSystem = "metric" | "imperial";

/** idx = weeks * 7 + days. Valid input range is 14 < idx < 140 i.e. 2w0d..19w6d. */
export const IDX_MIN = 14;
export const IDX_MAX = 140;
export const GA_WEEK_MIN = 2;
export const GA_WEEK_MAX = 19; // 19w6d is the last valid index (139)
export const AGE_MIN = 14;
export const AGE_MAX = 60;
export const HEIGHT_IN_MIN = 48;
export const HEIGHT_IN_MAX = 84;
export const WEIGHT_LB_MIN = 70;
export const WEIGHT_LB_MAX = 500;

/**
 * Verbatim probability table from Datayze. Indexed by gestational day
 * (`idx = weeks*7 + days`). Each value is the cumulative probability the
 * pregnancy ends in miscarriage from `idx` through 20w0d.
 */
export const MISCARRIAGE_PROBABILITY: Record<number, number> = {
  14: 0.35,
  15: 0.34287871341504,
  16: 0.33575742683008,
  17: 0.32863614024511,
  18: 0.32151485366015,
  19: 0.31439356707519,
  20: 0.30727228049023,
  21: 0.30015099390527,
  22: 0.2930297073203,
  23: 0.28590842073534,
  24: 0.27878713415038,
  25: 0.27166584756542,
  26: 0.26454456098046,
  27: 0.25742327439549,
  28: 0.25030198781053,
  29: 0.24172480468163,
  30: 0.23314762155273,
  31: 0.22457043842383,
  32: 0.21599325529493,
  33: 0.20741607216603,
  34: 0.19883888903713,
  35: 0.19026170590823,
  36: 0.18240444007397,
  37: 0.17454717423972,
  38: 0.16668990840547,
  39: 0.15883264257122,
  40: 0.15097537673697,
  41: 0.14311811090271,
  42: 0.13526084506846,
  43: 0.12770025369956,
  44: 0.12013966233065,
  45: 0.11257907096175,
  46: 0.10626982868846,
  47: 0.099960586415171,
  48: 0.093651344141883,
  49: 0.087342101868595,
  50: 0.080931462393257,
  51: 0.074520822917918,
  52: 0.06811018344258,
  53: 0.064154113347105,
  54: 0.060198043251631,
  55: 0.056241973156157,
  56: 0.052285903060682,
  57: 0.048390023898729,
  58: 0.044494144736775,
  59: 0.040598265574822,
  60: 0.039208092654813,
  61: 0.037817919734804,
  62: 0.036427746814795,
  63: 0.035037573894786,
  64: 0.033599729030136,
  65: 0.032161884165486,
  66: 0.030724039300836,
  67: 0.029286194436187,
  68: 0.027848349571537,
  69: 0.026410504706887,
  70: 0.024972659842237,
  71: 0.024172009700214,
  72: 0.02337135955819,
  73: 0.022570709416167,
  74: 0.022053220107455,
  75: 0.021535730798743,
  76: 0.021018241490031,
  77: 0.020500752181318,
  78: 0.01995354843277,
  79: 0.019406344684221,
  80: 0.018859140935672,
  81: 0.018311937187123,
  82: 0.017764733438574,
  83: 0.017217529690025,
  84: 0.016670325941476,
  85: 0.016183694267448,
  86: 0.01569706259342,
  87: 0.015210430919391,
  88: 0.014723799245363,
  89: 0.014237167571334,
  90: 0.013750535897306,
  91: 0.013263904223278,
  92: 0.012847905653459,
  93: 0.01243190708364,
  94: 0.012015908513821,
  95: 0.011599909944002,
  96: 0.011183911374183,
  97: 0.010767912804364,
  98: 0.010351914234545,
  99: 0.0099849258478284,
  100: 0.0096179374611117,
  101: 0.0092509490743949,
  102: 0.0088839606876782,
  103: 0.0085169723009614,
  104: 0.0081499839142446,
  105: 0.0077829955275279,
  106: 0.0074243505144624,
  107: 0.007065705501397,
  108: 0.0067070604883315,
  109: 0.0063484154752661,
  110: 0.0059897704622006,
  111: 0.0056311254491352,
  112: 0.0052724804360697,
  113: 0.005080605111011,
  114: 0.0048887297859522,
  115: 0.0046968544608934,
  116: 0.0045049791358346,
  117: 0.0043131038107759,
  118: 0.0041212284857171,
  119: 0.0039293531606583,
  120: 0.0037654160643677,
  121: 0.0036014789680771,
  122: 0.0034375418717865,
  123: 0.0032736047754959,
  124: 0.0031096676792053,
  125: 0.0029457305829147,
  126: 0.0027817934866241,
  127: 0.0025975560956127,
  128: 0.0024133187046013,
  129: 0.0022290813135899,
  130: 0.0020448439225785,
  131: 0.0018606065315671,
  132: 0.0016763691405556,
  133: 0.0014921317495442,
  134: 0.0013204454606148,
  135: 0.0011487591716854,
  136: 0.00097707288275605,
  137: 0.00080538659382666,
  138: 0.00063370030489727,
  139: 0.00046201401596788,
  140: 0,
};

export interface FormState {
  unitSystem: UnitSystem;
  ageRaw: string;
  gestWeeksRaw: string;
  gestDaysRaw: string;
  priorBirthsRaw: string;
  priorMiscarriagesRaw: string;
  heightFeetRaw: string;
  heightInchesRaw: string;
  heightCmRaw: string;
  weightLbRaw: string;
  weightKgRaw: string;
}

export const DEFAULT_FORM_STATE: FormState = {
  unitSystem: "imperial",
  ageRaw: "",
  gestWeeksRaw: "",
  gestDaysRaw: "0",
  priorBirthsRaw: "0",
  priorMiscarriagesRaw: "0",
  heightFeetRaw: "",
  heightInchesRaw: "",
  heightCmRaw: "",
  weightLbRaw: "",
  weightKgRaw: "",
};

/** Datayze's age multiplier — 3 bands. */
function ageFactor(age: number): number {
  if (age < 35) return 0.94;
  if (age < 40) return 1.3;
  return 2.46;
}

/** Datayze's prior-live-births multiplier — 2 bands. */
function birthsFactor(births: number): number {
  return births < 1 ? 1.03 : 0.71;
}

/** Datayze's prior-miscarriages multiplier — 2 bands. */
function miscarriagesFactor(prior: number): number {
  return prior < 3 ? 0.98 : 1.89;
}

/** Datayze's BMI multiplier — 4 bands on kg/m². */
function bmiFactor(bmi: number): number {
  if (bmi < 25) return 0.86;
  if (bmi < 30) return 1.12;
  if (bmi < 35) return 1.48;
  return 1.89;
}

export interface ResolvedInputs {
  age: number | null;
  births: number | null;
  miscarriages: number | null;
  bmi: number | null;
  heightM: number | null;
  weightKg: number | null;
}

function resolveHeightM(state: FormState): number | null {
  if (state.unitSystem === "metric") {
    const cm = parseNumOrNull(state.heightCmRaw);
    return cm == null ? null : cm / 100;
  }
  const ft = parseNumOrNull(state.heightFeetRaw);
  if (ft == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return (ft * 12 + inches) * 0.0254;
}

function resolveWeightKg(state: FormState): number | null {
  if (state.unitSystem === "metric") {
    return parseNumOrNull(state.weightKgRaw);
  }
  const lb = parseNumOrNull(state.weightLbRaw);
  return lb == null ? null : lb / 2.2046226218;
}

function resolveInputs(state: FormState): ResolvedInputs {
  const ageNum = parseNumOrNull(state.ageRaw);
  const births = parseNumOrNull(state.priorBirthsRaw);
  const misc = parseNumOrNull(state.priorMiscarriagesRaw);
  const heightM = resolveHeightM(state);
  const weightKg = resolveWeightKg(state);
  let bmi: number | null = null;
  if (
    heightM != null &&
    weightKg != null &&
    heightM > 0 &&
    weightKg > 0 &&
    Number.isFinite(heightM) &&
    Number.isFinite(weightKg)
  ) {
    bmi = weightKg / (heightM * heightM);
  }
  return {
    age: ageNum == null ? null : Math.floor(ageNum),
    births: births == null ? null : Math.floor(births),
    miscarriages: misc == null ? null : Math.floor(misc),
    bmi,
    heightM,
    weightKg,
  };
}

export interface FactorBreakdown {
  /** Factor values pushed (in Datayze order: age, births, miscarriages, bmi). */
  values: number[];
  /** Arithmetic mean (= 1 when no factors). */
  mean: number;
  age: number | null;
  births: number | null;
  miscarriages: number | null;
  bmi: number | null;
}

/** Apply Datayze's verbatim arithmetic-mean factor model. */
export function computeFactor(inputs: ResolvedInputs): FactorBreakdown {
  const values: number[] = [];
  let age: number | null = null;
  let births: number | null = null;
  let miscarriages: number | null = null;
  let bmi: number | null = null;

  if (inputs.age != null) {
    age = ageFactor(inputs.age);
    values.push(age);
  }
  if (inputs.births != null) {
    births = birthsFactor(inputs.births);
    values.push(births);
  }
  if (inputs.miscarriages != null) {
    miscarriages = miscarriagesFactor(inputs.miscarriages);
    values.push(miscarriages);
  }
  if (inputs.bmi != null) {
    bmi = bmiFactor(inputs.bmi);
    values.push(bmi);
  }
  const mean =
    values.length === 0 ? 1 : values.reduce((a, b) => a + b, 0) / values.length;
  return { values, mean, age, births, miscarriages, bmi };
}

export interface WeekRow {
  /** Gestational week (3..19 inclusive — table only defines idx 14..139). */
  weeks: number;
  /** Adjusted cumulative miscarriage probability from start of this week through 20w. */
  probability: number;
}

export interface MiscarriageResultOk {
  kind: "ok";
  idx: number;
  /** "8w 3d". */
  gestLabel: string;
  /** Cumulative P(miscarriage) from current GA through 20w (decimal). */
  probability: number;
  /** Reassurer = 1 − probability. */
  notMiscarriage: number;
  /** Raw lookup before factors applied. */
  rawProbability: number;
  /** Factor breakdown. */
  factor: FactorBreakdown;
  /** Inputs as resolved. */
  inputs: ResolvedInputs;
  /** Week-by-week curve from start (3w0d) through 19w6d. */
  weekRows: WeekRow[];
  /** P(miscarriage) at 2w0d for the reassurer copy. */
  initialProbability: number;
}

export type InvalidReason =
  | "missing_age"
  | "age_out_of_range"
  | "missing_ga"
  | "ga_out_of_range";

export interface MiscarriageResultInvalid {
  kind: "invalid";
  reason: InvalidReason;
}

export type MiscarriageResult = MiscarriageResultOk | MiscarriageResultInvalid;

function gestLabel(idx: number): string {
  const w = Math.floor(idx / 7);
  const d = idx % 7;
  return `${w}w ${d}d`;
}

export function computeResult(state: FormState): MiscarriageResult {
  const ageNum = parseNumOrNull(state.ageRaw);
  const weeksNum = parseNumOrNull(state.gestWeeksRaw);
  const daysNum = parseNumOrNull(state.gestDaysRaw) ?? 0;

  if (ageNum == null) return { kind: "invalid", reason: "missing_age" };
  if (ageNum < AGE_MIN || ageNum > AGE_MAX) {
    return { kind: "invalid", reason: "age_out_of_range" };
  }
  if (weeksNum == null) return { kind: "invalid", reason: "missing_ga" };

  const idx = Math.floor(weeksNum) * 7 + Math.floor(daysNum);
  if (idx <= IDX_MIN || idx >= IDX_MAX || daysNum < 0 || daysNum > 6) {
    return { kind: "invalid", reason: "ga_out_of_range" };
  }

  const inputs = resolveInputs(state);
  const factor = computeFactor(inputs);

  const raw = MISCARRIAGE_PROBABILITY[idx] ?? 0;
  const probability = Math.max(0, Math.min(1, raw * factor.mean));
  const notMiscarriage = 1 - probability;

  const weekRows: WeekRow[] = [];
  for (let w = 3; w <= 19; w++) {
    const rawW = MISCARRIAGE_PROBABILITY[w * 7] ?? 0;
    weekRows.push({ weeks: w, probability: rawW * factor.mean });
  }

  const initialProbability = (MISCARRIAGE_PROBABILITY[IDX_MIN] ?? 0.35) * factor.mean;

  return {
    kind: "ok",
    idx,
    gestLabel: gestLabel(idx),
    probability,
    notMiscarriage,
    rawProbability: raw,
    factor,
    inputs,
    weekRows,
    initialProbability,
  };
}

/* ── Formatting helpers (mirror Datayze's formatPercent edge cases) ──── */

export function formatPercent(p: number, places = 1): string {
  if (!Number.isFinite(p)) return "—";
  const rounded = Math.round(p * 100 * 10 ** places) / 10 ** places;
  if (rounded === 0) return "< 0.1%";
  if (rounded === 100) return "> 99.9%";
  return `${rounded.toFixed(places)}%`;
}

export function riskBucket(p: number): "very_low" | "low" | "moderate" | "high" {
  const pct = p * 100;
  if (pct < 5) return "very_low";
  if (pct < 15) return "low";
  if (pct < 30) return "moderate";
  return "high";
}

export function factorTimesSmaller(initial: number, now: number): number | null {
  if (now <= 0 || initial <= 0) return null;
  const ratio = initial / now;
  if (ratio < 2) return null;
  return Math.floor(ratio * 10) / 10;
}
