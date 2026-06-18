import {
  CYCLE_LENGTH_MAX,
  CYCLE_LENGTH_MIN,
  FERTILE_WINDOW_POST_OVULATION_DAYS,
  FERTILE_WINDOW_PRE_OVULATION_DAYS,
  LUTEAL_PHASE_DAYS,
  PREGNANCY_LENGTH_DAYS,
} from "@/app/data/tools/ovulation-calculator-config";

export interface OvulationFormState {
  lmpRaw: string; // yyyy-mm-dd
  cycleLength: number;
  periodLength: number;
}

export type OvulationInvalidReason =
  | "missing_lmp"
  | "future_lmp"
  | "lmp_too_old"
  | "cycle_out_of_range"
  | "unparseable_lmp";

export interface OvulationResultOk {
  kind: "ok";
  lmp: string; // ISO
  cycleLength: number;
  periodLength: number;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  nextPeriodStart: string;
  dueDate: string;
  /** Three projected cycles after this one. */
  upcoming: { cycleNumber: number; periodStart: string; ovulation: string }[];
  /** Days from today (positive = future, negative = past, 0 = today). */
  daysUntilOvulation: number;
  daysUntilNextPeriod: number;
  todayIso: string;
}

export interface OvulationResultInvalid {
  kind: "invalid";
  reason: OvulationInvalidReason;
}

export type OvulationResult = OvulationResultOk | OvulationResultInvalid;

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
  if (!year || !month || !day) return null;
  if (month < 1 || month > 12) return null;
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

export function computeOvulation(
  state: OvulationFormState,
  now: Date = new Date(),
): OvulationResult {
  if (!state.lmpRaw) return { kind: "invalid", reason: "missing_lmp" };
  const lmp = parseLocalDate(state.lmpRaw);
  if (!lmp) return { kind: "invalid", reason: "unparseable_lmp" };

  const today = startOfLocalDay(now);
  if (lmp.getTime() > today.getTime()) {
    return { kind: "invalid", reason: "future_lmp" };
  }

  // Don't bother with LMP > 120 days ago — likely already pregnant or stale data.
  const daysSinceLmp = diffDays(lmp, today);
  if (daysSinceLmp > 120) return { kind: "invalid", reason: "lmp_too_old" };

  if (
    state.cycleLength < CYCLE_LENGTH_MIN ||
    state.cycleLength > CYCLE_LENGTH_MAX
  ) {
    return { kind: "invalid", reason: "cycle_out_of_range" };
  }

  // Ovulation = LMP + cycleLength - lutealPhase
  const ovulationOffset = state.cycleLength - LUTEAL_PHASE_DAYS;
  const ovulationDate = addDays(lmp, ovulationOffset);

  // Fertile window: 5 days before ovulation through 1 day after
  const fertileWindowStart = addDays(
    ovulationDate,
    -FERTILE_WINDOW_PRE_OVULATION_DAYS,
  );
  const fertileWindowEnd = addDays(
    ovulationDate,
    FERTILE_WINDOW_POST_OVULATION_DAYS,
  );

  // Next period = LMP + cycleLength
  const nextPeriodStart = addDays(lmp, state.cycleLength);
  // Due date = LMP + 280 days (Naegele's rule)
  const dueDate = addDays(lmp, PREGNANCY_LENGTH_DAYS);

  const upcoming = [1, 2, 3].map((i) => ({
    cycleNumber: i + 1,
    periodStart: toIsoDate(addDays(lmp, state.cycleLength * i)),
    ovulation: toIsoDate(addDays(lmp, state.cycleLength * i + ovulationOffset)),
  }));

  return {
    kind: "ok",
    lmp: toIsoDate(lmp),
    cycleLength: state.cycleLength,
    periodLength: state.periodLength,
    ovulationDate: toIsoDate(ovulationDate),
    fertileWindowStart: toIsoDate(fertileWindowStart),
    fertileWindowEnd: toIsoDate(fertileWindowEnd),
    nextPeriodStart: toIsoDate(nextPeriodStart),
    dueDate: toIsoDate(dueDate),
    upcoming,
    daysUntilOvulation: diffDays(today, ovulationDate),
    daysUntilNextPeriod: diffDays(today, nextPeriodStart),
    todayIso: toIsoDate(today),
  };
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

export function relativeDayDescription(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

export function ovulationBucket(daysUntil: number): string {
  if (daysUntil < -30) return "past-30+";
  if (daysUntil < -7) return "past-7-30";
  if (daysUntil < 0) return "past-0-7";
  if (daysUntil <= 1) return "today-tomorrow";
  if (daysUntil <= 5) return "fertile-window";
  if (daysUntil <= 14) return "upcoming-2w";
  return "upcoming-2w+";
}
