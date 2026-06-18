// Pure compute functions for the Weight Loss Timeline Projector.
// No React, no side effects.

import {
  MEDICATIONS,
  type Medication,
  type Milestone,
  type ActivityKey,
} from "@/app/data/tools/weight-loss-timeline-projector-config";
import {
  ACTIVITY_LEVELS,
  applyActivityMultiplier,
  feetInchesToCm,
  lbsToKg,
  mifflinStJeor,
} from "@/app/utils/tools/health-math";

// ─── Projection ────────────────────────────────────────────────────────────

export type ProjectionInput = {
  medication: Medication;
  unit: "lb" | "kg";
  current: number | null;
  goal: number | null;
  weeksOnMed: number | null; // null when not toggled on
};

export type WeekSample = { week: number; weight: number; pct: number };

export type InvalidReason =
  | "missing"
  | "non-positive"
  | "goal-ge-current"
  | "weeks-on-med-out-of-range";

export type ProjectionResult =
  | { kind: "invalid"; reason: InvalidReason }
  | {
      kind: "ok";
      medication: Medication;
      unit: "lb" | "kg";
      current: number;
      goal: number;
      goalWeek: number;
      withinTrialWindow: boolean;
      veryEarly: boolean;
      unreachable: boolean;
      weeks: WeekSample[];
      milestoneRows: WeekSample[];
      weeksOnMed: number | null;
      baselineWeight: number;
    };

// Linear interpolation across an ordered milestone list anchored at (0, 0%).
// Walks the milestones once; week is clamped to the range and result is %.
export function interpolatePct(milestones: Milestone[], week: number): number {
  if (week <= 0) return 0;
  let prevWeek = 0;
  let prevPct = 0;
  for (const { week: w, pct } of milestones) {
    if (week <= w) {
      const span = w - prevWeek;
      if (span <= 0) return pct;
      const t = (week - prevWeek) / span;
      return prevPct + (pct - prevPct) * t;
    }
    prevWeek = w;
    prevPct = pct;
  }
  return prevPct; // past the last milestone — caller decides whether to extrapolate
}

// Slope (% per week) derived from the last segment of the curve. Used to
// extend projections beyond the trial window when a goal lies past maxWeek.
function lastSegmentSlope(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  if (milestones.length === 1) return milestones[0].pct / milestones[0].week;
  const last = milestones[milestones.length - 1];
  const prev = milestones[milestones.length - 2];
  const span = last.week - prev.week;
  if (span <= 0) return 0;
  return (last.pct - prev.pct) / span;
}

// Solves for the week at which projected weight equals the goal, given a
// baseline (already-on-med) and the medication's milestone curve. Returns
// the floating-point week number; the UI uses Math.ceil for the headline.
function solveGoalWeek(
  baseline: number,
  goal: number,
  startWeek: number,
  milestones: Milestone[],
  maxWeek: number,
): { goalWeek: number; withinTrialWindow: boolean } {
  // Walk integer weeks until projected ≤ goal, then linearly invert in the
  // bracketing pair for sub-week precision.
  let prevWeek = startWeek;
  let prevWeight = baseline * (1 + interpolatePct(milestones, startWeek) / 100);
  for (let w = startWeek + 1; w <= maxWeek; w++) {
    const pct = interpolatePct(milestones, w);
    const weight = baseline * (1 + pct / 100);
    if (weight <= goal) {
      const span = weight - prevWeight;
      if (span === 0) return { goalWeek: w, withinTrialWindow: true };
      const t = (goal - prevWeight) / span;
      return { goalWeek: prevWeek + t, withinTrialWindow: true };
    }
    prevWeek = w;
    prevWeight = weight;
  }
  // Past the trial window — extend at the last-segment slope.
  const slope = lastSegmentSlope(milestones); // % per week, negative
  if (slope >= 0) {
    return { goalWeek: Number.POSITIVE_INFINITY, withinTrialWindow: false };
  }
  const finalPct = interpolatePct(milestones, maxWeek);
  const finalWeight = baseline * (1 + finalPct / 100);
  // weight(week) = baseline × (1 + (finalPct + slope×(week - maxWeek))/100)
  // → solve for week when weight = goal
  const goalPct = (goal / baseline - 1) * 100;
  const extraWeeks = (goalPct - finalPct) / slope;
  if (!Number.isFinite(extraWeeks) || extraWeeks < 0) {
    return { goalWeek: Number.POSITIVE_INFINITY, withinTrialWindow: false };
  }
  return { goalWeek: maxWeek + extraWeeks, withinTrialWindow: false };
}

