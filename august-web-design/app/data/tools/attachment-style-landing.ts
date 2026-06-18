// Attachment Style Test — landing copy + 4 style definitions.
// All prose is author-original.
// NO React, NO JSX.

export type AttachmentStyleId =
  | "secure"
  | "anxious"
  | "avoidant"
  | "fearful-avoidant";

export const EXPECTATIONS = [
  {
    bold: "30 short statements",
    rest: "rated on a five-point scale from strongly disagree to strongly agree.",
  },
  {
    bold: "~5 minutes",
    rest: "to complete. Anonymous and scored entirely in your browser, nothing is stored.",
  },
  {
    bold: "A clear, evidence-based profile",
    rest: ", your scores on two axes (anxiety and avoidance) and the style they map to.",
  },
];

export interface AttachmentStyleDef {
  id: AttachmentStyleId;
  name: string;
  /** Short, you-statement headline for the results card. */
  headline: string;
  /** 2–3 sentence original prose summary. */
  summary: string;
  /** How this style typically shows up in relationships. */
  inRelationships: string;
  /** Common strengths at this style's best. */
  strengths: string;
  /** Common watch-outs at this style's worst. */
  watchOuts: string;
  /** Suggested growth direction. */
  growth: string;
  /** Approximate prevalence in adult population (rounded; from meta-analytic estimates). */
  prevalence: string;
}

export const STYLE_DEFINITIONS: readonly AttachmentStyleDef[] = [
  {
    id: "secure",
    name: "Secure",
    headline:
      "You tend to feel safe being close to people, and safe being yourself with them.",
    summary:
      "People with secure attachment are comfortable with intimacy and with independence. You can lean on the people closest to you and let them lean back without feeling consumed or abandoned. Closeness doesn't feel like a threat, and small ruptures don't feel like the end.",
    inRelationships:
      "Conflicts feel solvable. You assume good faith when a partner is unavailable for a moment, and you can ask for what you need without making it bigger than it is.",
    strengths:
      "Steady, communicative, generous in conflict, able to repair after a rupture. Easy to be close to and easy to let close.",
    watchOuts:
      "Secure people can sometimes underestimate how much an anxious or avoidant partner is genuinely struggling, mistaking it for unwillingness rather than fear.",
    growth:
      "The frontier for many secure folks is staying secure inside relationships with people whose patterns are different from their, without rolling their eyes, and without quietly drifting away.",
    prevalence: "~50–60% of adults",
  },
  {
    id: "anxious",
    name: "Anxious (Preoccupied)",
    headline:
      "You care deeply, and you feel small shifts in connection as if they were big ones.",
    summary:
      "People with anxious attachment crave closeness and feel safer when the people they love are clearly with them. You're attuned, often warmly attuned, and you read the room sharply for signs of distance. The flip side is that small distance can land hard, and reassurance can feel like the most important thing in the world to chase down.",
    inRelationships:
      "You feel best when there's a clear, reliable sense of connection. Withdrawal hurts; ambiguity is hard to sit with; you can find yourself protesting, pursuing, or testing as a way to feel close again.",
    strengths:
      "Loyal, emotionally tuned, willing to do the work, deeply invested in the people you love.",
    watchOuts:
      "Reading neutral cues as rejection, needing more reassurance than your partner can offer, getting hijacked by a single missed text, or chasing closeness in ways that push it further away.",
    growth:
      "Self-soothing skills you trust, a clear sense of your own worth that doesn't depend on someone else's mood, and a slower default than the first reactive move.",
    prevalence: "~15–20% of adults",
  },
  {
    id: "avoidant",
    name: "Avoidant (Dismissive)",
    headline:
      "You value your independence, and closeness can quietly start to feel like too much.",
    summary:
      "People with avoidant attachment learned early that the safest place to lean is on yourself. You're often steady, competent, and self-reliant and somewhere along the way you also learned that needing people is a vulnerability, not a strength. So you let people in only so far, and you pull back when it starts to feel like more.",
    inRelationships:
      "You're often the one who needs space when things get intense. Big emotional moments can leave you wanting to step away, regroup, and come back to it later, sometimes later than your partner can comfortably wait.",
    strengths:
      "Self-sufficient, calm under pressure, dependable in practical ways, hard to destabilize.",
    watchOuts:
      "Dismissing your own emotional needs, mistaking distance for safety, shutting down rather than turning toward when something hard comes up, leaving a partner without the closeness they need.",
    growth:
      "Letting someone you trust in just a little further than feels comfortable, then a little further, and noticing that the world doesn't collapse when you do.",
    prevalence: "~20–25% of adults",
  },
  {
    id: "fearful-avoidant",
    name: "Fearful-Avoidant (Disorganized)",
    headline:
      "You want closeness, and you also fear it sometimes in the same hour.",
    summary:
      "People with fearful-avoidant attachment carry both sides of the pattern at once. You long for closeness, but closeness can also feel dangerous, because somewhere along the way the people who were supposed to be safe weren't always safe. So you reach in and pull back, often with the same person, often in the same week.",
    inRelationships:
      "It can feel like two operating systems running at once, one that pulls you toward a partner and one that pulls you away as soon as you're really close. Conflicts can feel disproportionately big, and trust takes a long time to build and very little to shake.",
    strengths:
      "Emotionally deep, sensitive to nuance, capable of profound intimacy when things feel safe, often very perceptive about other people's pain.",
    watchOuts:
      "Push-pull dynamics, intense escalations followed by withdrawal, expecting betrayal from people who aren't betraying you, and a hard time trusting the calm in a relationship that's actually going well.",
    growth:
      "Slow, patient relationships — with a partner, a friend, a therapist, where consistency over time gradually teaches the nervous system a new default. Trauma-informed therapy is often the most direct path.",
    prevalence: "~5–10% of adults",
  },
] as const;

export function getStyleDef(id: AttachmentStyleId): AttachmentStyleDef {
  const def = STYLE_DEFINITIONS.find((s) => s.id === id);
  if (!def) throw new Error(`Unknown attachment style: ${id}`);
  return def;
}

export const HERO_TAGLINE =
  "A short, anonymous attachment-style test built on the two-axis (anxiety × avoidance) model. Answer 30 statements and find out where you sit on each axis, and which of the four styles : Secure, Anxious, Avoidant, or Fearful-Avoidant, fits you best, in about five minutes.";
