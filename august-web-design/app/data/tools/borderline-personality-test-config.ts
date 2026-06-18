import { buildSoftwareSchema, buildFaqSchema, buildMedicalWebpageSchema } from "@/app/utils/tools/tool-schema-helpers";

export const BPD_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What does this borderline personality disorder test measure?",
    a: "It checks how strongly you relate to twenty statements describing experiences and behaviour patterns associated with borderline personality disorder (BPD) — abandonment fears, emotional intensity, impulsivity, unstable identity, and unstable relationships. You rate each statement on a 5-point agree/disagree scale and the test sums your responses into a single score, then maps it into one of five interpretation tiers.",
  },
  {
    q: "How is this test scored?",
    a: "Each statement is scored 1 (Strongly Disagree) to 5 (Strongly Agree). Two items are reverse-scored — agreeing with them lowers the BPD-direction score, disagreeing raises it. The 20 item scores are summed for a total between 20 and 100. Higher totals indicate stronger overlap with BPD trait patterns: 20–36 very low, 37–52 low, 53–68 moderate, 69–84 elevated, 85–100 strong overlap.",
  },
  {
    q: "Is this a clinical diagnosis of BPD?",
    a: "No. This is an educational self-reflection tool. Borderline personality disorder can only be diagnosed by a qualified clinician — typically a psychiatrist or psychologist — through a structured interview that considers your history, the duration and pattern of these experiences, and rules out other conditions like complex PTSD, bipolar disorder, and ADHD that can look similar from the outside.",
  },
  {
    q: "Where do the questions come from?",
    a: "The 20 statements are adapted from the diagnostic criteria for borderline personality disorder in the DSM-5-TR (American Psychiatric Association) and from the format used in widely-cited public BPD screening tests. They cover the same nine BPD criteria: fear of abandonment, unstable relationships, identity disturbance, impulsivity, recurrent self-harm/suicidality, affective instability, emptiness, inappropriate anger, and transient dissociation or paranoia.",
  },
  {
    q: "Will my answers be saved or shared?",
    a: "No. Everything you enter stays in your browser. Your responses are not sent to a server and are not stored after you close the page.",
  },
  {
    q: "What if my score is in the elevated or high range?",
    a: "A high score doesn't diagnose BPD — but it does mean it's worth talking to a mental-health professional. BPD is one of the most treatable serious personality disorders: dialectical behaviour therapy (DBT), mentalization-based therapy (MBT), and schema therapy all have strong evidence. A clinician can confirm whether what you're experiencing is BPD, a related condition, or something else, and design a plan that fits.",
  },
  {
    q: "How long does the test take?",
    a: "Most people finish in three to five minutes. There are 20 short statements with one tap per item.",
  },
  {
    q: "I'm in crisis. What should I do?",
    a: "If you are in immediate danger or thinking about suicide or self-harm, please call or text 988 (the Suicide and Crisis Lifeline) in the US, or text HOME to 741741 to reach the Crisis Text Line. Outside the US, find your local hotline at findahelpline.com. You do not need a diagnosis to get help — call now and a real person will talk with you.",
  },
];

export const BPD_HOW_STEPS: readonly { label: string; text: string }[] = [
  {
    label: "Read each statement",
    text: "20 short first-person statements describing common BPD experiences.",
  },
  {
    label: "Rate your agreement",
    text: "Tap one of five options — from Strongly Disagree to Strongly Agree.",
  },
  {
    label: "See your tier",
    text: "Get an overall score plus an interpretation across five tiers and the statements you related to most strongly.",
  },
];

export const BPD_BENEFITS: readonly string[] = [
  "Based on the DSM-5-TR borderline personality disorder criteria",
  "Free, anonymous, and answered in under five minutes",
  "Five interpretation tiers from very-low to strong overlap",
  "Educational self-reflection — not a clinical diagnosis",
];

export const BPD_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "Borderline Personality Disorder (BPD) Test",
  "Free 20-question borderline personality disorder self-test based on the DSM-5-TR BPD criteria. Get your BPD trait score and interpretation tier in under five minutes.",
);

export const BPD_FAQ_SCHEMA = buildFaqSchema(BPD_FAQS);

export const BPD_MEDICAL_WEBPAGE_SCHEMA = buildMedicalWebpageSchema(
  "Borderline Personality Disorder (BPD) Test",
  "Borderline Personality Disorder",
  "F60.3",
  "2026-05-21",
);
