import { buildSoftwareSchema, buildFaqSchema } from "@/app/utils/tools/tool-schema-helpers";

export const ANGER_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What does this anger test actually measure?",
    a: "It measures how readily everyday situations provoke an anger reaction in you. You rate 25 short scenarios on a 5-point scale and the test sums your responses into an overall reactivity score, then compares it against published norms.",
  },
  {
    q: "How is this anger test scored?",
    a: "Each of the 25 items is scored 0 to 4 (Not at all → Very much). Your total ranges from 0 to 100. Higher totals indicate stronger and more frequent anger responses to common provocations. Scores under 45 are below average; 46–55 is average; 56–75 is above average; 76–85 is high; 86–100 is very high.",
  },
  {
    q: "Is this a clinical diagnosis?",
    a: "No. This is an educational self-assessment based on the Novaco Anger Inventory short form. It cannot diagnose an anger disorder or any mental health condition. A licensed clinician is the right person to evaluate whether anger is interfering with your life.",
  },
  {
    q: "Where does this test come from?",
    a: "The items are adapted from the Novaco Anger Inventory (Novaco, 1975; Devilly, 2004), one of the longest-running self-report measures of anger reactivity used in research and clinical settings.",
  },
  {
    q: "Will my answers be saved or shared?",
    a: "No. Everything you enter is processed in your browser and your responses are not sent to a server or stored.",
  },
  {
    q: "What can I do if my score is high?",
    a: "High anger reactivity is one of the best-studied targets of cognitive behavioural therapy. Working with a therapist, building reliable cool-down routines (timeouts, slow breathing, exercise), and reducing alcohol and sleep debt all reliably lower anger responses over time.",
  },
  {
    q: "How long does the test take?",
    a: "Most people finish in under five minutes. There are 25 short scenarios and one tap per item.",
  },
  {
    q: "Does my score change over time?",
    a: "Yes. Anger reactivity reflects recent stress, sleep, and life circumstances as well as long-term patterns. People often see meaningful changes after a few weeks of stress reduction, therapy, or lifestyle changes.",
  },
];

export const ANGER_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "Anger Management Test",
  "Free 25-question anger self-assessment based on the Novaco Anger Inventory. Get your anger reactivity score and where you fall against published norms.",
);

export const ANGER_FAQ_SCHEMA = buildFaqSchema(ANGER_FAQS);
