export type AlcoholFrequency = 'never' | 'rarely' | 'monthly' | 'weekly' | 'daily';
export type DietType = 'balanced' | 'high_sugar' | 'high_processed' | 'high_protein' | 'plant_based' | 'mixed';
export type StressLevel = 'low' | 'moderate' | 'high' | 'very_high';
export type SkincareRoutine = 'none' | 'basic' | 'thorough';

export interface FutureSelfLifestyle {
    age: number;
    waterGlassesPerDay: number;
    sleepHoursPerNight: number;
    alcoholFrequency: AlcoholFrequency;
    smokes: boolean;
    exerciseDaysPerWeek: number;
    diet: DietType;
    sunscreenRegular: boolean;
    stressLevel: StressLevel;
    skincareRoutine: SkincareRoutine;
    outdoorMinutesPerDay: number;
}

export interface FutureSelfBreakdownItem {
    factor: string;
    impact: 'positive' | 'neutral' | 'negative';
    note: string;
}

export interface FutureSelfAnalysis {
    yearsProjected: number;
    agedImageBlobName: string;
    agedImageSignedUrl: string;
    agingPromptUsed: string;
    breakdown: FutureSelfBreakdownItem[];
    summary: string;
}

export type FutureSelfStage =
    | 'idle'
    | 'analyzing'
    | 'generating'
    | 'storing'
    | 'complete'
    | 'error';
