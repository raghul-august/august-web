import { buildSoftwareSchema, buildFaqSchema, buildMedicalWebpageSchema } from "@/app/utils/tools/tool-schema-helpers";

export const AUTISM_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What is the AQ-10 autism test?",
    a: "The AQ-10 is the 10-item Autism Spectrum Quotient — a short adult screening tool developed by Carrie Allison, Bonnie Auyeung, and Simon Baron-Cohen at the University of Cambridge in 2012. It is the screener the UK's NHS and NICE clinical guidelines recommend GPs use when an adult asks about an autism assessment. It is not a diagnostic test on its own; it is a 'red flag' tool that indicates whether a fuller assessment is warranted.",
  },
  {
    q: "How is the AQ-10 scored?",
    a: "Each of the 10 items scores 0 or 1. For four of the items (1, 2, 9, and 10 in the order shown here), answering Definitely or Slightly Agree scores 1 point. For the other six items, answering Definitely or Slightly Disagree scores 1 point. Your final score is the sum, between 0 and 10. The published referral threshold is 6 or higher — in the validation study, about 80% of adults who scored ≥6 went on to receive an autism diagnosis.",
  },
  {
    q: "Does a high score mean I am autistic?",
    a: "No. A high score on the AQ-10 means a full clinical assessment is very likely worth your time — it does not, on its own, mean you are autistic. Diagnosis is made by a trained clinician (a psychiatrist, clinical psychologist, or specialist autism diagnostic team) using a structured interview such as ADOS-2 or ADI-R, alongside a developmental history. The AQ-10 is a 2-minute screener — the actual diagnostic process usually takes several hours.",
  },
  {
    q: "Does a low score rule out autism?",
    a: "Not entirely. The AQ-10 has good sensitivity but is not perfect, and some autistic adults — particularly women, non-binary people, and anyone who has spent years masking or 'camouflaging' autistic traits — can score below the cut-off and still be autistic. If your lived experience strongly suggests autism but your score is low, instruments like the RAADS-R or the CAT-Q (Camouflaging Autistic Traits Questionnaire) are worth exploring, and a conversation with a clinician is still appropriate.",
  },
  {
    q: "Where do the 10 questions come from?",
    a: "The 10 items are taken verbatim from Allison, Auyeung and Baron-Cohen's 2012 paper 'Toward Brief \"Red Flags\" for Autism Screening' in the Journal of the American Academy of Child & Adolescent Psychiatry. They were selected from the original 50-item AQ as the subset that retained almost all of the longer instrument's predictive validity. The AQ-10 is a public-domain instrument intended for use as a free screening tool.",
  },
  {
    q: "Who is this test for?",
    a: "The AQ-10 is designed for adults aged 16 and older without a learning disability. There are separate AQ-Child and AQ-Adolescent versions for younger respondents. If you are filling this in for or about a child, the M-CHAT-R/F (18–30 months) or the AQ-Child (4–11) are more appropriate tools.",
  },
  {
    q: "Will my answers be saved or shared?",
    a: "No. Everything you answer stays in your browser. Nothing is sent to a server and nothing is stored after you close the page.",
  },
  {
    q: "What should I do with my score?",
    a: "If you scored 6 or higher and you have wondered whether you might be autistic, the most useful next step is usually to book an appointment with your GP or primary-care provider and ask about a referral for an adult autism assessment. Take a screenshot of this result with you — it is exactly the type of evidence GPs and referral pathways look for. If you scored below 6 but the questions resonated, consider exploring the longer AQ (50 items), the RAADS-R, or the CAT-Q for more nuanced information before deciding whether to seek a formal assessment.",
  },
];

export const AUTISM_HOW_STEPS: readonly { label: string; text: string }[] = [
  {
    label: "Answer 10 short statements",
    text: "The official AQ-10 items, drawn verbatim from the 2012 validation paper used by the NHS.",
  },
  {
    label: "Rate how strongly you agree",
    text: "Definitely Agree, Slightly Agree, Slightly Disagree, or Definitely Disagree — one tap per question.",
  },
  {
    label: "See your AQ-10 score",
    text: "A 0–10 score, your interpretation tier, and whether you meet the published referral cut-off (6+).",
  },
];

export const AUTISM_BENEFITS: readonly string[] = [
  "The NHS-recommended AQ-10 adult autism screener — verbatim",
  "Free, anonymous, and finished in about two minutes",
  "Validated cut-off (≥6) used by GPs to decide on referral",
  "Educational screening tool — never a clinical diagnosis",
];

export const AUTISM_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "AQ-10 Autism Test",
  "Free AQ-10 autism screening test — the 10-item Autism Spectrum Quotient adult screener used by the NHS. Get your 0–10 score and see whether you meet the published referral threshold in about two minutes.",
);

export const AUTISM_FAQ_SCHEMA = buildFaqSchema(AUTISM_FAQS);

export const AUTISM_MEDICAL_WEBPAGE_SCHEMA = buildMedicalWebpageSchema(
  "AQ-10 Autism Test (Adult Screener)",
  "Autism Spectrum Disorder",
  "F84.0",
  "2026-05-21",
);
