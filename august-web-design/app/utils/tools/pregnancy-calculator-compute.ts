import { parseNumOrNull } from "@/app/utils/tools/health-math";

export type CalcMethod =
  | "lmp"
  | "conception"
  | "ivf"
  | "ultrasound"
  | "dueDate";

export type IVFTransferDay = "3" | "5" | "6";

export interface PregnancyFormState {
  method: CalcMethod;
  lmpDate: string;
  cycleLengthRaw: string;
  conceptionDate: string;
  ivfTransferDate: string;
  ivfTransferDay: IVFTransferDay;
  ultrasoundDate: string;
  ultrasoundWeeksRaw: string;
  ultrasoundDaysRaw: string;
  dueDateInput: string;
}

export const CYCLE_LENGTH_DEFAULT = 28;
export const CYCLE_LENGTH_MIN = 21;
export const CYCLE_LENGTH_MAX = 45;
export const ULTRASOUND_WEEKS_MIN = 4;
export const ULTRASOUND_WEEKS_MAX = 42;
export const FULL_TERM_DAYS = 280; // 40 weeks from LMP
export const OVULATION_DEFAULT_DAY = 14; // luteal phase length

export interface MethodMeta {
  id: CalcMethod;
  shortLabel: string;
  label: string;
  blurb: string;
}

export const METHODS: readonly MethodMeta[] = [
  {
    id: "lmp",
    shortLabel: "Last period",
    label: "Last menstrual period",
    blurb: "First day of your last period. Most common method.",
  },
  {
    id: "conception",
    shortLabel: "Conception",
    label: "Conception date",
    blurb: "If you know the date of conception or ovulation.",
  },
  {
    id: "ivf",
    shortLabel: "IVF transfer",
    label: "IVF transfer date",
    blurb: "Embryo transfer date and day of transfer.",
  },
  {
    id: "ultrasound",
    shortLabel: "Ultrasound",
    label: "Ultrasound dating",
    blurb: "Use the gestational age measured at a recent scan.",
  },
  {
    id: "dueDate",
    shortLabel: "Due date",
    label: "Known due date",
    blurb: "Work backwards from a known due date.",
  },
];

export const IVF_TRANSFER_OPTIONS: readonly { value: IVFTransferDay; label: string; offsetDays: number }[] = [
  { value: "3", label: "Day-3 (cleavage)", offsetDays: 263 },
  { value: "5", label: "Day-5 (blastocyst)", offsetDays: 261 },
  { value: "6", label: "Day-6 (blastocyst)", offsetDays: 260 },
];

/* ── date helpers (pure, no Date mutation) ───────────────────────────── */

const MS_PER_DAY = 86_400_000;

