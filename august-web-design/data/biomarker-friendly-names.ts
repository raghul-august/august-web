/**
 * Frontend mock layer for biomarker friendly names + plain-English notes.
 *
 * Source of truth in the long run is the gatekeeper `biomarker_mapping_data`
 * table with a curated `patient_friendly_name` column. Until that column ships
 * and the FHIR builder emits it, the frontend swaps abbreviation codes for
 * patient-readable names here so the Health tab demos cleanly.
 *
 * Lookup is alias-based and case-insensitive. Aliases mirror what the backend
 * actually emits as `Observation.code.text` today (raw lab abbreviations like
 * "E2", "Insul-F", "hs-CRP").
 */

export type LabFlagBucket = 'low' | 'normal' | 'high';

export interface BiomarkerFriendlyName {
  /** Strings the backend ships (Observation.code.text). Case-insensitive match. */
  aliases: string[];
  /** Title shown to the patient ("Estradiol"). */
  friendly: string;
  /** Subtitle shown under the title for clinical traceability ("Estradiol [Mass/volume] in Serum or Plasma"). Keep concise. */
  technical: string;
  /** One-liner explaining what the marker means at the current value level. */
  interpretation?: Partial<Record<LabFlagBucket, string>>;
  /** Conditions this marker most commonly relates to. Rendered as chips. */
  conditions?: string[];
}

