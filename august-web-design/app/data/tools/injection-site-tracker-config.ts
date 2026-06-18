// Pure data config for Injection Site Tracker tool.
// No React.

export type ISTMedication = "mounjaro" | "zepbound" | "ozempic" | "wegovy" | "other";

export type InjectionSite = "abdomen" | "thighs" | "upper-buttocks" | "upper-arms" | "flanks";

export type FrequencyDays = 5 | 7 | 10 | 14;

export type TrackingMode = "simple" | "advanced";

export type GridSize = "2x2" | "3x3" | "4x4";

export type Side = "L" | "R";

export interface WizardFormData {
  medication: ISTMedication | null;
  lastDoseDate: string | null; // ISO date string YYYY-MM-DD
  frequencyDays: FrequencyDays | null;
  selectedSites: InjectionSite[];
  trackingMode: TrackingMode | null;
  gridSize: GridSize | null;
}

export interface ScheduleEntry {
  injectionNumber: number;
  date: Date;
  site: InjectionSite;
  side: Side;
  spotCode: string | null;
  weekNumber: number;
}

export interface ScheduleResult {
  entries: ScheduleEntry[];
  totalInjections: number;
  siteCounts: Record<string, number>;
}

export const MEDICATIONS: { value: ISTMedication; label: string; subtitle: string }[] = [
  { value: "mounjaro", label: "Mounjaro", subtitle: "tirzepatide" },
  { value: "zepbound", label: "Zepbound", subtitle: "tirzepatide" },
  { value: "ozempic", label: "Ozempic", subtitle: "semaglutide" },
  { value: "wegovy", label: "Wegovy", subtitle: "semaglutide" },
  { value: "other", label: "Other GLP-1", subtitle: "" },
];

export const INJECTION_SITES: { value: InjectionSite; label: string; description: string; badge?: string }[] = [
  { value: "abdomen", label: "Abdomen", description: "Best absorption rate. Stay 2 inches from navel." },
  { value: "thighs", label: "Thighs", description: "Front/outer thigh. Some users prefer this to reduce nausea." },
  { value: "upper-buttocks", label: "Upper Buttocks", description: "Harder to reach for self-injection. May need a partner.", badge: "May need help" },
  { value: "upper-arms", label: "Upper Arms", description: "Back of arm only. Typically requires partner assistance.", badge: "May need help" },
  { value: "flanks", label: "Flanks / Love Handles", description: "Above waistline on sides. Good alternative during pregnancy." },
];

export const FREQUENCIES: { value: FrequencyDays; label: string; recommended?: boolean }[] = [
  { value: 5, label: "Every 5 Days" },
  { value: 7, label: "Weekly (7 days)", recommended: true },
  { value: 10, label: "Every 10 Days" },
  { value: 14, label: "Bi-weekly (14 days)" },
];

export const TRACKING_MODES: { value: TrackingMode; label: string; description: string; recommended?: boolean }[] = [
  { value: "simple", label: "Simple Mode", description: "Just tells you left side or right side each week. Perfect for weekly GLP-1 users.", recommended: true },
  { value: "advanced", label: "Advanced Grid Mode", description: "Tracks specific numbered spots within each zone. Based on ADCES clinical guidelines." },
];

export const GRID_SIZES: { value: GridSize; label: string; description: string; spots: number }[] = [
  { value: "2x2", label: "Compact", description: "4 spots per side", spots: 4 },
  { value: "3x3", label: "Standard", description: "9 spots per side", spots: 9 },
  { value: "4x4", label: "Extended", description: "16 spots per side", spots: 16 },
];

export const ZONE_INITIALS: Record<InjectionSite, string> = {
  "abdomen": "A",
  "thighs": "T",
  "upper-buttocks": "B",
  "upper-arms": "U",
  "flanks": "F",
};

export const SITE_LABELS: Record<InjectionSite, string> = {
  "abdomen": "Abdomen",
  "thighs": "Thighs",
  "upper-buttocks": "Buttocks",
  "upper-arms": "Arms",
  "flanks": "Flanks",
};

export const DEFAULT_FORM_DATA: WizardFormData = {
  medication: null,
  lastDoseDate: null,
  frequencyDays: null,
  selectedSites: [],
  trackingMode: null,
  gridSize: null,
};

export const HERO = {
  title: "GLP-1 Injection Site Tracker",
  accentWord: "Injection Site",
  tagline: "Prevent lipodystrophy by rotating injection sites with a personalized schedule for Ozempic, Mounjaro, Wegovy, and Zepbound.",
};

export const WIZARD_STEPS = [
  { id: "medication", question: "Which GLP-1 medication are you taking?", subtitle: "Select your medication to set up your tracker." },
  { id: "lastDose", question: "When was your last dose?", subtitle: "This sets your injection day." },
  { id: "frequency", question: "How often do you inject?", subtitle: "Select your injection frequency." },
  { id: "sites", question: "Which sites do you prefer?", subtitle: "Select all areas you are comfortable using." },
  { id: "tracking", question: "How detailed do you want?", subtitle: "Choose your tracking style." },
  { id: "gridSize", question: "Grid Size", subtitle: "Larger areas support more rotation spots." },
];

export const INTRO_EXPECTATIONS: { bold: string; rest: string }[] = [
  { bold: "5-6 quick steps", rest: "to customize your rotation schedule" },
  { bold: "12-injection plan", rest: "personalized to your medication and body areas" },
  { bold: "Print or save", rest: "your schedule for easy reference" },
];

export const CTA_BANNER = {
  headline: "Ready to track your injections?",
  subheadline: "Build a personalized rotation schedule in under a minute.",
  benefits: ["Prevent injection site complications", "Optimize medication absorption", "Free and private"] as const,
  ctaLabel: "Build My Schedule",
} as const;
