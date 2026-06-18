export { getBadgeTone } from "./tool-colors";
// Part A question IDs (8-13) are used for ASRS scoring
const partAIds = new Set([8, 9, 10, 11, 12, 13]);

const scoreMap: Record<string, number> = {
  "Never ever": 0,
  Rarely: 1,
  Sometimes: 2,
  Often: 3,
  Always: 4,
};

export interface ScoreResult {
  continuous: number; // 0-24 score
  dichotomous: number; // count of answers >= 2
}

export function computeScores(
  answers: Record<number, string>,
  questionIds: number[]
): ScoreResult {
  let continuous = 0;
  let dichotomous = 0;

  questionIds.forEach((id) => {
    if (!partAIds.has(id)) return;
    const answer = answers[id];
    const value = scoreMap[answer] ?? 0;
    continuous += value;
    if (value >= 2) dichotomous++;
  });

  return { continuous, dichotomous };
}

export interface VibeCheck {
  emoji: string;
  label: string;
  badge: "badge-low" | "badge-medium" | "badge-high";
  vibe: string;
}

export function getVibeCheck(score: number): VibeCheck {
  if (score <= 9) {
    return {
      emoji: "C",
      label: "Low key",
      badge: "badge-low",
      vibe: "Your brain seems pretty chill rn",
    };
  }
  if (score <= 13) {
    return {
      emoji: "T",
      label: "Maybe something",
      badge: "badge-medium",
      vibe: "There might be something here worth exploring",
    };
  }
  if (score <= 17) {
    return {
      emoji: "E",
      label: "Notable vibes",
      badge: "badge-medium",
      vibe: "Your responses suggest some ADHD-ish patterns",
    };
  }
  return {
    emoji: "S",
    label: "Strong indication",
    badge: "badge-high",
    vibe: "Definitely worth chatting with a professional",
  };
}
