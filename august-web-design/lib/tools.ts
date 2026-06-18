import {Apple,Brain,Compass,DollarSign,Dumbbell,Heart,LayoutGrid,Moon,Pill,Sparkles,Stethoscope,Syringe,Users,Wine,type LucideIcon,} from 'lucide-react';

export interface ToolCategoryMeta {
    readonly id: string;
    readonly label: string;
    readonly icon: LucideIcon;
    /** Soft pastel tint — used as the icon-swatch background when a tool doesn't
     *  declare its own bgColor. Keeps the All Tools grid visually varied while
     *  implicitly grouping tools from the same area by hue. */
    readonly color: string;
}

/** Order here drives the order categories appear in the filter menu. */
export const TOOL_CATEGORIES = [
    { id: 'glp1-weight-management', label: 'GLP-1 & Weight Management', icon: Syringe, color: '#FCE7DA' },
    { id: 'body-fitness', label: 'Body Metrics & Fitness', icon: Dumbbell, color: '#E6F0EC' },
    { id: 'healthcare-cost', label: 'Healthcare Costs & Insurance', icon: DollarSign, color: '#FBEFE2' },
    { id: 'medication-tools', label: 'Medication Tools', icon: Pill, color: '#DEEAF5' },
    { id: 'womens-health', label: "Reproductive & Women's Health", icon: Heart, color: '#FBE0E0' },
    { id: 'mental-health', label: 'Mental Health Screeners', icon: Brain, color: '#E8E1F2' },
    { id: 'sleep-wellness', label: 'Sleep & Daily Wellness', icon: Moon, color: '#E0E8F5' },
    { id: 'personality', label: 'Personality & Self-Reflection', icon: Compass, color: '#F7E9D2' },
    { id: 'symptom-check', label: 'Symptom Check & General Health', icon: Stethoscope, color: '#E8F0E0' },
    { id: 'relationships', label: 'Relationships & Intimacy', icon: Users, color: '#F5E0DC' },
    { id: 'substances', label: 'Substances & Recovery', icon: Wine, color: '#F2DDD3' },
    { id: 'cognitive', label: 'Cognitive & Sensory', icon: Sparkles, color: '#F0E5F5' },
    { id: 'nutrition', label: 'Nutrition & Hydration', icon: Apple, color: '#FBF0E0' },
] as const satisfies readonly ToolCategoryMeta[];

export const FALLBACK_CATEGORY_ICON: LucideIcon = LayoutGrid;

export type ToolCategoryId = (typeof TOOL_CATEGORIES)[number]['id'];

export const CATEGORY_BY_ID: Record<ToolCategoryId, ToolCategoryMeta> = TOOL_CATEGORIES.reduce(
    (acc, c) => ({ ...acc, [c.id]: c }),
    {} as Record<ToolCategoryId, ToolCategoryMeta>
);

/** Resolve a tool's display tint: its explicit `bgColor` takes precedence,
 *  otherwise fall back to the category pastel. Use for hero/banner cards. */
export function colorForTool(tool: ToolMeta): string {
    if (tool.bgColor) return tool.bgColor;
    const cat = tool.categories[0];
    return cat ? CATEGORY_BY_ID[cat].color : 'var(--muted)';
}

/** Category pastel only — ignores per-tool `bgColor`. Use for the small grid
 *  cards where every tool should match its category hue. */
export function categoryColorForTool(tool: ToolMeta): string {
    const cat = tool.categories[0];
    return cat ? CATEGORY_BY_ID[cat].color : 'var(--muted)';
}

export interface ToolMeta {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    /** Internal app route */
    readonly href: string;
    /**
     * Whether the tool lives outside the chat-app's own layout (i.e. on the
     * website/library side of the merged repo). Used for analytics/active-state
     * decisions, not routing — everything is routed normally.
     */
    readonly isExternal: boolean;
    /** Does the tool require the user to be signed in before seeing results? */
    readonly requiresAuth: boolean;
    /** Whether the tool opens within the chat-app's shared layout (vs. its own standalone page). */
    readonly isOpeningOnSameLayout: boolean;
    /** Optional tag (e.g. "Featured", "New"). */
    readonly tag?: string;
    /** Optional light background tint for the featured/new highlight cards. */
    readonly bgColor?: string;
    /** Short catchy headline for the featured/new highlight cards. */
    readonly subheading?: string;
    /** CTA button label rendered on the featured/new highlight cards. */
    readonly ctaLabel?: string;
    /** One or more categories this tool belongs to. Drives the category filter on /tool. */
    readonly categories: readonly ToolCategoryId[];
}

