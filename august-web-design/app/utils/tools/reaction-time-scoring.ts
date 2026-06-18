import {
  REACTION_TIME_TIERS,
  type ReactionTimeTier,
} from "@/app/data/tools/reaction-time-config";

export interface ReactionTimeResult {
  /** Arithmetic mean of valid trial times, rounded to integer ms. */
  averageMs: number;
  /** Fastest single valid trial. */
  bestMs: number;
  /** Slowest single valid trial. */
  worstMs: number;
  /** All valid trial times in the order they were recorded. */
  trials: number[];
  /** Total trials attempted, including false starts. */
  totalAttempts: number;
  /** Number of clicks before the green appeared. */
  falseStarts: number;
  tier: ReactionTimeTier;
  /** Rough percentile (0–100) of the population this beats. */
  percentile: number;
}

export function getReactionTimeTier(averageMs: number): ReactionTimeTier {
  for (const tier of REACTION_TIME_TIERS) {
    if (averageMs >= tier.min && averageMs < tier.max) return tier;
  }
  return REACTION_TIME_TIERS[REACTION_TIME_TIERS.length - 1];
}

/**
 * Rough population percentile based on a normal-ish distribution of human
 * reaction times (mean ≈ 285 ms, sd ≈ 50 ms). Returns the percent of the
 * population this average is faster than, clamped to [1, 99].
 */
export function estimatePercentile(averageMs: number): number {
  const mean = 285;
  const sd = 50;
  const z = (averageMs - mean) / sd;
  // Abramowitz & Stegun approximation of the standard normal CDF.
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d =
    0.3989422804 * Math.exp((-z * z) / 2) *
    (0.319381530 * t -
      0.356563782 * t * t +
      1.781477937 * t * t * t -
      1.821255978 * t * t * t * t +
      1.330274429 * t * t * t * t * t);
  const cdf = z >= 0 ? 1 - d : d;
  const fasterThan = (1 - cdf) * 100;
  return Math.max(1, Math.min(99, Math.round(fasterThan)));
}

export function computeReactionTimeResult(
  trials: number[],
  falseStarts: number,
): ReactionTimeResult | null {
  if (trials.length === 0) return null;

  const sum = trials.reduce((acc, t) => acc + t, 0);
  const averageMs = Math.round(sum / trials.length);
  const bestMs = Math.min(...trials);
  const worstMs = Math.max(...trials);
  const tier = getReactionTimeTier(averageMs);
  const percentile = estimatePercentile(averageMs);

  return {
    averageMs,
    bestMs,
    worstMs,
    trials,
    totalAttempts: trials.length + falseStarts,
    falseStarts,
    tier,
    percentile,
  };
}
