export interface BodyDysmorphiaTier {
  id: "very-low" | "low" | "moderate" | "elevated" | "high";
  label: string;
  /** Inclusive lower bound on the 20–100 raw score. */
  min: number;
  /** Inclusive upper bound on the 20–100 raw score. */
  max: number;
  range: string;
  headline: string;
  description: string;
  badge:
    | "badge-pure"
    | "badge-low"
    | "badge-moderate"
    | "badge-significant"
    | "badge-high";
}

/** Ordered low → high so lookups walk the array once. */
export const BODY_DYSMORPHIA_TIERS: readonly BodyDysmorphiaTier[] = [
  {
    id: "very-low",
    label: "Few signs of body dysmorphia",
    min: 20,
    max: 35,
    range: "20–35",
    headline: "Your answers point to few body-dysmorphia-related patterns.",
    description:
      "You scored well below the midpoint on the items drawn from clinical BDD screens. The pattern is a generally comfortable, flexible relationship with your appearance — occasional dissatisfaction without it becoming a fixation.",
    badge: "badge-pure",
  },
  {
    id: "low",
    label: "Mild appearance preoccupation",
    min: 36,
    max: 51,
    range: "36–51",
    headline: "You show mild appearance-related preoccupation.",
    description:
      "A handful of items felt familiar — maybe occasional mirror-checking or comparing to others — but the overall pattern is well within the range most adults endorse. Worth noticing, not yet a clinical concern.",
    badge: "badge-low",
  },
  {
    id: "moderate",
    label: "Moderate signs of body dysmorphia",
    min: 52,
    max: 67,
    range: "52–67",
    headline: "Your answers include a moderate cluster of BDD-related patterns.",
    description:
      "You endorsed enough of the statements to suggest persistent, distressing appearance focus. Many people score here without it becoming a disorder — but if these thoughts are eating into time, work, or relationships, it's worth a closer look.",
    badge: "badge-moderate",
  },
  {
    id: "elevated",
    label: "Elevated signs of body dysmorphia",
    min: 68,
    max: 83,
    range: "68–83",
    headline: "Your answers show elevated body-dysmorphia patterns.",
    description:
      "Most of the statements felt true to some degree — preoccupation with perceived flaws, ritualised checking or grooming, and clear distress. This isn't a diagnosis, but it overlaps meaningfully with the patterns clinicians screen for. A therapist who treats BDD can help clarify what's going on.",
    badge: "badge-significant",
  },
  {
    id: "high",
    label: "Strong signs of body dysmorphia",
    min: 84,
    max: 100,
    range: "84–100",
    headline: "Your answers align strongly with body dysmorphic disorder.",
    description:
      "You endorsed nearly every item at high intensity — extensive appearance worry, avoidance, checking or fixing rituals, and significant emotional cost. Self-tests can't diagnose BDD, but the pattern is consistent enough to warrant a conversation with a clinician. Cognitive-behavioural therapy and SSRIs both have evidence for BDD.",
    badge: "badge-high",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "Who is this body dysmorphia test for?",
    a: "Adults who want to understand whether their relationship with their appearance shows patterns associated with body dysmorphic disorder (BDD). The 20 items are adapted from established BDD screening measures and Psychology Today's clinical content.",
  },
  {
    q: "Is this a clinical diagnosis?",
    a: "No. BDD can only be diagnosed by a mental health professional after a structured clinical interview. This screener tells you whether your responses overlap with BDD trait patterns — it can't tell you whether you meet DSM-5 criteria.",
  },
  {
    q: "How is the score calculated?",
    a: "Each of the 20 statements is rated on a 5-point Likert scale (Strongly Disagree → Strongly Agree, scored 1–5). Your total falls between 20 and 100, banded into 5 tiers from 'Few signs' to 'Strong signs'.",
  },
  {
    q: "How accurate is a 20-item self-screen?",
    a: "Useful for self-reflection, not for diagnosis. Self-report screens for BDD work best as a starting point for conversation, especially because shame can lead to under-reporting. Treat your score as one data point in a bigger picture.",
  },
  {
    q: "What should I do if my score is elevated?",
    a: "Talk to a mental health professional, ideally one with experience treating BDD. Cognitive-behavioural therapy (specifically exposure and response prevention) and SSRIs have the strongest evidence base. You can also chat with August in this page to talk through what your score means.",
  },
  {
    q: "Sources",
    a: "Items are adapted from Psychology Today's Body Dysmorphia Test (psychologytoday.com) and align thematically with the Body Dysmorphic Disorder Questionnaire (BDDQ) and Yale-Brown Obsessive Compulsive Scale — BDD version (BDD-YBOCS).",
  },
] as const;

export const HOW_STEPS = [
  {
    label: "Read each statement",
    text: "20 short statements drawn from clinical and research instruments on this topic, presented one at a time.",
  },
  {
    label: "Rate your agreement",
    text: "Tap how strongly you agree, from Strongly Disagree to Strongly Agree. The next question appears automatically.",
  },
  {
    label: "See your tier",
    text: "Your responses are scored into a 5-tier banding so you know where on the spectrum you land.",
  },
] as const;

export const EXPECTATIONS = [
  {
    bold: "20 short questions",
    rest: "rated on a 5-point Strongly Disagree → Strongly Agree scale, one tap per item.",
  },
  {
    bold: "~3 minutes",
    rest: "to complete, totally anonymous, no answer leaves your browser.",
  },
  {
    bold: "Clinically grounded",
    rest: ", every item is adapted from published clinical or research instruments.",
  },
] as const;
