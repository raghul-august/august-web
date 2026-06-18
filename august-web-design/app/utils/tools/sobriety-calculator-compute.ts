import {
  SOBRIETY_MILESTONES,
  type SobrietyMilestone,
} from "@/app/data/tools/sobriety-calculator-config";

export interface SobrietyResultOk {
  kind: "ok";
  /** Inclusive total calendar days from sobriety date through today. */
  days: number;
  weeks: number;
  months: number;
  years: number;
  /** Breakdown like "3 years, 2 months, 5 days". */
  breakdown: SobrietyBreakdown;
  hours: number;
  minutes: number;
  /** Last milestone the user has already passed (closest below or equal). */
  current: SobrietyMilestone | null;
  /** Next milestone the user is working toward. */
  next: SobrietyMilestone | null;
  /** Days remaining to next milestone (0 when already past final). */
  daysToNext: number;
  /** 0..1 progress fraction between current and next milestone (inclusive). */
  progress: number;
  sobrietyDate: string; // ISO yyyy-mm-dd
  todayIso: string; // ISO yyyy-mm-dd
}

export interface SobrietyResultInvalid {
  kind: "invalid";
  reason: "missing_date" | "future_date" | "unparseable";
}

export type SobrietyResult = SobrietyResultOk | SobrietyResultInvalid;

export interface SobrietyBreakdown {
  years: number;
  months: number;
  days: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_MINUTE = 1000 * 60;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Difference in whole calendar days (inclusive of both endpoints). */
function inclusiveDayDiff(from: Date, to: Date): number {
  const a = startOfLocalDay(from).getTime();
  const b = startOfLocalDay(to).getTime();
  return Math.floor((b - a) / MS_PER_DAY) + 1;
}

function diffYearsMonthsDays(from: Date, to: Date): SobrietyBreakdown {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days };
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalDate(input: string): Date | null {
  if (!input) return null;
  // Accept yyyy-mm-dd
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

function findMilestones(days: number): {
  current: SobrietyMilestone | null;
  next: SobrietyMilestone | null;
} {
  let current: SobrietyMilestone | null = null;
  let next: SobrietyMilestone | null = null;
  for (const m of SOBRIETY_MILESTONES) {
    if (days >= m.days) {
      current = m;
    } else if (!next) {
      next = m;
      break;
    }
  }
  return { current, next };
}

export function computeSobriety(
  sobrietyDateInput: string,
  now: Date = new Date(),
): SobrietyResult {
  if (!sobrietyDateInput) return { kind: "invalid", reason: "missing_date" };
  const sobrietyDate = parseLocalDate(sobrietyDateInput);
  if (!sobrietyDate) return { kind: "invalid", reason: "unparseable" };

  const todayStart = startOfLocalDay(now);
  const sobrietyStart = startOfLocalDay(sobrietyDate);

  if (sobrietyStart.getTime() > todayStart.getTime()) {
    return { kind: "invalid", reason: "future_date" };
  }

  const days = inclusiveDayDiff(sobrietyStart, todayStart);
  const weeks = Math.floor(days / 7);

  const breakdown = diffYearsMonthsDays(sobrietyStart, todayStart);
  const years = breakdown.years;
  const months = breakdown.years * 12 + breakdown.months;

  const elapsedMs = now.getTime() - sobrietyStart.getTime();
  const hours = Math.max(0, Math.floor(elapsedMs / MS_PER_HOUR));
  const minutes = Math.max(0, Math.floor(elapsedMs / MS_PER_MINUTE));

  const { current, next } = findMilestones(days);
  const daysToNext = next ? Math.max(0, next.days - days) : 0;
  const progress = next
    ? Math.min(
        1,
        Math.max(
          0,
          (days - (current?.days ?? 0)) /
            Math.max(1, next.days - (current?.days ?? 0)),
        ),
      )
    : 1;

  return {
    kind: "ok",
    days,
    weeks,
    months,
    years,
    breakdown,
    hours,
    minutes,
    current,
    next,
    daysToNext,
    progress,
    sobrietyDate: toIsoDate(sobrietyStart),
    todayIso: toIsoDate(todayStart),
  };
}

export function sobrietyBucket(days: number): string {
  if (days < 1) return "0";
  if (days < 7) return "1-6";
  if (days < 30) return "7-29";
  if (days < 90) return "30-89";
  if (days < 180) return "90-179";
  if (days < 365) return "180-364";
  if (days < 730) return "1y-2y";
  if (days < 1825) return "2y-5y";
  if (days < 3650) return "5y-10y";
  return "10y+";
}

export function formatBreakdown(b: SobrietyBreakdown): string {
  const parts: string[] = [];
  if (b.years > 0) parts.push(`${b.years} year${b.years === 1 ? "" : "s"}`);
  if (b.months > 0) parts.push(`${b.months} month${b.months === 1 ? "" : "s"}`);
  if (b.days > 0 || parts.length === 0)
    parts.push(`${b.days} day${b.days === 1 ? "" : "s"}`);
  return parts.join(", ");
}
