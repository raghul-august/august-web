export const NUM_TRIALS = 5;

/**
 * Random wait range in milliseconds before the screen turns green.
 * Matches the de-facto Human Benchmark range so the test feels right to users
 * who've taken it before, while avoiding a trivially short delay you could
 * race-click through.
 */
export const WAIT_MIN_MS = 2500;
export const WAIT_MAX_MS = 5000;

/** Anything below this is treated as a too-soon false start, not a record. */
export const FALSE_START_FLOOR_MS = 80;

export interface ReactionTimeTier {
  id:
    | "lightning"
    | "excellent"
    | "great"
    | "good"
    | "average"
    | "slow"
    | "very-slow";
  label: string;
  /** Inclusive lower bound in ms (use 0 for the fastest tier). */
  min: number;
  /** Exclusive upper bound in ms (use Infinity for the slowest tier). */
  max: number;
  range: string;
  headline: string;
  description: string;
  badge:
    | "badge-low"
    | "badge-medium"
    | "badge-high"
    | "badge-significant"
    | "badge-moderate"
    | "badge-pure";
}

/** Ordered fast → slow so lookups walk the array once. */
export const REACTION_TIME_TIERS: readonly ReactionTimeTier[] = [
  {
    id: "lightning",
    label: "Lightning",
    min: 0,
    max: 200,
    range: "Under 200 ms",
    headline: "Lightning-fast reflexes",
    description:
      "Sub-200 ms is the territory of fighter pilots, top-tier esports players, and well-rested 20-somethings. Roughly the top 5% of attempts on public reaction-time benchmarks land here.",
    badge: "badge-pure",
  },
  {
    id: "excellent",
    label: "Excellent",
    min: 200,
    max: 240,
    range: "200–239 ms",
    headline: "Excellent reaction time",
    description:
      "Distinctly quicker than average. This range is typical of trained athletes, pro gamers, and people having a good, well-caffeinated day.",
    badge: "badge-low",
  },
  {
    id: "great",
    label: "Great",
    min: 240,
    max: 270,
    range: "240–269 ms",
    headline: "Great reaction time",
    description:
      "A little ahead of the curve. Public reaction-time tests put the average adult around 270–290 ms, so you're already faster than most people taking the same screen.",
    badge: "badge-medium",
  },
  {
    id: "good",
    label: "Good",
    min: 270,
    max: 310,
    range: "270–309 ms",
    headline: "Right around average",
    description:
      "This is where most healthy adults land on simple visual reaction-time tests. Sleep, caffeine, screen brightness, and which finger you used can all swing it 30–50 ms.",
    badge: "badge-moderate",
  },
  {
    id: "average",
    label: "Slightly slow",
    min: 310,
    max: 360,
    range: "310–359 ms",
    headline: "A touch slower than average",
    description:
      "Still well within the normal range. Reaction time naturally rises with tiredness, screen lag, and age, improves with a few practice trials.",
    badge: "badge-significant",
  },
  {
    id: "slow",
    label: "Slow",
    min: 360,
    max: 500,
    range: "360–499 ms",
    headline: "Slower than typical",
    description:
      "This is on the slow end for a simple click test. Try again somewhere quieter, with a wired mouse or trackpad if possible, and after a short warm-up.",
    badge: "badge-high",
  },
  {
    id: "very-slow",
    label: "Very slow",
    min: 500,
    max: Number.POSITIVE_INFINITY,
    range: "500 ms and up",
    headline: "Notably slow today",
    description:
      "Most often this means tab-throttling, a high-latency input device, or distraction during the trial. A wired mouse, full-screen window, and a quick second attempt usually shave off 100 ms or more.",
    badge: "badge-high",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "What's a normal human reaction time?",
    a: "On a simple visual click test like this one, the average adult lands around 270–290 ms. Anything under 240 ms is fast, and under 200 ms is exceptional. Reaction time naturally slows with age, fatigue, and high screen latency.",
  },
  {
    q: "Why is my time slower than I expected?",
    a: "Browser tab throttling, wireless mice, low monitor refresh rate, and even how tired you are can each add 30–50 ms. Try again on a wired mouse, in a focused tab, and after a short warm-up trial or two.",
  },
  {
    q: "How is the result calculated?",
    a: "You take 5 trials. We measure the time between the screen turning green and your click, then report the arithmetic mean across the 5 attempts. Any trial where you click before the green is treated as a false start and doesn't count toward the average.",
  },
  {
    q: "Is this a medical test?",
    a: "No. This is a casual reflex check, not a diagnostic tool. It can't detect concussion, ADHD, or any clinical condition. If your reaction time has changed suddenly and you're worried, talk to a doctor.",
  },
  {
    q: "Can I make my reaction time faster?",
    a: "A bit, yes. Sleep, hydration, caffeine, regular cardio, and practiced reaction-based games (rhythm games, fast-paced shooters) can shave tens of milliseconds. Hardware matters too — a 144 Hz+ monitor and wired mouse meaningfully reduce input latency.",
  },
] as const;

export const HOW_STEPS = [
  {
    label: "Wait for green",
    text: "Click the box to start a trial. It turns red, then green after a random delay.",
  },
  {
    label: "Click as fast as you can",
    text: "The instant the screen turns green, click. Your time appears in milliseconds.",
  },
  {
    label: "5 trials, one average",
    text: "Do 5 attempts. We average them and tell you how your reflexes stack up.",
  },
] as const;

export const EXPECTATIONS = [
  {
    bold: "5 quick trials",
    rest: "of a simple visual reaction test. Takes about 30 seconds.",
  },
  {
    bold: "Pure reflex measurement",
    rest: "— time between the screen turning green and your click, in milliseconds.",
  },
  {
    bold: "No sign-up, no storage",
    rest: ". Results stay in your browser and disappear when you close the tab.",
  },
] as const;
