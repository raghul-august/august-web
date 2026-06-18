export type CeliacDomain =
  | "digestive"
  | "neurological"
  | "skin-mouth"
  | "musculoskeletal"
  | "reproductive"
  | "family-risk"
  | "associated-conditions";

export interface CeliacOption {
  label: string;
  /** Frequency-weighted scoring; 0 = absent, 3 = persistent. */
  value: 0 | 1 | 2 | 3;
}

export interface CeliacQuestion {
  id: number;
  text: string;
  domain: CeliacDomain;
  /** Some items are binary (yes/no), some are frequency-rated. */
  scoring: "binary" | "frequency";
  /** Risk-weighted items (family history, type 1 diabetes) score higher when "yes". */
  weight?: number;
}

export const CELIAC_FREQUENCY_OPTIONS: readonly CeliacOption[] = [
  { label: "Never", value: 0 },
  { label: "Occasionally", value: 1 },
  { label: "Often", value: 2 },
  { label: "Almost always", value: 3 },
] as const;

export const CELIAC_BINARY_OPTIONS: readonly CeliacOption[] = [
  { label: "No", value: 0 },
  { label: "Yes", value: 3 },
] as const;

export function getOptionsForQuestion(q: CeliacQuestion): readonly CeliacOption[] {
  return q.scoring === "binary"
    ? CELIAC_BINARY_OPTIONS
    : CELIAC_FREQUENCY_OPTIONS;
}

/**
 * Celiac symptom checklist organized around the clinical symptom domains
 * commonly used in patient-facing celiac assessment tools (e.g. Celiac
 * Disease Foundation, Beyond Celiac symptom self-assessments).
 *
 * Symptoms are paired with high-risk markers (family history, type 1
 * diabetes, Hashimoto's, etc.) that elevate pre-test probability.
 */
export const CELIAC_QUESTIONS: readonly CeliacQuestion[] = [
  // Digestive
  {
    id: 1,
    text: "Chronic diarrhea or loose stools",
    domain: "digestive",
    scoring: "frequency",
  },
  {
    id: 2,
    text: "Bloating, gas, or abdominal pain after meals",
    domain: "digestive",
    scoring: "frequency",
  },
  {
    id: 3,
    text: "Constipation",
    domain: "digestive",
    scoring: "frequency",
  },
  {
    id: 4,
    text: "Unexplained nausea or vomiting",
    domain: "digestive",
    scoring: "frequency",
  },
  {
    id: 5,
    text: "Pale, foul-smelling, or fatty stools (steatorrhea)",
    domain: "digestive",
    scoring: "frequency",
  },
  {
    id: 6,
    text: "Unexplained weight loss",
    domain: "digestive",
    scoring: "binary",
  },

  // Neurological / cognitive
  {
    id: 7,
    text: "Chronic fatigue not explained by sleep",
    domain: "neurological",
    scoring: "frequency",
  },
  {
    id: 8,
    text: "Brain fog or difficulty concentrating",
    domain: "neurological",
    scoring: "frequency",
  },
  {
    id: 9,
    text: "Headaches or migraines",
    domain: "neurological",
    scoring: "frequency",
  },
  {
    id: 10,
    text: "Numbness or tingling in hands or feet (peripheral neuropathy)",
    domain: "neurological",
    scoring: "frequency",
  },
  {
    id: 11,
    text: "Anxiety or depression",
    domain: "neurological",
    scoring: "frequency",
  },

  // Skin and mouth
  {
    id: 12,
    text: "Itchy, blistering skin rash (especially elbows, knees, scalp) — dermatitis herpetiformis",
    domain: "skin-mouth",
    scoring: "binary",
    weight: 2,
  },
  {
    id: 13,
    text: "Recurring canker sores in your mouth",
    domain: "skin-mouth",
    scoring: "frequency",
  },
  {
    id: 14,
    text: "Defects in dental enamel (tooth discoloration or pitting)",
    domain: "skin-mouth",
    scoring: "binary",
  },

  // Musculoskeletal
  {
    id: 15,
    text: "Joint pain or stiffness without injury",
    domain: "musculoskeletal",
    scoring: "frequency",
  },
  {
    id: 16,
    text: "Bone or muscle pain, or unexplained osteoporosis/osteopenia",
    domain: "musculoskeletal",
    scoring: "binary",
  },
  {
    id: 17,
    text: "Iron-deficiency anemia not explained by diet or menstruation",
    domain: "musculoskeletal",
    scoring: "binary",
  },

  // Reproductive
  {
    id: 18,
    text: "Missed or irregular menstrual periods, infertility, or recurrent miscarriage",
    domain: "reproductive",
    scoring: "binary",
  },

  // Family/genetic risk
  {
    id: 19,
    text: "A first-degree relative (parent, sibling, child) has been diagnosed with celiac disease",
    domain: "family-risk",
    scoring: "binary",
    weight: 3,
  },

  // Associated autoimmune conditions
  {
    id: 20,
    text: "You have been diagnosed with type 1 diabetes, Hashimoto's, autoimmune liver disease, or Down syndrome",
    domain: "associated-conditions",
    scoring: "binary",
    weight: 2,
  },

  // Improvement on gluten-free
  {
    id: 21,
    text: "Your symptoms clearly improve when you avoid gluten",
    domain: "digestive",
    scoring: "binary",
    weight: 2,
  },
] as const;

export const CELIAC_TOTAL = CELIAC_QUESTIONS.length; // 21
export const CELIAC_DOMAIN_LABELS: Record<CeliacDomain, string> = {
  digestive: "Digestive symptoms",
  neurological: "Neurological & cognitive",
  "skin-mouth": "Skin & mouth",
  musculoskeletal: "Musculoskeletal & blood",
  reproductive: "Reproductive",
  "family-risk": "Family / genetic risk",
  "associated-conditions": "Associated autoimmune conditions",
};
