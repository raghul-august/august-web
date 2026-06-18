import type { MedicationKey, ScheduleStep, TitrationFormData } from "@/app/data/tools/glp1-titration-calculator-config";
import { MEDICATIONS } from "@/app/data/tools/glp1-titration-calculator-config";

export interface ResultRow {
  week: string;
  doseMg: number;
  duration: number;
  units: number;
  volumeMl: string;
  isMaintenanceStart?: boolean;
  note?: string;
}

export interface TitrationResult {
  rows: ResultRow[];
  medicationName: string;
  indication: string;
  maxDose: number;
}

export function calcUnits(doseMg: number, concentration: number): number {
  if (concentration <= 0 || doseMg < 0) return 0;
  return Math.round((doseMg / concentration) * 100 * 10) / 10;
}

export function calcVolume(doseMg: number, concentration: number): string {
  if (concentration <= 0) return "0.00";
  return (doseMg / concentration).toFixed(2);
}

function buildExtendedSchedule(key: MedicationKey, extraWeeks = 4): ScheduleStep[] {
  const med = MEDICATIONS[key];
  if (!med) return [];
  return med.schedule.map((step) =>
    step.isMaintenanceStart
      ? step
      : { ...step, duration: step.duration + extraWeeks, week: `${step.week} (Extended +${extraWeeks} weeks)` },
  );
}

function buildCustomTargetSchedule(key: MedicationKey, targetDoseMg: number): ScheduleStep[] {
  const med = MEDICATIONS[key];
  if (!med) return [];
  const result: ScheduleStep[] = [];
  for (const step of med.schedule) {
    result.push(step);
    if (step.doseMg >= targetDoseMg) {
      if (step.doseMg === targetDoseMg) {
        result[result.length - 1] = {
          ...step,
          isMaintenanceStart: true,
          note: `Custom target dose (${targetDoseMg} mg)`,
        };
      }
      break;
    }
  }
  return result;
}

export function computeTitration(
  medication: MedicationKey,
  concentration: number,
  extendedTitration: boolean,
  customTarget: boolean,
  targetDose?: number,
): TitrationResult | null {
  const med = MEDICATIONS[medication];
  if (!med) return null;

  let schedule = med.schedule;
  if (extendedTitration) {
    schedule = buildExtendedSchedule(medication, 4);
  }
  if (customTarget && targetDose != null && targetDose >= 0.1) {
    schedule = buildCustomTargetSchedule(medication, targetDose);
  }

  const rows: ResultRow[] = schedule.map((step) => ({
    ...step,
    units: calcUnits(step.doseMg, concentration),
    volumeMl: calcVolume(step.doseMg, concentration),
  }));

  return {
    rows,
    medicationName: med.name,
    indication: med.indication,
    maxDose: med.maxDose,
  };
}

export function validateTitrationInput(
  formData: TitrationFormData,
): { valid: true } | { valid: false; error: string } {
  if (!formData.medication) {
    return { valid: false, error: "Select a medication" };
  }
  const conc = parseFloat(formData.concentration);
  if (!Number.isFinite(conc) || conc < 0.1) {
    return { valid: false, error: "Enter a vial concentration (at least 0.1 mg/mL)" };
  }
  if (formData.customTarget) {
    const target = parseFloat(formData.targetDose);
    if (!Number.isFinite(target) || target < 0.1) {
      return { valid: false, error: "Enter a valid target dose (at least 0.1 mg)" };
    }
  }
  return { valid: true };
}
