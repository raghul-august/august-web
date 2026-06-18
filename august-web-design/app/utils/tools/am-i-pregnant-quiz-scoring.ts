// Pure scoring for the "Am I Pregnant?" quiz. No side effects.

import {
  questions,
  TOTAL_QUESTIONS,
  type PregnancyOption,
  type PregnancyQuestion,
} from "@/app/data/tools/am-i-pregnant-quiz-questions";

export type PregnancyAnswers = Record<number, number>;

export type PregnancyTierId =
  | "test-confirmed"
  | "very-likely"
  | "possible"
  | "too-early"
  | "unlikely";

export interface PregnancyTier {
  id: PregnancyTierId;
  label: string;
  range: string;
  headline: string;
  description: string;
  nextStep: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
}

export interface PregnancyResult {
  /** Raw weighted sum across answered questions. */
  score: number;
  /** Max possible score across all questions. */
  maxScore: number;
  /** Min possible score across all questions (can be negative). */
  minScore: number;
  /** Score clamped to 0–100 for visualization. */
  percent: number;
  answered: number;
  total: number;
  tier: PregnancyTier;
  /** True when the user marked "positive home test" — overrides the band. */
  testConfirmed: boolean;
  /** Top signals that pushed the score the most. */
  topSignals: readonly string[];
}

const TIERS: Readonly<Record<PregnancyTierId, PregnancyTier>> = {
  "test-confirmed": {
    id: "test-confirmed",
    label: "Positive home test",
    range: "Test-confirmed",
    headline: "A positive home test usually means you're pregnant.",
    description:
      "Home pregnancy tests are highly accurate when positive. False positives are uncommon, and they're most often caused by very early miscarriage, certain fertility medications, or testing before the line has stabilized. The next step is a visit with a clinician to confirm the result and start prenatal care or talk through your options.",
    nextStep:
      "Book a clinical appointment for a confirmatory test and to discuss next steps.",
    badge: "badge-high",
    tone: "warning",
  },
  "very-likely": {
    id: "very-likely",
    label: "Pregnancy is likely",
    range: "High",
    headline:
      "Your answers line up strongly with the early signs of pregnancy.",
    description:
      "Several of the patterns you described, including a late or missed period, recent exposure, and multiple early symptoms are common signs of pregnancy. A home pregnancy test taken first thing in the morning would give you a clear answer at this point.",
    nextStep:
      "Take a home pregnancy test today (first morning urine is most accurate).",
    badge: "badge-significant",
    tone: "caution",
  },
  possible: {
    id: "possible",
    label: "Pregnancy is possible",
    range: "Moderate",
    headline: "There are some signs that could point to early pregnancy.",
    description:
      "Some of what you described overlaps with early pregnancy, but a lot of these symptoms also show up before a regular period. The most informative next step is a home pregnancy test from the day your period is due, or a few days later if your cycle is irregular.",
    nextStep:
      "Test on the day your period is due or in 5–7 days if it's not due yet.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  "too-early": {
    id: "too-early",
    label: "Possibly too early to tell",
    range: "Early",
    headline: "You may simply be too early in the cycle for a reliable read.",
    description:
      "Most early pregnancy symptoms only become noticeable in the week or two after a missed period, and home tests work best from the day your period is due. If you've had recent exposure, the most useful thing right now is to wait until your period is due and then test.",
    nextStep:
      "Wait until your expected period date, then take a home pregnancy test.",
    badge: "badge-moderate",
    tone: "neutral",
  },
  unlikely: {
    id: "unlikely",
    label: "Pregnancy looks unlikely",
    range: "Low",
    headline: "Based on what you described, pregnancy looks unlikely right now.",
    description:
      "Your timing, exposure, and symptom picture don't strongly point to pregnancy. That said, no symptom checklist can fully rule it out if your next period doesn't arrive on time, a home test is the cheapest, fastest way to be sure.",
    nextStep:
      "If your next period is more than a few days late, take a home pregnancy test.",
    badge: "badge-low",
    tone: "info",
  },
};

function rangeFor(q: PregnancyQuestion): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const opt of q.options) {
    if (opt.value < min) min = opt.value;
    if (opt.value > max) max = opt.value;
  }
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 0;
  return { min, max };
}

function totals(): { min: number; max: number } {
  let min = 0;
  let max = 0;
  for (const q of questions) {
    const r = rangeFor(q);
    min += r.min;
    max += r.max;
  }
  return { min, max };
}

const SCORE_RANGE = totals();

function pickTier(score: number, testConfirmed: boolean): PregnancyTier {
  if (testConfirmed) return TIERS["test-confirmed"];
  // Bands chosen against the natural max of the synthesized item set.
  if (score >= 22) return TIERS["very-likely"];
  if (score >= 12) return TIERS.possible;
  if (score >= 5) return TIERS["too-early"];
  return TIERS.unlikely;
}

function findOption(
  q: PregnancyQuestion,
  value: number,
): PregnancyOption | undefined {
  return q.options.find((o) => o.value === value);
}

function buildTopSignals(answers: PregnancyAnswers): string[] {
  const rows: { weight: number; label: string }[] = [];
  for (const q of questions) {
    const v = answers[q.id];
    if (v === undefined) continue;
    const opt = findOption(q, v);
    if (!opt) continue;
    if (opt.value <= 0) continue;
    rows.push({ weight: opt.value, label: opt.label });
  }
  rows.sort((a, b) => b.weight - a.weight);
  return rows.slice(0, 4).map((r) => r.label);
}

export function computePregnancyScore(answers: PregnancyAnswers): number {
  let score = 0;
  for (const q of questions) {
    const v = answers[q.id];
    if (v === undefined) continue;
    const opt = findOption(q, v);
    if (!opt) continue;
    score += opt.value;
  }
  return score;
}

export function pregnancyScoreBucket(score: number): string {
  if (score >= 22) return "high";
  if (score >= 12) return "moderate";
  if (score >= 5) return "early";
  return "low";
}

export function computePregnancyResult(
  answers: PregnancyAnswers,
): PregnancyResult {
  const score = computePregnancyScore(answers);
  const answered = questions.reduce(
    (n, q) => (answers[q.id] !== undefined ? n + 1 : n),
    0,
  );
  // "Yes — it was positive" home-test answer is the +12 option on q11.
  const testQuestion = questions.find((q) => q.key === "test_taken");
  const positiveValue = testQuestion?.options.find(
    (o) => o.label.toLowerCase().startsWith("yes — it was positive") ||
           o.label.toLowerCase().startsWith("yes - it was positive"),
  )?.value;
  const testConfirmed =
    testQuestion !== undefined &&
    positiveValue !== undefined &&
    answers[testQuestion.id] === positiveValue;

  const denominator = Math.max(1, SCORE_RANGE.max);
  const percent = Math.max(
    0,
    Math.min(100, Math.round((score / denominator) * 100)),
  );

  return {
    score,
    maxScore: SCORE_RANGE.max,
    minScore: SCORE_RANGE.min,
    percent,
    answered,
    total: TOTAL_QUESTIONS,
    tier: pickTier(score, testConfirmed),
    testConfirmed,
    topSignals: buildTopSignals(answers),
  };
}
