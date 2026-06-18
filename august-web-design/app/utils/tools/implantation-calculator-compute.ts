import {
  CYCLE_LENGTH_MAX,
  CYCLE_LENGTH_MIN,
  HCG_DETECTABLE_OFFSET_DAYS,
  IMPLANTATION_DPO_MAX,
  IMPLANTATION_DPO_MIN,
  LUTEAL_PHASE_DAYS,
  PEAK_IMPLANTATION_DPO,
  PROBABILITY_BY_DPO,
  PROBABILITY_LABEL,
  type ImplantationProbability,
} from "@/app/data/tools/implantation-calculator-config";

export type ImplantationMode = "ovulation" | "lmp";

export interface ImplantationFormState {
  mode: ImplantationMode;
  ovulationRaw: string; // yyyy-mm-dd
  lmpRaw: string; // yyyy-mm-dd
  cycleLength: string; // raw input; parsed to number at compute time
}

export type ImplantationInvalidReason =
  | "missing_ovulation"
  | "missing_lmp"
  | "unparseable_date"
  | "future_date"
  | "date_too_old"
  | "cycle_out_of_range";

export interface DpoEntry {
  dpo: number;
  date: string; // ISO yyyy-mm-dd
  probability: ImplantationProbability;
  label: string; // "Less common" | "Common" | "Most common"
}

export interface ImplantationResultOk {
  kind: "ok";
  mode: ImplantationMode;
  ovulationDate: string;
  ovulationWasDerived: boolean;
  mostLikelyDate: string;
  windowStart: string;
  windowEnd: string;
  earliestTestDate: string;
  days: DpoEntry[];
  cycleLength: number;
}

export interface ImplantationResultInvalid {
  kind: "invalid";
  reason: ImplantationInvalidReason;
}

export type ImplantationResult =
  | ImplantationResultOk
  | ImplantationResultInvalid;

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

export function computeImplantation(
  state: ImplantationFormState,
  now: Date = new Date(),
): ImplantationResult {
  const today = startOfLocalDay(now);
  let ovulation: Date;
  let ovulationWasDerived = false;
  let cycleLengthNum = 0;

  if (state.mode === "ovulation") {
    if (!state.ovulationRaw) {
      return { kind: "invalid", reason: "missing_ovulation" };
    }
    const parsed = parseLocalDate(state.ovulationRaw);
    if (!parsed) return { kind: "invalid", reason: "unparseable_date" };
    if (parsed.getTime() > today.getTime()) {
      return { kind: "invalid", reason: "future_date" };
    }
    if (diffDays(parsed, today) > 120) {
      return { kind: "invalid", reason: "date_too_old" };
    }
    ovulation = parsed;
  } else {
    if (!state.lmpRaw) return { kind: "invalid", reason: "missing_lmp" };
    const parsed = parseLocalDate(state.lmpRaw);
    if (!parsed) return { kind: "invalid", reason: "unparseable_date" };
    if (parsed.getTime() > today.getTime()) {
      return { kind: "invalid", reason: "future_date" };
    }
    if (diffDays(parsed, today) > 180) {
      return { kind: "invalid", reason: "date_too_old" };
    }
    const trimmed = state.cycleLength.trim();
    cycleLengthNum = Number(trimmed);
    if (
      trimmed === "" ||
      !Number.isFinite(cycleLengthNum) ||
      cycleLengthNum < CYCLE_LENGTH_MIN ||
      cycleLengthNum > CYCLE_LENGTH_MAX
    ) {
      return { kind: "invalid", reason: "cycle_out_of_range" };
    }
    ovulation = addDays(parsed, cycleLengthNum - LUTEAL_PHASE_DAYS);
    ovulationWasDerived = true;
  }

  const days: DpoEntry[] = [];
  for (let dpo = IMPLANTATION_DPO_MIN; dpo <= IMPLANTATION_DPO_MAX; dpo++) {
    const probability = PROBABILITY_BY_DPO[dpo] ?? "common";
    days.push({
      dpo,
      date: toIsoDate(addDays(ovulation, dpo)),
      probability,
      label: PROBABILITY_LABEL[probability],
    });
  }

  const mostLikelyDate = toIsoDate(addDays(ovulation, PEAK_IMPLANTATION_DPO));
  const windowStart = toIsoDate(addDays(ovulation, IMPLANTATION_DPO_MIN));
  const windowEnd = toIsoDate(addDays(ovulation, IMPLANTATION_DPO_MAX));
  const earliestTestDate = toIsoDate(
    addDays(ovulation, IMPLANTATION_DPO_MAX + HCG_DETECTABLE_OFFSET_DAYS),
  );

  return {
    kind: "ok",
    mode: state.mode,
    ovulationDate: toIsoDate(ovulation),
    ovulationWasDerived,
    mostLikelyDate,
    windowStart,
    windowEnd,
    earliestTestDate,
    days,
    cycleLength: cycleLengthNum,
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

export function formatShortDate(iso: string): string {
  const d = parseLocalDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function implantationBucket(result: ImplantationResultOk): string {
  return `${result.mode}|${result.cycleLength}`;
}
