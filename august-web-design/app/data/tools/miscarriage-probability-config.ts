// Pure data config for the Miscarriage Probability / Reassurer tool. No React.

import { buildSoftwareSchema, buildFaqSchema } from "@/app/utils/tools/tool-schema-helpers";

export const MISCARRIAGE_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What does this calculator tell me?",
    a: "Two things. First, it estimates the probability that your pregnancy will end in a miscarriage from your current gestational age through 20 weeks. Second, it shows the complementary 'reassurer' number — the probability the pregnancy continues past 20 weeks — which rises sharply as the first trimester progresses.",
  },
  {
    q: "Where does the model come from?",
    a: "The lookup table and risk-factor multipliers come from Datayze's Miscarriage Reassurer (datayze.com/miscarriage-reassurer), which Datayze synthesised from peer-reviewed studies including Mukherjee 2013 and Wang 2002. The implementation here reproduces Datayze's table and combination logic verbatim so the numbers match.",
  },
  {
    q: "Why does the risk drop so quickly?",
    a: "Most miscarriages occur in the first trimester, especially between 4 and 8 weeks of gestation. By 12 weeks the cumulative remaining risk is under 2%, and by 16 weeks it is under 1%. A pregnancy that has already reached 10 weeks faces dramatically less remaining risk than one that has just reached 5 weeks — that is exactly what the reassurer captures.",
  },
  {
    q: "How does the calculator combine my risk factors?",
    a: "Each non-blank input pushes a multiplier into a list: age (×0.94 if <35, ×1.30 if 35–39, ×2.46 if ≥40), prior live births (×1.03 if 0, ×0.71 if ≥1), prior miscarriages (×0.98 if <3, ×1.89 if ≥3), and BMI from height + weight (×0.86 if <25, ×1.12 if 25–29.9, ×1.48 if 30–34.9, ×1.89 if ≥35). The multipliers are then averaged (arithmetic mean) and applied to the table value. This mirrors Datayze exactly.",
  },
  {
    q: "Why averaging instead of multiplying?",
    a: "Statistically, independent risk factors would normally multiply (or log-multiply in a regression). Datayze averages them instead, which means adding a 'healthy' factor next to a high-risk one *dampens* the adjustment. We preserve this so the output matches the published tool. If you want a stricter independent-multiplier model, this is the right place to fork.",
  },
  {
    q: "Does the tool account for IVF, ART, or known fertility diagnoses?",
    a: "No. The model is population-level. If you used IVF, ICSI, or are managing a fertility diagnosis, your risk profile may differ — talk with your reproductive endocrinologist or OB-GYN.",
  },
  {
    q: "Is this a medical recommendation?",
    a: "No. It is an educational estimator only. It does not see your ultrasound findings, lab work, medications, or medical history beyond the inputs above. If you have any concern about your pregnancy, contact your healthcare team.",
  },
  {
    q: "Why does the tool stop at 20 weeks?",
    a: "Loss after 20 weeks is classified as stillbirth, not miscarriage, and follows a different risk model. Datayze's table is zero-anchored at 20w0d, which is the standard clinical cutoff used here.",
  },
];

export const MISCARRIAGE_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "Miscarriage Probability / Reassurer",
  "Free miscarriage probability and reassurer calculator. Personalised remaining miscarriage risk and the probability your pregnancy continues past 20 weeks, based on maternal age, gestational age, BMI, prior live births, and prior miscarriages.",
);

export const MISCARRIAGE_FAQ_SCHEMA = buildFaqSchema(MISCARRIAGE_FAQS);
