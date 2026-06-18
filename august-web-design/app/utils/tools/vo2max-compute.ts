import { kgToLbs, lbsToKg, parseNumOrNull } from "@/app/utils/tools/health-math";

export type Sex = "male" | "female";
export type UnitSystem = "metric" | "imperial";
export type Method = "race-time" | "cooper" | "mile15" | "rockport" | "resting-hr";

export type RaceDistance =
  | "marathon"
  | "half-marathon"
  | "10k"
  | "5k"
  | "3k"
  | "1mi"
  | "1500m"
  | "800m";

export const RACE_DISTANCE_METERS: Record<RaceDistance, number> = {
  marathon: 42195,
  "half-marathon": 21097.5,
  "10k": 10000,
  "5k": 5000,
  "3k": 3000,
  "1mi": 1609.34,
  "1500m": 1500,
  "800m": 800,
};

export const RACE_DISTANCE_LABELS: Record<RaceDistance, string> = {
  marathon: "Marathon",
  "half-marathon": "Half marathon",
  "10k": "10K",
  "5k": "5K",
  "3k": "3K",
  "1mi": "1 Mile",
  "1500m": "1500 m",
  "800m": "800 m",
};

export interface VO2MaxFormState {
  method: Method;
  sex: Sex;
  ageRaw: string;
  unitSystem: UnitSystem;
  weightKgRaw: string;
  weightLbRaw: string;
  raceDistance: RaceDistance;
  raceHrsRaw: string;
  raceMinsRaw: string;
  raceSecsRaw: string;
  cooperDistanceRaw: string;
  mile15MinsRaw: string;
  mile15SecsRaw: string;
  rockportMinsRaw: string;
  rockportSecsRaw: string;
  rockportHrRaw: string;
  restingHrRaw: string;
}

export const AGE_MIN = 13;
export const AGE_MAX = 90;
export const WEIGHT_KG_MIN = 30;
export const WEIGHT_KG_MAX = 250;

/* ── Norm tables (topendsports.com) ─────────────────────────────────── */

export interface VO2MaxCategory {
  id: "excellent" | "good" | "above-average" | "average" | "below-average" | "poor" | "very-poor";
  label: string;
  description: string;
  tone: "info" | "success" | "neutral" | "caution" | "warning";
}

export const VO2MAX_CATEGORIES: readonly VO2MaxCategory[] = [
  {
    id: "excellent",
    label: "Excellent",
    description: "Elite aerobic fitness. Your heart and lungs deliver oxygen at the level of trained endurance athletes.",
    tone: "info",
  },
  {
    id: "good",
    label: "Good",
    description: "Strong aerobic fitness. Endurance work feels easy and you recover quickly.",
    tone: "success",
  },
  {
    id: "above-average",
    label: "Above average",
    description: "Above-average aerobic capacity for your age and sex. A solid base for most activities.",
    tone: "success",
  },
  {
    id: "average",
    label: "Average",
    description: "Typical aerobic capacity for your age and sex. Targeted training would lift this further.",
    tone: "neutral",
  },
  {
    id: "below-average",
    label: "Below average",
    description: "Below the population average. Adding two to three aerobic sessions a week will move this band quickly.",
    tone: "caution",
  },
  {
    id: "poor",
    label: "Poor",
    description: "Lower than the population norm. Start with brisk walking or easy cycling and build duration before intensity.",
    tone: "warning",
  },
  {
    id: "very-poor",
    label: "Very poor",
    description: "Well below population norms. Talk to a clinician before starting structured training, especially if you have heart-disease risk factors.",
    tone: "warning",
  },
];

const CAT_BY_ID = new Map(VO2MAX_CATEGORIES.map((c) => [c.id, c]));

interface AgeBand {
  id: string;
  label: string;
  minAge: number;
  maxAge: number;
  male: BandThresholds;
  female: BandThresholds;
}

interface BandThresholds {
  excellent: number;
  good: number;
  aboveAverage: number;
  average: number;
  belowAverage: number;
  poor: number;
}

