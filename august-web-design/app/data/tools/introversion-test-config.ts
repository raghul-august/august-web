export interface IntroversionTier {
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
export const INTROVERSION_TIERS: readonly IntroversionTier[] = [
  {
    id: "very-low",
    label: "Strong Introvert",
    min: 20,
    max: 35,
    range: "20–35",
    headline: "You sit firmly on the introverted end of the spectrum.",
    description:
      "You answered like someone who recharges through solitude, prefers depth over breadth, and finds large social settings draining. You probably do your best thinking alone, and friendships tend to be few and close rather than many and casual.",
    badge: "badge-pure",
  },
  {
    id: "low",
    label: "Lean Introvert",
    min: 36,
    max: 51,
    range: "36–51",
    headline: "You lean introverted with some extroverted moments.",
    description:
      "You're recognisably introverted — most items pointing to quiet recharge, smaller groups, and inward reflection rang true — but you can flex into extroverted modes when needed. This is the most common 'introvert' profile.",
    badge: "badge-low",
  },
  {
    id: "moderate",
    label: "Ambivert",
    min: 52,
    max: 67,
    range: "52–67",
    headline: "You sit in the middle of the spectrum — an ambivert.",
    description:
      "You enjoy people and you enjoy solitude in roughly equal measure. You can light up a room and you can disappear into a book. Ambiverts are arguably the largest single group on the spectrum and tend to be highly adaptable socially.",
    badge: "badge-moderate",
  },
  {
    id: "elevated",
    label: "Lean Extrovert",
    min: 68,
    max: 83,
    range: "68–83",
    headline: "You lean extroverted with introvert moments.",
    description:
      "You're recognisably extroverted — energised by people, comfortable in groups, quick to engage — but you also value alone time and depth. This is the most common 'extrovert' profile.",
    badge: "badge-significant",
  },
  {
    id: "high",
    label: "Strong Extrovert",
    min: 84,
    max: 100,
    range: "84–100",
    headline: "You sit firmly on the extroverted end of the spectrum.",
    description:
      "You answered like someone who is energised by social contact, comfortable being assertive and the centre of attention, and prefers action over reflection. You likely have a wide circle and feel restless after too much solo time.",
    badge: "badge-high",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "What does this test measure?",
    a: "Extroversion — one of the five core personality traits (the 'Big Five'). The test places you on the introvert–ambivert–extrovert spectrum based on how you describe your social energy, assertiveness, and preferred modes of recharge.",
  },
  {
    q: "Is being an introvert a bad thing?",
    a: "No. Introversion and extroversion are temperament traits, not value judgements. Each has strengths — introverts often think more deeply and form fewer but closer relationships; extroverts often network well and feel comfortable in fast-moving environments. The world needs both.",
  },
  {
    q: "How is the score calculated?",
    a: "Each of the 20 statements is rated 1–5 (Strongly Disagree → Strongly Agree). Nine items are reverse-keyed so the score sums to a single 20–100 number where higher = more extroverted, lower = more introverted, and 52–67 is the ambivert band.",
  },
  {
    q: "What's an ambivert?",
    a: "Someone who sits in the middle of the spectrum and exhibits both introverted and extroverted patterns depending on context. Ambiverts often have the social flexibility of extroverts and the reflective depth of introverts.",
  },
  {
    q: "Can introversion change over time?",
    a: "The underlying trait is relatively stable, but how it shows up can shift through life — life stage, career, relationships, and even practice (e.g. public speaking) all play a role. Most people don't change tiers entirely, but they can move within them.",
  },
  {
    q: "Sources",
    a: "Items are adapted from Psychology Today's Introversion / Extroversion Test (psychologytoday.com) and align with the extroversion factor of the Big Five Inventory (BFI) and the Eysenck Personality Questionnaire (EPQ).",
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
