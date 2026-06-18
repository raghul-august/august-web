export interface BurnoutTier {
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
export const BURNOUT_TIERS: readonly BurnoutTier[] = [
  {
    id: "very-low",
    label: "No signs of burnout",
    min: 20,
    max: 35,
    range: "20–35",
    headline: "Your answers point away from burnout patterns.",
    description:
      "You scored well below the midpoint on the burnout items. The picture is one of someone who can mostly bring energy, presence, and a sense of purpose to work — even on tough days. Whatever you're doing to manage the load, keep doing it.",
    badge: "badge-pure",
  },
  {
    id: "low",
    label: "Mild work stress",
    min: 36,
    max: 51,
    range: "36–51",
    headline: "You show mild work-related stress without burnout.",
    description:
      "A handful of items rang true occasional dread, dissatisfaction, or fatigue but the overall pattern isn't burnout. This is normal stress, the kind most working people feel sometimes. Worth watching, not yet a fire.",
    badge: "badge-low",
  },
  {
    id: "moderate",
    label: "Moderate burnout",
    min: 52,
    max: 67,
    range: "52–67",
    headline: "Your answers show moderate burnout patterns.",
    description:
      "You endorsed enough exhaustion-, cynicism-, or ineffectiveness-themed items to make burnout a real concern. You're likely able to function, but it costs more energy than it should. This is the band where small structural changes (workload, boundaries, support) tend to help most.",
    badge: "badge-moderate",
  },
  {
    id: "elevated",
    label: "Significant burnout",
    min: 68,
    max: 83,
    range: "68–83",
    headline: "Your answers show significant burnout.",
    description:
      "Most of the burnout items felt true dread, cynicism, exhaustion, feelings of ineffectiveness, and difficulty being present for loved ones. This isn't a diagnosis, but it's a signal that the current work setup is not sustainable. People at this level benefit from a real conversation with a clinician, a coach, or HR/management.",
    badge: "badge-significant",
  },
  {
    id: "high",
    label: "Severe burnout",
    min: 84,
    max: 100,
    range: "84–100",
    headline: "Your answers align strongly with severe burnout.",
    description:
      "You endorsed nearly every item at high intensity exhaustion that doesn't lift with rest, cynicism that has hardened into worldview, and a sense of futility about your work. At this level, burnout often co-occurs with depression or anxiety. Please talk to a clinician meaningful relief usually requires more than self-care.",
    badge: "badge-high",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "Is burnout a real medical condition?",
    a: "The World Health Organization classifies burnout as an 'occupational phenomenon' in the ICD-11, not a medical diagnosis. It describes a syndrome, exhaustion, mental distance from one's job, and reduced professional efficacy, resulting specifically from chronic, unmanaged workplace stress.",
  },
  {
    q: "How is this test scored?",
    a: "Each of the 20 statements is rated 1–5 (Strongly Disagree → Strongly Agree). Four items are reverse-keyed (statements about feeling proud of your work or in control). Your total falls between 20 and 100 and is banded into 5 tiers from 'No signs of burnout' to 'Severe burnout'.",
  },
  {
    q: "What's the difference between burnout and depression?",
    a: "Burnout is workplace-specific and tends to lift when the work situation improves. Depression is broader, affecting sleep, appetite, energy, and pleasure across every area of life, and persists even when work is going well. The two can co-occur, and at high burnout levels, a professional should help untangle them.",
  },
  {
    q: "Can burnout get better without changing jobs?",
    a: "Sometimes. If the core driver is workload, autonomy, or recognition, structural changes (negotiating scope, taking real time off, clearer boundaries) can help meaningfully. If the issue is values misalignment or chronic toxic culture, a job change is often the highest-leverage move.",
  },
  {
    q: "What should I do if my score is high?",
    a: "Talk to someone a clinician, a trusted manager, HR, or a therapist who works with burnout. Self-care alone is rarely enough at the higher tiers. You can also chat with August in this page to talk through what you're experiencing without committing to a longer process.",
  },
  {
    q: "Sources",
    a: "Items are adapted from Psychology Today's Burnout at Work Test (psychologytoday.com) and align with the three-dimension model of burnout (emotional exhaustion, depersonalisation, reduced personal accomplishment) developed by Christina Maslach in the Maslach Burnout Inventory (MBI).",
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
