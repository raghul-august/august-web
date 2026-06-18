import { buildSoftwareSchema, buildFaqSchema } from "@/app/utils/tools/tool-schema-helpers";

export const COMPATIBILITY_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What does this compatibility test actually measure?",
    a: "How well your relationship lines up across five dimensions known to predict long-term satisfaction: communication, emotional intimacy, shared values and goals, conflict resolution, and lifestyle fit. You rate fifteen statements on a 5-point scale and the test combines them into an overall compatibility percentage plus a score for each dimension.",
  },
  {
    q: "How is the score calculated?",
    a: "Each of the fifteen statements is scored 1 (Strongly Disagree) to 5 (Strongly Agree). A handful are reverse-scored — agreeing with them lowers your compatibility number, disagreeing raises it. The raw sum (15–75) is rescaled to a percentage between 0 and 100, and the four interpretation tiers are: 0–30% limited alignment, 31–55% foundation in progress, 56–80% strong compatibility, 81–100% exceptional partnership.",
  },
  {
    q: "Is this a real prediction of whether we'll last?",
    a: "No. This is a self-reflection tool, not a forecast. Decades of relationship research show that how couples handle communication and repair after conflict matters more than any single snapshot of compatibility. Use the result as a conversation starter, not a verdict.",
  },
  {
    q: "Do I need my partner with me to take it?",
    a: "No — most people take it solo first to see what they think, then optionally retake it together. The most interesting results come from taking it twice (once each) and comparing where you agree and where you don't.",
  },
  {
    q: "Why ask for names if it's not name-based?",
    a: "Just for personalization. The names you enter only appear in your result copy on your own screen. Nothing is sent to a server and nothing is stored after you close the page.",
  },
  {
    q: "What if our score is low?",
    a: "A low score doesn't mean the relationship can't work — many couples rebuild from this point with intentional effort or with a therapist. It does mean the patterns the test surfaces are worth taking seriously, especially the dimension with the lowest sub-score. That's almost always where the next conversation belongs.",
  },
  {
    q: "How long does the test take?",
    a: "Most people finish in three to four minutes. Fifteen short statements, one tap per item.",
  },
  {
    q: "What dimensions does it cover?",
    a: "Communication (how safely you talk about hard things), emotional intimacy (how close and known you feel), shared values and goals (how aligned your futures are), conflict resolution (how you fight and repair), and lifestyle and rhythms (how your days, energy, and routines fit together).",
  },
];

export const COMPATIBILITY_HOW_STEPS: readonly { label: string; text: string }[] = [
  {
    label: "Enter both names",
    text: "Used only to personalize your result copy — nothing is sent to a server.",
  },
  {
    label: "Answer fifteen statements",
    text: "Rate each one on a 5-point scale from Strongly Disagree to Strongly Agree.",
  },
  {
    label: "See your compatibility profile",
    text: "Overall percentage, tier, and a breakdown across five relationship dimensions.",
  },
];

export const COMPATIBILITY_BENEFITS: readonly string[] = [
  "Built around five evidence-informed relationship dimensions",
  "Free, anonymous, answered in under four minutes",
  "Personalized result copy using both partners' names",
  "Dimension-by-dimension breakdown to show where to focus",
];

export const COMPATIBILITY_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "Love Compatibility Test",
  "Free 15-question love compatibility test that scores a relationship across communication, emotional intimacy, shared values, conflict resolution, and lifestyle fit. Personalized, anonymous, and answered in under four minutes.",
  "LifestyleApplication",
);

export const COMPATIBILITY_FAQ_SCHEMA = buildFaqSchema(COMPATIBILITY_FAQS);
