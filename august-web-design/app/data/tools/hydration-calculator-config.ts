// Pure data config for Hydration Calculator tool.
// No React.

export type Gender = "male" | "female";
export type PregnancyStatus = "none" | "pregnant" | "breastfeeding";
export type UnitSystem = "metric" | "imperial";
export type ActivityLevel = "rare" | "occasional" | "weekly" | "daily";

export type BeverageId = "water" | "soda" | "diet-soda" | "fruit-juice" | "coffee-sugar" | "coffee-tea" | "wine" | "beer" | "sport-drinks" | "energy-drinks";

export interface BeverageConfig {
  id: BeverageId;
  name: string;
  glassVolumeCl: number;
  waterContentFactor: number; // 0-1, how much of the glass volume counts as hydration
  caloriesPerGlass: number;
}

export interface HydrationFormData {
  gender: Gender | null;
  pregnancyStatus: PregnancyStatus;
  age: number | null;
  weightValue: number | null;
  weightUnit: "kg" | "lbs";
  heightValue: number | null;
  heightUnit: "cm" | "in";
  unitSystem: UnitSystem;
  activityLevel: ActivityLevel | null;
  country: string;
  beverageIntake: Record<BeverageId, number>;
}

export interface HydrationResult {
  recommendedIntakeLiters: number;
  actualIntakeLiters: number;
  dailyWaterLossLiters: number;
  foodWaterContributionLiters: number;
  isSufficientlyHydrated: boolean;
  totalCaloriesFromBeverages: number;
  isWithinCalorieGuideline: boolean;
  calorieExcess: number;
  conditionalMessages: ConditionalMessage[];
}

export interface ConditionalMessage {
  type: "info" | "warning";
  text: string;
}

export const BEVERAGES: readonly BeverageConfig[] = [
  { id: "water", name: "Water", glassVolumeCl: 25, waterContentFactor: 1.0, caloriesPerGlass: 0 },
  { id: "soda", name: "Soda", glassVolumeCl: 33, waterContentFactor: 0.89, caloriesPerGlass: 140 },
  { id: "diet-soda", name: "Diet Soda", glassVolumeCl: 33, waterContentFactor: 0.95, caloriesPerGlass: 2 },
  { id: "fruit-juice", name: "Fruit Juice", glassVolumeCl: 25, waterContentFactor: 0.85, caloriesPerGlass: 112 },
  { id: "coffee-sugar", name: "Coffee/tea with sugar", glassVolumeCl: 12.5, waterContentFactor: 0.97, caloriesPerGlass: 30 },
  { id: "coffee-tea", name: "Coffee/tea", glassVolumeCl: 12.5, waterContentFactor: 0.99, caloriesPerGlass: 2 },
  { id: "wine", name: "Wine", glassVolumeCl: 12.5, waterContentFactor: 0.85, caloriesPerGlass: 85 },
  { id: "beer", name: "Beer", glassVolumeCl: 25, waterContentFactor: 0.92, caloriesPerGlass: 103 },
  { id: "sport-drinks", name: "Sport Drinks", glassVolumeCl: 50, waterContentFactor: 0.94, caloriesPerGlass: 125 },
  { id: "energy-drinks", name: "Energy Drinks", glassVolumeCl: 25, waterContentFactor: 0.90, caloriesPerGlass: 110 },
] as const;

export const ACTIVITY_OPTIONS = [
  { value: "rare" as const, label: "Rarely active", description: "Little to no regular exercise", multiplier: 1.0 },
  { value: "occasional" as const, label: "Occasionally active", description: "Light exercise 1-2 days per week", multiplier: 1.15 },
  { value: "weekly" as const, label: "Weekly active", description: "Moderate exercise 3-5 days per week", multiplier: 1.3 },
  { value: "daily" as const, label: "Daily active", description: "Hard exercise 6-7 days per week", multiplier: 1.5 },
] as const;

export const COUNTRY_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "India", label: "India" },
  { value: "Brazil", label: "Brazil" },
  { value: "Japan", label: "Japan" },
  { value: "Mexico", label: "Mexico" },
  { value: "Spain", label: "Spain" },
  { value: "China", label: "China" },
  { value: "Italy", label: "Italy" },
  { value: "South Africa", label: "South Africa" },
  { value: "Other", label: "Other" },
] as const;

export const DEFAULT_BEVERAGE_INTAKE: Record<BeverageId, number> = {
  "water": 0,
  "soda": 0,
  "diet-soda": 0,
  "fruit-juice": 0,
  "coffee-sugar": 0,
  "coffee-tea": 0,
  "wine": 0,
  "beer": 0,
  "sport-drinks": 0,
  "energy-drinks": 0,
};

export const DEFAULT_FORM_DATA: HydrationFormData = {
  gender: null,
  pregnancyStatus: "none",
  age: null,
  weightValue: null,
  weightUnit: "kg",
  heightValue: null,
  heightUnit: "cm",
  unitSystem: "metric",
  activityLevel: null,
  country: "",
  beverageIntake: { ...DEFAULT_BEVERAGE_INTAKE },
};

export const FOOD_WATER_CONTRIBUTION = 0.8; // liters, fixed constant
export const WHO_LIQUID_CALORIE_GUIDELINE = 200; // kcal/day, approximate WHO sugar guideline