const TOOLS_DATA = [
    {
        id: 'bill-analyser',
        label: 'Bill Analyser',
        description: 'Decode your medical bill and spot overcharges.',
        href: '/tool/bill-analyser',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: true,
        categories: ['healthcare-cost'],
        tag: 'Featured',
        bgColor: '#6A553B',
        subheading: 'Know what you really owe.',
        ctaLabel: 'Analyse my bill',
    },
    {
        id: 'insurance',
        label: 'Insurance Appeal',
        description: 'Generate a doctor-grade appeal letter for denials.',
        href: '/tool/appeal-assistant',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: true,
        categories: ['healthcare-cost'],
    },
    {
        id: 'cost-estimator',
        label: 'Cost Saver',
        description: 'Compare real provider prices for any procedure.',
        href: '/tool/cost-estimator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: true,
        categories: ['healthcare-cost'],
        tag: 'Featured',
        bgColor: '#3F6951',
        subheading: 'Same treatment. $400 here. $4,000 there.',
        ctaLabel: 'Find the best price',
    },
    {
        id: 'prescription-reader',
        label: 'Prescription Reader',
        description: 'Understand what your prescription actually says.',
        href: '/prescription-reader',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['healthcare-cost', 'symptom-check'],
    },
    {
        id: 'free-adhd-test',
        label: 'Free ADHD Test',
        description: 'A clinically informed self-assessment for ADHD.',
        href: '/tool/free-adhd-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
        tag: 'Featured',
        bgColor: '#1F3868',
    },
    {
        id: 'childhood-trauma-test',
        label: 'Childhood Trauma Test',
        description: 'Reflect on early experiences with a guided check-in.',
        href: '/tool/childhood-trauma-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health', 'personality'],
    },
    {
        id: 'tdee-calculator',
        label: 'TDEE Calculator',
        description: 'Estimate your daily calorie burn from your stats.',
        href: '/tool/tdee-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['body-fitness'],
    },
    {
        id: 'chronotype-test',
        label: 'Chronotype Test',
        description: 'Discover your natural sleep-wake type with a quick quiz.',
        href: '/tool/chronotype-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['sleep-wellness'],
        tag: 'Featured',
        bgColor: '#6A553B',
    },
    {
        id: 'rice-purity-test',
        label: 'Rice Purity Test',
        description: 'The classic 100-question life experience checklist.',
        href: '/tool/rice-purity-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['personality', 'relationships'],
        tag: 'Featured',
        bgColor: '#3F6951',
    },
    {
        id: 'glp1-budget-calculator',
        label: 'GLP-1 Budget Calculator',
        description: 'Estimate your monthly out-of-pocket GLP-1 medication cost.',
        href: '/tool/glp1-budget-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['glp1-weight-management', 'healthcare-cost'],
        tag: 'Featured',
        bgColor: '#1F3868',
        subheading: '$1,000 a month? Or $0?',
        ctaLabel: 'Estimate my cost',
    },
    {
        id: 'glp1-coverage-check',
        label: 'GLP-1 Coverage Check',
        description: 'See how likely your insurance is to cover GLP-1 therapy.',
        href: '/tool/glp1-coverage-check',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['glp1-weight-management', 'healthcare-cost'],
    },
    {
        id: 'glp1-dose-calculator',
        label: 'GLP-1 Dose Calculator',
        description: 'Calculate injection volume from your prescribed concentration.',
        href: '/tool/glp1-dose-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['glp1-weight-management'],
    },
    {
        id: 'glp1-meal-planner',
        label: 'GLP-1 Meal Planner',
        description: 'Build a high-protein meal plan tailored to your GLP-1 phase.',
        href: '/tool/glp1-meal-planner',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['glp1-weight-management', 'nutrition'],
    },
    {
        id: 'sexual-orientation-test',
        label: 'Sexual Orientation Test',
        description: 'A spectrum-based self-reflection across multiple dimensions of attraction.',
        href: '/tool/sexual-orientation-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['relationships'],
    },
    {
        id: 'glp1-supply-tracker',
        label: 'GLP-1 Supply Tracker',
        description: 'Compare top GLP-1 telehealth providers by state, medication, and price.',
        href: '/tool/glp1-supply-tracker',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['glp1-weight-management'],
    },
    {
        id: 'injection-site-tracker',
        label: 'Injection Site Tracker',
        description: 'Generate a personalized 12-week injection site rotation schedule.',
        href: '/tool/injection-site-tracker',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['glp1-weight-management'],
    },
    {
        id: 'hydration-calculator',
        label: 'Hydration Calculator',
        description: 'Assess your daily hydration and liquid calorie intake.',
        href: '/tool/hydration-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['sleep-wellness', 'nutrition'],
    },
    {
        id: 'glp1-plateau-calculator',
        label: 'GLP-1 Plateau Calculator',
        description: 'Diagnose your GLP-1 weight loss plateau and get a personalized action plan.',
        href: '/tool/glp1-plateau-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['glp1-weight-management'],
    },
    {
        id: 'glp1-titration-calculator',
        label: 'GLP-1 Titration Calculator',
        description: 'Build a week-by-week dose escalation schedule with injection units.',
        href: '/tool/glp1-titration-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['glp1-weight-management'],
    },
    {
        id: 'weight-loss-timeline-projector',
        label: 'Weight Loss Timeline Projector',
        description: 'Project your weight-loss curve and time-to-goal for GLP-1 medications.',
        href: '/tool/weight-loss-timeline-projector',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['glp1-weight-management', 'body-fitness'],
    },
    {
        id: 'future-self',
        label: 'Future Self',
        description: 'Upload a photo and see how you may look in 10 years.',
        href: '/tool/future-self',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: true,
        categories: ['personality'],
        tag: 'New',
        bgColor: '#3F6951',
        subheading: 'Meet yourself in 10 years.',
        ctaLabel: 'See my future self',
    },
    {
        id : 'bmi-calculator',
        label: 'BMI Calculator',
        description: 'Calculate your Body Mass Index (BMI) based on your height and weight.',
        href: '/tool/bmi-calculator',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['body-fitness'],
    },
    {
        id : 'bmr-calculator',
        label: 'BMR Calculator',
        description: 'Calculate your Basal Metabolic Rate to see how many calories you need at rest.',
        href: '/tool/bmr-calculator',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['body-fitness'],
    },
    {
        id : 'bac-calculator',
        label: 'BAC Calculator',
        description: 'Estimate your Blood Alcohol Content from drinks, weight, and time elapsed.',
        href: '/tool/bac-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['substances'],
    },
    {
        id : 'heart-age-calculator',
        label: 'Heart Age Calculator',
        description: 'Estimate your cardiovascular heart age, no lab values needed.',
        href: '/tool/heart-age-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['body-fitness'],
    },
    {
        id : 'ivf-success-estimator',
        label: 'IVF Success Estimator',
        description: 'Estimate your chances of success with In Vitro Fertilization (IVF).',
        href: '/tool/ivf-success-estimator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['womens-health'],
    },
    {
        id : 'miscarriage-probability',
        label: 'Miscarriage Reassurer',
        description: 'Get a personalized miscarriage risk estimate with tailored recommendations.',
        href: '/tool/miscarriage-probability',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['womens-health'],
        tag: 'New',
        bgColor: '#6A553B',
        ctaLabel : "Reassure me",
    },
    {
        id : 'pregnancy-calculator',
        label: 'Pregnancy Calculator',
        description: 'Track your pregnancy progress, estimate due date, and get weekly updates.',
        href: '/tool/pregnancy-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['womens-health'],
    },
    {
        id: 'pregnancy-weight-gain-calculator',
        label: 'Pregnancy Weight Gain Calculator',
        description: 'See your IOM-recommended weight gain range and track if you\'re on pace.',
        href: '/tool/pregnancy-weight-gain-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['womens-health'],
        tag: 'New',
        bgColor: '#1F3868',
        subheading: 'Track every pound, every week.',
        ctaLabel: 'Track my weight',
    },
    {
        id: 'anger-management-test',
        label: 'Anger Management Test',
        description: 'Anger self-assessment based on the Novaco Anger Inventory.',
        href: '/tool/anger-management-test',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['mental-health', 'personality'],
    },
    {
        id: 'symptoms-checker',
        label: 'Symptoms Checker',
        description: 'Pick symptoms and severity to see if self-care, a doctor, or ER is best.',
        href: '/tool/symptoms-checker',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['symptom-check'],
        tag: 'Featured',
        bgColor: '#6A553B',
        subheading: 'Doctor, ER, or self-care?',
        ctaLabel: 'Check my symptoms',
    },
    {
        id: 'sleep-calculator',
        label: 'Sleep Calculator',
        description: 'Enter a bedtime or wake time and skip groggy morning sleep inertia.',
        href: '/tool/sleep-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['sleep-wellness'],
        tag: 'Featured',
        bgColor: '#3F6951',
        subheading: 'Wake up sharp. Not groggy.',
        ctaLabel: 'Plan my sleep',
    },
    {
        id: 'borderline-personality-test',
        label: 'Borderline Personality Disorder Test',
        description: 'Borderline personality disorder self-test based on the DSM-5-TR BPD criteria.'
        // +'Rate how strongly you agree and see your BPD trait score.'
        ,
        href: '/tool/borderline-personality-test',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'autism-test',
        label: 'AQ-10 Autism Test',
        description: 'See your 0-10 score and whether you meet the NHS referral threshold.',
        href: '/tool/autism-test',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'vo2max-calculator',
        label: 'VO2 Max Calculator',
        description: 'Enter race time or resting HR to see your VO2 max against age and sex norms.',
        href: '/tool/vo2max-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['body-fitness'],
    },
    {
        id: 'depression-test',
        label: 'Depression Test',
        description: 'PHQ-9 depression self-screen with severity score and clinical banding.',
        href: '/tool/depression-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'schizophrenia-test',
        label: 'Schizophrenia Test',
        description: 'PQ-B psychosis-risk self-screen with distress score and clinical threshold.',
        href: '/tool/schizophrenia-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'social-anxiety-test',
        label: 'Social Anxiety Test',
        description: 'Self-screen modelled on the APA Severity Measure for Social Anxiety Disorder.',
        href: '/tool/social-anxiety-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'anxiety-test',
        label: 'Anxiety Test',
        description: 'Self-screen for generalized anxiety with 20 items and a 5-tier severity banding.',
        href: '/tool/anxiety-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'bipolar-test',
        label: 'Bipolar Test',
        description: '20 items on mania, mood swings, and depression, with a 5-tier severity banding.',
        href: '/tool/bipolar-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'menopause',
        label: 'Menopause Age Calculator',
        description: 'Predict when natural menopause is most likely for you, no labs required.',
        href: '/tool/menopause',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['womens-health'],
    },
    {
        id: 'reaction-time',
        label: 'Reaction Time Test',
        description: 'Five quick trials show your average reaction time against the population mean.',
        href: '/tool/reaction-time',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['cognitive'],
    },
    {
        id: 'narcissism-test',
        label: 'Narcissism Test',
        description: '20 items from NPI, NARQ, and B-PNI inventories, banded into a 5-tier spectrum.',
        href: '/tool/narcissism-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health', 'personality'],
    },
    {
        id: 'self-esteem-test',
        label: 'Self-Esteem Test',
        description: '20 items from major self-esteem scales, banded into a 5-tier spectrum.',
        href: '/tool/self-esteem-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['personality'],
    },
    {
        id: 'psychopathy-test',
        label: 'Psychopathy Test',
        description: '20 items drawn from the Hare PCL-R, PPI, and Levenson Self-Report Psychopathy Scale, banded into a 5-tier psychopathy spectrum.',
        href: '/tool/psychopathy-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health', 'personality'],
    },
    {
        id: 'body-dysmorphia-test',
        label: 'Body Dysmorphia Test',
        description: '20 Likert items adapted from clinical BDD assessments, banded into a 5-tier spectrum from few signs to strong signs of body dysmorphic disorder.',
        href: '/tool/body-dysmorphia-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'emotional-availability-test',
        label: 'Emotional Availability Test',
        description: '20 items show how open or guarded you are in close relationships.',
        href: '/tool/emotional-availability-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['relationships'],
    },
    {
        id: 'highly-sensitive-personal-test',
        label: 'Highly Sensitive Person Test',
        description: '20 items adapted from Elaine Aron’s Highly Sensitive Person Scale.',
        href: '/tool/highly-sensitive-personal-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['personality'],
    },
    {
        id: 'introversion-test',
        label: 'Introvert / Extrovert Test',
        description: '20 items place you on the introversion-extroversion Big Five spectrum.',
        href: '/tool/introversion-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['personality'],
    },
    {
        id: 'burnout-at-work',
        label: 'Burnout at Work Test',
        description: '20 items on the Maslach Burnout Inventory covering exhaustion and cynicism.',
        href: '/tool/burnout-at-work',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'loneliness-test',
        label: 'Loneliness Test',
        description: '20 items inspired by the UCLA Loneliness Scale, from connected to lonely.',
        href: '/tool/loneliness-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'mental-age-test',
        label: 'Mental Age Test',
        description: 'Estimate your mental age from habits, music, and outlook, across 5 tiers.',
        href: '/tool/mental-age-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['personality'],
    },
    {
        id: 'sobriety-calculator',
        label: 'Sobriety Calculator',
        description: 'Count days, weeks, and years sober with milestones from 24 hours to 10+ years.',
        href: '/tool/sobriety-calculator',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['substances'],
    },
    {
        id: 'ace-test',
        label: 'ACE Test',
        description: 'The standardized 10-item Adverse Childhood Experiences questionnaire.',
        href: '/tool/ace-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['mental-health'],
    },
    {
        id: 'celiac-disease',
        label: 'Celiac Disease Symptom Test',
        description: 'A celiac symptoms checklist with a likelihood band across body systems.',
        href: '/tool/celiac-disease',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['symptom-check', 'nutrition'],
    },
    {
        id: 'thc-detox-calculator',
        label: 'THC Detox Calculator',
        description: 'Estimate THC detection windows for urine, blood, saliva, and hair tests.',
        href: '/tool/thc-detox-calculator',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['substances'],
    },
    {
        id: 'dri-calculator',
        label: 'DRI Calculator',
        description: 'Personal Dietary Reference Intakes for calories, macros, vitamins, and minerals.',
        href: '/tool/dri-calculator',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['nutrition'],
    },
    {
        id: 'ovulation-calculator',
        label: 'Ovulation Calculator',
        description: 'Predict your fertile window, ovulation day, next period, and due date from your last menstrual period and cycle length.',
        href: '/tool/ovulation-calculator',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['womens-health'],
    },
    {
        id: 'implantation-calculator',
        label: 'Implantation Calculator',
        description: 'Estimate when implantation may have happened, with a day-by-day DPO probability table.',
        href: '/tool/implantation-calculator',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['womens-health'],
        tag: 'New',
        bgColor: '#6A553B',
        ctaLabel: "Check my implantation",
    },
    {
        id: 'perimenopause-symptom',
        label: 'Perimenopause Symptom Quiz',
        description: 'A 21-item symptom checklist based on the Greene Climacteric Scale.',
        href: '/tool/perimenopause-symptom',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['womens-health'],
    },
    {
        id: 'iq-test',
        label: 'IQ Test',
        description: 'Free 20-question IQ test with an estimate on the Wechsler scale and percentile.',
        href: '/tool/iq-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['cognitive'],
    },
    {
        id: 'enneagram-test',
        label: 'Enneagram Test',
        description: 'A 36-question Enneagram test mapping you to one of nine core types with wing.',
        href: '/tool/enneagram-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['personality'],
    },
    {
        id: 'color-blind-test',
        label: 'Color Blind Test',
        description: 'A 12-plate Ishihara-style screen for color vision deficiency.',
        href: '/tool/color-blind-test',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['cognitive'],
    },
    {
        id: 'am-i-pregnant-quiz',
        label: 'Am I Pregnant Quiz',
        description: 'A free anonymous 11-question early-pregnancy symptom check with a likelihood band.',
        href: '/tool/am-i-pregnant-quiz',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['womens-health'],
    },
    {
        id: 'attachment-style',
        label: 'Attachment Style Test',
        description: 'A free 30-question quiz mapping you to one of four attachment styles.',
        href: '/tool/attachment-style',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: ['relationships'],
    },
    {
        id: 'pill-identifier',
        label: 'Pill Identifier',
        description: 'Match a tablet or capsule to the medication it likely is by entering its imprint code, color, and shape. Built from the FDA pill-imprint taxonomy.',
        href: '/tool/pill-identifier',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['medication-tools'],
        tag: 'Featured',
        bgColor: '#1F3868',
    },
    {
        id: 'macro-calculator',
        label: 'Macro Calculator',
        description: 'Get daily protein, carb, and fat targets in grams from your stats and goal.',
        href: '/tool/macro-calculator',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: [ 'nutrition'],
    },
    {
        id: 'body-fat-calculator',
        label: 'Body Fat Calculator',
        description: 'Estimate body fat percentage and see your fitness range.',
        href: '/tool/body-fat-calculator',
        isExternal: false,
        requiresAuth: false,
        isOpeningOnSameLayout: false,
        categories: [ 'body-fitness'],
        tag: 'New',
        bgColor: '#1F3868',
        ctaLabel : "Check body fat"
    },
    {
        id: 'intermittent-fasting-calculator',
        label: 'Intermittent Fasting Calculator',
        description: 'Plan your 16:8, 18:6, 20:4, OMAD, or 5:2 schedule and see when key metabolic milestones land.',
        href: '/tool/intermittent-fasting-calculator',
        isExternal: false,
        requiresAuth: true,
        isOpeningOnSameLayout: false,
        categories: ['nutrition', 'body-fitness'],
        tag: 'New',
        bgColor: '#6A553B',
        ctaLabel : "Plan my fast"
    }
] as const satisfies readonly ToolMeta[];

