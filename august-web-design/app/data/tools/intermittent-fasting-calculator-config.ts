export type ProtocolId = "16-8" | "18-6" | "20-4" | "omad" | "5-2" | "custom";

export type DifficultyTier =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert";

export type ProtocolKind = "time-restricted" | "calorie-restricted";

export interface Protocol {
  id: ProtocolId;
  label: string;
  shortLabel: string;
  difficulty: DifficultyTier;
  kind: ProtocolKind;
  /** Fasting hours per day. Ignored for calorie-restricted protocols. */
  fastHours: number;
  /** Eating window in hours. Ignored for calorie-restricted protocols. */
  eatHours: number;
  description: string;
  recommendedMeals: string;
  /** "No" for time-restricted; the calorie band for protocols that restrict calories. */
  calorieRestriction: string;
}

export const PROTOCOLS: readonly Protocol[] = [
  {
    id: "16-8",
    label: "16:8 (Leangains)",
    shortLabel: "16:8",
    difficulty: "Beginner",
    kind: "time-restricted",
    fastHours: 16,
    eatHours: 8,
    description:
      "The most popular protocol. Fast for 16 hours, eat within an 8-hour window.",
    recommendedMeals: "2 to 3 meals",
    calorieRestriction: "No",
  },
  {
    id: "18-6",
    label: "18:6",
    shortLabel: "18:6",
    difficulty: "Intermediate",
    kind: "time-restricted",
    fastHours: 18,
    eatHours: 6,
    description:
      "A moderately aggressive protocol with 18 hours of fasting and a 6-hour eating window.",
    recommendedMeals: "2 meals",
    calorieRestriction: "No",
  },
  {
    id: "20-4",
    label: "20:4 (Warrior Diet)",
    shortLabel: "20:4",
    difficulty: "Advanced",
    kind: "time-restricted",
    fastHours: 20,
    eatHours: 4,
    description:
      "Based on the Warrior Diet. One large meal with small snacks inside a 4-hour eating window.",
    recommendedMeals: "1 main meal plus small snacks",
    calorieRestriction: "No",
  },
  {
    id: "omad",
    label: "OMAD (One Meal a Day)",
    shortLabel: "OMAD",
    difficulty: "Expert",
    kind: "time-restricted",
    fastHours: 23,
    eatHours: 1,
    description:
      "Eat one meal per day within a 1-hour window. Requires deliberate nutrition planning.",
    recommendedMeals: "1 meal",
    calorieRestriction: "No",
  },
  {
    id: "5-2",
    label: "5:2 (Fast Diet)",
    shortLabel: "5:2",
    difficulty: "Intermediate",
    kind: "calorie-restricted",
    fastHours: 0,
    eatHours: 0,
    description:
      "Eat normally 5 days per week, restrict to 500 to 600 kcal on 2 non-consecutive days.",
    recommendedMeals: "Normal eating on 5 days, 2 small meals on the 2 restricted days",
    calorieRestriction: "500 to 600 kcal on 2 days each week",
  },
  {
    id: "custom",
    label: "Custom",
    shortLabel: "Custom",
    difficulty: "Intermediate",
    kind: "time-restricted",
    fastHours: 16,
    eatHours: 8,
    description: "Set your own fasting hours and pick the first meal time.",
    recommendedMeals: "Varies by your eating window",
    calorieRestriction: "No",
  },
];

export const CUSTOM_FAST_HOURS_MIN = 12;
export const CUSTOM_FAST_HOURS_MAX = 22;
export const CUSTOM_FAST_HOURS_DEFAULT = 16;

export const FIRST_MEAL_DEFAULT_MINUTES = 12 * 60;
export const FIRST_MEAL_MIN_MINUTES = 0;
export const FIRST_MEAL_MAX_MINUTES = 23 * 60 + 45;
export const FIRST_MEAL_STEP_MINUTES = 15;

export const QUICK_FIRST_MEAL_PRESETS: readonly number[] = [
  8 * 60,
  9 * 60,
  10 * 60,
  11 * 60,
  12 * 60,
  13 * 60,
  14 * 60,
  15 * 60,
  16 * 60,
  17 * 60,
  18 * 60,
  19 * 60,
];

export type MilestoneIcon =
  | "fed"
  | "battery"
  | "fire"
  | "bolt"
  | "recycle"
  | "deep"
  | "renew";

export interface Milestone {
  id: string;
  label: string;
  hoursAfterLastMeal: number;
  description: string;
  icon: MilestoneIcon;
}

export const MILESTONES: readonly Milestone[] = [
  {
    id: "fed-ends",
    label: "Fed State Ends",
    hoursAfterLastMeal: 4,
    description: "Digestion complete, blood sugar normalizes.",
    icon: "fed",
  },
  {
    id: "post-absorptive",
    label: "Post-Absorptive State",
    hoursAfterLastMeal: 6,
    description: "Body begins tapping glycogen stores.",
    icon: "battery",
  },
  {
    id: "fat-burning",
    label: "Fat Burning Begins",
    hoursAfterLastMeal: 12,
    description: "Glycogen depleting, fat oxidation increases.",
    icon: "fire",
  },
  {
    id: "ketosis",
    label: "Ketosis Begins",
    hoursAfterLastMeal: 18,
    description: "Liver produces ketones for fuel.",
    icon: "bolt",
  },
  {
    id: "autophagy",
    label: "Autophagy Increases",
    hoursAfterLastMeal: 24,
    description: "Cellular cleanup and recycling ramps up.",
    icon: "recycle",
  },
  {
    id: "deep-ketosis",
    label: "Deep Ketosis",
    hoursAfterLastMeal: 36,
    description: "Significant ketone production.",
    icon: "deep",
  },
  {
    id: "peak-autophagy",
    label: "Peak Autophagy",
    hoursAfterLastMeal: 48,
    description: "Maximum cellular renewal activity.",
    icon: "renew",
  },
];

