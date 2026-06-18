// Drug Interaction Checker — config for landing copy, mini-game tuning,
// verdict tiers, and result CTAs. No React in this file.
//
// Note: this tool measures the *cognitive* interaction between substances,
// fatigue, stress and the user's reflexes/memory/focus/tracking. It is NOT
// a pharmacological drug-vs-drug interaction database. Copy frames it
// honestly throughout.

export const TOTAL_TESTS = 4;

// ─── Mini-game tuning ───────────────────────────────────────────────────

// Reaction Tap: number of trials and color-flip windows
export const REACTION_CONFIG = {
  trials: 5,
  // Random pre-flip delay window in ms
  minDelay: 900,
  maxDelay: 2400,
  // Reaction time score thresholds (lower ms = better)
  // Score = 100 if avg ≤ goodMs, 0 if avg ≥ badMs, linear in between
  goodMs: 280,
  badMs: 700,
  // Penalty per false start (tapping while red)
  falseStartPenalty: 15,
} as const;

// Memory: pattern of colored cells
export const MEMORY_CONFIG = {
  rounds: 5, // sequence grows: 3 → 4 → 5 → 6 → 7
  startLength: 3,
  cells: 4, // 4-color grid (Simon-style)
  flashMs: 480,
  gapMs: 220,
  // Score = (correctRounds / rounds) * 100
} as const;

// Stroop: color-word interference
export const STROOP_CONFIG = {
  trials: 10,
  trialMs: 2400, // time per trial; miss = wrong
  // Score blends accuracy and avg response time
  goodMs: 700,
  badMs: 2200,
} as const;

// Dot Chase: tap a dot before it jumps to a new spot
export const DOT_CHASE_CONFIG = {
  duration: 14_000, // total game time in ms
  initialIntervalMs: 1300, // dot jumps every N ms (decreases)
  minIntervalMs: 600,
  intervalStepMs: 50, // shrink each successful tap
  dotSize: 56, // px
} as const;

// ─── Verdicts ───────────────────────────────────────────────────────────

export type VerdictTier =
  | "no-interaction"
  | "low-interaction"
  | "moderate-interaction"
  | "high-interaction"
  | "severe-interaction";

export interface Verdict {
  tier: VerdictTier;
  name: string;
  emoji: string;
  shortLabel: string;
  description: string;
  receipt: string; // line for the fake "lab report"
  advice: string[];
  // Range for averaged 0–100 score
  min: number;
  max: number;
  // Pre-filled August chat message
  augustPrompt: string;
}

export const VERDICTS: Verdict[] = [
  {
    tier: "no-interaction",
    name: "No interaction detected",
    shortLabel: "Cognition running clean",
    emoji: "🟢",
    description:
      "Your reflexes, memory, focus, and tracking all came in clean. Whatever's in your system right now isn't slowing you down on these four tests. Save this score for a baseline to compare against later.",
    receipt: "No cognitive interaction detected. Subject performing within sharp range.",
    advice: [
      "Save this score as your personal baseline",
      "Sleep, water, sunlight — keep the trio honest",
      "Try the test again after coffee, after a late night, after a drink — see how the score moves",
    ],
    min: 80,
    max: 100,
    augustPrompt:
      "Hi august — I scored No Interaction on the Drug Interaction Checker (cognitive self-screen). I want to keep my focus this sharp. What habits actually move the needle?",
  },
  {
    tier: "low-interaction",
    name: "Low interaction",
    shortLabel: "Slight cognitive drag",
    emoji: "🟡",
    description:
      "You're mostly sharp, but something is pulling at the edges. Could be sleep debt, caffeine crash, mild stress, or one drink ago. The drag is real but small.",
    receipt: "Mild cognitive interaction detected. Reaction or attention down from baseline.",
    advice: [
      "Drink water before reaching for another coffee",
      "Skip the tasks that need real precision tonight",
      "Aim for seven plus hours of sleep this week",
    ],
    min: 60,
    max: 79,
    augustPrompt:
      "Hi august — I scored Low Interaction on a cognitive self-screen. I think I'm running on bad sleep and caffeine. What's the move to actually feel sharper this week?",
  },
  {
    tier: "moderate-interaction",
    name: "Moderate interaction",
    shortLabel: "Noticeable cognitive drag",
    emoji: "🟠",
    description:
      "Reflexes slow, memory patchy, focus leaking. Substances, exhaustion, anxiety, or a rough day — something is interacting with your cognition in a way you can feel on the score.",
    receipt: "Noticeable cognitive interaction across reaction, memory, and attention.",
    advice: [
      "Don't make any big decisions tonight",
      "Eat something real. Sit down for ten minutes",
      "Don't post or send that message yet",
    ],
    min: 40,
    max: 59,
    augustPrompt:
      "Hi august — I scored Moderate Interaction on a cognitive self-screen. My reaction and focus felt off. Can you help me figure out what might actually be going on?",
  },
  {
    tier: "high-interaction",
    name: "High interaction",
    shortLabel: "Cognitive systems clearly affected",
    emoji: "🔴",
    description:
      "Multiple systems are misfiring. Reaction slow, memory shaky, focus elsewhere. Whether it's substances, deep exhaustion, or both, your brain is asking for a timeout right now.",
    receipt: "Significant cognitive interaction observed across reaction, memory, and attention domains.",
    advice: [
      "Do not drive — full stop",
      "Hand the phone to someone you trust",
      "Drink water, sit down, breathe. Forty minutes off changes a lot",
    ],
    min: 20,
    max: 39,
    augustPrompt:
      "Hi august — I just scored High Interaction on a cognitive self-screen and I'm not feeling great. Can we talk about what's going on with my body and head right now?",
  },
  {
    tier: "severe-interaction",
    name: "Severe interaction",
    shortLabel: "Cognition heavily impaired",
    emoji: "🚨",
    description:
      "Every domain came in low. This is what heavy cognitive interaction looks like on a casual self-screen. If this is from substances, stay where you are. If it isn't, you really need sleep — and possibly someone to check on you.",
    receipt: "Severe cognitive interaction. Strongly advise no driving, no major decisions, no DMs.",
    advice: [
      "Don't drive, don't ride, don't operate anything",
      "Tell a friend you trust where you are right now",
      "If something feels actually wrong, call SAMHSA: 1-800-662-4357",
    ],
    min: 0,
    max: 19,
    augustPrompt:
      "Hi august — I just scored Severe Interaction on a cognitive self-screen and I'm worried about how I'm feeling. Can you help me think through what to do right now?",
  },
];

// Disclaimer shown across the tool
export const DISCLAIMER =
  "Entertainment and self-reflection only. This tool does not check pharmacological drug-vs-drug interactions and is not a medical or legal impairment test. If you or someone you're with is in crisis, call SAMHSA's free helpline at 1-800-662-HELP (4357), available 24/7.";
