export interface MentalAgeTier {
  id: "forever-young" | "young-adult" | "balanced-adult" | "wise" | "old-soul";
  label: string;
  /** Inclusive lower bound on the rounded mental age. */
  min: number;
  /** Inclusive upper bound on the rounded mental age. */
  max: number;
  range: string;
  headline: string;
  description: string;
  badge:
    | "badge-pure"
    | "badge-low"
    | "badge-moderate"
    | "badge-significant"
    | "badge-high";
}

/** Ordered young → old. */
export const MENTAL_AGE_TIERS: readonly MentalAgeTier[] = [
  {
    id: "forever-young",
    label: "Forever Young",
    min: 18,
    max: 24,
    range: "18–24",
    headline: "Your mind is bursting with playful, in-the-moment energy.",
    description:
      "You answered like someone who loves spontaneity, viral culture, and going where the night takes you. The world hasn't dampened your urge to try, post, dance, and stay up too late and honestly, that's a feature, not a bug.",
    badge: "badge-pure",
  },
  {
    id: "young-adult",
    label: "Young Adult Spirit",
    min: 25,
    max: 33,
    range: "25–33",
    headline: "You think like a curious, social, mid-twenties spirit.",
    description:
      "Your mental age sits in classic early-adult territory: you like fun, friends, and freedom, but you're starting to care about budgets, breakfast, and the way you handle stress. The mix of impulse and self-awareness is the sweet spot.",
    badge: "badge-low",
  },
  {
    id: "balanced-adult",
    label: "Grounded Adult",
    min: 34,
    max: 43,
    range: "34–43",
    headline: "You answered like a settled, intentional adult.",
    description:
      "Routines, plans, and steady habits show up in your choices — and so does the willingness to enjoy the moment. This is the band where most people first feel like the adult in the room without losing their sense of play.",
    badge: "badge-moderate",
  },
  {
    id: "wise",
    label: "Wise Beyond Your Years",
    min: 44,
    max: 52,
    range: "44–52",
    headline: "Your mind moves with the calm of someone older.",
    description:
      "You tend to plan, save, schedule, and protect your energy. People probably tell you that you're 'mature for your age' — your answers say the same thing. The downside: it's easy to forget to leave room for spontaneity.",
    badge: "badge-significant",
  },
  {
    id: "old-soul",
    label: "Old Soul",
    min: 53,
    max: 60,
    range: "53–60",
    headline: "You think like a true old soul.",
    description:
      "Quiet evenings, deep conversations, careful planning, and a low tolerance for chaos these answers paint the portrait of someone whose mind has settled into reflective, considered rhythms. You value peace, purpose, and people over noise.",
    badge: "badge-high",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    q: "What is a mental age test?",
    a: "A mental age test is a lighthearted self-report quiz that compares the way you live, think, and respond to the world against age-typical patterns. It isn't an IQ test, a developmental assessment, or anything clinical it's a mirror for how grown-up (or playful) your habits feel right now.",
  },
  {
    q: "Is this an accurate measure of my mental age?",
    a: "No quiz can deliver an exact number for something as fuzzy as 'mental age.' Treat the result as a personality snapshot. The score reflects which lifestyle, decision-making, and social choices you tend toward not your intelligence, maturity, or biological brain age.",
  },
  {
    q: "How is the score calculated?",
    a: "Each of the 15 questions has four options, and each option carries an implicit age value (ranging roughly 18–55). We take the average of the values you select and round to the nearest year. That number is your 'mental age,' and we band it into five descriptive tiers.",
  },
  {
    q: "How long does the test take?",
    a: "About 2–3 minutes. There are 15 multiple-choice questions, the next one appears automatically after you answer, and there's no sign-up or email gate.",
  },
  {
    q: "Will my answers be saved?",
    a: "No. Nothing leaves your browser. The test runs entirely on this page no account, no storage, no tracking of individual responses.",
  },
  {
    q: "Why doesn't my mental age match my real age?",
    a: "Because they measure different things. Real age is a fixed number; the mental-age tier you land in reflects what you choose to do on a typical Friday, how you eat breakfast, how you spend money, and how you talk about stress. Those choices drift independently of how many candles are on your cake.",
  },
] as const;

export const HOW_STEPS = [
  {
    label: "Answer 15 quick questions",
    text: "Multiple-choice items about how you live: sleep, social media, money, stress, music, and more.",
  },
  {
    label: "Each option points to an age",
    text: "Behind every choice is a number, the typical mental age that pattern points to. Tap and the next question loads automatically.",
  },
  {
    label: "See your mental age + tier",
    text: "We average the values you picked and place you in one of five tiers, from Forever Young to Old Soul.",
  },
] as const;

export const EXPECTATIONS = [
  {
    bold: "15 quick questions",
    rest: "with four multiple-choice options each, auto-advancing as you go.",
  },
  {
    bold: "~2 minutes",
    rest: "to complete, totally anonymous, no email or sign-up.",
  },
  {
    bold: "Playful, not clinical",
    rest: ", a lifestyle snapshot — not an IQ, maturity, or developmental test.",
  },
] as const;
