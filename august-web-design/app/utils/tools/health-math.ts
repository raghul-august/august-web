// --- BMR ---
export function mifflinStJeor(input: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
}): number {
  const { weightKg, heightCm, age, sex } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function harrisBenedict(input: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
}): number {
  const { weightKg, heightCm, age, sex } = input;
  return sex === "male"
    ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
    : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
}

export function katchMcArdle(input: {
  weightKg: number;
  bodyFatPct: number;
}): number {
  const leanMass = input.weightKg * (1 - input.bodyFatPct / 100);
  return 370 + 21.6 * leanMass;
}

// --- BMI ---
export function calculateBMI(input: { weightKg: number; heightCm: number }): number {
  const { weightKg, heightCm } = input;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

// --- Activity ---
export const ACTIVITY_LEVELS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extreme: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_LEVELS;

export function applyActivityMultiplier(bmr: number, level: ActivityLevel): number {
  return bmr * ACTIVITY_LEVELS[level];
}

// --- Units ---
export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number = 0): number {
  return (feet * 12 + inches) * 2.54;
}

export function feetInchesToInches(feet: number, inches: number): number {
  return feet * 12 + inches;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

export function mgPerMlToUnitsU100(mg: number, mlOrConcentration: number): number {
  return mg * mlOrConcentration * 100;
}

// --- Clamp ---
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function clampToRange(
  n: number | null | undefined,
  min: number,
  max: number,
): number | null {
  if (n == null) return null;
  if (n === 0) return n;
  if (n > max) return max;
  return n;
}

// --- Format ---
export function fmtUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function fmtDecimal(n: number, places: number): string {
  return `${Number(n.toFixed(places))}`;
}

export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString();
}

export function fmtPercent(n: number, places = 1): string {
  return `${n.toFixed(places)}%`;
}

// --- Unit conversion for form state ---
export type UnitSystem = "imperial" | "metric";

interface UnitFields {
  heightCmRaw?: string;
  heightFeetRaw?: string;
  heightInchesRaw?: string;
  weightKgRaw?: string;
  weightLbRaw?: string;
}

export function convertUnits(state: UnitFields, to: UnitSystem): Partial<UnitFields> {
  const patch: Partial<UnitFields> = {};
  if (to === "metric") {
    const feet = parseNumOrNull(state.heightFeetRaw);
    const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
    if (feet != null) patch.heightCmRaw = fmtDecimal(feetInchesToCm(feet, inches), 0);
    const lb = parseNumOrNull(state.weightLbRaw);
    if (lb != null) patch.weightKgRaw = fmtDecimal(lbsToKg(lb), 1);
  } else {
    const cm = parseNumOrNull(state.heightCmRaw);
    if (cm != null) {
      const { feet, inches } = cmToFeetInches(cm);
      patch.heightFeetRaw = String(feet);
      patch.heightInchesRaw = String(inches);
    }
    const kg = parseNumOrNull(state.weightKgRaw);
    if (kg != null) patch.weightLbRaw = fmtDecimal(kgToLbs(kg), 1);
  }
  return patch;
}

// --- Resolve raw form values ---
export function resolveHeightCm(state: {
  unitSystem: string;
  heightCmRaw?: string;
  heightFeetRaw?: string;
  heightInchesRaw?: string;
}): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.heightCmRaw);
  const ft = parseNumOrNull(state.heightFeetRaw);
  if (ft == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return feetInchesToCm(ft, inches);
}

export function resolveWeightKg(state: {
  unitSystem: string;
  weightKgRaw?: string;
  weightLbRaw?: string;
}): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.weightKgRaw);
  const lb = parseNumOrNull(state.weightLbRaw);
  return lb != null ? lbsToKg(lb) : null;
}

// --- Validate ---
export function isValidPositiveNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

export function parseNumOrNull(s: string | null | undefined): number | null {
  if (s == null) return null;
  const trimmed = s.trim().replace(",", ".");
  if (trimmed === "" || !/^\d*\.?\d*$/.test(trimmed)) return null;
  const n = parseFloat(trimmed);
  return Number.isFinite(n) ? n : null;
}
