// Pure data config for GLP-1 Dose Calculator tool.
// No React.

import type { DoseWarning } from "@/app/utils/tools/glp1-dose-compute";
export type Medication = "semaglutide" | "tirzepatide";

export const MEDICATIONS = {
  semaglutide: {
    label: "Semaglutide",
    concentrationsMgPerMl: [1, 2.5, 5, 10, 12.5, 20],
    defaultConc: 2.5,
    doseChipsMg: [0.25, 0.5, 1.0, 1.7, 2.0, 2.4],
    defaultDose: 0.25,
  },
  tirzepatide: {
    label: "Tirzepatide",
    concentrationsMgPerMl: [5, 10, 20, 25, 30, 40],
    defaultConc: 10,
    doseChipsMg: [2.5, 5, 7.5, 10, 12.5, 15],
    defaultDose: 2.5,
  },
} as const;

export const SYRINGE_BARRELS_ML = [0.3, 0.5, 1.0] as const;

export type DosingRow = { week: string; dose: string; notes?: string };

// Titration schedules sourced from FDA labels:
// - Semaglutide: Wegovy Prescribing Information (NDA 215256); Ozempic PI (NDA 209637) for T2D uses different endpoints.
// - Tirzepatide: Zepbound/Mounjaro Prescribing Information (Lilly).
// Research docs (florida/06-assets-and-content.md, rivas/06-assets-and-content.md) don't contradict.
export const DOSING_SCHEDULE: {
  semaglutide: DosingRow[];
  tirzepatide: DosingRow[];
} = {
  semaglutide: [
    { week: "Weeks 1–4", dose: "0.25 mg/wk", notes: "Starter dose" },
    { week: "Weeks 5–8", dose: "0.5 mg/wk" },
    { week: "Weeks 9–12", dose: "1.0 mg/wk" },
    { week: "Weeks 13–16", dose: "1.7 mg/wk" },
    { week: "Week 17+", dose: "2.4 mg/wk", notes: "Maintenance" },
  ],
  tirzepatide: [
    { week: "Weeks 1–4", dose: "2.5 mg/wk", notes: "Starter (not for maintenance)" },
    { week: "Weeks 5–8", dose: "5.0 mg/wk" },
    { week: "Weeks 9–12", dose: "7.5 mg/wk" },
    { week: "Weeks 13–16", dose: "10 mg/wk" },
    { week: "Weeks 17–20", dose: "12.5 mg/wk" },
    { week: "Week 21+", dose: "15 mg/wk", notes: "Maximum dose" },
  ],
};

// Stable warning order; keys must match DoseWarning codes.
export const WARNING_ORDER: DoseWarning[] = [
  "over_capacity",
  "over_100_units",
  "sanity_conc",
  "sanity_dose",
];

export const WARNING_META: Record<
  DoseWarning,
  { tone: "red" | "orange"; msg: string }
> = {
  over_capacity: {
    tone: "red",
    msg: "Your dose exceeds this barrel's capacity. Pick a larger barrel, or split the dose into two injections.",
  },
  over_100_units: {
    tone: "red",
    msg: "This exceeds 100 units on a U-100 syringe. Confirm with your prescriber before drawing.",
  },
  sanity_conc: {
    tone: "orange",
    msg: "That concentration looks unusually high - double-check the label on your vial.",
  },
  sanity_dose: {
    tone: "orange",
    msg: "That dose is higher than any labeled GLP-1 dose. Confirm with your prescriber.",
  },
};