const AGE_BANDS: readonly AgeBand[] = [
  {
    id: "18-25",
    label: "18–25",
    minAge: 13,
    maxAge: 25,
    male: { excellent: 60, good: 52, aboveAverage: 47, average: 42, belowAverage: 37, poor: 30 },
    female: { excellent: 56, good: 47, aboveAverage: 42, average: 38, belowAverage: 33, poor: 28 },
  },
  {
    id: "26-35",
    label: "26–35",
    minAge: 26,
    maxAge: 35,
    male: { excellent: 56, good: 49, aboveAverage: 43, average: 40, belowAverage: 35, poor: 30 },
    female: { excellent: 52, good: 45, aboveAverage: 39, average: 35, belowAverage: 31, poor: 26 },
  },
  {
    id: "36-45",
    label: "36–45",
    minAge: 36,
    maxAge: 45,
    male: { excellent: 51, good: 43, aboveAverage: 39, average: 35, belowAverage: 31, poor: 26 },
    female: { excellent: 45, good: 38, aboveAverage: 34, average: 31, belowAverage: 27, poor: 22 },
  },
  {
    id: "46-55",
    label: "46–55",
    minAge: 46,
    maxAge: 55,
    male: { excellent: 45, good: 39, aboveAverage: 36, average: 32, belowAverage: 29, poor: 25 },
    female: { excellent: 40, good: 34, aboveAverage: 31, average: 28, belowAverage: 25, poor: 20 },
  },
  {
    id: "56-65",
    label: "56–65",
    minAge: 56,
    maxAge: 65,
    male: { excellent: 41, good: 36, aboveAverage: 32, average: 30, belowAverage: 26, poor: 22 },
    female: { excellent: 37, good: 32, aboveAverage: 28, average: 25, belowAverage: 22, poor: 18 },
  },
  {
    id: "65+",
    label: "65+",
    minAge: 66,
    maxAge: 200,
    male: { excellent: 37, good: 33, aboveAverage: 29, average: 26, belowAverage: 22, poor: 20 },
    female: { excellent: 32, good: 28, aboveAverage: 25, average: 22, belowAverage: 19, poor: 17 },
  },
];

function bandFor(age: number): AgeBand {
  for (const b of AGE_BANDS) {
    if (age >= b.minAge && age <= b.maxAge) return b;
  }
  return AGE_BANDS[AGE_BANDS.length - 1];
}

function categoryFor(vo2: number, age: number, sex: Sex): { category: VO2MaxCategory; band: AgeBand } {
  const band = bandFor(age);
  const t = sex === "male" ? band.male : band.female;
  let id: VO2MaxCategory["id"];
  if (vo2 > t.excellent) id = "excellent";
  else if (vo2 >= t.good) id = "good";
  else if (vo2 >= t.aboveAverage) id = "above-average";
  else if (vo2 >= t.average) id = "average";
  else if (vo2 >= t.belowAverage) id = "below-average";
  else if (vo2 >= t.poor) id = "poor";
  else id = "very-poor";
  return { category: CAT_BY_ID.get(id)!, band };
}

/* ── Formulas ───────────────────────────────────────────────────────── */

// Tanaka 2001: HRmax = 208 − 0.7 × age
function tanakaHRmax(age: number): number {
  return 208 - 0.7 * age;
}

// Uth-Sørensen 2004: VO2max ≈ (HRmax / HRrest) × 15.3
function vo2FromRestingHr(age: number, hrRest: number): number {
  return (tanakaHRmax(age) / hrRest) * 15.3;
}

// Cooper 12-min run: VO2max = (d_meters − 504.9) / 44.73
function vo2FromCooper(distanceMeters: number): number {
  return (distanceMeters - 504.9) / 44.73;
}

// George 1993 1.5-mile run: VO2max = 88.02 − 0.0957×weight_lb − 1.594×time_min + 6.315(male)−0
function vo2FromMile15(weightLb: number, timeMin: number, sex: Sex): number {
  const sexAdj = sex === "male" ? 6.315 : 0;
  return 88.02 - 0.0957 * weightLb - 1.594 * timeMin + sexAdj;
}

// Rockport 1-mile walk: VO2max = 132.853 − 0.0769×BW(lb) − 0.3877×age − 3.2649×t − 0.1565×HR + 6.315(male)
function vo2FromRockport(
  weightLb: number,
  age: number,
  timeMin: number,
  hr: number,
  sex: Sex,
): number {
  const sexAdj = sex === "male" ? 6.315 : 0;
  return (
    132.853 -
    0.0769 * weightLb -
    0.3877 * age -
    3.2649 * timeMin -
    0.1565 * hr +
    sexAdj
  );
}

// Jack Daniels VDOT — velocity → VO2 → %VO2max → VDOT
// v in m/min; VO2 = -4.6 + 0.182258·v + 0.000104·v²
function danielsVO2(velocityMperMin: number): number {
  return -4.6 + 0.182258 * velocityMperMin + 0.000104 * velocityMperMin * velocityMperMin;
}

// %VO2max sustainable for time t (min)
function danielsPctVO2max(timeMin: number): number {
  return (
    0.8 +
    0.1894393 * Math.exp(-0.012778 * timeMin) +
    0.2989558 * Math.exp(-0.1932605 * timeMin)
  );
}

