export type QuestionInputType =
  | "radio"
  | "checkbox"
  | "number"
  | "dropdown"
  | "date-masked"
  | "height-dual";

export interface GLP1Option {
  value: string;
  label: string;
}

export interface GLP1Question {
  id: string;
  text: string;
  subtitle?: string;
  inputType: QuestionInputType;
  options?: GLP1Option[];
  placeholder?: string;
  required: boolean;
  condition?: {
    questionId: string;
    values: string[];
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface GLP1Section {
  id: string;
  title: string;
  subtitle: string;
  questions: GLP1Question[];
}

export type GLP1AnswerValue = string | string[] | number | { feet: number; inches: number };
export type GLP1Answers = Record<string, GLP1AnswerValue>;

export const US_STATES: GLP1Option[] = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const YES_NO: GLP1Option[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const sections: GLP1Section[] = [
  {
    id: "basics",
    title: "Basics",
    subtitle: "about you",
    questions: [
      {
        id: "dob",
        text: "What's your month and year of birth?",
        subtitle: "We only need the month and year.",
        inputType: "date-masked",
        required: true,
        validation: { pattern: "MM-YYYY" },
      },
      {
        id: "state",
        text: "Which state do you live in?",
        inputType: "dropdown",
        required: true,
        options: US_STATES,
      },
      {
        id: "gender",
        text: "How do you describe your gender?",
        subtitle: "This helps us tailor a care path that's safe and appropriate.",
        inputType: "radio",
        required: true,
        options: [
          { value: "man", label: "Man" },
          { value: "woman", label: "Woman" },
          { value: "transgender_man", label: "Transgender man" },
          { value: "transgender_woman", label: "Transgender woman" },
          { value: "non_binary", label: "Non-binary or non-conforming" },
          { value: "another", label: "Another identity" },
          { value: "decline", label: "Decline to answer" },
        ],
      },
      {
        id: "bio_sex",
        text: "What sex were you assigned at birth?",
        subtitle: "Medication safety and eligibility can depend on this.",
        inputType: "radio",
        required: true,
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "intersex", label: "Intersex" },
        ],
      },
      {
        id: "pregnant",
        text: "Are you pregnant, nursing, or trying to become pregnant?",
        inputType: "radio",
        required: true,
        condition: { questionId: "bio_sex", values: ["female"] },
        options: YES_NO,
      },
    ],
  },
  {
    id: "body_metrics",
    title: "Body Metrics",
    subtitle: "current & goal",
    questions: [
      {
        id: "height",
        text: "How tall are you?",
        inputType: "height-dual",
        required: true,
      },
      {
        id: "weight",
        text: "What's your current weight?",
        subtitle: "We use this with your height to estimate BMI - one of the main factors insurers look at.",
        inputType: "number",
        required: true,
        placeholder: "Weight in lbs",
        validation: { min: 50, max: 800 },
      },
      {
        id: "goal_weight",
        text: "What's your goal weight?",
        inputType: "number",
        required: true,
        placeholder: "Goal weight in lbs",
        validation: { min: 50, max: 800 },
      },
    ],
  },
  {
    id: "medical_history",
    title: "Medical History",
    subtitle: "history & contraindications",
    questions: [
      {
        id: "conditions",
        text: "Have you ever been diagnosed with or treated for any of these?",
        subtitle: "Select all that apply.",
        inputType: "checkbox",
        required: true,
        options: [
          { value: "dialysis", label: "Currently undergoing dialysis" },
          { value: "heart_failure", label: "Heart failure" },
          { value: "eating_disorder", label: "Anorexia or bulimia" },
          { value: "organ_transplant", label: "Organ transplant" },
          { value: "liver_failure", label: "Liver failure" },
          { value: "none", label: "None of these" },
        ],
      },
      {
        id: "cancer",
        text: "Have you ever had cancer?",
        inputType: "radio",
        required: true,
        options: YES_NO,
      },
      {
        id: "weight_loss_med",
        text: "Have you ever taken a weight-loss medication?",
        inputType: "radio",
        required: true,
        options: [
          { value: "currently", label: "I'm taking one now" },
          { value: "previously", label: "I've taken one in the past" },
          { value: "never", label: "No, never" },
        ],
      },
      {
        id: "pancreatitis",
        text: "Have you had pancreatitis?",
        inputType: "radio",
        required: true,
        options: YES_NO,
      },
      {
        id: "gastroparesis",
        text: "Have you had gastroparesis (delayed stomach emptying)?",
        inputType: "radio",
        required: true,
        options: YES_NO,
      },
      {
        id: "gallbladder",
        text: "Have you had gallbladder pain or problems?",
        subtitle: "Gallstones, infection, or sludge all count.",
        inputType: "radio",
        required: true,
        options: YES_NO,
      },
      {
        id: "mtc_men2",
        text: "Do you or a close relative have a history of medullary thyroid cancer or MEN-2?",
        inputType: "radio",
        required: true,
        options: YES_NO,
      },
      {
        id: "triglycerides",
        text: "Have you been told your triglycerides were above 1000 mg/dL?",
        inputType: "radio",
        required: true,
        options: YES_NO,
      },
    ],
  },
  {
    id: "medication_prefs",
    title: "Medication Preferences",
    subtitle: "preferences & tolerances",
    questions: [
      {
        id: "pill_swallowing",
        text: "Do you have trouble swallowing pills?",
        inputType: "radio",
        required: true,
        options: [
          { value: "yes", label: "Yes, it's difficult for me" },
          { value: "no", label: "No, pills are fine" },
        ],
      },
      {
        id: "needle_comfort",
        text: "How do you feel about self-injections?",
        inputType: "radio",
        required: true,
        options: [
          { value: "dislike", label: "I'd rather avoid needles" },
          { value: "prefer_oral", label: "I prefer oral over injections" },
          { value: "prefer_injection", label: "I prefer injections over oral" },
        ],
      },
      {
        id: "absorption",
        text: "Do any of these affect how your body absorbs nutrients?",
        subtitle: "Select all that apply.",
        inputType: "checkbox",
        required: true,
        options: [
          { value: "celiac", label: "Celiac disease" },
          { value: "gluten_lactose", label: "Gluten or lactose intolerance" },
          { value: "ibd", label: "Inflammatory bowel disease (IBD)" },
          { value: "none", label: "None of these" },
        ],
      },
      {
        id: "low_b12",
        text: "Has a lab test shown you're low on vitamin B12?",
        inputType: "radio",
        required: true,
        options: [
          { value: "yes", label: "Yes, confirmed by lab work" },
          { value: "no", label: "No" },
        ],
      },
    ],
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    subtitle: "habits & wellness",
    questions: [
      {
        id: "sleep",
        text: "How is your sleep lately?",
        subtitle: "Falling asleep, staying asleep, or waking up unrested all count.",
        inputType: "radio",
        required: true,
        options: [
          { value: "most", label: "I struggle most nights" },
          { value: "sometimes", label: "Sometimes it's a struggle" },
          { value: "never", label: "I sleep well" },
        ],
      },
      {
        id: "fatigue",
        text: "How often do you feel fatigued?",
        inputType: "radio",
        required: true,
        options: [
          { value: "most", label: "Most of the time" },
          { value: "sometimes", label: "Sometimes" },
          { value: "never", label: "Rarely or never" },
        ],
      },
      {
        id: "diet",
        text: "Do you follow a vegetarian or vegan diet?",
        inputType: "radio",
        required: true,
        options: YES_NO,
      },
      {
        id: "digestive",
        text: "Do you experience any of these regularly?",
        subtitle: "Select all that apply.",
        inputType: "checkbox",
        required: true,
        options: [
          { value: "nausea", label: "Nausea or vomiting" },
          { value: "acid_reflux", label: "Acid reflux" },
          { value: "heartburn", label: "Heartburn" },
          { value: "none", label: "None of these" },
        ],
      },
      {
        id: "med_side_effects",
        text: "Are you sensitive to side effects from new medications?",
        subtitle: "Things like nausea, vomiting, or diarrhea when starting something new.",
        inputType: "radio",
        required: true,
        options: YES_NO,
      },
      {
        id: "pms",
        text: "Do you experience PMS symptoms?",
        subtitle: "Mood shifts, breast tenderness, fatigue, or irritability around your period.",
        inputType: "radio",
        required: true,
        condition: { questionId: "bio_sex", values: ["female"] },
        options: YES_NO,
      },
      {
        id: "strength_training",
        text: "How often do you do strength training?",
        inputType: "radio",
        required: true,
        options: [
          { value: "less_than_1", label: "Less than once a week" },
          { value: "1x", label: "Once a week" },
          { value: "2x", label: "Twice a week" },
          { value: "more_than_2", label: "Three or more times a week" },
        ],
      },
      {
        id: "surgeries",
        text: "Have you ever had surgery?",
        inputType: "radio",
        required: true,
        options: YES_NO,
      },
    ],
  },
];

export const allQuestions = sections.flatMap((s) => s.questions);
