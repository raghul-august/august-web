// Pure time-math for the Sleep Calculator.
// No React, no DOM, no Date side-effects beyond reading "now" when explicitly asked.

export type SleepMode = "wake-at" | "sleep-at" | "sleep-now";
export type AgeBand =
  | "teen"
  | "young-adult"
  | "adult"
  | "older-adult";

export interface AgeGuideline {
  id: AgeBand;
  label: string;
  range: string;
  minHours: number;
  maxHours: number;
}

export const AGE_GUIDELINES: readonly AgeGuideline[] = [
  { id: "teen", label: "Teen (13–17)", range: "8–10 hours", minHours: 8, maxHours: 10 },
  { id: "young-adult", label: "Young adult (18–25)", range: "7–9 hours", minHours: 7, maxHours: 9 },
  { id: "adult", label: "Adult (26–64)", range: "7–9 hours", minHours: 7, maxHours: 9 },
  { id: "older-adult", label: "Older adult (65+)", range: "7–8 hours", minHours: 7, maxHours: 8 },
];

export interface SleepFormState {
  mode: SleepMode;
  // 12-hour input. Hour is "1"–"12", minute is "00"–"59", period is "AM" | "PM"
  hourRaw: string;
  minuteRaw: string;
  period: "AM" | "PM";
  ageBand: AgeBand;
  cycleMinutes: number;       // default 90
  fallAsleepMinutes: number;  // default 15
}

export const DEFAULT_CYCLE_MINUTES = 90;
export const DEFAULT_FALL_ASLEEP_MINUTES = 15;
export const CYCLE_MIN_MINUTES = 70;
export const CYCLE_MAX_MINUTES = 120;
export const FALL_ASLEEP_MAX_MINUTES = 60;

// Cycles shown to the user. 5–6 are the recommended range for most adults.
export const CYCLE_COUNTS: readonly number[] = [6, 5, 4, 3];
export const RECOMMENDED_CYCLES: ReadonlySet<number> = new Set([5, 6]);

export interface CycleRow {
  cycles: number;
  totalSleepMinutes: number;
  totalSleepLabel: string;       // "7.5 hours"
  clockMinutes: number;          // minutes from start of day for the resulting time
  clockLabel: string;            // "10:15 PM"
  recommended: boolean;
}

export interface SleepResultOk {
  kind: "ok";
  mode: SleepMode;
  anchorMinutes: number;         // input time in minutes from start of day
  anchorLabel: string;           // input time formatted
  rows: CycleRow[];              // ordered by cycles desc (most sleep first)
  bestRow: CycleRow;             // the recommended row to highlight (closest to age band, prefer 5)
  cycleMinutes: number;
  fallAsleepMinutes: number;
  ageGuideline: AgeGuideline;
}

export interface SleepResultInvalid {
  kind: "invalid";
  reason: "missing_time" | "bad_time";
}

export type SleepResult = SleepResultOk | SleepResultInvalid;

const MINUTES_PER_DAY = 24 * 60;

export function parseTo24h(
  hourRaw: string,
  minuteRaw: string,
  period: "AM" | "PM",
): number | null {
  const h = parseInt(hourRaw, 10);
  const m = parseInt(minuteRaw, 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 1 || h > 12) return null;
  if (m < 0 || m > 59) return null;
  let hour24 = h % 12;
  if (period === "PM") hour24 += 12;
  return hour24 * 60 + m;
}

export function formatClock(totalMinutes: number): string {
  const wrapped = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour24 = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  const mm = minute.toString().padStart(2, "0");
  return `${hour12}:${mm} ${period}`;
}

function formatHours(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  // 1 decimal, drop trailing .0
  const display = Number(hours.toFixed(1));
  return `${display} hour${display === 1 ? "" : "s"}`;
}

function currentClockMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function computeSleepResult(
  state: SleepFormState,
  options: { nowMinutes?: number } = {},
): SleepResult {
  let anchor: number;
  if (state.mode === "sleep-now") {
    anchor = options.nowMinutes ?? currentClockMinutes();
  } else {
    const parsed = parseTo24h(state.hourRaw, state.minuteRaw, state.period);
    if (state.hourRaw.trim() === "" || state.minuteRaw.trim() === "") {
      return { kind: "invalid", reason: "missing_time" };
    }
    if (parsed == null) return { kind: "invalid", reason: "bad_time" };
    anchor = parsed;
  }

  const cycle = state.cycleMinutes > 0 ? state.cycleMinutes : DEFAULT_CYCLE_MINUTES;
  const buffer = state.fallAsleepMinutes >= 0 ? state.fallAsleepMinutes : DEFAULT_FALL_ASLEEP_MINUTES;

  const rows: CycleRow[] = CYCLE_COUNTS.map((cycles) => {
    const totalSleep = cycles * cycle;
    // For wake-at: bedtime = anchor − buffer − cycles*cycle
    // For sleep-at / sleep-now: wake = anchor + buffer + cycles*cycle
    const offset = state.mode === "wake-at"
      ? -(buffer + totalSleep)
      : (buffer + totalSleep);
    const clockMinutes = anchor + offset;
    return {
      cycles,
      totalSleepMinutes: totalSleep,
      totalSleepLabel: formatHours(totalSleep),
      clockMinutes,
      clockLabel: formatClock(clockMinutes),
      recommended: RECOMMENDED_CYCLES.has(cycles),
    };
  });

  const ageGuideline = AGE_GUIDELINES.find((g) => g.id === state.ageBand) ?? AGE_GUIDELINES[2];

  // Best row: the smallest-cycle recommended row whose total sleep meets the age min.
  // Falls back to highest recommended cycle if none qualify.
  const ageMinMinutes = ageGuideline.minHours * 60;
  const meeting = rows.filter((r) => r.recommended && r.totalSleepMinutes >= ageMinMinutes);
  const bestRow = meeting.length > 0
    ? meeting[meeting.length - 1]
    : rows.find((r) => r.recommended) ?? rows[1];

  return {
    kind: "ok",
    mode: state.mode,
    anchorMinutes: anchor,
    anchorLabel: formatClock(anchor),
    rows,
    bestRow,
    cycleMinutes: cycle,
    fallAsleepMinutes: buffer,
    ageGuideline,
  };
}

export function modeBucket(mode: SleepMode): string {
  return mode;
}