export function computeProjection(input: ProjectionInput): ProjectionResult {
  const { medication, unit, current, goal, weeksOnMed } = input;

  if (current == null || goal == null) {
    return { kind: "invalid", reason: "missing" };
  }
  if (current <= 0 || goal <= 0) {
    return { kind: "invalid", reason: "non-positive" };
  }
  if (goal >= current) {
    return { kind: "invalid", reason: "goal-ge-current" };
  }

  const med = MEDICATIONS[medication];

  // Validate weeksOnMed if present.
  let startWeek = 0;
  let baseline = current;
  if (weeksOnMed != null) {
    if (weeksOnMed < 0 || weeksOnMed > med.maxWeek) {
      return { kind: "invalid", reason: "weeks-on-med-out-of-range" };
    }
    startWeek = weeksOnMed;
    // Back-calculate the baseline so that current_weight sits on the curve at startWeek.
    const pctAtStart = interpolatePct(med.milestones, startWeek);
    baseline = current / (1 + pctAtStart / 100);
  }

  const { goalWeek, withinTrialWindow } = solveGoalWeek(
    baseline,
    goal,
    startWeek,
    med.milestones,
    med.maxWeek,
  );

  // Cap extrapolation at maxWeek × 2 — beyond that, treat as unreachable.
  const unreachableCap = med.maxWeek * 2;
  const unreachable =
    !Number.isFinite(goalWeek) || goalWeek > unreachableCap;
  const veryEarly = !unreachable && goalWeek <= startWeek + 2;

  // Build weekly samples for the chart. Span enough weeks to show context:
  // from startWeek out to ceil(goalWeek), but always at least 12 weeks of
  // forward visibility, capped at maxWeek if within window, or at the
  // unreachableCap otherwise.
  const visibleEnd = unreachable
    ? unreachableCap
    : Math.min(unreachableCap, Math.max(startWeek + 12, Math.ceil(goalWeek)));
  const weeks: WeekSample[] = [];
  for (let w = 0; w <= visibleEnd; w++) {
    let pct: number;
    if (w <= med.maxWeek) {
      pct = interpolatePct(med.milestones, w);
    } else {
      // Linear extension past the trial window using last-segment slope.
      const slope = lastSegmentSlope(med.milestones);
      const finalPct = interpolatePct(med.milestones, med.maxWeek);
      pct = finalPct + slope * (w - med.maxWeek);
    }
    weeks.push({ week: w, weight: baseline * (1 + pct / 100), pct });
  }

  // Milestone rows — auto-clamped to the medication's maxWeek.
  const milestoneRows: WeekSample[] = med.milestones.map(({ week, pct }) => ({
    week,
    weight: baseline * (1 + pct / 100),
    pct,
  }));

  return {
    kind: "ok",
    medication,
    unit,
    current,
    goal,
    goalWeek: Number.isFinite(goalWeek) ? goalWeek : unreachableCap,
    withinTrialWindow,
    veryEarly,
    unreachable,
    weeks,
    milestoneRows,
    weeksOnMed,
    baselineWeight: baseline,
  };
}

// ─── Calorie / macro panel ─────────────────────────────────────────────────

export type CalorieInput = {
  medication: Medication;
  unit: "lb" | "kg";
  weight: number | null;          // current weight, in `unit`
  heightUnit: "ftin" | "cm";
  heightFeet: number | null;
  heightInches: number | null;
  heightCm: number | null;
  age: number | null;
  sex: "male" | "female";
  activity: ActivityKey;
};

export type CalorieResult =
  | { kind: "invalid" }
  | {
      kind: "ok";
      bmr: number;
      tdee: number;
      deficitPct: number;
      targetCalories: number;
      deficit: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
      flooredAt1200: boolean;
    };

const MIN_CALORIE_FLOOR = 1200;

export function computeCalorieTargets(input: CalorieInput): CalorieResult {
  const {
    medication,
    unit,
    weight,
    heightUnit,
    heightFeet,
    heightInches,
    heightCm,
    age,
    sex,
    activity,
  } = input;

  if (weight == null || age == null) return { kind: "invalid" };
  if (weight <= 0 || age <= 0) return { kind: "invalid" };

  let resolvedHeightCm: number | null = null;
  if (heightUnit === "cm") {
    if (heightCm == null || heightCm <= 0) return { kind: "invalid" };
    resolvedHeightCm = heightCm;
  } else {
    if (heightFeet == null || heightFeet <= 0) return { kind: "invalid" };
    resolvedHeightCm = feetInchesToCm(heightFeet, heightInches ?? 0);
  }

  const weightKg = unit === "lb" ? lbsToKg(weight) : weight;
  const bmr = mifflinStJeor({ weightKg, heightCm: resolvedHeightCm, age, sex });
  const tdee = applyActivityMultiplier(bmr, activity);
  const deficitPct = MEDICATIONS[medication].deficitPct;
  const rawTarget = Math.round(tdee * (1 - deficitPct));
  const targetCalories = Math.max(rawTarget, MIN_CALORIE_FLOOR);
  const flooredAt1200 = rawTarget < MIN_CALORIE_FLOOR;
  const deficit = Math.round(tdee - targetCalories);

  // Macro split: 30% protein / 40% carbs / 30% fat
  const proteinG = Math.round((0.30 * targetCalories) / 4);
  const carbsG = Math.round((0.40 * targetCalories) / 4);
  const fatG = Math.round((0.30 * targetCalories) / 9);

  return {
    kind: "ok",
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    deficitPct,
    targetCalories,
    deficit,
    proteinG,
    carbsG,
    fatG,
    flooredAt1200,
  };
}

// Re-export ACTIVITY_LEVELS so tests/components have a single source.
export { ACTIVITY_LEVELS };
