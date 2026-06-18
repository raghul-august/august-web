import {
  orientationQuestions,
  Dimension,
} from "@/app/data/tools/sexual-orientation-questions";

export type OrientationArchetype =
  | "predominantly-different"
  | "predominantly-same"
  | "multi-gender"
  | "asexual-spectrum"
  | "exploring";

export type AffinityTier = "Strong" | "Moderate" | "Low";

export interface DimensionScore {
  score: number; // 0-100
  tier: AffinityTier;
}

export interface OrientationResult {
  archetype: OrientationArchetype;
  name: string;
  emoji: string;
  shortLabel: string;
  description: string;
  traits: string[];
  // 4 explicit dimension scores, plus a romantic ↔ sexual lean
  dimensions: {
    sameGender: DimensionScore;
    differentGender: DimensionScore;
    multiGender: DimensionScore;
    asexual: DimensionScore;
  };
  romanticLean: number; // 0 = fully sexual, 100 = fully romantic, 50 = balanced
}

const archetypeData: Record<
  OrientationArchetype,
  Omit<OrientationResult, "dimensions" | "romanticLean">
> = {
  "predominantly-different": {
    archetype: "predominantly-different",
    name: "Predominantly Different-Gender Attracted",
    shortLabel: "Heterosexual leaning",
    emoji: "💛",
    description:
      "Your attractions tend to point toward people of a different gender from your own, both romantically and sexually. That doesn't have to mean exclusively, most people sit somewhere on a spectrum, and yours leans clearly one way.",
    traits: [
      "Clear attraction to different gender",
      "Limited same-gender pull",
      "Stable orientation pattern",
    ],
  },
  "predominantly-same": {
    archetype: "predominantly-same",
    name: "Predominantly Same-Gender Attracted",
    shortLabel: "Same-gender leaning",
    emoji: "💚",
    description:
      "Your attractions tend to point toward people of your own gender, both romantically and sexually. That's not a single label. You might call it gay, lesbian, queer, or something else entirely. The pattern is what matters.",
    traits: [
      "Clear attraction to same gender",
      "Limited different-gender pull",
      "Stable orientation pattern",
    ],
  },
  "multi-gender": {
    archetype: "multi-gender",
    name: "Multi-Gender Attracted",
    shortLabel: "Bisexual / pansexual leaning",
    emoji: "💜",
    description:
      "You feel meaningful attraction across more than one gender. That can look like bisexual, pansexual, queer, or anything in between. The throughline is that gender isn't a strict filter for who you're drawn to.",
    traits: [
      "Attraction across genders",
      "Open to multiple possibilities",
      "Gender feels less like a filter",
    ],
  },
  "asexual-spectrum": {
    archetype: "asexual-spectrum",
    name: "Asexual Spectrum",
    shortLabel: "Limited sexual attraction",
    emoji: "🤍",
    description:
      "Sexual attraction isn't a strong or frequent feeling for you. You might still feel romantic pull or deep emotional closeness, that's the asexual spectrum. It includes asexual, demisexual, graysexual, and other identities where sex sits in the background.",
    traits: [
      "Low sexual drive overall",
      "Romantic feelings can still exist",
      "Sex isn't a core lens",
    ],
  },
  exploring: {
    archetype: "exploring",
    name: "Exploring",
    shortLabel: "Fluid / questioning",
    emoji: "✨",
    description:
      "Your answers don't settle cleanly into one pattern. That's not indecision orientation is fluid for many people, and exploring is its own real thing. Sit with what you noticed. There's no rush to land.",
    traits: [
      "Mixed or shifting attractions",
      "Open to questioning",
      "Resists a single label",
    ],
  },
};

const MAX_PER_QUESTION = 4;

function avgForDimension(
  answers: Record<number, number>,
  dimension: Dimension
): number {
  const matching = orientationQuestions.filter((q) => q.dimension === dimension);
  if (matching.length === 0) return 0;
  const sum = matching.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
  return (sum / (matching.length * MAX_PER_QUESTION)) * 100;
}

function avgForAttractionType(
  answers: Record<number, number>,
  type: "sexual" | "romantic"
): number {
  const matching = orientationQuestions.filter((q) => q.attractionType === type);
  if (matching.length === 0) return 0;
  const sum = matching.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
  return (sum / (matching.length * MAX_PER_QUESTION)) * 100;
}

function tierFor(score: number): AffinityTier {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  return "Low";
}

export function computeOrientation(
  answers: Record<number, number>
): OrientationResult {
  const sameGender = avgForDimension(answers, "same-gender");
  const differentGender = avgForDimension(answers, "different-gender");
  const asexual = avgForDimension(answers, "asexual");
  const multiGender = avgForDimension(answers, "multi-gender");

  const sexualMean = avgForAttractionType(answers, "sexual");
  const romanticMean = avgForAttractionType(answers, "romantic");
  const totalMean = sexualMean + romanticMean;
  const romanticLean = totalMean > 0 ? (romanticMean / totalMean) * 100 : 50;

  const overallAttraction = (sameGender + differentGender) / 2;
  const SAME_THRESHOLD = 55;
  const OTHER_THRESHOLD = 55;
  const ASEXUAL_THRESHOLD = 55;
  const MULTI_BOTH_PRESENT = 40;

  let archetype: OrientationArchetype;

  // Asexual spectrum: high asexual signal AND overall attraction is low
  if (asexual >= ASEXUAL_THRESHOLD && overallAttraction < 40) {
    archetype = "asexual-spectrum";
  } else if (sameGender >= MULTI_BOTH_PRESENT && differentGender >= MULTI_BOTH_PRESENT) {
    archetype = "multi-gender";
  } else if (multiGender >= 60 && overallAttraction >= 30) {
    // Strong "gender doesn't matter" signal even if one side is moderate
    archetype = "multi-gender";
  } else if (sameGender >= SAME_THRESHOLD && differentGender < MULTI_BOTH_PRESENT) {
    archetype = "predominantly-same";
  } else if (differentGender >= OTHER_THRESHOLD && sameGender < MULTI_BOTH_PRESENT) {
    archetype = "predominantly-different";
  } else {
    archetype = "exploring";
  }

  return {
    ...archetypeData[archetype],
    dimensions: {
      sameGender: { score: sameGender, tier: tierFor(sameGender) },
      differentGender: { score: differentGender, tier: tierFor(differentGender) },
      multiGender: { score: multiGender, tier: tierFor(multiGender) },
      asexual: { score: asexual, tier: tierFor(asexual) },
    },
    romanticLean,
  };
}