export function vo2FromRaceTime(distanceMeters: number, timeSec: number): number {
  if (timeSec <= 0) return 0;
  const timeMin = timeSec / 60;
  const velocity = distanceMeters / timeMin;
  const vo2 = danielsVO2(velocity);
  const pct = danielsPctVO2max(timeMin);
  return vo2 / pct;
}

/* ── State helpers ──────────────────────────────────────────────────── */

function resolveWeightKg(state: VO2MaxFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.weightKgRaw);
  const lb = parseNumOrNull(state.weightLbRaw);
  return lb == null ? null : lbsToKg(lb);
}

function resolveWeightLb(state: VO2MaxFormState): number | null {
  if (state.unitSystem === "imperial") return parseNumOrNull(state.weightLbRaw);
  const kg = parseNumOrNull(state.weightKgRaw);
  return kg == null ? null : kgToLbs(kg);
}

function parseTimeSec(h: string, m: string, s: string): number | null {
  const hh = parseNumOrNull(h) ?? 0;
  const mm = parseNumOrNull(m) ?? 0;
  const ss = parseNumOrNull(s) ?? 0;
  if (hh === 0 && mm === 0 && ss === 0) return null;
  return hh * 3600 + mm * 60 + ss;
}

/* ── Result types ───────────────────────────────────────────────────── */

export interface VO2MaxResultOk {
  kind: "ok";
  vo2max: number;
  vo2maxRounded: number;
  method: Method;
  age: number;
  sex: Sex;
  band: { id: string; label: string };
  category: VO2MaxCategory;
  mets: number;
  hrMax?: number;
  pace?: { perKmSec: number; perMiSec: number };
  equivalent?: { distance: RaceDistance; label: string; timeSec: number }[];
}

export type InvalidReason =
  | "missing_age"
  | "age_out_of_range"
  | "missing_sex"
  | "missing_weight"
  | "weight_out_of_range"
  | "missing_method_input"
  | "method_input_out_of_range";

export interface VO2MaxResultInvalid {
  kind: "invalid";
  reason: InvalidReason;
  needs?: string;
}

export type VO2MaxResult = VO2MaxResultOk | VO2MaxResultInvalid;

/* ── Equivalent times (race-time method) ────────────────────────────── */

