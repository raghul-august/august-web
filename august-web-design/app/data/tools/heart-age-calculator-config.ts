import { buildSoftwareSchema, buildFaqSchema } from "@/app/utils/tools/tool-schema-helpers";

export const HEART_AGE_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What is heart age?",
    a: "Heart age is the age your cardiovascular system appears to be based on your risk factors. If yours is higher than your chronological age, your habits and metrics suggest your heart is ageing faster than the calendar.",
  },
  {
    q: "How is heart age calculated?",
    a: "This calculator uses the non-laboratory Framingham general cardiovascular risk model (D'Agostino et al., 2008). It takes age, sex, BMI, blood pressure category, smoking status, and diabetes — no blood tests required — and compares your projected 10-year risk to an ideal profile for someone of your sex.",
  },
  {
    q: "Why no cholesterol or HDL inputs?",
    a: "The non-laboratory Framingham model intentionally swaps cholesterol values for BMI so the tool works without lab results. Performance is comparable for most adults, though the lab-based model is slightly more precise.",
  },
  {
    q: "What blood pressure should I enter if I don't know mine?",
    a: "Pick 'Don't know.' The calculator uses a population-average systolic value when no reading is provided. For a more accurate number, get your blood pressure measured and re-run the tool.",
  },
  {
    q: "Is this a medical diagnosis?",
    a: "No. Heart age is an educational estimate based on a published statistical model. It's not a replacement for a clinical cardiovascular risk assessment by a doctor.",
  },
  {
    q: "Who is the model validated for?",
    a: "The Framingham general CVD model is validated for adults aged 30–74 without prior cardiovascular disease. Outside that range the estimate is less reliable.",
  },
  {
    q: "What can lower my heart age?",
    a: "Quitting smoking, getting blood pressure into the normal range, reaching a healthy BMI, and managing diabetes all reduce projected cardiovascular risk — and therefore heart age — within the same model.",
  },
  {
    q: "Why does my heart age differ from another online calculator?",
    a: "Heart-age calculators use different models (Framingham lab, Framingham non-lab, QRISK, ASCVD). Inputs and coefficients differ, so the same person can get different numbers. The trend — and what changes it — matters more than the exact value.",
  },
];

export const HEART_AGE_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "Heart Age Calculator",
  "Estimate your heart age using the non-laboratory Framingham cardiovascular risk model. Free, no signup, no lab values needed.",
);

export const HEART_AGE_FAQ_SCHEMA = buildFaqSchema(HEART_AGE_FAQS);
