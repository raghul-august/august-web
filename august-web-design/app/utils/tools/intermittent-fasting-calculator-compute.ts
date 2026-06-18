import {
  CUSTOM_FAST_HOURS_DEFAULT,
  CUSTOM_FAST_HOURS_MAX,
  CUSTOM_FAST_HOURS_MIN,
  FIRST_MEAL_DEFAULT_MINUTES,
  FIRST_MEAL_MAX_MINUTES,
  FIRST_MEAL_MIN_MINUTES,
  MILESTONES,
  type MilestoneIcon,
  PROTOCOLS,
  type Protocol,
  type ProtocolId,
} from "@/app/data/tools/intermittent-fasting-calculator-config";

export interface IfFormState {
  protocolId: ProtocolId;
  /** Minutes since local midnight, 0 to 1439. */
  firstMealMinutes: number;
  customFastHours: number;
}

export type IfInvalidReason =
  | "first_meal_out_of_range"
  | "custom_fast_out_of_range";

export interface IfScheduleEvent {
  id: string;
  time: string;
  label: string;
}

export interface IfMilestoneEntry {
  id: string;
  label: string;
  hoursAfterLastMeal: number;
  description: string;
  icon: MilestoneIcon;
  approxLabel: string;
  reachedAt: string;
  /** True when this milestone lands inside the fasting window. */
  withinFast: boolean;
}

export interface IfResultTimeRestricted {
  kind: "time-restricted";
  protocol: Protocol;
  fastHours: number;
  eatHours: number;
  firstMealMinutes: number;
  lastMealMinutes: number;
  eatingWindowLabel: string;
  fastingWindowLabel: string;
  schedule: IfScheduleEvent[];
  milestones: IfMilestoneEntry[];
}

export interface IfResultCalorieRestricted {
  kind: "calorie-restricted";
  protocol: Protocol;
}

export interface IfResultInvalid {
  kind: "invalid";
  reason: IfInvalidReason;
}

export type IfResultOk = IfResultTimeRestricted | IfResultCalorieRestricted;
export type IfResult = IfResultOk | IfResultInvalid;

const DAY_MINUTES = 24 * 60;

function modMinutes(m: number): number {
  return ((m % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
}

export function formatClock(minutes: number): string {
  const m = modMinutes(minutes);
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm.toString().padStart(2, "0")} ${period}`;
}

export function getProtocol(id: ProtocolId): Protocol {
  return PROTOCOLS.find((p) => p.id === id) ?? PROTOCOLS[0];
}

export function computeIfSchedule(state: IfFormState): IfResult {
  const protocol = getProtocol(state.protocolId);

  if (protocol.kind === "calorie-restricted") {
    return { kind: "calorie-restricted", protocol };
  }

  if (
    state.firstMealMinutes < FIRST_MEAL_MIN_MINUTES ||
    state.firstMealMinutes > FIRST_MEAL_MAX_MINUTES ||
    !Number.isFinite(state.firstMealMinutes)
  ) {
    return { kind: "invalid", reason: "first_meal_out_of_range" };
  }

  let fastHours = protocol.fastHours;
  let eatHours = protocol.eatHours;
  if (protocol.id === "custom") {
    const f = state.customFastHours;
    if (
      !Number.isFinite(f) ||
      f < CUSTOM_FAST_HOURS_MIN ||
      f > CUSTOM_FAST_HOURS_MAX
    ) {
      return { kind: "invalid", reason: "custom_fast_out_of_range" };
    }
    fastHours = f;
    eatHours = 24 - f;
  }

  const firstMeal = modMinutes(state.firstMealMinutes);
  const lastMeal = modMinutes(firstMeal + eatHours * 60);

  const eatingWindowLabel = `${formatClock(firstMeal)} to ${formatClock(lastMeal)}`;
  const fastingWindowLabel = `${formatClock(lastMeal)} to ${formatClock(firstMeal)}`;

  const schedule: IfScheduleEvent[] = [
    {
      id: "break",
      time: formatClock(firstMeal),
      label: "Break your fast (first meal)",
    },
    {
      id: "close",
      time: formatClock(lastMeal),
      label: "Last meal (eating window closes)",
    },
    {
      id: "begin",
      time: formatClock(lastMeal),
      label: "Fasting begins",
    },
    {
      id: "ends",
      time: formatClock(firstMeal),
      label: "Fast ends (next day)",
    },
  ];

  const milestones: IfMilestoneEntry[] = MILESTONES.map((m) => {
    const reachedMinutes = lastMeal + m.hoursAfterLastMeal * 60;
    const withinFast = m.hoursAfterLastMeal <= fastHours;
    return {
      id: m.id,
      label: m.label,
      hoursAfterLastMeal: m.hoursAfterLastMeal,
      description: m.description,
      icon: m.icon,
      approxLabel: `~${m.hoursAfterLastMeal}h after last meal`,
      reachedAt: formatClock(reachedMinutes),
      withinFast,
    };
  });

  return {
    kind: "time-restricted",
    protocol,
    fastHours,
    eatHours,
    firstMealMinutes: firstMeal,
    lastMealMinutes: lastMeal,
    eatingWindowLabel,
    fastingWindowLabel,
    schedule,
    milestones,
  };
}

export function ifCalculatorBucket(result: IfResultOk): string {
  if (result.kind === "calorie-restricted") {
    return `${result.protocol.id}|cr`;
  }
  return `${result.protocol.id}|${result.fastHours}|${result.firstMealMinutes}`;
}

export const DEFAULT_IF_STATE: IfFormState = {
  protocolId: "16-8",
  firstMealMinutes: FIRST_MEAL_DEFAULT_MINUTES,
  customFastHours: CUSTOM_FAST_HOURS_DEFAULT,
};
