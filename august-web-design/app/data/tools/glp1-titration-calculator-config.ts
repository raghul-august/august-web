export type MedicationKey = "wegovy" | "ozempic" | "mounjaro" | "zepbound";

export interface ScheduleStep {
  week: string;
  doseMg: number;
  duration: number;
  isMaintenanceStart?: boolean;
  note?: string;
}

export interface MedicationInfo {
  name: string;
  indication: string;
  maxDose: number;
  defaultConcentration: number;
  commonConcentrations: number[];
  schedule: ScheduleStep[];
}

export interface TitrationFormData {
  medication: MedicationKey | "";
  concentration: string;
  extendedTitration: boolean;
  customTarget: boolean;
  targetDose: string;
}

export const MEDICATIONS: Record<MedicationKey, MedicationInfo> = {
  wegovy: {
    name: "Wegovy (Semaglutide)",
    indication: "Weight Loss",
    maxDose: 2.4,
    defaultConcentration: 2.5,
    commonConcentrations: [1, 2.5, 5],
    schedule: [
      { week: "1-4", doseMg: 0.25, duration: 4, note: "Starting dose for GI tolerability" },
      { week: "5-8", doseMg: 0.5, duration: 4 },
      { week: "9-12", doseMg: 1, duration: 4 },
      { week: "13-16", doseMg: 1.7, duration: 4 },
      {
        week: "17+", doseMg: 2.4, duration: 0, isMaintenanceStart: true,
        note: "Maintenance dose (may maintain at 1.7 mg if 2.4 mg not tolerated)",
      },
    ],
  },
  ozempic: {
    name: "Ozempic (Semaglutide)",
    indication: "Type 2 Diabetes",
    maxDose: 2,
    defaultConcentration: 1,
    commonConcentrations: [1, 2.5],
    schedule: [
      { week: "1-4", doseMg: 0.25, duration: 4, note: "Non-therapeutic starting dose for GI tolerability" },
      { week: "5-8", doseMg: 0.5, duration: 4 },
      { week: "9-12", doseMg: 1, duration: 4, note: "Many patients stabilize here" },
      {
        week: "13+", doseMg: 2, duration: 0, isMaintenanceStart: true,
        note: "Maximum dose if additional A1c reduction needed",
      },
    ],
  },
  mounjaro: {
    name: "Mounjaro (Tirzepatide)",
    indication: "Type 2 Diabetes",
    maxDose: 15,
    defaultConcentration: 10,
    commonConcentrations: [5, 10, 15, 20],
    schedule: [
      { week: "1-4", doseMg: 2.5, duration: 4 },
      { week: "5-8", doseMg: 5, duration: 4 },
      { week: "9-12", doseMg: 7.5, duration: 4 },
      { week: "13-16", doseMg: 10, duration: 4, note: "Many patients achieve goals at 5-10 mg" },
      { week: "17-20", doseMg: 12.5, duration: 4 },
      {
        week: "21+", doseMg: 15, duration: 0, isMaintenanceStart: true,
        note: "Maximum dose for greatest efficacy",
      },
    ],
  },
  zepbound: {
    name: "Zepbound (Tirzepatide)",
    indication: "Weight Loss",
    maxDose: 15,
    defaultConcentration: 10,
    commonConcentrations: [5, 10, 15, 20],
    schedule: [
      { week: "1-4", doseMg: 2.5, duration: 4 },
      { week: "5-8", doseMg: 5, duration: 4 },
      { week: "9-12", doseMg: 7.5, duration: 4 },
      { week: "13-16", doseMg: 10, duration: 4 },
      { week: "17-20", doseMg: 12.5, duration: 4 },
      {
        week: "21+", doseMg: 15, duration: 0, isMaintenanceStart: true,
        note: "Maintenance dose typically 5, 10, or 15 mg based on response",
      },
    ],
  },
};

export const MEDICATION_OPTIONS: { value: MedicationKey; label: string }[] = [
  { value: "wegovy", label: "Wegovy (Semaglutide)" },
  { value: "ozempic", label: "Ozempic (Semaglutide)" },
  { value: "mounjaro", label: "Mounjaro (Tirzepatide)" },
  { value: "zepbound", label: "Zepbound (Tirzepatide)" },
];

export const DEFAULT_FORM_DATA: TitrationFormData = {
  medication: "",
  concentration: "",
  extendedTitration: false,
  customTarget: false,
  targetDose: "",
};
