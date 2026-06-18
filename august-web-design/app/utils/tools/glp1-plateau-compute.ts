import {
  MEDICATION_OPTIONS,
  type MedicationOption,
  type ExerciseLevel,
  type ProteinLevel,
  type SleepQuality,
  type PlateauFormData,
} from "@/app/data/tools/glp1-plateau-calculator-config";

// --- Types ---

export interface PlateauInput {
  startingWeight: number; // lbs, 100-600
  currentWeight: number; // lbs, 80-600
  weeksOnMedication: number; // 1-200
  weeksWithoutChange: number; // 0-52
  medication: string; // value from MEDICATION_OPTIONS
  exercise: string; // ExerciseLevel value
  protein: string; // ProteinLevel value
  sleep: string; // SleepQuality value
}

export interface Recommendation {
  id: string;
  icon: string; // Lucide icon name
  title: string;
  description: string;
  priority: number; // lower = higher priority
}

export type PlateauStatus = "true" | "likely" | "not-yet";

export interface PlateauResult {
  status: PlateauStatus;
  statusLabel: string;
  pctLost: number;
  lbsLost: number;
  avgWeeklyLoss: number;
  weeksOnMedication: number;
  weeksStalled: number;
  expectedPctAtThisPoint: number;
  expectedPctTotal: number;
  isOnTrack: boolean;
  medicationLabel: string;
  recommendations: Recommendation[];
}

// --- Helpers ---

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function findMedication(value: string): MedicationOption | null {
  return MEDICATION_OPTIONS.find((m) => m.value === value) ?? null;
}

// Default for unknown medications: conservative mid-range estimate
const DEFAULT_MED: Pick<MedicationOption, "expectedPct" | "isMaxDose" | "label"> = {
  expectedPct: 12,
  isMaxDose: false,
  label: "Unknown medication",
};

// Standard clinical trial duration (weeks) — SURMOUNT-1, STEP-1
const TRIAL_WEEKS = 72;

// --- Plateau classification ---

function classifyPlateau(weeksWithoutChange: number): {
  status: PlateauStatus;
  statusLabel: string;
} {
  if (weeksWithoutChange >= 8) return { status: "true", statusLabel: "True Plateau" };
  if (weeksWithoutChange >= 4) return { status: "likely", statusLabel: "Likely Plateau" };
  return { status: "not-yet", statusLabel: "Not a Plateau Yet" };
}

// --- Recommendations ---

function buildRecommendations(
  input: PlateauInput,
  med: Pick<MedicationOption, "isMaxDose">,
): Recommendation[] {
  const recs: Recommendation[] = [];
  const protein = input.protein as ProteinLevel;
  const exercise = input.exercise as ExerciseLevel;
  const sleep = input.sleep as SleepQuality;

  // 1. Protein
  if (protein === "low" || protein === "moderate") {
    const target = Math.round(input.currentWeight * 0.45 * 1.4);
    if (protein === "low") {
      recs.push({
        id: "protein",
        icon: "Egg",
        title: "Increase protein intake",
        description: `Your protein intake is very low. Aim for around ${target} g per day based on your current weight. Protein preserves muscle mass during weight loss, which keeps your metabolism higher.`,
        priority: 1,
      });
    } else {
      recs.push({
        id: "protein",
        icon: "Egg",
        title: "Boost your protein",
        description: `Try increasing to around ${target} g per day. Higher protein intake helps preserve lean mass and can improve satiety between meals.`,
        priority: 1,
      });
    }
  }

  // 2. Exercise
  if (exercise !== "resistance") {
    if (exercise === "none") {
      recs.push({
        id: "exercise",
        icon: "Dumbbell",
        title: "Start a movement routine",
        description:
          "Adding any regular exercise, especially resistance training, can help restart weight loss. Start with 2-3 days per week of bodyweight exercises or light weights.",
        priority: 2,
      });
    } else if (exercise === "light") {
      recs.push({
        id: "exercise",
        icon: "Dumbbell",
        title: "Add resistance training",
        description:
          "Walking is great, but adding 2-3 days of resistance training per week can significantly boost your metabolism and help break through a plateau.",
        priority: 2,
      });
    } else if (exercise === "moderate-cardio") {
      recs.push({
        id: "exercise",
        icon: "Dumbbell",
        title: "Include strength training",
        description:
          "Cardio alone may not break a plateau. Adding 2-3 resistance training sessions per week builds muscle, which raises your resting metabolic rate.",
        priority: 2,
      });
    }
  }

  // 3. Sleep
  if (sleep === "poor" || sleep === "fair") {
    if (sleep === "poor") {
      recs.push({
        id: "sleep",
        icon: "Moon",
        title: "Prioritize sleep quality",
        description:
          "Poor sleep is a major plateau driver. It disrupts hunger hormones (ghrelin and leptin) and increases cortisol, which promotes fat storage. Aim for 7-8 hours per night.",
        priority: 3,
      });
    } else {
      recs.push({
        id: "sleep",
        icon: "Moon",
        title: "Improve your sleep",
        description:
          "Getting to 7-8 hours of quality sleep per night can meaningfully impact weight loss. Sleep affects appetite regulation and metabolic recovery.",
        priority: 3,
      });
    }
  }

  // 4. Dose increase
  if (!med.isMaxDose && input.weeksWithoutChange >= 4) {
    recs.push({
      id: "dose",
      icon: "Pill",
      title: "Discuss a dose adjustment",
      description:
        "You're not at the maximum dose for your medication. If you've been at your current dose for several weeks without progress, your prescriber may recommend titrating up. This is a conversation to have with your healthcare provider.",
      priority: 4,
    });
  }

  // 5. Calorie recalibration (always)
  const maintenance = Math.round(input.currentWeight * 0.45 * 14);
  const deficit = maintenance - 500;
  recs.push({
    id: "calories",
    icon: "Calculator",
    title: "Recalibrate your calorie target",
    description: `As you lose weight, your calorie needs decrease. Your estimated maintenance is around ${maintenance} calories per day. A moderate deficit of 500 calories puts your target around ${deficit} calories per day for roughly 1 lb per week of loss.`,
    priority: 5,
  });

  return recs.sort((a, b) => a.priority - b.priority);
}

