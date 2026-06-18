export interface NarcissismTier {
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
    | "badge-low"
    | "badge-moderate"
    | "badge-significant"
    | "badge-high"
    | "badge-pure";
}

/** Ordered low → high so lookups walk the array once. */
export const NARCISSISM_TIERS: readonly NarcissismTier[] = [
  {
    id: "very-low",
    label: "Few narcissistic traits",
    min: 20,
    max: 35,
    range: "20–35",
    headline: "Your answers point to few narcissistic traits.",
    description:
      "You scored well below the midpoint on the items drawn from the NPI, NARQ, and B-PNI. The pattern is one of comfort with sharing the spotlight, a generally accurate view of your own importance, and willingness to learn from others.",
    badge: "badge-pure",
  },
  {
    id: "low",
    label: "Low narcissistic traits",
    min: 36,
    max: 51,
    range: "36–51",
    headline: "Your answers show a few narcissistic traits.",
    description:
      "A handful of items felt familiar maybe occasional fantasies of success, or a quiet wish to be noticed but the overall pattern is well within what most people endorse. This is the range a confident, healthy ego sits in.",
    badge: "badge-low",
  },
  {
    id: "moderate",
    label: "Some narcissistic traits",
    min: 52,
    max: 67,
    range: "52–67",
    headline: "Your answers include a moderate cluster of narcissistic traits.",
    description:
      "You endorsed enough of the statements to suggest some grandiose or entitled patterns are present. Many people score here without it becoming a problem — but if friends, partners, or coworkers have flagged these traits as hurtful, it’s worth a closer look.",
    badge: "badge-moderate",
  },
  {
    id: "elevated",
    label: "Elevated narcissistic traits",
    min: 68,
    max: 83,
    range: "68–83",
    headline: "Your answers show elevated narcissistic traits.",
    description:
      "Most of the statements felt true to some degree — a strong pull toward admiration, entitlement, and discounting others’ needs. This isn’t a diagnosis, but it overlaps meaningfully with the traits clinicians screen for. A therapist can help separate healthy confidence from patterns that get in your way.",
    badge: "badge-significant",
  },
  {
    id: "high",
    label: "High narcissistic traits",
    min: 84,
    max: 100,
    range: "84–100",
    headline: "Your answers align strongly with narcissistic patterns.",
    description:
      "You endorsed nearly every item at high intensity — grandiose self-image, entitlement, rivalry, and difficulty acknowledging vulnerability. Self-tests can’t diagnose narcissistic personality disorder, but the pattern is consistent enough to be worth taking to a clinician. Specialised therapies (transference-focused, schema, mentalisation-based) have real evidence behind them.",
    badge: "badge-high",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "Who is this narcissism test for?",
    a: "Anyone curious about where they fall on the narcissism spectrum. The 20 items are adapted from three standard inventories: the Narcissistic Personality Inventory (NPI), the Narcissistic Admiration and Rivalry Questionnaire (NARQ), and the Brief Pathological Narcissism Inventory (B-PNI). It’s built for adults and is explicitly not a diagnosis.",
  },
  {
    q: "Is this a clinical diagnosis?",
    a: "No. Narcissistic personality disorder (NPD) can only be diagnosed by a mental health professional after a structured clinical interview. This screener tells you whether your responses overlap with the trait pattern researchers use to study narcissism — it can’t tell you whether you meet DSM-5 criteria.",
  },
  {
    q: "How is the score calculated?",
    a: "Each of the 20 statements is rated on a 5-point Likert scale (Strongly Disagree → Strongly Agree, scored 1–5). Three items are reverse-keyed so that agreeing with the counter-narcissistic statement doesn’t inflate your score. Your total falls between 20 and 100, and we band it into 5 tiers.",
  },
  {
    q: "How accurate is a 20-item self-screen?",
    a: "Useful for self-reflection, not for diagnosis. Self-report screens for narcissism have a known limitation: people very high in narcissism sometimes under-report (because they don’t see the traits as flaws) or over-report (because they admire the qualities). Treat your score as one data point.",
  },
  {
    q: "What should I do if my score is elevated?",
    a: "If the description matches your experience and you’d like to understand it better, talking to a therapist is the most useful next step. Schema therapy, mentalisation-based treatment, and transference-focused psychotherapy all have evidence for narcissistic patterns. You can also chat with August inside this page to talk through what your score means without committing to anything.",
  },
  {
    q: "Sources",
    a: "Back, M.D., et al. — Narcissistic Admiration and Rivalry Questionnaire (NARQ). Raskin, R. & Terry, H. — Narcissistic Personality Inventory (NPI). Schoenleber, M., et al. — Brief Pathological Narcissism Inventory (B-PNI).",
  },
] as const;

export const HOW_STEPS = [
  {
    label: "Read each statement",
    text: "20 short statements about how you see yourself and others — adapted from the NPI, NARQ, and B-PNI.",
  },
  {
    label: "Rate your agreement",
    text: "Tap how strongly you agree, from Strongly Disagree to Strongly Agree. The next question appears automatically.",
  },
  {
    label: "See your tier",
    text: "Your responses get scored into a 5-tier banding so you know where on the spectrum you land.",
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
    rest: ", every item is drawn from the NPI, NARQ, or B-PNI research inventories.",
  },
] as const;
