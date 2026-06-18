import { buildSoftwareSchema, buildFaqSchema } from "@/app/utils/tools/tool-schema-helpers";

export const SYMPTOMS_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What does this symptom checker actually do?",
    a: "It guides you through a short structured intake — sex, age, body region, primary symptom, duration, severity, and red-flag symptoms — then summarizes a care-urgency level, a short list of common causes, and self-care steps that match what you reported.",
  },
  {
    q: "Is this a diagnosis?",
    a: "No. This is an educational triage tool, not a diagnosis. It can’t see you, listen to your lungs, or run labs. A licensed clinician is the right person to evaluate, diagnose, and treat any symptom.",
  },
  {
    q: "How does the care-urgency level get decided?",
    a: "The tool weights red-flag symptoms (like chest pressure, trouble breathing, or sudden severe headache) the highest, then factors in severity, duration, and a few age/symptom-specific signals. Any single emergency red flag escalates the result to emergency care.",
  },
  {
    q: "When should I ignore the result and just call 911?",
    a: "If you have chest pain that doesn’t go away, trouble breathing, signs of a stroke (face droop, weakness on one side, trouble speaking), severe sudden headache, or any feeling that something is seriously wrong, call 911. The tool is not a substitute for emergency judgment.",
  },
  {
    q: "Will my answers be saved?",
    a: "No. Everything runs in your browser. Your answers are not stored or sent to a server.",
  },
  {
    q: "Why are some symptoms missing?",
    a: "We focused on the most common adult symptoms so the tool stays fast and easy. If your symptom isn’t listed, pick the closest body region and the most similar symptom, then describe the actual one in your visit notes.",
  },
  {
    q: "How accurate is this compared to seeing a doctor?",
    a: "Symptom checkers are useful for triage — figuring out whether you need to be seen, and how soon. They are far less accurate than an in-person evaluation for diagnosis. Treat the result as a starting point for a conversation, not a verdict.",
  },
  {
    q: "Can I use this for a child?",
    a: "Children under 18 have different baseline conditions and red flags. If you select the under-18 age band, please follow the conservative care guidance and contact a pediatrician for anything unusual.",
  },
];

export const SYMPTOMS_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "Symptoms Checker",
  "Free guided symptom checker. Pick a body region and primary symptom, answer a few short questions, and get a care-urgency recommendation with common causes and self-care steps.",
);

export const SYMPTOMS_FAQ_SCHEMA = buildFaqSchema(SYMPTOMS_FAQS);
