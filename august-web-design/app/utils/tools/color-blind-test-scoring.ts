import {
  COLOR_BLIND_PLATES,
  COLOR_BLIND_TOTAL,
  type ColorBlindDeficiencyType,
  type ColorBlindPlate,
} from "@/app/data/tools/color-blind-test-questions";

export type ColorBlindAnswers = Record<number, string>;

export type ColorBlindTierId =
  | "normal"
  | "mild"
  | "deutan"
  | "protan"
  | "tritan"
  | "red-green"
  | "strong";

export type ColorBlindAnswerMark = "correct" | "alternative" | "missed";

export interface ColorBlindTier {
  id: ColorBlindTierId;
  label: string;
  range: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export interface ColorBlindPerPlate {
  plateId: number;
  type: ColorBlindDeficiencyType;
  mark: ColorBlindAnswerMark;
  selected: string;
  displayed: string;
  alternative: string;
}

export interface ColorBlindResult {
  /** Total correct plate identifications. */
  score: number;
  /** Max score (= total plates). */
  maxScore: number;
  /** Plate count. */
  total: number;
  /** Number of plates the user answered. */
  answered: number;
  /** Fraction of plates missed (0..1). */
  severityRatio: number;
  /** Tier classification. */
  tier: ColorBlindTier;
  /** Per-plate breakdown for the results screen. */
  perPlate: ColorBlindPerPlate[];
  /** Miss counts by deficiency pattern. */
  patternCounts: {
    protan: number;
    deutan: number;
    tritan: number;
    redGreen: number;
  };
  /** Friendly name of the dominant deficiency pattern, or null if no clear pattern. */
  dominantPattern: ColorBlindTierId | null;
}

const TIERS: Record<ColorBlindTierId, ColorBlindTier> = {
  normal: {
    id: "normal",
    label: "Normal trichromacy",
    range: "11–12 / 12",
    headline: "Your color vision looks typical.",
    description:
      "You correctly identified the patterns on all (or all but one) of the plates. That's consistent with normal trichromatic color vision. Online screens can't rule out a very mild deficiency, but no clear deficiency pattern showed up.",
    badge: "badge-low",
    tone: "info",
  },
  mild: {
    id: "mild",
    label: "Mild color vision deficiency",
    range: "8–10 / 12",
    headline: "A few plates were tricky, with no clear pattern.",
    description:
      "You missed a small number of plates but the misses didn't cluster on a specific deficiency type. This could be a mild deficiency, a calibration issue, or just glare. If you'd like certainty, an eye-care professional can run a clinical Ishihara, HRR or anomaloscope test.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  deutan: {
    id: "deutan",
    label: "Likely deuteranopia / deuteranomaly",
    range: "—",
    headline: "Likely red-green deficiency (deutan pattern).",
    description:
      "Your misses cluster on plates that separate deutan (green-cone) responses, and several red-green plates pulled the deficiency answer instead of the standard one. Deutan is the most common form of color vision deficiency, affecting roughly 6% of men of European descent. A clinical exam can confirm the type and severity.",
    badge: "badge-significant",
    tone: "caution",
  },
  protan: {
    id: "protan",
    label: "Likely protanopia / protanomaly",
    range: "—",
    headline: "Likely red-green deficiency (protan pattern).",
    description:
      "Your misses cluster on plates that flag protan (red-cone) responses. Protan deficiency makes reds appear darker and harder to distinguish from greens, browns and oranges. A clinical exam can confirm the type and severity.",
    badge: "badge-significant",
    tone: "caution",
  },
  tritan: {
    id: "tritan",
    label: "Likely tritan deficiency",
    range: "—",
    headline: "Likely blue-yellow deficiency (tritan pattern).",
    description:
      "You missed plates designed to probe tritan (blue-cone) responses. Tritan deficiency is rare and affects how blues and yellows are distinguished. Online screens are particularly poor at testing tritan vision, please confirm this with a clinician.",
    badge: "badge-significant",
    tone: "caution",
  },
  "red-green": {
    id: "red-green",
    label: "Likely red-green deficiency",
    range: "—",
    headline: "Likely red-green color vision deficiency.",
    description:
      "Your misses cluster on red-green plates, but the protan vs deutan split isn't clear from these plates alone. A clinician can run more sensitive tests (HRR or anomaloscope) to pin down the specific subtype.",
    badge: "badge-significant",
    tone: "caution",
  },
  strong: {
    id: "strong",
    label: "Strong color vision deficiency",
    range: "0–4 / 12",
    headline: "Strong color vision deficiency suggested.",
    description:
      "You missed most plates. That pattern suggests a marked color vision deficiency. A clinical eye exam with calibrated plates, lighting and ideally an anomaloscope can identify the exact type and severity.",
    badge: "badge-high",
    tone: "warning",
  },
};

export function getColorBlindTier(id: ColorBlindTierId): ColorBlindTier {
  return TIERS[id];
}

/**
 * Mark a single plate answer.
 * - "correct" → matched the displayed number (or, for hidden-digit plates, matched the alternative)
 * - "alternative" → matched the deficiency-pattern answer
 * - "missed" → matched neither / picked "nothing"
 */
export function markAnswer(
  plate: ColorBlindPlate,
  selected: string | undefined,
): ColorBlindAnswerMark {
  if (selected == null) return "missed";
  // Control plate: both answers are the same — only correct counts.
  if (plate.deficiencyType === "control") {
    return selected === plate.displayedNumber ? "correct" : "missed";
  }
  // Hidden-digit plate: the deficient see a number, normal vision sees nothing.
  // We score "nothing" (or empty displayed) as the normal answer.
  if (plate.deficiencyType === "hidden-red-green") {
    if (plate.displayedNumber === "" && selected === "nothing") return "correct";
    if (selected === plate.alternativeNumber) return "alternative";
    return "missed";
  }
  // Normal transformation / vanishing plates.
  if (selected === plate.displayedNumber) return "correct";
  // Vanishing plates have alternativeNumber === "" — picking nothing means deficient response.
  if (plate.alternativeNumber === "" && selected === "nothing") return "alternative";
  if (plate.alternativeNumber !== "" && selected === plate.alternativeNumber) {
    return "alternative";
  }
  return "missed";
}

function bumpPattern(
  counts: ColorBlindResult["patternCounts"],
  type: ColorBlindDeficiencyType,
) {
  switch (type) {
    case "protan":
      counts.protan += 1;
      counts.redGreen += 1;
      break;
    case "deutan":
      counts.deutan += 1;
      counts.redGreen += 1;
      break;
    case "tritan":
      counts.tritan += 1;
      break;
    case "red-green":
    case "hidden-red-green":
      counts.redGreen += 1;
      break;
    case "control":
      break;
  }
}

export function computeColorBlindResult(
  answers: ColorBlindAnswers,
): ColorBlindResult {
  const perPlate: ColorBlindPerPlate[] = [];
  const patternCounts = { protan: 0, deutan: 0, tritan: 0, redGreen: 0 };
  let score = 0;
  let answered = 0;

  for (const plate of COLOR_BLIND_PLATES) {
    const selected = answers[plate.id];
    if (selected !== undefined) answered += 1;
    const mark = markAnswer(plate, selected);
    if (mark === "correct") score += 1;
    if (mark === "alternative") bumpPattern(patternCounts, plate.deficiencyType);
    if (mark === "missed" && plate.deficiencyType !== "control") {
      // Treat missed plates as soft evidence for the plate's category.
      bumpPattern(patternCounts, plate.deficiencyType);
    }
    perPlate.push({
      plateId: plate.id,
      type: plate.deficiencyType,
      mark,
      selected: selected ?? "",
      displayed: plate.displayedNumber,
      alternative: plate.alternativeNumber,
    });
  }

  const total = COLOR_BLIND_TOTAL;
  const severityRatio = total === 0 ? 0 : (total - score) / total;

  let tierId: ColorBlindTierId;
  let dominantPattern: ColorBlindTierId | null = null;

  // Threshold tuning notes: with 12 plates (1 control, 7 red-green-family,
  // 1 protan, 1 deutan, 2 tritan), thresholds must fit the available plates.
  if (score >= total - 1) {
    tierId = "normal";
  } else if (severityRatio >= 0.6) {
    tierId = "strong";
  } else if (
    patternCounts.tritan >= 2 &&
    patternCounts.tritan > patternCounts.deutan &&
    patternCounts.tritan > patternCounts.protan
  ) {
    tierId = "tritan";
    dominantPattern = "tritan";
  } else if (
    patternCounts.protan >= 1 &&
    patternCounts.protan > patternCounts.deutan &&
    patternCounts.redGreen >= 2
  ) {
    tierId = "protan";
    dominantPattern = "protan";
  } else if (
    patternCounts.deutan >= 1 &&
    patternCounts.deutan > patternCounts.protan &&
    patternCounts.redGreen >= 2
  ) {
    tierId = "deutan";
    dominantPattern = "deutan";
  } else if (patternCounts.redGreen >= 3) {
    tierId = "red-green";
    dominantPattern = "red-green";
  } else {
    tierId = "mild";
  }

  return {
    score,
    maxScore: total,
    total,
    answered,
    severityRatio,
    tier: TIERS[tierId],
    perPlate,
    patternCounts,
    dominantPattern,
  };
}

export function colorBlindScoreBucket(score: number): string {
  if (score >= 11) return "11-12";
  if (score >= 8) return "8-10";
  if (score >= 5) return "5-7";
  return "0-4";
}