// --- Main computation ---

export function computePlateau(input: PlateauInput): PlateauResult {
  // Step 1 - Core stats
  const lbsLost = input.startingWeight - input.currentWeight;
  const pctLost = round1((lbsLost / input.startingWeight) * 100);
  const avgWeeklyLoss = round1(lbsLost / input.weeksOnMedication);

  // Step 2 - Plateau classification
  const { status, statusLabel } = classifyPlateau(input.weeksWithoutChange);

  // Step 3 - Drug lookup
  const med = findMedication(input.medication);
  const expectedPct = med?.expectedPct ?? DEFAULT_MED.expectedPct;
  const isMaxDose = med?.isMaxDose ?? DEFAULT_MED.isMaxDose;
  const medicationLabel = med?.label ?? DEFAULT_MED.label;

  const expectedPctAtThisPoint = round1(
    expectedPct * (input.weeksOnMedication / TRIAL_WEEKS),
  );

  // Step 4 - On-track status (75% tolerance)
  const isOnTrack = pctLost >= expectedPctAtThisPoint * 0.75;

  // Step 5 - Recommendations
  const recommendations = buildRecommendations(input, { isMaxDose });

  return {
    status,
    statusLabel,
    pctLost,
    lbsLost,
    avgWeeklyLoss,
    weeksOnMedication: input.weeksOnMedication,
    weeksStalled: input.weeksWithoutChange,
    expectedPctAtThisPoint,
    expectedPctTotal: expectedPct,
    isOnTrack,
    medicationLabel,
    recommendations,
  };
}

// --- Validation ---

export function validatePlateauInput(
  formData: PlateauFormData,
): { valid: boolean; error?: string } {
  const sw = parseFloat(formData.startingWeight);
  const cw = parseFloat(formData.currentWeight);
  const wom = parseFloat(formData.weeksOnMedication);
  const wwc = parseFloat(formData.weeksWithoutChange);
  const isMetric = formData.unitSystem === "metric";
  const unit = isMetric ? "kg" : "lbs";
  const swMin = isMetric ? 45 : 100;
  const swMax = isMetric ? 272 : 600;
  const cwMin = isMetric ? 36 : 80;

  if (!Number.isFinite(sw) || sw <= 0)
    return { valid: false, error: "Starting weight must be a positive number" };
  if (sw < swMin || sw > swMax)
    return { valid: false, error: `Starting weight must be between ${swMin} and ${swMax} ${unit}` };

  if (!Number.isFinite(cw) || cw <= 0)
    return { valid: false, error: "Current weight must be a positive number" };
  if (cw < cwMin || cw > swMax)
    return { valid: false, error: `Current weight must be between ${cwMin} and ${swMax} ${unit}` };
  if (cw >= sw)
    return { valid: false, error: "Current weight must be less than starting weight" };

  if (!Number.isFinite(wom) || wom <= 0)
    return { valid: false, error: "Weeks on medication must be a positive number" };
  if (wom < 1 || wom > 200)
    return { valid: false, error: "Weeks on medication must be between 1 and 200" };

  if (!Number.isFinite(wwc) || wwc < 0)
    return { valid: false, error: "Weeks without change must be 0 or more" };
  if (wwc > 52)
    return { valid: false, error: "Weeks without change must be 52 or less" };
  if (wwc > wom)
    return { valid: false, error: "Weeks without change cannot exceed weeks on medication" };

  if (!formData.medication)
    return { valid: false, error: "Please select a medication" };
  if (!formData.exercise)
    return { valid: false, error: "Please select an exercise level" };
  if (!formData.protein)
    return { valid: false, error: "Please select a protein level" };
  if (!formData.sleep)
    return { valid: false, error: "Please select a sleep quality level" };

  return { valid: true };
}