// Reverse the Daniels chain: given a target VDOT, solve for time at each distance
// by iterating. velocity grows as time shrinks; solve via simple bisection.
function timeForDistanceAtVDOT(distanceMeters: number, vdot: number): number {
  // bisection on time (seconds): 30s .. 6 hours
  let lo = 30;
  let hi = 6 * 3600;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const est = vo2FromRaceTime(distanceMeters, mid);
    if (est > vdot) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const EQUIV_DISTANCES: RaceDistance[] = [
  "marathon",
  "half-marathon",
  "10k",
  "5k",
  "1mi",
];

/* ── Main compute ───────────────────────────────────────────────────── */

export function computeVO2Max(state: VO2MaxFormState): VO2MaxResult {
  const age = parseNumOrNull(state.ageRaw);
  if (age == null) return { kind: "invalid", reason: "missing_age" };
  if (age < AGE_MIN || age > AGE_MAX) return { kind: "invalid", reason: "age_out_of_range" };

  let vo2: number;
  let extras: { pace?: VO2MaxResultOk["pace"]; equivalent?: VO2MaxResultOk["equivalent"]; hrMax?: number } = {};

  switch (state.method) {
    case "resting-hr": {
      const hrRest = parseNumOrNull(state.restingHrRaw);
      if (hrRest == null) return { kind: "invalid", reason: "missing_method_input", needs: "resting heart rate" };
      if (hrRest < 30 || hrRest > 130) return { kind: "invalid", reason: "method_input_out_of_range", needs: "resting heart rate (30–130 bpm)" };
      vo2 = vo2FromRestingHr(age, hrRest);
      extras.hrMax = tanakaHRmax(age);
      break;
    }
    case "cooper": {
      const dRaw = parseNumOrNull(state.cooperDistanceRaw);
      if (dRaw == null) return { kind: "invalid", reason: "missing_method_input", needs: "12-minute distance" };
      const distanceMeters = state.unitSystem === "imperial" ? dRaw * 1609.34 : dRaw;
      if (distanceMeters < 800 || distanceMeters > 6000) {
        return { kind: "invalid", reason: "method_input_out_of_range", needs: "12-minute distance (800–6000 m)" };
      }
      vo2 = vo2FromCooper(distanceMeters);
      break;
    }
    case "mile15": {
      const t = parseTimeSec("", state.mile15MinsRaw, state.mile15SecsRaw);
      if (t == null) return { kind: "invalid", reason: "missing_method_input", needs: "1.5-mile run time" };
      if (t < 300 || t > 2700) {
        return { kind: "invalid", reason: "method_input_out_of_range", needs: "1.5-mile time (5–45 min)" };
      }
      const weightLb = resolveWeightLb(state);
      if (weightLb == null) return { kind: "invalid", reason: "missing_weight" };
      const kg = state.unitSystem === "metric" ? parseNumOrNull(state.weightKgRaw) : null;
      const wKg = kg ?? weightLb / 2.20462;
      if (wKg < WEIGHT_KG_MIN || wKg > WEIGHT_KG_MAX) {
        return { kind: "invalid", reason: "weight_out_of_range" };
      }
      vo2 = vo2FromMile15(weightLb, t / 60, state.sex);
      break;
    }
    case "rockport": {
      const t = parseTimeSec("", state.rockportMinsRaw, state.rockportSecsRaw);
      if (t == null) return { kind: "invalid", reason: "missing_method_input", needs: "walk time" };
      if (t < 300 || t > 3600) {
        return { kind: "invalid", reason: "method_input_out_of_range", needs: "walk time (5–60 min)" };
      }
      const hr = parseNumOrNull(state.rockportHrRaw);
      if (hr == null) return { kind: "invalid", reason: "missing_method_input", needs: "post-walk heart rate" };
      if (hr < 60 || hr > 220) return { kind: "invalid", reason: "method_input_out_of_range", needs: "heart rate (60–220 bpm)" };
      const weightLb = resolveWeightLb(state);
      if (weightLb == null) return { kind: "invalid", reason: "missing_weight" };
      const kg = state.unitSystem === "metric" ? parseNumOrNull(state.weightKgRaw) : null;
      const wKg = kg ?? weightLb / 2.20462;
      if (wKg < WEIGHT_KG_MIN || wKg > WEIGHT_KG_MAX) {
        return { kind: "invalid", reason: "weight_out_of_range" };
      }
      vo2 = vo2FromRockport(weightLb, age, t / 60, hr, state.sex);
      break;
    }
    case "race-time": {
      const t = parseTimeSec(state.raceHrsRaw, state.raceMinsRaw, state.raceSecsRaw);
      if (t == null) return { kind: "invalid", reason: "missing_method_input", needs: "race time" };
      if (t < 60 || t > 10 * 3600) {
        return { kind: "invalid", reason: "method_input_out_of_range", needs: "race time (1 min–10 hr)" };
      }
      const d = RACE_DISTANCE_METERS[state.raceDistance];
      vo2 = vo2FromRaceTime(d, t);
      const paceSecPerKm = (t / d) * 1000;
      const paceSecPerMi = (t / d) * 1609.34;
      extras.pace = { perKmSec: paceSecPerKm, perMiSec: paceSecPerMi };
      extras.equivalent = EQUIV_DISTANCES
        .filter((dist) => dist !== state.raceDistance)
        .map((dist) => ({
          distance: dist,
          label: RACE_DISTANCE_LABELS[dist],
          timeSec: timeForDistanceAtVDOT(RACE_DISTANCE_METERS[dist], vo2),
        }));
      break;
    }
    default:
      return { kind: "invalid", reason: "missing_method_input" };
  }

  if (!Number.isFinite(vo2) || vo2 <= 0 || vo2 > 100) {
    return { kind: "invalid", reason: "method_input_out_of_range", needs: "the inputs above" };
  }

  const { category, band } = categoryFor(vo2, age, state.sex);

  return {
    kind: "ok",
    vo2max: vo2,
    vo2maxRounded: Math.round(vo2 * 10) / 10,
    method: state.method,
    age,
    sex: state.sex,
    band: { id: band.id, label: band.label },
    category,
    mets: vo2 / 3.5,
    ...extras,
  };
}

/* ── Formatters ─────────────────────────────────────────────────────── */

export function vo2Bucket(vo2: number): string {
  if (vo2 < 25) return "<25";
  if (vo2 < 35) return "25-34";
  if (vo2 < 45) return "35-44";
  if (vo2 < 55) return "45-54";
  if (vo2 < 65) return "55-64";
  return "65+";
}

export function fmtPace(secPerUnit: number): string {
  const total = Math.round(secPerUnit);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function fmtRaceTime(timeSec: number): string {
  const total = Math.round(timeSec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* Scale used by the "where you land" bar */
export const SCALE_MIN = 15;
export const SCALE_MAX = 70;

export function normRangeFor(age: number, sex: Sex): { min: number; max: number } {
  const band = bandFor(age);
  const t = sex === "male" ? band.male : band.female;
  return { min: t.poor, max: t.excellent };
}

