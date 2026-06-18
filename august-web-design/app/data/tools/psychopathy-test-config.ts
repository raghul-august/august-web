export interface PsychopathyTier {
  id: "very-low" | "low" | "moderate" | "elevated" | "high";
  label: string;
  min: number;
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
export const PSYCHOPATHY_TIERS: readonly PsychopathyTier[] = [
  {
    id: "very-low",
    label: "Few psychopathic traits",
    min: 20,
    max: 35,
    range: "20–35",
    headline: "Your answers show very few psychopathic traits.",
    description:
      "You scored well below the midpoint on the items drawn from the PCL-R, PPI, and Levenson Self-Report Psychopathy Scale. The pattern is one of empathy, conscientiousness, and discomfort with manipulating or hurting others.",
    badge: "badge-pure",
  },
  {
    id: "low",
    label: "Low psychopathic traits",
    min: 36,
    max: 51,
    range: "36–51",
    headline: "Your answers show low psychopathic traits.",
    description:
      "A handful of items felt familiar — maybe an occasional fearlessness or impatience with others’ feelings — but the overall pattern is well within typical range. This is where most adults sit on self-report psychopathy measures.",
    badge: "badge-low",
  },
  {
    id: "moderate",
    label: "Some psychopathic traits",
    min: 52,
    max: 67,
    range: "52–67",
    headline: "Your answers show a moderate cluster of psychopathic traits.",
    description:
      "You endorsed enough statements to suggest some grandiose, callous, or thrill-seeking patterns. Many people score here without it being a clinical concern, but if friends, partners, or coworkers have repeatedly flagged these traits as hurtful, it is worth a closer look.",
    badge: "badge-moderate",
  },
  {
    id: "elevated",
    label: "Elevated psychopathic traits",
    min: 68,
    max: 83,
    range: "68–83",
    headline: "Your answers show elevated psychopathic traits.",
    description:
      "Most of the statements felt true to some degree — fearlessness, manipulation, contempt for the rules. This isn’t a diagnosis on its own, but it overlaps meaningfully with the trait pattern researchers screen for. A mental health professional can tell you whether the pattern is causing harm and what changes the trajectory.",
    badge: "badge-significant",
  },
  {
    id: "high",
    label: "High psychopathic traits",
    min: 84,
    max: 100,
    range: "84–100",
    headline: "Your answers align strongly with psychopathic patterns.",
    description:
      "You endorsed nearly every item at high intensity — low empathy, manipulation, callousness, contempt for others’ struggles, and disregard for rules. Self-tests cannot diagnose psychopathy (that takes a structured clinical interview like the PCL-R), but the pattern is consistent and worth taking to a licensed mental health provider.",
    badge: "badge-high",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "Who is this psychopathy test for?",
    a: "Anyone curious about where they fall on the psychopathy spectrum. The 20 items are adapted from three established research instruments: the Hare Psychopathy Checklist–Revised (PCL-R), the Psychopathic Personality Inventory (PPI), and the Levenson Self-Report Psychopathy Scale. It is built for adults and is explicitly not a diagnosis.",
  },
  {
    q: "Is this a clinical diagnosis?",
    a: "No. The PCL-R, the gold-standard psychopathy assessment, is administered by trained clinicians in a structured interview with collateral information — not in a 20-question self-report. This screener tells you whether your responses overlap with the trait pattern researchers study; it cannot tell you whether you meet clinical criteria.",
  },
  {
    q: "What is the difference between psychopathy and antisocial personality disorder?",
    a: "Antisocial personality disorder (ASPD) is the DSM-5 diagnosis; it focuses on behaviour (lying, aggression, rule-breaking). Psychopathy is a research construct that adds interpersonal and affective traits — grandiosity, callousness, shallow affect. Most people with psychopathy meet ASPD criteria; most people with ASPD do not score high on psychopathy.",
  },
  {
    q: "How is the score calculated?",
    a: "Each of the 20 statements is rated 1–5 (Strongly Disagree → Strongly Agree). Five items are reverse-keyed — agreeing with an empathic statement counts as low psychopathy. Your total falls between 20 and 100 and is banded into 5 tiers.",
  },
  {
    q: "How accurate is a 20-item self-screen?",
    a: "Useful for self-reflection, not for diagnosis. Self-report screens for psychopathy have a known limitation: people very high in psychopathy may under-report (deliberate impression management) or over-report (admiring the traits). Treat your score as one data point.",
  },
  {
    q: "Sources",
    a: "Hare, R. — Hare Psychopathy Checklist–Revised (PCL-R). Lilienfeld, S., et al. — Psychopathic Personality Inventory (PPI). Levenson, M., et al. — Levenson Self-Report Psychopathy Scale.",
  },
] as const;

export const HOW_STEPS = [
  {
    label: "Read each statement",
    text: "20 short statements adapted from the PCL-R, PPI, and Levenson Self-Report Psychopathy Scale.",
  },
  {
    label: "Rate your agreement",
    text: "Tap how strongly you agree, from Strongly Disagree to Strongly Agree. The next question appears automatically.",
  },
  {
    label: "See your tier",
    text: "Your responses are scored into a 5-tier banding so you know where on the psychopathy spectrum you land.",
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
    bold: "Research-grounded",
    rest: ", every item is drawn from the PCL-R, PPI, or Levenson SRP inventories.",
  },
] as const;
