// Question/option data for the Symptoms Checker tool.
// Symptom list and qualifier-group labels are drawn verbatim from Mayo Clinic's
// public symptom checker (28-symptom adult flow) to keep the questionnaire
// experience faithful to the source patients encounter elsewhere.

export type SexValue = "male" | "female";
export type AgeBand = "under-18" | "18-39" | "40-64" | "65-plus";
export type DurationValue = "today" | "few-days" | "1-2-weeks" | "2-plus-weeks";
export type SeverityValue = "mild" | "moderate" | "severe" | "unbearable";

export type BodyRegion =
  | "head-nerves"
  | "eyes"
  | "ent"
  | "chest-lungs"
  | "digestive"
  | "back-neck"
  | "limbs-joints"
  | "urinary-pelvic"
  | "skin"
  | "mental";

export interface SimpleOption<V extends string> {
  label: string;
  value: V;
  helper?: string;
}

export const SEX_OPTIONS: readonly SimpleOption<SexValue>[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export const AGE_OPTIONS: readonly SimpleOption<AgeBand>[] = [
  { label: "Under 18", value: "under-18" },
  { label: "18–39", value: "18-39" },
  { label: "40–64", value: "40-64" },
  { label: "65 and older", value: "65-plus" },
];

export const DURATION_OPTIONS: readonly SimpleOption<DurationValue>[] = [
  { label: "Started today", value: "today" },
  { label: "A few days", value: "few-days" },
  { label: "1–2 weeks", value: "1-2-weeks" },
  { label: "Longer than 2 weeks", value: "2-plus-weeks" },
];

export const SEVERITY_OPTIONS: readonly SimpleOption<SeverityValue>[] = [
  { label: "Mild — noticeable but not limiting", value: "mild" },
  { label: "Moderate — bothering me regularly", value: "moderate" },
  { label: "Severe — interfering with daily life", value: "severe" },
  { label: "Unbearable — I can't function", value: "unbearable" },
];

export interface BodyRegionOption {
  value: BodyRegion;
  label: string;
  helper: string;
}

export const BODY_REGIONS: readonly BodyRegionOption[] = [
  { value: "head-nerves", label: "Head, face & nerves", helper: "Headaches, dizziness, numbness" },
  { value: "eyes", label: "Eyes", helper: "Pain, redness, vision problems" },
  { value: "ent", label: "Ear, nose & throat", helper: "Sore throat, congestion, swallowing" },
  { value: "chest-lungs", label: "Chest, heart & lungs", helper: "Chest pain, breath, palpitations" },
  { value: "digestive", label: "Stomach & digestive", helper: "Pain, nausea, bowel changes" },
  { value: "back-neck", label: "Back, neck & shoulders", helper: "Back, neck, shoulder pain" },
  { value: "limbs-joints", label: "Arms, hips, legs & joints", helper: "Joint, hip, foot, leg" },
  { value: "urinary-pelvic", label: "Urinary & pelvic", helper: "Urinary problems, pelvic pain" },
  { value: "skin", label: "Skin", helper: "Rash, itch, hives" },
  { value: "mental", label: "Mood & sleep", helper: "Anxiety, low mood, insomnia" },
];

export interface SymptomOption {
  value: string;
  label: string;
}

// Mayo-derived symptom list (28 adult symptoms), regrouped under our body regions.
// Labels are verbatim except for trailing "in adults" which we drop for cleaner UX.
export const SYMPTOMS_BY_REGION: Record<BodyRegion, readonly SymptomOption[]> = {
  "head-nerves": [
    { value: "headache", label: "Headache" },
    { value: "dizziness", label: "Dizziness" },
    { value: "numbness-hands", label: "Numbness or tingling in hands" },
  ],
  eyes: [
    { value: "eye-discomfort", label: "Eye discomfort and redness" },
    { value: "eye-problems", label: "Eye problems (vision)" },
  ],
  ent: [
    { value: "sore-throat", label: "Sore throat" },
    { value: "difficulty-swallowing", label: "Difficulty swallowing" },
    { value: "nasal-congestion", label: "Nasal congestion" },
  ],
  "chest-lungs": [
    { value: "chest-pain", label: "Chest pain" },
    { value: "shortness-of-breath", label: "Shortness of breath" },
    { value: "palpitations", label: "Heart palpitations" },
    { value: "cough", label: "Cough" },
    { value: "wheezing", label: "Wheezing" },
  ],
  digestive: [
    { value: "abdominal-pain", label: "Abdominal pain" },
    { value: "blood-in-stool", label: "Blood in stool" },
    { value: "constipation", label: "Constipation" },
    { value: "diarrhea", label: "Diarrhea" },
    { value: "nausea-vomiting", label: "Nausea or vomiting" },
  ],
  "back-neck": [
    { value: "low-back-pain", label: "Low back pain" },
    { value: "neck-pain", label: "Neck pain" },
    { value: "shoulder-pain", label: "Shoulder pain" },
  ],
  "limbs-joints": [
    { value: "foot-ankle-pain", label: "Foot or ankle pain" },
    { value: "leg-swelling", label: "Foot or leg swelling" },
    { value: "hip-pain", label: "Hip pain" },
    { value: "knee-pain", label: "Knee pain" },
  ],
  "urinary-pelvic": [
    { value: "urinary-problems", label: "Urinary problems" },
    { value: "pelvic-pain-female", label: "Pelvic pain (female)" },
    { value: "pelvic-pain-male", label: "Pelvic pain (male)" },
  ],
  skin: [
    { value: "skin-rash", label: "Skin rash" },
    { value: "itching", label: "Persistent itching" },
    { value: "hives", label: "Hives or welts" },
  ],
  mental: [
    { value: "anxiety", label: "Anxiety or panic" },
    { value: "low-mood", label: "Persistent low mood" },
    { value: "insomnia", label: "Insomnia or poor sleep" },
  ],
};

// ── Mayo-style related-factor groups ─────────────────────────────────────────
// Per-symptom multi-select qualifiers. Labels match Mayo's verbatim phrasing
// where possible. Each factor has a "weight" used in the urgency score:
//   2 = single factor that can push to emergency on its own
//   1 = contributes to urgent
//   0 = informational only (helps with possible-cause matching)

export interface FactorOption {
  value: string;
  label: string;
  weight: number;
}

export interface FactorGroup {
  id: string;
  title: string;
  options: readonly FactorOption[];
}

export const FACTORS_BY_SYMPTOM: Record<string, readonly FactorGroup[]> = {
  headache: [
    {
      id: "headache-pain-is",
      title: "Pain is",
      options: [
        { value: "extreme", label: "Extreme", weight: 1 },
        { value: "mild-moderate", label: "Mild to moderate", weight: 0 },
        { value: "moderate-severe", label: "Moderate to severe", weight: 1 },
        { value: "pressure", label: "Pressure or squeezing sensation", weight: 0 },
        { value: "stabbing", label: "Stabbing or burning", weight: 0 },
        { value: "throbbing", label: "Throbbing", weight: 0 },
      ],
    },
    {
      id: "headache-located",
      title: "Pain located",
      options: [
        { value: "around-one-eye", label: "Around one eye or radiates from one eye", weight: 0 },
        { value: "around-temples", label: "Around your temples", weight: 0 },
        { value: "both-sides", label: "On both sides of your head", weight: 0 },
        { value: "one-side", label: "On one side of your head", weight: 0 },
      ],
    },
    {
      id: "headache-onset",
      title: "Onset is",
      options: [
        { value: "gradual", label: "Gradual", weight: 0 },
        { value: "head-injury", label: "Preceded by a head injury or fall", weight: 2 },
        { value: "med-overuse", label: "Preceded by frequent use of pain medication", weight: 0 },
        { value: "aura", label: "Preceded by visual or other sensory disturbances", weight: 0 },
        { value: "sudden", label: "Sudden", weight: 2 },
      ],
    },
    {
      id: "headache-accompanied",
      title: "Accompanied by",
      options: [
        { value: "personality-change", label: "Change in personality, behaviors or mental status", weight: 2 },
        { value: "confusion", label: "Confusion", weight: 2 },
        { value: "difficulty-speaking", label: "Difficulty speaking", weight: 2 },
        { value: "fever", label: "Fever", weight: 1 },
        { value: "weakness-numbness", label: "Persistent weakness or numbness", weight: 2 },
        { value: "seizures", label: "Seizures", weight: 2 },
        { value: "light-noise-sens", label: "Sensitivity to light or noise", weight: 0 },
        { value: "stiff-neck", label: "Stiff neck", weight: 1 },
        { value: "vision-problems", label: "Vision problems", weight: 1 },
        { value: "nausea-vomiting", label: "Nausea or vomiting", weight: 0 },
      ],
    },
  ],
  "chest-pain": [
    {
      id: "chest-pain-described",
      title: "Pain best described as",
      options: [
        { value: "burning", label: "Burning", weight: 0 },
        { value: "crushing", label: "Crushing or heavy", weight: 2 },
        { value: "pressure", label: "Pressure or squeezing", weight: 2 },
        { value: "sharp", label: "Sharp or stabbing", weight: 0 },
        { value: "tearing", label: "Tearing or ripping", weight: 2 },
        { value: "tightness", label: "Tightness", weight: 1 },
      ],
    },
    {
      id: "chest-pain-trigger",
      title: "Triggered or worsened by",
      options: [
        { value: "exertion", label: "Physical exertion", weight: 1 },
        { value: "breathing-in", label: "Breathing in deeply", weight: 0 },
        { value: "lying-down", label: "Lying down or bending over", weight: 0 },
        { value: "stress", label: "Stress or anxiety", weight: 0 },
        { value: "after-eating", label: "After eating", weight: 0 },
        { value: "pressing", label: "Pressing on the chest", weight: 0 },
      ],
    },
    {
      id: "chest-pain-accompanied",
      title: "Accompanied by",
      options: [
        { value: "arm-jaw-pain", label: "Pain radiating to arm, neck or jaw", weight: 2 },
        { value: "shortness-breath", label: "Shortness of breath", weight: 1 },
        { value: "sweating", label: "Cold sweats", weight: 1 },
        { value: "nausea", label: "Nausea or vomiting", weight: 0 },
        { value: "lightheaded", label: "Lightheadedness or fainting", weight: 1 },
        { value: "heartburn", label: "Heartburn or acid taste", weight: 0 },
        { value: "cough", label: "Cough", weight: 0 },
        { value: "fever", label: "Fever", weight: 0 },
      ],
    },
  ],
  "abdominal-pain": [
    {
      id: "abd-pain-is",
      title: "Pain is",
      options: [
        { value: "burning", label: "Burning", weight: 0 },
        { value: "crampy", label: "Crampy", weight: 0 },
        { value: "dull", label: "Dull", weight: 0 },
        { value: "intense", label: "Intense", weight: 1 },
        { value: "intermittent", label: "Intermittent or episodic", weight: 0 },
        { value: "sharp", label: "Sharp", weight: 0 },
        { value: "sudden-acute", label: "Sudden (acute)", weight: 1 },
        { value: "worsening", label: "Worsening or progressing", weight: 1 },
      ],
    },
    {
      id: "abd-pain-located",
      title: "Pain located in",
      options: [
        { value: "radiates", label: "Abdomen but radiates to other parts of the body", weight: 1 },
        { value: "lower", label: "Lower abdomen", weight: 0 },
        { value: "middle", label: "Middle abdomen", weight: 0 },
        { value: "sides", label: "One or both sides", weight: 0 },
        { value: "upper", label: "Upper abdomen", weight: 0 },
      ],
    },
    {
      id: "abd-pain-accompanied",
      title: "Accompanied by",
      options: [
        { value: "swelling", label: "Abdominal swelling", weight: 1 },
        { value: "bloody-stool", label: "Black or bloody stools", weight: 2 },
        { value: "fever", label: "Fever", weight: 1 },
        { value: "vomit-blood", label: "Vomiting blood", weight: 2 },
        { value: "nausea-vomiting", label: "Nausea or vomiting", weight: 0 },
        { value: "diarrhea", label: "Diarrhea", weight: 0 },
        { value: "constipation", label: "Constipation", weight: 0 },
        { value: "weight-loss", label: "Unintended weight loss", weight: 1 },
        { value: "pulsing-navel", label: "Pulsing sensation near the navel", weight: 2 },
      ],
    },
  ],
  cough: [
    {
      id: "cough-is",
      title: "Cough is",
      options: [
        { value: "dry", label: "Dry", weight: 0 },
        { value: "productive", label: "Producing phlegm or mucus", weight: 0 },
      ],
    },
    {
      id: "cough-problem-is",
      title: "Problem is",
      options: [
        { value: "acute", label: "Acute (less than 3 weeks)", weight: 0 },
        { value: "subacute", label: "Subacute (3–8 weeks)", weight: 0 },
        { value: "chronic", label: "Chronic (over 8 weeks)", weight: 1 },
      ],
    },
    {
      id: "cough-accompanied",
      title: "Accompanied by",
      options: [
        { value: "blood", label: "Coughing up blood", weight: 2 },
        { value: "shortness-breath", label: "Shortness of breath", weight: 1 },
        { value: "chest-pain", label: "Chest pain", weight: 1 },
        { value: "fever", label: "Fever", weight: 0 },
        { value: "wheeze", label: "Wheezing", weight: 0 },
        { value: "weight-loss", label: "Unintended weight loss", weight: 1 },
        { value: "night-sweats", label: "Night sweats", weight: 1 },
      ],
    },
  ],
  "shortness-of-breath": [
    {
      id: "sob-problem",
      title: "Problem is",
      options: [
        { value: "acute", label: "Acute — came on suddenly", weight: 2 },
        { value: "chronic", label: "Chronic — has been ongoing", weight: 0 },
      ],
    },
    {
      id: "sob-trigger",
      title: "Triggered or worsened by",
      options: [
        { value: "exertion", label: "Exertion", weight: 0 },
        { value: "rest", label: "Present at rest", weight: 2 },
        { value: "lying-down", label: "Lying down", weight: 1 },
        { value: "allergens", label: "Allergens or cold air", weight: 0 },
      ],
    },
    {
      id: "sob-accompanied",
      title: "Accompanied by",
      options: [
        { value: "chest-pain", label: "Chest pain or tightness", weight: 2 },
        { value: "swelling", label: "Swelling in legs or ankles", weight: 1 },
        { value: "blue-lips", label: "Bluish lips or fingertips", weight: 2 },
        { value: "fever", label: "Fever", weight: 0 },
        { value: "wheeze", label: "Wheezing", weight: 0 },
        { value: "cough", label: "Cough", weight: 0 },
      ],
    },
  ],
  "sore-throat": [
    {
      id: "throat-accompanied",
      title: "Accompanied by",
      options: [
        { value: "trouble-breathing", label: "Difficulty breathing", weight: 2 },
        { value: "drooling", label: "Drooling or unable to swallow saliva", weight: 2 },
        { value: "fever", label: "Fever", weight: 0 },
        { value: "swollen-glands", label: "Swollen neck glands", weight: 0 },
        { value: "white-patches", label: "White patches on tonsils", weight: 0 },
        { value: "rash", label: "Rash", weight: 0 },
        { value: "hoarseness", label: "Hoarseness over 2 weeks", weight: 1 },
        { value: "ear-pain", label: "Ear pain", weight: 0 },
      ],
    },
  ],
  "low-back-pain": [
    {
      id: "back-pain-is",
      title: "Pain",
      options: [
        { value: "shoots-leg", label: "Shoots down one or both legs", weight: 1 },
        { value: "dull", label: "Dull and aching", weight: 0 },
        { value: "sharp", label: "Sharp", weight: 0 },
      ],
    },
    {
      id: "back-pain-trigger",
      title: "Triggered by",
      options: [
        { value: "lifting", label: "Lifting or bending", weight: 0 },
        { value: "sitting", label: "Long periods of sitting", weight: 0 },
        { value: "injury", label: "Recent injury or fall", weight: 1 },
      ],
    },
    {
      id: "back-pain-accompanied",
      title: "Accompanied by",
      options: [
        { value: "bladder-bowel", label: "Loss of bladder or bowel control", weight: 2 },
        { value: "leg-weakness", label: "Weakness in one or both legs", weight: 2 },
        { value: "fever", label: "Fever", weight: 1 },
        { value: "weight-loss", label: "Unintended weight loss", weight: 1 },
        { value: "numbness-groin", label: "Numbness in groin or inner thighs", weight: 2 },
      ],
    },
  ],
  dizziness: [
    {
      id: "dizzy-feel",
      title: "You feel",
      options: [
        { value: "spinning", label: "Spinning or that the room is moving", weight: 0 },
        { value: "lightheaded", label: "Lightheaded or about to faint", weight: 1 },
        { value: "off-balance", label: "Off balance", weight: 0 },
      ],
    },
    {
      id: "dizzy-trigger",
      title: "Triggered or worsened by",
      options: [
        { value: "head-movement", label: "Head movements", weight: 0 },
        { value: "standing", label: "Standing up quickly", weight: 0 },
      ],
    },
    {
      id: "dizzy-accompanied",
      title: "Accompanied by",
      options: [
        { value: "weakness-one-side", label: "Weakness on one side", weight: 2 },
        { value: "trouble-speaking", label: "Trouble speaking", weight: 2 },
        { value: "chest-pain", label: "Chest pain", weight: 2 },
        { value: "fainting", label: "Fainting", weight: 2 },
        { value: "hearing-loss", label: "Hearing loss", weight: 1 },
        { value: "double-vision", label: "Double vision", weight: 1 },
        { value: "nausea", label: "Nausea or vomiting", weight: 0 },
      ],
    },
  ],
};

// Step ordering for the quiz state machine. "factors" is conditionally shown
// only when FACTORS_BY_SYMPTOM has groups for the chosen symptom.
export type StepId =
  | "sex"
  | "age"
  | "region"
  | "symptom"
  | "factors"
  | "duration"
  | "severity"
  | "red-flags";

export const STEP_ORDER: readonly StepId[] = [
  "sex",
  "age",
  "region",
  "symptom",
  "factors",
  "duration",
  "severity",
  "red-flags",
];

export const TOTAL_STEPS = STEP_ORDER.length;

export interface RedFlag {
  value: string;
  label: string;
  weight: number;
}

export const RED_FLAGS: readonly RedFlag[] = [
  { value: "trouble-breathing", label: "Trouble breathing or shortness of breath at rest", weight: 2 },
  { value: "chest-pressure", label: "New chest pain, pressure, or tightness", weight: 2 },
  { value: "fainted", label: "Fainted or lost consciousness", weight: 2 },
  { value: "worst-headache", label: "Sudden “worst headache of my life”", weight: 2 },
  { value: "confusion-speech", label: "Confusion or trouble speaking", weight: 2 },
  { value: "one-sided-weakness", label: "Weakness or numbness on one side", weight: 2 },
  { value: "severe-abdominal", label: "Severe, unrelenting abdominal pain", weight: 2 },
  { value: "blood-vomit-stool", label: "Vomiting blood or black, tarry stools", weight: 2 },
  { value: "anaphylaxis", label: "Swelling of lips, tongue, or throat", weight: 2 },
  { value: "stiff-neck-fever", label: "Stiff neck with fever", weight: 1 },
  { value: "high-fever", label: "Fever over 103°F (39.4°C)", weight: 1 },
  { value: "pregnant-bleeding", label: "Pregnant with bleeding or severe pain", weight: 2 },
  { value: "recent-injury", label: "Recent serious injury or head trauma", weight: 1 },
  { value: "none", label: "None of the above", weight: 0 },
];
