import type { Medication } from "@/app/data/tools/glp1-dose-calculator-config";

export type DoseInput = {
  medication: Medication;
  concentration: number; // mg/mL
  dose: number; // mg
  barrelMl: 0.3 | 0.5 | 1.0;
  vialMl?: number; // optional, enables totalMg + dosesPerVial
};

export type DoseWarning =
  | "over_capacity"
  | "over_100_units"
  | "sanity_conc"
  | "sanity_dose";

export type DoseResult = {
  volumeMl: number;
  unitsU100: number;
  totalMg?: number;
  dosesPerVial?: number;
  warnings: DoseWarning[];
  displayState: "ok" | "invalid" | "over";
};
// Minimum viable values — below this treat as user-not-done-typing
const MIN_VALID = 0.1;
// Sanity thresholds: above these, user likely typo'd
const SANITY_CONC_MAX = 100; // mg/mL
const SANITY_DOSE_MAX = 50; // mg

export function computeDose(input: DoseInput): DoseResult {
  const { concentration: conc, dose, barrelMl, vialMl } = input;

  if (
    !Number.isFinite(conc) ||
    !Number.isFinite(dose) ||
    conc < MIN_VALID ||
    dose < MIN_VALID
  ) {
    return {
      volumeMl: NaN,
      unitsU100: NaN,
      warnings: [],
      displayState: "invalid",
    };
  }

  // Round volume to 3 decimals (mL), units to 1 decimal (U-100 syringe)
  const volumeMl = Math.round((dose / conc) * 1000) / 1000;
  const unitsU100 = Math.round(volumeMl * 100 * 10) / 10;

  const warnings: DoseWarning[] = [];
  if (volumeMl > barrelMl) warnings.push("over_capacity");
  if (unitsU100 > 100) warnings.push("over_100_units");
  if (conc > SANITY_CONC_MAX) warnings.push("sanity_conc");
  if (dose > SANITY_DOSE_MAX) warnings.push("sanity_dose");

  const result: DoseResult = {
    volumeMl,
    unitsU100,
    warnings,
    displayState:
      warnings.includes("over_capacity") || warnings.includes("over_100_units")
        ? "over"
        : "ok",
  };

  if (vialMl && vialMl > 0) {
    const totalMg = +(conc * vialMl).toFixed(3);
    result.totalMg = totalMg;
    result.dosesPerVial = Math.floor(totalMg / dose);
  }

  return result;
}
