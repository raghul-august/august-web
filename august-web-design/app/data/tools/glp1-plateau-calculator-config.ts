export type ExerciseLevel = "none" | "light" | "moderate-cardio" | "resistance";
export type ProteinLevel = "low" | "moderate" | "good" | "high";
export type SleepQuality = "poor" | "fair" | "good" | "great";
export type PlateauStatus = "true" | "likely" | "not-yet";
export type UnitSystem = "imperial" | "metric";

export interface MedicationOption {
  value: string;
  label: string;
  expectedPct: number; // expected % total body weight loss at 72 weeks (clinical trial data)
  isMaxDose: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface PlateauFormData {
  unitSystem: UnitSystem;
  startingWeight: string;
  currentWeight: string;
  weeksOnMedication: string;
  weeksWithoutChange: string;
  medication: string;
  exercise: ExerciseLevel | "";
  protein: ProteinLevel | "";
  sleep: SleepQuality | "";
}

export const MEDICATION_OPTIONS: MedicationOption[] = [
  { value: "ozempic-0.5", label: "Ozempic 0.5 mg", expectedPct: 6, isMaxDose: false },
  { value: "ozempic-1", label: "Ozempic 1 mg", expectedPct: 8, isMaxDose: false },
  { value: "ozempic-2", label: "Ozempic 2 mg", expectedPct: 11, isMaxDose: true },
  { value: "wegovy-2.4", label: "Wegovy 2.4 mg", expectedPct: 15, isMaxDose: true },
  { value: "mounjaro-5", label: "Mounjaro / Zepbound 5 mg", expectedPct: 15, isMaxDose: false },
  { value: "mounjaro-10", label: "Mounjaro / Zepbound 10 mg", expectedPct: 19, isMaxDose: false },
  { value: "mounjaro-15", label: "Mounjaro / Zepbound 15 mg", expectedPct: 21, isMaxDose: true },
];

export const EXERCISE_OPTIONS: SelectOption[] = [
  { value: "none", label: "None" },
  { value: "light", label: "Light (1-2 days walking)" },
  { value: "moderate-cardio", label: "Moderate cardio (3-4 days)" },
  { value: "resistance", label: "Includes resistance / strength" },
];

export const PROTEIN_OPTIONS: SelectOption[] = [
  { value: "low", label: "Low (under 60 g)" },
  { value: "moderate", label: "Moderate (60-100 g)" },
  { value: "good", label: "Good (100-130 g)" },
  { value: "high", label: "High (over 130 g)" },
];

export const SLEEP_OPTIONS: SelectOption[] = [
  { value: "poor", label: "Poor (under 6 hrs)" },
  { value: "fair", label: "Fair (6-7 hrs)" },
  { value: "good", label: "Good (7-8 hrs)" },
  { value: "great", label: "Great (8+ hrs)" },
];

export const DEFAULT_FORM_DATA: PlateauFormData = {
  unitSystem: "imperial",
  startingWeight: "",
  currentWeight: "",
  weeksOnMedication: "",
  weeksWithoutChange: "",
  medication: "",
  exercise: "",
  protein: "",
  sleep: "",
};
