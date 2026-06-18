import {
  REACTION_CONFIG,
  STROOP_CONFIG,
  VERDICTS,
  Verdict,
} from "@/app/data/tools/drug-interaction-checker-config";

// ─── Per-test raw inputs ────────────────────────────────────────────────

export interface ReactionRaw {
  // Reaction times in ms across successful trials
  trials: number[];
  falseStarts: number;
}

export interface MemoryRaw {
  correctRounds: number;
  totalRounds: number;
  // Longest sequence successfully repeated
  longestSequence: number;
}

export interface StroopRaw {
  correct: number;
  total: number;
  // Avg response time across attempted trials in ms
  avgResponseMs: number;
}

export interface DotChaseRaw {
  hits: number;
  misses: number; // dot jumped before tap
  // Avg time-to-tap in ms
  avgTapMs: number;
}

export interface CookedRaw {
  reaction?: ReactionRaw;
  memory?: MemoryRaw;
  stroop?: StroopRaw;
  dotChase?: DotChaseRaw;
}

// ─── Scoring ────────────────────────────────────────────────────────────

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

function scoreReaction(raw: ReactionRaw | undefined): number {
  if (!raw || raw.trials.length === 0) return 0;
  const avg = raw.trials.reduce((a, b) => a + b, 0) / raw.trials.length;
  const { goodMs, badMs, falseStartPenalty } = REACTION_CONFIG;
  // Linear: goodMs → 100, badMs → 0
  const span = badMs - goodMs;
  const raw01 = (badMs - avg) / span;
  const base = clamp(raw01 * 100);
  const penalty = raw.falseStarts * falseStartPenalty;
  return clamp(base - penalty);
}

function scoreMemory(raw: MemoryRaw | undefined): number {
  if (!raw || raw.totalRounds === 0) return 0;
  return clamp((raw.correctRounds / raw.totalRounds) * 100);
}

function scoreStroop(raw: StroopRaw | undefined): number {
  if (!raw || raw.total === 0) return 0;
  const accuracy = raw.correct / raw.total; // 0..1
  const { goodMs, badMs } = STROOP_CONFIG;
  const span = badMs - goodMs;
  const speed01 = clamp(((badMs - raw.avgResponseMs) / span) * 100);
  // 70% accuracy, 30% speed
  return clamp(accuracy * 70 + (speed01 / 100) * 30);
}

function scoreDotChase(raw: DotChaseRaw | undefined): number {
  if (!raw) return 0;
  const total = raw.hits + raw.misses;
  if (total === 0) return 0;
  const accuracy = raw.hits / total; // 0..1
  // Faster taps boost the score modestly. Cap reasonable speed at 600ms.
  const speed01 = clamp(((1200 - raw.avgTapMs) / 600) * 100);
  return clamp(accuracy * 75 + (speed01 / 100) * 25);
}

export interface CookedScores {
  reaction: number;
  memory: number;
  stroop: number;
  dotChase: number;
  overall: number;
}

export interface CookedResult {
  scores: CookedScores;
  verdict: Verdict;
  weakestTest: keyof CookedScores;
  // Stable specimen ID for the fake lab report
  specimenId: string;
}

const TEST_LABEL: Record<keyof CookedScores, string> = {
  reaction: "Reaction Tap",
  memory: "Pattern Memory",
  stroop: "Color Trick",
  dotChase: "Dot Chase",
  overall: "Overall",
};

export function getTestLabel(key: keyof CookedScores): string {
  return TEST_LABEL[key];
}

function pickVerdict(overall: number): Verdict {
  // VERDICTS list goes high → low; pick first whose range contains the score.
  const found = VERDICTS.find((v) => overall >= v.min && overall <= v.max);
  // Fallback: lowest tier
  return found ?? VERDICTS[VERDICTS.length - 1];
}

function findWeakest(scores: Omit<CookedScores, "overall">): keyof CookedScores {
  const entries = Object.entries(scores) as Array<[keyof CookedScores, number]>;
  let weakest: keyof CookedScores = entries[0][0];
  let lowest = entries[0][1];
  for (const [k, v] of entries) {
    if (v < lowest) {
      lowest = v;
      weakest = k;
    }
  }
  return weakest;
}

function generateSpecimenId(): string {
  // Format: AUG-YYMMDD-XXXX (4 hex). Deterministic-ish from time + random.
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
  return `AUG-${yy}${mm}${dd}-${rand}`;
}

// Score a single test in isolation. Used by the orchestrator for the
// inter-test transition card and the live cumulative gauge.
export function scoreSingle(
  key: keyof Omit<CookedScores, "overall">,
  raw: CookedRaw
): number {
  switch (key) {
    case "reaction":
      return Math.round(scoreReaction(raw.reaction));
    case "memory":
      return Math.round(scoreMemory(raw.memory));
    case "stroop":
      return Math.round(scoreStroop(raw.stroop));
    case "dotChase":
      return Math.round(scoreDotChase(raw.dotChase));
  }
}

export function computeCookedResult(raw: CookedRaw): CookedResult {
  const reaction = Math.round(scoreReaction(raw.reaction));
  const memory = Math.round(scoreMemory(raw.memory));
  const stroop = Math.round(scoreStroop(raw.stroop));
  const dotChase = Math.round(scoreDotChase(raw.dotChase));
  const overall = Math.round((reaction + memory + stroop + dotChase) / 4);
  const verdict = pickVerdict(overall);
  const weakestTest = findWeakest({ reaction, memory, stroop, dotChase });
  return {
    scores: { reaction, memory, stroop, dotChase, overall },
    verdict,
    weakestTest,
    specimenId: generateSpecimenId(),
  };
}
