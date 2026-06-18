export type Gender = 'male' | 'female' | 'other';

export type HeightUnit = 'cm' | 'ft';
export type WeightUnit = 'kg' | 'lbs';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme';

export interface FormData {
  gender: Gender | null;
  height: {
    value: number;
    unit: HeightUnit;
  };
  weight: {
    value: number;
    unit: WeightUnit;
  };
  age: number | null;
  activityLevel: ActivityLevel | null;
  bodyFatPercent: number | null;
}

export interface TDEEResult {
  bmr: number;
  tdee: number;
  bmi: number;
  loseWeight: {
    slow: number;
    fast: number;
  };
  gainWeight: {
    slow: number;
    fast: number;
  };
}

export interface ActivityOption {
  value: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;
}

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little to no exercise',
    multiplier: 1.2,
  },
  {
    value: 'light',
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    multiplier: 1.375,
  },
  {
    value: 'moderate',
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    multiplier: 1.55,
  },
  {
    value: 'active',
    label: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    multiplier: 1.725,
  },
  {
    value: 'extreme',
    label: 'Extremely Active',
    description: 'Very hard exercise & physical job',
    multiplier: 1.9,
  },
];

export const DEFAULT_FORM_DATA: FormData = {
  gender: null,
  height: { value: 170, unit: 'cm' },
  weight: { value: 70, unit: 'kg' },
  age: 25,
  activityLevel: 'moderate',
  bodyFatPercent: null,
};
