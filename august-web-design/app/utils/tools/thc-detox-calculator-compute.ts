import {
  BMI_MULTIPLIER,
  DETECTION_WINDOWS,
  type BmiCategory,
  type TestType,
  type UsageFrequency,
} from "@/app/data/tools/thc-detox-calculator-config";

export interface ThcDetoxFormState {
  frequency: UsageFrequency | null;
  testType: TestType;
  bmi: BmiCategory;
  /** Optional ISO date of last use; if absent, "today" is assumed. */
  lastUseRaw: string;
}

export interface ThcDetoxResultOk {
  kind: "ok";
  frequency: UsageFrequency;
  testType: TestType;
  bmi: BmiCategory;
  /** Detection window from LAST USE, in days. Adjusted for BMI. */
  windowMinDays: number;
  windowMaxDays: number;
  /** Days remaining from TODAY until the high end of the window. */
  daysRemainingMin: number;
  daysRemainingMax: number;
  /** ISO yyyy-mm-dd: estimated earliest "likely clear" date (low end of window from last use). */
  earliestClearDate: string;
  /** ISO yyyy-mm-dd: conservative "likely clear" date (high end of window from last use). */
  conservativeClearDate: string;
  daysSinceLastUse: number;
  /** "likely clear" | "borderline" | "still detectable" */
  status: "likely-clear" | "borderline" | "still-detectable";
}

export interface ThcDetoxResultInvalid {
  kind: "invalid";
  reason:
    | "missing_frequency"
    | "missing_test_type"
    | "missing_bmi"
    | "unparseable_date"
    | "future_date"
    | "hair_single_use";
}

export type ThcDetoxResult = ThcDetoxResultOk | ThcDetoxResultInvalid;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalDate(input: string): Date | null {
  if (!input) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const d = new Date(year, month - 1, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function diffDays(from: Date, to: Date): number {
  return Math.round(
    (startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) /
      MS_PER_DAY,
  );
}

export function computeThcDetox(
  state: ThcDetoxFormState,
  now: Date = new Date(),
): ThcDetoxResult {
  if (!state.frequency) return { kind: "invalid", reason: "missing_frequency" };
  if (!state.testType) return { kind: "invalid", reason: "missing_test_type" };
  if (!state.bmi) return { kind: "invalid", reason: "missing_bmi" };

  if (state.testType === "hair" && state.frequency === "single-use") {
    return { kind: "invalid", reason: "hair_single_use" };
  }

  const today = startOfLocalDay(now);

  let lastUse = today;
  if (state.lastUseRaw) {
    const parsed = parseLocalDate(state.lastUseRaw);
    if (!parsed) return { kind: "invalid", reason: "unparseable_date" };
    if (parsed.getTime() > today.getTime()) {
      return { kind: "invalid", reason: "future_date" };
    }
    lastUse = parsed;
  }

  const win = DETECTION_WINDOWS[state.testType][state.frequency];
  const mult = BMI_MULTIPLIER[state.bmi];
  const adjustedMin = Math.max(1, Math.round(win.min));
  const adjustedMax = Math.max(adjustedMin, Math.round(win.max * mult));

  const earliestClearDate = toIsoDate(addDays(lastUse, adjustedMin));
  const conservativeClearDate = toIsoDate(addDays(lastUse, adjustedMax));

  const daysSinceLastUse = diffDays(lastUse, today);
  const daysRemainingMin = Math.max(0, adjustedMin - daysSinceLastUse);
  const daysRemainingMax = Math.max(0, adjustedMax - daysSinceLastUse);

  let status: ThcDetoxResultOk["status"];
  if (daysSinceLastUse >= adjustedMax) status = "likely-clear";
  else if (daysSinceLastUse >= adjustedMin) status = "borderline";
  else status = "still-detectable";

  return {
    kind: "ok",
    frequency: state.frequency,
    testType: state.testType,
    bmi: state.bmi,
    windowMinDays: adjustedMin,
    windowMaxDays: adjustedMax,
    daysRemainingMin,
    daysRemainingMax,
    earliestClearDate,
    conservativeClearDate,
    daysSinceLastUse,
    status,
  };
}

export function thcDetoxBucket(result: ThcDetoxResultOk): string {
  return `${result.testType}|${result.frequency}|${result.bmi}|${result.status}`;
}

export function formatHumanDate(iso: string): string {
  const d = parseLocalDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