export type ToolId = (typeof TOOLS_DATA)[number]['id'];

export const TOOLS: readonly ToolMeta[] = TOOLS_DATA;

export const FEATURED_TOOL_IDS: ToolId[] = ['bill-analyser'];

export const TOOLS_BY_ID: Record<ToolId, ToolMeta> = TOOLS_DATA.reduce(
    (acc, t) => ({ ...acc, [t.id]: t }),
    {} as Record<ToolId, ToolMeta>
);

const SEARCH_INDEX = new Map<string, string>(
    TOOLS_DATA.map((t) => [t.id, t.label.toLowerCase()])
);

/** Substring match against a tool's prebuilt lowercased search blob. Expects `query` to already be lowercased. */
export function toolMatches(toolId: string, query: string): boolean {
    return SEARCH_INDEX.get(toolId)?.includes(query) ?? false;
}

export function getToolBySlug(slug: string): ToolMeta | undefined {
    return TOOLS.find((t) => t.id === slug);
}

/** Map current pathname → toolId, for "last used" tracking and active state. */ 
export function toolIdForPath(pathname: string | null | undefined): ToolId | null {
    if (!pathname) return null;
    if (pathname.startsWith('/tool/appeal-assistant')) return 'insurance';
    if (pathname.startsWith('/tool/cost-estimator')) return 'cost-estimator';
    if (pathname.startsWith('/tool/bill-analyser')) return 'bill-analyser';
    if (pathname.startsWith('/prescription-reader')) return 'prescription-reader';
    if (pathname.startsWith('/tool/free-adhd-test')) return 'free-adhd-test';
    if (pathname.startsWith('/tool/childhood-trauma-test')) return 'childhood-trauma-test';
    if (pathname.startsWith('/tool/tdee-calculator')) return 'tdee-calculator';
    if (pathname.startsWith('/tool/chronotype-test')) return 'chronotype-test';
    if (pathname.startsWith('/tool/rice-purity-test')) return 'rice-purity-test';
    if (pathname.startsWith('/tool/glp1-budget-calculator')) return 'glp1-budget-calculator';
    if (pathname.startsWith('/tool/glp1-coverage-check')) return 'glp1-coverage-check';
    if (pathname.startsWith('/tool/glp1-dose-calculator')) return 'glp1-dose-calculator';
    if (pathname.startsWith('/tool/glp1-meal-planner')) return 'glp1-meal-planner';
    if (pathname.startsWith('/tool/sexual-orientation-test')) return 'sexual-orientation-test';
    if (pathname.startsWith('/tool/glp1-supply-tracker')) return 'glp1-supply-tracker';
    if (pathname.startsWith('/tool/injection-site-tracker')) return 'injection-site-tracker';
    if (pathname.startsWith('/tool/hydration-calculator')) return 'hydration-calculator';
    if (pathname.startsWith('/tool/glp1-plateau-calculator')) return 'glp1-plateau-calculator';
    if (pathname.startsWith('/tool/glp1-titration-calculator')) return 'glp1-titration-calculator';
    if (pathname.startsWith('/tool/weight-loss-timeline-projector')) return 'weight-loss-timeline-projector';
    if (pathname.startsWith('/tool/future-self')) return 'future-self';
    if (pathname.startsWith('/tool/bmi-calculator')) return 'bmi-calculator';
    if (pathname.startsWith('/tool/bmr-calculator')) return 'bmr-calculator';
    if (pathname.startsWith('/tool/bac-calculator')) return 'bac-calculator';
    if (pathname.startsWith('/tool/heart-age-calculator')) return 'heart-age-calculator';
    if (pathname.startsWith('/tool/ivf-success-estimator')) return 'ivf-success-estimator';
    if (pathname.startsWith('/tool/miscarriage-probability')) return 'miscarriage-probability';
    if (pathname.startsWith('/tool/pregnancy-calculator')) return 'pregnancy-calculator';
    if (pathname.startsWith('/tool/pregnancy-weight-gain-calculator')) return 'pregnancy-weight-gain-calculator';
    if (pathname.startsWith('/tool/pregnancy-weight-gain-calculator')) return 'pregnancy-weight-gain-calculator';
    if (pathname.startsWith('/tool/anger-management-test')) return 'anger-management-test';
    if (pathname.startsWith('/tool/symptoms-checker')) return 'symptoms-checker';
    if (pathname.startsWith('/tool/sleep-calculator')) return 'sleep-calculator';
    if (pathname.startsWith('/tool/borderline-personality-test')) return 'borderline-personality-test';
    if (pathname.startsWith('/tool/autism-test')) return 'autism-test';
    if (pathname.startsWith('/tool/vo2max-calculator')) return 'vo2max-calculator';
    if (pathname.startsWith('/tool/depression-test')) return 'depression-test';
    if (pathname.startsWith('/tool/schizophrenia-test')) return 'schizophrenia-test';
    if (pathname.startsWith('/tool/social-anxiety-test')) return 'social-anxiety-test';
    if (pathname.startsWith('/tool/anxiety-test')) return 'anxiety-test';
    if (pathname.startsWith('/tool/bipolar-test')) return 'bipolar-test';
    if (pathname.startsWith('/tool/menopause')) return 'menopause';
    if (pathname.startsWith('/tool/reaction-time')) return 'reaction-time';
    if (pathname.startsWith('/tool/narcissism-test')) return 'narcissism-test';
    if (pathname.startsWith('/tool/self-esteem-test')) return 'self-esteem-test';
    if (pathname.startsWith('/tool/psychopathy-test')) return 'psychopathy-test';
    if (pathname.startsWith('/tool/body-dysmorphia-test')) return 'body-dysmorphia-test';
    if (pathname.startsWith('/tool/emotional-availability-test')) return 'emotional-availability-test';
    if (pathname.startsWith('/tool/highly-sensitive-personal-test')) return 'highly-sensitive-personal-test';
    if (pathname.startsWith('/tool/introversion-test')) return 'introversion-test';
    if (pathname.startsWith('/tool/burnout-at-work')) return 'burnout-at-work';
    if (pathname.startsWith('/tool/loneliness-test')) return 'loneliness-test';
    if (pathname.startsWith('/tool/mental-age-test')) return 'mental-age-test';
    if (pathname.startsWith('/tool/sobriety-calculator')) return 'sobriety-calculator';
    if (pathname.startsWith('/tool/ace-test')) return 'ace-test';
    if (pathname.startsWith('/tool/celiac-disease')) return 'celiac-disease';
    if (pathname.startsWith('/tool/thc-detox-calculator')) return 'thc-detox-calculator';
    if (pathname.startsWith('/tool/dri-calculator')) return 'dri-calculator';
    if (pathname.startsWith('/tool/ovulation-calculator')) return 'ovulation-calculator';
    if (pathname.startsWith('/tool/implantation-calculator')) return 'implantation-calculator';
    if (pathname.startsWith('/tool/perimenopause-symptom')) return 'perimenopause-symptom';
    if (pathname.startsWith('/tool/iq-test')) return 'iq-test';
    if (pathname.startsWith('/tool/enneagram-test')) return 'enneagram-test';
    if (pathname.startsWith('/tool/color-blind-test')) return 'color-blind-test';
    if (pathname.startsWith('/tool/am-i-pregnant-quiz')) return 'am-i-pregnant-quiz';
    if (pathname.startsWith('/tool/attachment-style')) return 'attachment-style';
    if (pathname.startsWith('/tool/pill-identifier')) return 'pill-identifier';
    if (pathname.startsWith('/tool/macro-calculator')) return 'macro-calculator';
    if (pathname.startsWith('/tool/intermittent-fasting-calculator')) return 'intermittent-fasting-calculator';
    return null;
}