function parseIsoDate(s: string): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // UTC midnight to avoid timezone drift
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  return d;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / MS_PER_DAY);
}

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function toIso(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ── Default state ───────────────────────────────────────────────────── */

export const DEFAULT_FORM_STATE: PregnancyFormState = {
  method: "lmp",
  lmpDate: "",
  cycleLengthRaw: String(CYCLE_LENGTH_DEFAULT),
  conceptionDate: "",
  ivfTransferDate: "",
  ivfTransferDay: "5",
  ultrasoundDate: "",
  ultrasoundWeeksRaw: "",
  ultrasoundDaysRaw: "0",
  dueDateInput: "",
};

/* ── Result types ────────────────────────────────────────────────────── */

export type Trimester = 1 | 2 | 3;

export interface MilestoneRow {
  id: string;
  label: string;
  weeks: number;
  date: string;
  isoDate: string;
  helper: string;
  reached: boolean;
}

export interface PregnancyResultOk {
  kind: "ok";
  method: CalcMethod;
  // Computed key dates
  lmpDate: string; // ISO
  lmpDateLong: string;
  conceptionDate: string; // ISO
  conceptionDateLong: string;
  dueDate: string; // ISO
  dueDateLong: string;

  // Current state
  gestationalAgeDays: number; // days since LMP
  gestWeeks: number;
  gestDays: number;
  gestLabel: string; // "12w 3d"

  daysRemaining: number; // can be negative if overdue
  weeksRemaining: number;
  percentComplete: number; // 0..100

  trimester: Trimester;
  trimesterLabel: string;

  // Reference dates
  firstTrimesterEnd: string;
  secondTrimesterEnd: string;
  viabilityDate: string; // 24w
  fullTermDate: string; // 37w

  // Week-by-week timeline
  milestones: MilestoneRow[];
}

export interface PregnancyResultInvalid {
  kind: "invalid";
  reason:
    | "missing"
    | "future_lmp"
    | "ancient_lmp"
    | "cycle_out_of_range"
    | "ultrasound_out_of_range"
    | "due_date_out_of_range"
    | "future_conception"
    | "future_transfer";
}

export type PregnancyResult = PregnancyResultOk | PregnancyResultInvalid;

/* ── LMP resolver: every method ultimately yields an LMP date ────────── */

function resolveLmp(state: PregnancyFormState): { lmp: Date | null; reason: PregnancyResultInvalid["reason"] | null } {
  const today = todayUtc();

  switch (state.method) {
    case "lmp": {
      const lmp = parseIsoDate(state.lmpDate);
      if (!lmp) return { lmp: null, reason: "missing" };
      if (lmp.getTime() > today.getTime()) return { lmp: null, reason: "future_lmp" };
      const daysAgo = diffDays(today, lmp);
      if (daysAgo > 320) return { lmp: null, reason: "ancient_lmp" };
      const cycle = parseNumOrNull(state.cycleLengthRaw) ?? CYCLE_LENGTH_DEFAULT;
      if (cycle < CYCLE_LENGTH_MIN || cycle > CYCLE_LENGTH_MAX) {
        return { lmp: null, reason: "cycle_out_of_range" };
      }
      // Cycle-length adjustment: ovulation = LMP + (cycle - 14). EDD = ovulation + 266 = LMP + 280 + (cycle - 28).
      // Express it as a corrected LMP so downstream math stays uniform: shift LMP back by (28 - cycle).
      const shiftBackDays = CYCLE_LENGTH_DEFAULT - cycle;
      return { lmp: addDays(lmp, -shiftBackDays), reason: null };
    }

    case "conception": {
      const c = parseIsoDate(state.conceptionDate);
      if (!c) return { lmp: null, reason: "missing" };
      if (c.getTime() > today.getTime()) return { lmp: null, reason: "future_conception" };
      return { lmp: addDays(c, -OVULATION_DEFAULT_DAY), reason: null };
    }

    case "ivf": {
      const t = parseIsoDate(state.ivfTransferDate);
      if (!t) return { lmp: null, reason: "missing" };
      if (t.getTime() > today.getTime()) return { lmp: null, reason: "future_transfer" };
      const opt = IVF_TRANSFER_OPTIONS.find((o) => o.value === state.ivfTransferDay);
      if (!opt) return { lmp: null, reason: "missing" };
      // Due date = transfer + offset. LMP = due - 280.
      const due = addDays(t, opt.offsetDays);
      return { lmp: addDays(due, -FULL_TERM_DAYS), reason: null };
    }

    case "ultrasound": {
      const u = parseIsoDate(state.ultrasoundDate);
      if (!u) return { lmp: null, reason: "missing" };
      const wk = parseNumOrNull(state.ultrasoundWeeksRaw);
      const dy = parseNumOrNull(state.ultrasoundDaysRaw) ?? 0;
      if (wk == null) return { lmp: null, reason: "missing" };
      if (wk < ULTRASOUND_WEEKS_MIN || wk > ULTRASOUND_WEEKS_MAX || dy < 0 || dy > 6) {
        return { lmp: null, reason: "ultrasound_out_of_range" };
      }
      const gaDays = Math.floor(wk) * 7 + Math.floor(dy);
      return { lmp: addDays(u, -gaDays), reason: null };
    }

    case "dueDate": {
      const d = parseIsoDate(state.dueDateInput);
      if (!d) return { lmp: null, reason: "missing" };
      const daysFromToday = diffDays(d, today);
      // Allow up to ~2 weeks past due and full 40-week window forward
      if (daysFromToday < -21 || daysFromToday > FULL_TERM_DAYS + 14) {
        return { lmp: null, reason: "due_date_out_of_range" };
      }
      return { lmp: addDays(d, -FULL_TERM_DAYS), reason: null };
    }
  }
}

/* ── Milestone definitions ───────────────────────────────────────────── */

interface MilestoneDef {
  id: string;
  label: string;
  weeks: number;
  helper: string;
}

const MILESTONES: readonly MilestoneDef[] = [
  { id: "conception", label: "Conception", weeks: 2, helper: "Around the time of ovulation and fertilization." },
  { id: "missed_period", label: "Missed period", weeks: 4, helper: "Earliest reliable home pregnancy test." },
  { id: "heart", label: "First heartbeat", weeks: 6, helper: "Often visible on transvaginal ultrasound." },
  { id: "end_t1", label: "End of 1st trimester", weeks: 13, helper: "Miscarriage risk drops sharply after week 12." },
  { id: "start_t2", label: "Start of 2nd trimester", weeks: 14, helper: "The 'honeymoon' phase begins." },
  { id: "anatomy", label: "Anatomy scan", weeks: 20, helper: "Detailed mid-pregnancy ultrasound." },
  { id: "viability", label: "Viability threshold", weeks: 24, helper: "Babies born after this point have a chance of survival." },
  { id: "start_t3", label: "Start of 3rd trimester", weeks: 28, helper: "Baby moves regularly now." },
  { id: "full_term", label: "Full term", weeks: 37, helper: "Safe range for delivery begins." },
  { id: "due_date", label: "Due date (40 weeks)", weeks: 40, helper: "Only ~5% of babies arrive on the actual due date." },
];

/* ── Public compute ──────────────────────────────────────────────────── */

export function computePregnancy(state: PregnancyFormState): PregnancyResult {
  const { lmp, reason } = resolveLmp(state);
  if (!lmp) return { kind: "invalid", reason: reason ?? "missing" };

  const today = todayUtc();
  const gestDaysTotal = diffDays(today, lmp);
  const safeGest = Math.max(0, gestDaysTotal);
  const gestWeeks = Math.floor(safeGest / 7);
  const gestDays = safeGest % 7;

  const dueDate = addDays(lmp, FULL_TERM_DAYS);
  const conceptionDate = addDays(lmp, OVULATION_DEFAULT_DAY);
  const firstTrimesterEnd = addDays(lmp, 13 * 7);
  const secondTrimesterEnd = addDays(lmp, 27 * 7);
  const viabilityDate = addDays(lmp, 24 * 7);
  const fullTermDate = addDays(lmp, 37 * 7);

  const daysRemaining = diffDays(dueDate, today);
  const weeksRemaining = Math.ceil(daysRemaining / 7);
  const percentComplete = Math.max(0, Math.min(100, (safeGest / FULL_TERM_DAYS) * 100));

  let trimester: Trimester;
  let trimesterLabel: string;
  if (gestDaysTotal < 14 * 7) {
    trimester = 1;
    trimesterLabel = "First trimester";
  } else if (gestDaysTotal < 28 * 7) {
    trimester = 2;
    trimesterLabel = "Second trimester";
  } else {
    trimester = 3;
    trimesterLabel = "Third trimester";
  }

  const milestones: MilestoneRow[] = MILESTONES.map((m) => {
    const date = addDays(lmp, m.weeks * 7);
    return {
      id: m.id,
      label: m.label,
      weeks: m.weeks,
      date: formatShortDate(date),
      isoDate: toIso(date),
      helper: m.helper,
      reached: gestWeeks >= m.weeks,
    };
  });

  return {
    kind: "ok",
    method: state.method,
    lmpDate: toIso(lmp),
    lmpDateLong: formatLongDate(lmp),
    conceptionDate: toIso(conceptionDate),
    conceptionDateLong: formatLongDate(conceptionDate),
    dueDate: toIso(dueDate),
    dueDateLong: formatLongDate(dueDate),

    gestationalAgeDays: gestDaysTotal,
    gestWeeks,
    gestDays,
    gestLabel: `${gestWeeks}w ${gestDays}d`,

    daysRemaining,
    weeksRemaining,
    percentComplete,

    trimester,
    trimesterLabel,

    firstTrimesterEnd: toIso(firstTrimesterEnd),
    secondTrimesterEnd: toIso(secondTrimesterEnd),
    viabilityDate: toIso(viabilityDate),
    fullTermDate: toIso(fullTermDate),

    milestones,
  };
}

/* ── small bucket helper for analytics ───────────────────────────────── */

export function trimesterFromGestDays(gestDays: number): Trimester {
  if (gestDays < 14 * 7) return 1;
  if (gestDays < 28 * 7) return 2;
  return 3;
}
