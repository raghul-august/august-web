import { buildSoftwareSchema, buildFaqSchema } from "@/app/utils/tools/tool-schema-helpers";

export const MENOPAUSE_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What's the average age of menopause?",
    a: "Across Western populations, the average age at natural menopause is 51, with most women reaching it between 45 and 55. Our calculator anchors to that 51 baseline and adjusts up or down based on the personal factors you enter.",
  },
  {
    q: "How is this prediction calculated?",
    a: "We start at the population mean (51 years) and weight maternal menopause age — the single strongest genetic predictor — together with ethnicity, smoking history, alcohol use, BMI, current cycle status, and a small set of health conditions documented to shift the timeline (PCOS, autoimmune disease, cancer treatment, hysterectomy, oophorectomy).",
  },
  {
    q: "Why is my mother's age so heavily weighted?",
    a: "Twin studies and the SWAN cohort consistently show that 50–60% of the variance in menopause age is heritable, with maternal age being the closest practical proxy. If you don't know your mother's age, the model falls back to the population mean and your other inputs carry more weight.",
  },
  {
    q: "Can smoking really change when I reach menopause?",
    a: "Yes. Meta-analyses put current smoking at roughly 1–2 years earlier menopause, with a dose–response relationship. Former smokers see a smaller residual effect that fades over time.",
  },
  {
    q: "What if I've had a hysterectomy or my ovaries removed?",
    a: "If both ovaries are removed (bilateral oophorectomy), menopause has already happened — surgically — regardless of natural timing. A hysterectomy that leaves the ovaries in place tends to bring natural menopause forward by about a year on average.",
  },
  {
    q: "What does 'irregular cycles' mean here?",
    a: "Irregular cycles late in the reproductive years are often the first sign of perimenopause. We use this as a mild signal that the transition may be closer than the genetic and lifestyle inputs alone would suggest.",
  },
  {
    q: "Is this a medical diagnosis?",
    a: "No. This is an educational estimate built from population-level epidemiology (primarily the SWAN study). Only a clinician — typically with cycle history and, when needed, FSH/estradiol or AMH testing — can assess where you actually are in the menopause transition.",
  },
  {
    q: "How accurate is the predicted age?",
    a: "Even the best-validated models predict menopause age to within roughly ±3 years for an individual. Treat the number as a planning anchor, not a date on the calendar.",
  },
  {
    q: "What can I do with this estimate?",
    a: "Use it to start conversations earlier — about hormone therapy options, bone density screening, cardiovascular risk, fertility planning, and symptom tracking. The transition is far more manageable when it's anticipated rather than reacted to.",
  },
];

export const MENOPAUSE_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "Menopause Age Calculator",
  "Estimate your menopause age from family history, lifestyle, cycle status, and health conditions. Free, no signup, no lab tests.",
);

export const MENOPAUSE_FAQ_SCHEMA = buildFaqSchema(MENOPAUSE_FAQS);