export const biomarkerFriendlyNames: Record<string, BiomarkerFriendlyName> = {
  // ── Hormones ────────────────────────────────────────────────
  estradiol: {
    aliases: ['E2', 'Estradiol'],
    friendly: 'Estradiol',
    technical: 'E2 — estrogen hormone',
    interpretation: {
      high: 'Higher than the reference band. In men, often picked up alongside metabolic shifts.',
      normal: 'In the typical adult band.',
      low: 'Lower than the reference band.',
    },
    conditions: ['Hormonal balance'],
  },
  'total-testosterone': {
    aliases: ['Total Testosterone'],
    friendly: 'Total testosterone',
    technical: 'Total testosterone in blood',
    interpretation: {
      high: 'Above the typical adult range.',
      normal: 'In the typical adult band.',
      low: 'Below the typical adult range — worth a conversation about energy, mood, and muscle.',
    },
    conditions: ['Hormonal balance'],
  },
  'free-testosterone': {
    aliases: ['Free Testosterone'],
    friendly: 'Free testosterone',
    technical: 'The portion of testosterone actually available to tissues',
    interpretation: {
      high: 'Above range.',
      normal: 'In range — useful alongside total testosterone.',
      low: 'Below range — may indicate low active hormone even when total looks normal.',
    },
    conditions: ['Hormonal balance'],
  },
  shbg: {
    aliases: ['SHBG'],
    friendly: 'Sex hormone binding globulin',
    technical: 'SHBG — the carrier protein for testosterone and estradiol',
    interpretation: {
      high: 'Higher SHBG can pull free testosterone down even when total looks normal.',
      normal: 'In range.',
      low: 'Lower SHBG often tracks with insulin resistance.',
    },
    conditions: ['Hormonal balance'],
  },
  'insulin-fasting': {
    aliases: ['Insul-F', 'Insulin Fasting', 'Insulin, fasting'],
    friendly: 'Fasting insulin',
    technical: 'Insulin level in a fasted state — a window into insulin resistance',
    interpretation: {
      high: 'Above the upper bound — a strong early signal of insulin resistance, often before HbA1c moves.',
      normal: 'In range.',
      low: 'Unusually low — context matters.',
    },
    conditions: ['Insulin resistance', 'Pre-diabetes'],
  },

  // ── Glucose / Diabetes ──────────────────────────────────────
  hba1c: {
    aliases: ['HbA1c', 'A1C', 'Hemoglobin A1c'],
    friendly: 'HbA1c (3-month sugar)',
    technical: 'Average blood sugar over the past 2-3 months',
    interpretation: {
      high: 'Above the non-diabetic threshold (5.7%). 5.7-6.4% reads as pre-diabetic, ≥6.5% as diabetic.',
      normal: 'In the non-diabetic range.',
      low: 'Lower than typical — usually nothing to worry about on its own.',
    },
    conditions: ['Type 2 diabetes', 'Pre-diabetes'],
  },
  'glucose-fasting': {
    aliases: ['Glucose Fasting', 'Fasting Glucose'],
    friendly: 'Fasting glucose',
    technical: 'Blood sugar measured after an overnight fast',
    interpretation: {
      high: 'Above the non-diabetic threshold (100 mg/dL). 100-125 is pre-diabetic, ≥126 is diabetic.',
      normal: 'In the non-diabetic range.',
      low: 'Below typical — worth flagging if you felt shaky or off.',
    },
    conditions: ['Type 2 diabetes', 'Pre-diabetes'],
  },

  // ── Lipids ──────────────────────────────────────────────────
  'total-cholesterol': {
    aliases: ['T-Chol', 'Total Cholesterol', 'Cholesterol Total'],
    friendly: 'Total cholesterol',
    technical: 'Sum of LDL, HDL, and other cholesterol carriers',
    interpretation: {
      high: 'Above 200 mg/dL. The LDL and HDL breakdown tells the full story.',
      normal: 'In the desirable band.',
      low: 'Below typical — usually fine unless persistent.',
    },
    conditions: ['Heart health'],
  },
  'ldl-cholesterol': {
    aliases: ['LDL-C', 'LDL', 'LDL Cholesterol'],
    friendly: 'LDL cholesterol',
    technical: 'The "bad" cholesterol — main driver of plaque buildup',
    interpretation: {
      high: 'Above optimal (100 mg/dL). 130-159 borderline, 160-189 high, ≥190 very high.',
      normal: 'In optimal range.',
      low: 'Below typical.',
    },
    conditions: ['Heart health'],
  },
  'hdl-cholesterol': {
    aliases: ['HDL-C', 'HDL', 'HDL Cholesterol'],
    friendly: 'HDL cholesterol',
    technical: 'The "good" cholesterol — protective for the heart',
    interpretation: {
      high: 'Higher HDL is protective.',
      normal: 'In a healthy band.',
      low: 'Below 40 mg/dL in men (50 in women). Lower HDL means less protection — exercise and omega-3s tend to lift it.',
    },
    conditions: ['Heart health'],
  },
  triglycerides: {
    aliases: ['Trig', 'Triglycerides', 'TG'],
    friendly: 'Triglycerides',
    technical: 'Storage fat circulating in blood — sensitive to sugar and alcohol',
    interpretation: {
      high: 'Above 150 mg/dL. Cutting refined carbs and alcohol typically brings this down quickly.',
      normal: 'In the desirable band.',
      low: 'Below typical.',
    },
    conditions: ['Heart health', 'Insulin resistance'],
  },
  'vldl-cholesterol': {
    aliases: ['VLDL-C', 'VLDL'],
    friendly: 'VLDL cholesterol',
    technical: 'Very-low-density carrier — mostly reflects triglycerides',
    interpretation: {
      high: 'Above the typical band — tracks with triglycerides.',
      normal: 'In range.',
    },
    conditions: ['Heart health'],
  },
  'apo-b': {
    aliases: ['ApoB', 'Apo B', 'Apolipoprotein B'],
    friendly: 'Apolipoprotein B',
    technical: 'ApoB — count of atherogenic particles. Often more predictive than LDL.',
    interpretation: {
      high: 'Above the recommended band. ApoB is the particle-count view of cardiovascular risk.',
      normal: 'In a healthy band.',
      low: 'Below typical.',
    },
    conditions: ['Heart health'],
  },
  'apo-a1': {
    aliases: ['ApoA1', 'Apo A1', 'Apolipoprotein A1'],
    friendly: 'Apolipoprotein A1',
    technical: 'ApoA1 — main protein on HDL particles. Higher is protective.',
    interpretation: {
      high: 'Higher tracks with stronger HDL function.',
      normal: 'In a healthy band.',
      low: 'Below typical.',
    },
    conditions: ['Heart health'],
  },
  lpa: {
    aliases: ['Lp(a)', 'Lipoprotein(a)', 'LP(A)'],
    friendly: 'Lipoprotein(a)',
    technical: 'Lp(a) — a genetically-determined cardiovascular risk marker',
    interpretation: {
      high: 'Above 30 mg/dL — independent risk factor, mostly genetic.',
      normal: 'In a low-risk band.',
    },
    conditions: ['Heart health'],
  },
  'hs-crp': {
    aliases: ['hs-CRP', 'CRP', 'High-sensitivity CRP'],
    friendly: 'High-sensitivity CRP',
    technical: 'hs-CRP — a sensitive marker of low-grade inflammation',
    interpretation: {
      high: 'Above 3 mg/L points to elevated inflammation. Above 1-3 is average risk.',
      normal: 'Below 1 mg/L — low inflammatory load.',
      low: 'Very low.',
    },
    conditions: ['Heart health', 'Inflammation'],
  },
  'chol-hdl-ratio': {
    aliases: ['C/HDL', 'Chol/HDL', 'Cholesterol/HDL Ratio'],
    friendly: 'Cholesterol-to-HDL ratio',
    technical: 'Total cholesterol divided by HDL — quick risk shorthand',
    interpretation: {
      high: 'Above the desirable band. Often pulled down by raising HDL.',
      normal: 'In a healthy band.',
    },
    conditions: ['Heart health'],
  },
  'ldl-hdl-ratio': {
    aliases: ['LDL/HDL', 'LDL-HDL Ratio'],
    friendly: 'LDL-to-HDL ratio',
    technical: 'LDL divided by HDL — quick atherogenic-vs-protective shorthand',
    interpretation: {
      high: 'Above the desirable band.',
      normal: 'In a healthy band.',
    },
    conditions: ['Heart health'],
  },

  // ── CBC ─────────────────────────────────────────────────────
  hemoglobin: {
    aliases: ['Hgb', 'Hemoglobin', 'HGB'],
    friendly: 'Hemoglobin',
    technical: 'Oxygen-carrying protein in red blood cells',
    interpretation: {
      high: 'Above the typical band — can hint at dehydration or higher red-cell production.',
      normal: 'Carrying oxygen well.',
      low: 'Below the typical band — anemia screen is the usual next step.',
    },
    conditions: ['Anemia'],
  },
  hematocrit: {
    aliases: ['Hematocrit', 'HCT', 'PCV'],
    friendly: 'Hematocrit',
    technical: 'Share of blood made up of red cells',
    interpretation: {
      high: 'Above typical.',
      normal: 'In range.',
      low: 'Below typical — often parallels hemoglobin.',
    },
    conditions: ['Anemia'],
  },
  rbc: {
    aliases: ['RBC', 'Red Blood Cells', 'rbc-blood'],
    friendly: 'Red blood cells',
    technical: 'Total red-cell count',
    interpretation: {
      high: 'Above the typical band.',
      normal: 'Healthy red-cell count.',
      low: 'Below typical — paired with hemoglobin for anemia screen.',
    },
  },
  wbc: {
    aliases: ['WBC', 'White Blood Cells'],
    friendly: 'White blood cells',
    technical: 'Total immune-cell count in blood',
    interpretation: {
      high: 'Above typical — often a response to infection or stress.',
      normal: 'Healthy immune-cell count.',
      low: 'Below typical — context matters.',
    },
    conditions: ['Immune'],
  },
  platelets: {
    aliases: ['Platelets', 'PLT'],
    friendly: 'Platelets',
    technical: 'Clotting cells',
    interpretation: {
      high: 'Above typical.',
      normal: 'Healthy clotting reserve.',
      low: 'Below typical — bruising or bleeding risk if very low.',
    },
  },
  mcv: {
    aliases: ['MCV'],
    friendly: 'Mean cell volume',
    technical: 'MCV — average size of red cells',
    interpretation: {
      high: 'Larger cells — common with low B12 or folate.',
      normal: 'In range.',
      low: 'Smaller cells — classic iron-deficiency signature.',
    },
  },
  mch: {
    aliases: ['MCH'],
    friendly: 'Hemoglobin per cell',
    technical: 'MCH — average hemoglobin amount per red cell',
    interpretation: {
      high: 'Above typical.',
      normal: 'In range.',
      low: 'Below typical — pairs with low iron stores.',
    },
  },
  mchc: {
    aliases: ['MCHC'],
    friendly: 'Hemoglobin concentration',
    technical: 'MCHC — hemoglobin density inside red cells',
    interpretation: {
      high: 'Above typical.',
      normal: 'In range.',
      low: 'Below typical.',
    },
  },
  mpv: {
    aliases: ['MPV'],
    friendly: 'Mean platelet volume',
    technical: 'Average platelet size',
    interpretation: {
      high: 'Above typical.',
      normal: 'In range.',
      low: 'Below typical.',
    },
  },
  'eosinophils-percentage': {
    aliases: ['Eosinophils Percentage', 'Eosinophils %', 'Eos %'],
    friendly: 'Eosinophils',
    technical: 'Eosinophil share of white cells — allergy/parasite signal',
    interpretation: {
      high: 'Above typical — often allergies or parasitic exposure.',
      normal: 'In range.',
    },
    conditions: ['Allergy', 'Immune'],
  },
  'eosinophils-absolute': {
    aliases: ['Eosinophils Absolute', 'Eos Absolute'],
    friendly: 'Eosinophils (count)',
    technical: 'Absolute eosinophil count',
    interpretation: {
      high: 'Above typical — allergy or parasite signal.',
      normal: 'In range.',
    },
    conditions: ['Allergy', 'Immune'],
  },
  esr: {
    aliases: ['ESR'],
    friendly: 'ESR (inflammation)',
    technical: 'Erythrocyte sedimentation rate — non-specific inflammation signal',
    interpretation: {
      high: 'Above typical — inflammation somewhere; non-specific.',
      normal: 'In range.',
    },
    conditions: ['Inflammation'],
  },

  // ── Kidney ──────────────────────────────────────────────────
  creatinine: {
    aliases: ['Creatinine'],
    friendly: 'Creatinine',
    technical: 'Muscle breakdown product filtered by kidneys',
    interpretation: {
      high: 'Above typical — kidneys filtering less efficiently, or just high muscle mass.',
      normal: 'Kidneys are filtering well.',
      low: 'Below typical — usually fine unless paired with other signals.',
    },
    conditions: ['Kidney health'],
  },
  bun: {
    aliases: ['BUN', 'Blood Urea Nitrogen'],
    friendly: 'BUN (kidney filter)',
    technical: 'Blood urea nitrogen — a kidney-function and hydration signal',
    interpretation: {
      high: 'Above typical — kidneys, dehydration, or high-protein diet.',
      normal: 'In range.',
      low: 'Below typical.',
    },
    conditions: ['Kidney health'],
  },
  urea: {
    aliases: ['Blood Urea', 'Urea'],
    friendly: 'Urea',
    technical: 'Blood urea — kidney filtration + hydration signal',
    interpretation: {
      high: 'Above typical.',
      normal: 'In range.',
      low: 'Below typical.',
    },
    conditions: ['Kidney health'],
  },
  egfr: {
    aliases: ['eGFR'],
    friendly: 'Kidney filtration rate',
    technical: 'eGFR — estimated glomerular filtration rate',
    interpretation: {
      high: 'Above typical.',
      normal: 'Healthy filtration rate.',
      low: 'Below typical — flag if persistent.',
    },
    conditions: ['Kidney health'],
  },
  'uric-acid': {
    aliases: ['Uric Acid'],
    friendly: 'Uric acid',
    technical: 'Purine breakdown product — high levels link to gout',
    interpretation: {
      high: 'Above typical — gout risk; meat, beer, and fructose are common drivers.',
      normal: 'In range.',
      low: 'Below typical.',
    },
    conditions: ['Gout'],
  },

  // ── Liver ───────────────────────────────────────────────────
  alt: {
    aliases: ['ALT'],
    friendly: 'ALT (liver enzyme)',
    technical: 'Alanine aminotransferase — leaks when liver cells are stressed',
    interpretation: {
      high: 'Above typical — fatty liver, alcohol, or medication often the culprit.',
      normal: 'In range.',
      low: 'Below typical — usually fine.',
    },
    conditions: ['Liver health'],
  },
  ast: {
    aliases: ['AST'],
    friendly: 'AST (liver enzyme)',
    technical: 'Aspartate aminotransferase — liver and muscle enzyme',
    interpretation: {
      high: 'Above typical — liver, muscle, or recent intense exercise.',
      normal: 'In range.',
      low: 'Below typical.',
    },
    conditions: ['Liver health'],
  },
  alp: {
    aliases: ['ALP'],
    friendly: 'Alkaline phosphatase',
    technical: 'ALP — liver and bone enzyme',
    interpretation: {
      high: 'Above typical — liver or bone source.',
      normal: 'In range.',
      low: 'Below typical.',
    },
    conditions: ['Liver health', 'Bone health'],
  },
  ggt: {
    aliases: ['GGT'],
    friendly: 'GGT (liver enzyme)',
    technical: 'Gamma-glutamyl transferase — sensitive to alcohol and bile-duct stress',
    interpretation: {
      high: 'Above typical — alcohol or fatty liver often involved.',
      normal: 'In range.',
      low: 'Below typical.',
    },
    conditions: ['Liver health'],
  },
  'bilirubin-total': {
    aliases: ['Bilirubin Total'],
    friendly: 'Bilirubin (total)',
    technical: 'Sum of direct + indirect bilirubin — a red-cell breakdown product',
    interpretation: {
      high: 'Above typical — Gilbert syndrome or liver-clearance issues.',
      normal: 'In range.',
      low: 'Below typical.',
    },
    conditions: ['Liver health'],
  },
  'bilirubin-direct': {
    aliases: ['Bilirubin Direct'],
    friendly: 'Bilirubin (direct)',
    technical: 'Conjugated bilirubin — should be very low',
    interpretation: {
      high: 'Above typical — bile-duct or liver-clearance issue.',
      normal: 'In range.',
    },
    conditions: ['Liver health'],
  },
  'bilirubin-indirect': {
    aliases: ['Bilirubin Indirect'],
    friendly: 'Bilirubin (indirect)',
    technical: 'Unconjugated bilirubin — pre-liver source',
    interpretation: {
      high: 'Above typical — Gilbert is the most common benign cause.',
      normal: 'In range.',
    },
    conditions: ['Liver health'],
  },
  albumin: {
    aliases: ['Albumin'],
    friendly: 'Albumin',
    technical: 'Main protein in blood — liver makes it; pulled down by inflammation',
    interpretation: {
      high: 'Above typical — usually dehydration.',
      normal: 'In range.',
      low: 'Below typical — nutritional or inflammatory.',
    },
    conditions: ['Liver health', 'Nutrition'],
  },
  globulin: {
    aliases: ['Globulin Total', 'Globulin'],
    friendly: 'Globulin',
    technical: 'Antibody-bearing protein fraction in blood',
    interpretation: {
      high: 'Above typical — chronic inflammation or immune activity.',
      normal: 'In range.',
      low: 'Below typical.',
    },
  },
  'alb-glob-ratio': {
    aliases: ['Alb/Glob', 'A/G Ratio'],
    friendly: 'Albumin/globulin ratio',
    technical: 'Quick read on protein balance',
    interpretation: {
      high: 'Above typical.',
      normal: 'In range.',
      low: 'Below typical — usually reflects high globulin.',
    },
  },

  // ── Electrolytes ────────────────────────────────────────────
  sodium: {
    aliases: ['Sodium', 'Na'],
    friendly: 'Sodium',
    technical: 'Main blood electrolyte — water balance',
    interpretation: {
      high: 'Above typical — usually dehydration.',
      normal: 'Electrolytes balanced.',
      low: 'Below typical.',
    },
  },
  potassium: {
    aliases: ['Potassium', 'K'],
    friendly: 'Potassium',
    technical: 'Heart and muscle electrolyte',
    interpretation: {
      high: 'Above typical — needs attention; affects heart rhythm.',
      normal: 'In range.',
      low: 'Below typical — affects heart rhythm.',
    },
  },
  chloride: {
    aliases: ['Chloride', 'Cl'],
    friendly: 'Chloride',
    technical: 'Electrolyte partner of sodium',
    interpretation: {
      high: 'Above typical.',
      normal: 'In range.',
      low: 'Below typical.',
    },
  },
  calcium: {
    aliases: ['Calcium', 'Ca'],
    friendly: 'Calcium',
    technical: 'Bone, muscle, and nerve electrolyte',
    interpretation: {
      high: 'Above typical — parathyroid worth checking.',
      normal: 'In range.',
      low: 'Below typical — vitamin D and parathyroid worth checking.',
    },
    conditions: ['Bone health'],
  },

  // ── Iron / Vitamins ─────────────────────────────────────────
  ferritin: {
    aliases: ['Ferritin'],
    friendly: 'Ferritin (iron stores)',
    technical: 'Iron storage protein — best single read of total body iron',
    interpretation: {
      high: 'Above typical — can mean iron overload or inflammation.',
      normal: 'Iron stores in healthy range.',
      low: 'Below typical — early sign of iron deficiency, often before hemoglobin drops.',
    },
    conditions: ['Anemia'],
  },
  iron: {
    aliases: ['Iron'],
    friendly: 'Serum iron',
    technical: 'Iron circulating in blood right now',
    interpretation: {
      high: 'Above typical.',
      normal: 'In range.',
      low: 'Below typical.',
    },
    conditions: ['Anemia'],
  },
  'vitamin-d': {
    aliases: ['25-OH D3', '25 OH Vitamin D', 'Vitamin D', '25(OH)D'],
    friendly: 'Vitamin D',
    technical: '25-hydroxyvitamin D — the storage form measured in blood',
    interpretation: {
      high: 'Above 100 ng/mL — high but rarely problematic.',
      normal: 'In the sufficient band (30-100 ng/mL).',
      low: 'Below 30 ng/mL — deficiency common in India even with sun exposure; supplementation usually fixes it.',
    },
    conditions: ['Vitamin D deficiency', 'Bone health'],
  },
  'vitamin-b12': {
    aliases: ['Vit B12', 'Vitamin B12', 'B12'],
    friendly: 'Vitamin B12',
    technical: 'Nerve and red-cell vitamin — comes from animal foods',
    interpretation: {
      high: 'Above typical — usually fine.',
      normal: 'In range.',
      low: 'Below 200 pg/mL — neurologic symptoms possible; vegetarians and PPI users are at higher risk.',
    },
    conditions: ['Nutrition'],
  },

  // ── Thyroid ─────────────────────────────────────────────────
  tsh: {
    aliases: ['TSH'],
    friendly: 'TSH (thyroid signal)',
    technical: 'Brain signal that drives thyroid output',
    interpretation: {
      high: 'Above typical — pituitary pushing harder; often means underactive thyroid.',
      normal: 'In range.',
      low: 'Below typical — thyroid running hot, or excess levothyroxine.',
    },
    conditions: ['Thyroid health'],
  },
  'free-t4': {
    aliases: ['Free T4', 'FT4'],
    friendly: 'Free T4',
    technical: 'Active thyroid hormone in circulation',
    interpretation: {
      high: 'Above typical — overactive thyroid.',
      normal: 'Active thyroid hormone in target.',
      low: 'Below typical — underactive thyroid.',
    },
    conditions: ['Thyroid health'],
  },
  'free-t3': {
    aliases: ['Free T3', 'FT3'],
    friendly: 'Free T3',
    technical: 'The more active form of thyroid hormone',
    interpretation: {
      high: 'Above typical — overactive thyroid.',
      normal: 'In range.',
      low: 'Below typical.',
    },
    conditions: ['Thyroid health'],
  },
};

/**
 * Build a flat alias-lookup table for runtime resolution. Aliases are
 * case-insensitive, whitespace-collapsed, and stripped of leading/trailing
 * spaces so backend "  E2  " still resolves.
 */
const aliasIndex: Map<string, BiomarkerFriendlyName> = (() => {
  const out = new Map<string, BiomarkerFriendlyName>();
  for (const entry of Object.values(biomarkerFriendlyNames)) {
    for (const alias of entry.aliases) {
      out.set(alias.trim().toLowerCase(), entry);
    }
  }
  return out;
})();

export function lookupBiomarker(name: string | null | undefined): BiomarkerFriendlyName | null {
  if (!name) return null;
  const key = String(name).trim().toLowerCase();
  return aliasIndex.get(key) ?? null;
}
