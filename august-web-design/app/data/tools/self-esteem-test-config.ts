export interface SelfEsteemTier {
  id: "very-low" | "low" | "moderate" | "healthy" | "very-high";
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
export const SELF_ESTEEM_TIERS: readonly SelfEsteemTier[] = [
  {
    id: "very-low",
    label: "Very low self-esteem",
    min: 20,
    max: 35,
    range: "20–35",
    headline: "Your answers point to very low self-esteem.",
    description:
      "Most of the positive statements felt untrue and the negative ones felt familiar — patterns of shame, rumination, and self-criticism. This kind of internal climate is exhausting and often linked to depression and anxiety. Working with a therapist on self-compassion and cognitive restructuring can shift this meaningfully.",
    badge: "badge-high",
  },
  {
    id: "low",
    label: "Low self-esteem",
    min: 36,
    max: 51,
    range: "36–51",
    headline: "Your answers suggest low self-esteem.",
    description:
      "You see flashes of self-worth, but the dominant pattern is self-doubt — quick to take criticism personally, slow to claim your own strengths. Many people sit here through stretches of their life. Targeted work (CBT, self-compassion training, journalling around evidence for and against your inner critic) can lift this.",
    badge: "badge-significant",
  },
  {
    id: "moderate",
    label: "Moderate self-esteem",
    min: 52,
    max: 67,
    range: "52–67",
    headline: "Your answers show middle-of-the-road self-esteem.",
    description:
      "You hold a generally fair view of yourself but it wobbles under pressure. You can recover from setbacks, but criticism still stings more than it should. Most adults sit somewhere in this band; small habits — naming wins, practising self-compassion, getting out of comparison loops — push you up the curve.",
    badge: "badge-moderate",
  },
  {
    id: "healthy",
    label: "Healthy self-esteem",
    min: 68,
    max: 83,
    range: "68–83",
    headline: "Your answers reflect healthy self-esteem.",
    description:
      "You like who you are without needing to feel superior. You can take feedback without collapsing, you treat your flaws with reasonable kindness, and you back yourself in challenges. This is the band researchers associate with the best long-term mental health outcomes.",
    badge: "badge-low",
  },
  {
    id: "very-high",
    label: "Very high self-esteem",
    min: 84,
    max: 100,
    range: "84–100",
    headline: "Your answers show very high self-regard.",
    description:
      "You endorsed nearly every positive statement at full intensity and rejected every negative one. That is genuinely confident — but at the very top of the scale, researchers note it can shade into difficulty hearing constructive feedback or seeing your own blind spots. If others around you are flagging this, it is worth a curious look.",
    badge: "badge-pure",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "Who is this self-esteem test for?",
    a: "Anyone who wants a clearer read on their self-worth. The 20 items are adapted from four classic self-esteem measures — Rosenberg, Coopersmith, Robson, and Neff’s Self-Compassion Scale. It’s built for adults and is explicitly not a diagnosis.",
  },
  {
    q: "How is the score calculated?",
    a: "Each of the 20 statements is rated 1–5 (Strongly Disagree → Strongly Agree). Six items are reverse-keyed — for instance, agreeing with “I brood over my flaws” counts as low self-esteem. Your total falls between 20 (very low) and 100 (very high), banded into 5 tiers.",
  },
  {
    q: "Is higher always better?",
    a: "Mostly yes, but not infinitely. The 84–100 band is genuinely healthy confidence — until it shades into difficulty hearing critical feedback or seeing your own blind spots. Researchers describe a sweet spot where you can like yourself and still update your view of yourself.",
  },
  {
    q: "What if my score is low?",
    a: "Low self-esteem is closely linked to depression, anxiety, and the way you talk to yourself when things go wrong. The strongest evidence-based interventions are cognitive behavioural therapy, self-compassion training (Kristin Neff has a free 8-week programme), and journalling that targets the inner critic. A therapist can help you pick the right one.",
  },
  {
    q: "Why does feedback feel so harsh?",
    a: "People with low self-esteem often hear neutral feedback as proof of an underlying flaw. That isn’t a character defect — it’s a learned interpretation pattern, often laid down in childhood, and it responds well to therapy.",
  },
  {
    q: "Sources",
    a: "Rosenberg, M. — Society and the Adolescent Self-Image. Coopersmith, S. — Coopersmith Self-Esteem Inventory. Robson, P. — The Robson Self-Concept Questionnaire. Neff, K. — Development and Validation of a Scale to Measure Self-Compassion.",
  },
] as const;

export const HOW_STEPS = [
  {
    label: "Read each statement",
    text: "20 short statements about how you see yourself, adapted from the Rosenberg, Coopersmith, Robson, and Neff scales.",
  },
  {
    label: "Rate your agreement",
    text: "Tap how strongly you agree, from Strongly Disagree to Strongly Agree. The next question appears automatically.",
  },
  {
    label: "See your band",
    text: "Your responses are scored into a 5-tier banding so you know where on the self-esteem spectrum you land.",
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
    rest: ", every item is drawn from a published self-esteem or self-compassion measure.",
  },
] as const;
