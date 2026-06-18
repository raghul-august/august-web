import {
  ADULT_CUTOFF,
  ADULT_MAX_SCORE,
  YOUTH_CUTOFF,
  YOUTH_MAX_SCORE,
  adultQuestions,
  getQuestionsForTrack,
  youthQuestions,
  type OcdTrack,
} from "@/app/data/tools/ocd-test-questions";

export type OcdAnswers = Record<number, number>;

export type OcdTierId = "below-cutoff" | "above-mild" | "above-significant";

export interface OcdTier {
  id: OcdTierId;
  label: string;
  range: string;
  headline: string;
  description: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export interface OcdResult {
  track: OcdTrack;
  /** Sum of items for the chosen track. */
  score: number;
  maxScore: number;
  cutoff: number;
  aboveCutoff: boolean;
  percent: number;
  answered: number;
  total: number;
  tier: OcdTier;
  /** Name of the underlying clinical instrument (OCI-4 or OCI-CV-5). */
  instrument: string;
}

const ADULT_TIERS: readonly OcdTier[] = [
  {
    id: "below-cutoff",
    label: "Below the OCD cut-off",
    range: "0–4",
    headline:
      "Your OCI-4 score is at or below the cut-off used to flag likely OCD.",
    description:
      "The 4-item OCI-4 isn't sensitive to every form of OCD, but a score of 4 or less means the brief screen didn't flag the patterns it looks for. If something still feels off, a clinician can use a fuller assessment.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "above-mild",
    label: "Above the cut-off",
    range: "5–9",
    headline:
      "Your OCI-4 score is above the cut-off, suggesting OCD is likely.",
    description:
      "The IOCDF uses a score greater than 4 on the OCI-4 to recommend a fuller diagnostic assessment. This is a screen, not a diagnosis, but a few of these statements clearly resonated, and a clinician who knows OCD can clarify what's going on.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "above-significant",
    label: "Well above the cut-off",
    range: "10–16",
    headline:
      "Your OCI-4 score is well above the cut-off used to flag likely OCD.",
    description:
      "Most of the statements felt very familiar at a meaningful intensity. This doesn't diagnose OCD on its own, but a clinical evaluation with someone who treats OCD is the right next step. Evidence-based treatments, exposure and response prevention (ERP) in particular, work well, and earlier care tends to be easier.",
    badge: "badge-high",
    tone: "warning",
  },
];

const YOUTH_TIERS: readonly OcdTier[] = [
  {
    id: "below-cutoff",
    label: "Below the OCD cut-off",
    range: "0–2",
    headline:
      "Your OCI-CV-5 score is at or below the cut-off used to flag likely OCD.",
    description:
      "The 5-item OCI-CV-5 is a brief screen for kids and teens. A score of 2 or less means it didn't flag the patterns it's looking for. If something still feels hard, talking to a parent, school counsellor, or doctor is a good idea.",
    badge: "badge-low",
    tone: "info",
  },
  {
    id: "above-mild",
    label: "Above the cut-off",
    range: "3–5",
    headline:
      "Your OCI-CV-5 score is above the cut-off, suggesting OCD is likely.",
    description:
      "The IOCDF uses a score greater than 2 on the OCI-CV-5 to recommend a fuller diagnostic assessment. This is a screen, not a diagnosis, but a few statements clearly fit, and a clinician who works with young people and OCD can help figure out what's going on.",
    badge: "badge-significant",
    tone: "caution",
  },
  {
    id: "above-significant",
    label: "Well above the cut-off",
    range: "6–10",
    headline:
      "Your OCI-CV-5 score is well above the cut-off used to flag likely OCD.",
    description:
      "Most of the statements happened often. This doesn't diagnose OCD on its own, but a clinical evaluation with someone who treats OCD in young people is the right next step. Effective treatments — including exposure and response prevention (ERP) and family-based approaches work well.",
    badge: "badge-high",
    tone: "warning",
  },
];

export function getOcdTier(track: OcdTrack, score: number): OcdTier {
  if (track === "adult") {
    if (score <= 4) return ADULT_TIERS[0];
    if (score <= 9) return ADULT_TIERS[1];
    return ADULT_TIERS[2];
  }
  if (score <= 2) return YOUTH_TIERS[0];
  if (score <= 5) return YOUTH_TIERS[1];
  return YOUTH_TIERS[2];
}

export function ocdScoreBucket(track: OcdTrack, score: number): string {
  if (track === "adult") {
    if (score <= 4) return "0-4";
    if (score <= 9) return "5-9";
    return "10-16";
  }
  if (score <= 2) return "0-2";
  if (score <= 5) return "3-5";
  return "6-10";
}

export function computeOcdScore(
  track: OcdTrack,
  answers: OcdAnswers,
): number {
  const items = getQuestionsForTrack(track);
  return items.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
}

export function computeOcdResult(
  track: OcdTrack,
  answers: OcdAnswers,
): OcdResult {
  const items = track === "adult" ? adultQuestions : youthQuestions;
  const score = computeOcdScore(track, answers);
  const maxScore = track === "adult" ? ADULT_MAX_SCORE : YOUTH_MAX_SCORE;
  const cutoff = track === "adult" ? ADULT_CUTOFF : YOUTH_CUTOFF;
  const answered = items.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );

  return {
    track,
    score,
    maxScore,
    cutoff,
    aboveCutoff: score > cutoff,
    percent: Math.round((score / maxScore) * 100),
    answered,
    total: items.length,
    tier: getOcdTier(track, score),
    instrument: track === "adult" ? "OCI-4" : "OCI-CV-5",
  };
}
