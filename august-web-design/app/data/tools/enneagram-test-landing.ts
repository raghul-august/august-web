// Enneagram Test — landing copy + 9 type definitions.
// Original prose; summarizes public-domain Enneagram type framework.
// NO React, NO JSX.

import type { EnneagramType } from "./enneagram-test-questions";

export const EXPECTATIONS = [
  {
    bold: "36 short statements",
    rest: "rated on a five-point scale from strongly disagree to strongly agree.",
  },
  {
    bold: "~5 minutes",
    rest: "to complete. Anonymous and scored entirely in your browser.",
  },
  {
    bold: "Honest, no-gating results",
    rest: ", a primary type, a wing, and the full ranking of all nine types so you can see how close your secondary type was.",
  },
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What is the Enneagram?",
    a: "The Enneagram is a personality framework that maps people to nine core types. Each type is defined less by surface behavior and more by an underlying motivation, a basic fear, and a basic desire that quietly drives how the person sees the world.",
  },
  {
    q: "Is the Enneagram scientific?",
    a: "The Enneagram is best understood as a self-reflection framework rather than a clinical instrument. It is not a diagnostic tool. People use it because the patterns it describes are recognizable and helpful for growth, not because it predicts behavior in a strict statistical sense.",
  },
  {
    q: "How accurate is a 36-question version?",
    a: "Short tests are good for a confident first pass. With four well-chosen items per type, a 36-question quiz can usually identify your top one or two types. If your top two scores are very close, the result screen tells you that and recommends reading both descriptions before committing to a type.",
  },
  {
    q: "What is a wing?",
    a: "Your wing is the type immediately next to your primary type on the Enneagram circle that you score highest on. Wings color how your primary type expresses itself in the world. A Type 5 with a 4 wing looks and feels different from a Type 5 with a 6 wing.",
  },
  {
    q: "Can my type change over time?",
    a: "The classical Enneagram view is that your core type stays constant for life, while the way you express it can become healthier or less healthy depending on circumstances. Some people change which type they identify with after deeper reflection, which usually means the first read was incomplete rather than that the type itself changed.",
  },
  {
    q: "Is my data stored anywhere?",
    a: "No. The questions are scored entirely in your browser. Nothing about your responses is uploaded or saved.",
  },
];

export interface EnneagramTypeDef {
  type: EnneagramType;
  name: string;
  /** Short you-statement headline for the results card. */
  headline: string;
  /** 2-3 sentence original prose summary. */
  summary: string;
  /** Core motivation. */
  motivation: string;
  /** Basic fear. */
  fear: string;
  /** Basic desire. */
  desire: string;
  /** Growth direction note (where this type integrates toward). */
  growth: string;
  /** Strengths at best. */
  atBest: string;
  /** Watch-out at worst. */
  atWorst: string;
}

export const TYPE_DEFINITIONS: readonly EnneagramTypeDef[] = [
  {
    type: 1,
    name: "The Reformer",
    headline: "You feel a deep pull toward doing things the right way.",
    summary:
      "Ones move through the world with a quiet sense of how it should work, and a personal commitment to closing the gap between what is and what ought to be. You hold yourself to a standard, often a stricter one than you'd apply to anyone else, and you take real satisfaction in work that's careful, principled, and honest.",
    motivation: "To act with integrity and to make the things around you better than you found them.",
    fear: "Being corrupt, defective, or fundamentally wrong.",
    desire: "To be good, balanced, and to live with a clear conscience.",
    growth:
      "Ones grow by relaxing toward the spontaneity and playfulness of Type 7 — letting things be imperfect, and trusting that joy isn't earned only after the work is finished.",
    atBest: "Principled, wise, discerning, realistic about what's worth improving and what's worth accepting.",
    atWorst: "Critical, rigid, self-punishing, resentful of others who aren't trying as hard.",
  },
  {
    type: 2,
    name: "The Helper",
    headline: "You feel most yourself when you're useful to someone who matters to you.",
    summary:
      "Twos are warm, attentive, and tuned to other people's needs almost by reflex. You like being the one who notices, the one who shows up, the one who can be counted on. The catch is that your own needs can quietly slip out of view, and being on the receiving end of someone else's care can feel oddly uncomfortable.",
    motivation: "To feel loved by being indispensable to the people around you.",
    fear: "Being unwanted, unworthy of love, or alone.",
    desire: "To feel genuinely loved and to know your love matters to others.",
    growth:
      "Twos grow by moving toward the self-honesty of Type 4 — naming their own needs, sitting with their own feelings, and letting themselves be loved for who they are, not for what they give.",
    atBest: "Generous, encouraging, emotionally intelligent, deeply present for others.",
    atWorst: "People-pleasing, possessive, manipulating closeness, secretly resentful of unreciprocated care.",
  },
  {
    type: 3,
    name: "The Achiever",
    headline: "You'd rather be the person who got it done than the person who talked about it.",
    summary:
      "Threes are driven, adaptable, and unusually good at reading what success looks like in any given room. You set goals, hit them, and quietly notice when other people don't. The risk is that the image of who you are gets a little tangled up with what you've accomplished, and the version of you underneath the trophies can become harder to find.",
    motivation: "To feel valuable through accomplishment, achievement, and the admiration of others.",
    fear: "Being worthless, exposed as a failure, or seen as ordinary.",
    desire: "To feel genuinely valuable and worthwhile.",
    growth:
      "Threes grow by moving toward the loyalty and commitment of Type 6, investing in people and processes that won't make them look impressive, simply because those people and processes matter.",
    atBest: "Energetic, capable, inspiring, able to translate ambition into real results for the people around them.",
    atWorst: "Image-conscious, competitive, deceptive about effort, willing to cut corners to win.",
  },
  {
    type: 4,
    name: "The Individualist",
    headline: "You feel things deeply, and you've always quietly known you were a little different.",
    summary:
      "Fours have an unusually rich inner life. You're drawn to depth, beauty, melancholy, and the kind of conversations that take you somewhere real. There's a thread of longing in you for something more, something authentic, something missing and you'd rather sit with that than paper over it with surface contentment.",
    motivation: "To find and express the authentic self, in all its uniqueness.",
    fear: "Having no identity, no significance, or being fundamentally flawed.",
    desire: "To know yourself, and to be known.",
    growth:
      "Fours grow by moving toward the discipline and groundedness of Type 1, channeling intensity into steady, useful creation instead of getting lost in feeling itself.",
    atBest: "Expressive, creative, emotionally honest, capable of finding meaning others miss.",
    atWorst: "Withdrawn, self-absorbed, melancholic, comparing themselves unfavorably against others.",
  },
  {
    type: 5,
    name: "The Investigator",
    headline: "You'd rather understand something deeply than perform around it.",
    summary:
      "Fives are observers. You learn for the love of learning, and you guard your time and energy carefully because you know how easily they get drained. Privacy isn't avoidance for you. It's the resource that makes thinking possible. You'd rather show up rare and prepared than constantly and half-engaged.",
    motivation: "To understand the world by mastering knowledge.",
    fear: "Being overwhelmed, intruded upon, or rendered incompetent.",
    desire: "To be capable and competent in a world you understand.",
    growth:
      "Fives grow by moving toward the action-oriented confidence of Type 8, trusting that they can engage the world directly, not only from behind books and screens.",
    atBest: "Perceptive, innovative, inventive, able to see what others miss.",
    atWorst: "Detached, hoarding, withholding, isolated from feelings and people.",
  },
  {
    type: 6,
    name: "The Loyalist",
    headline: "You scan the road ahead, because somebody should.",
    summary:
      "Sixes are the people who think things through, who plan for the contingency, who don't fall for the pitch on the first read. You're loyal to the people and structures you trust, and once you're in, you're really in. The cost is a hum of internal doubt that can be hard to switch off, especially when the stakes feel high.",
    motivation: "To have security, support, and guidance you can count on.",
    fear: "Being without support, alone in danger, or unable to defend yourself.",
    desire: "To feel safe and secure.",
    growth:
      "Sixes grow by moving toward the calm self-trust of Type 9, quieting the inner committee long enough to notice their own steady center.",
    atBest: "Reliable, loyal, courageous in real adversity, the person you actually want next to you in a crisis.",
    atWorst: "Anxious, indecisive, suspicious, oscillating between over-trust and over-doubt.",
  },
  {
    type: 7,
    name: "The Enthusiast",
    headline: "You light up around possibility, novelty, and what could come next.",
    summary:
      "Sevens are quick, optimistic, and unusually good at finding the upside in almost any situation. You like options, ideas, and momentum, and you can reframe a hard moment into a story with a silver lining faster than most people can name what hurt. The shadow is a quiet allergy to pain, the kind that makes it tempting to keep moving before the difficult feeling lands.",
    motivation: "To stay happy, stimulated, and free.",
    fear: "Being trapped in pain, deprived, or stuck in a limiting life.",
    desire: "To be satisfied, content, and have your needs met.",
    growth:
      "Sevens grow by moving toward the focus and depth of Type 5, letting themselves stay long enough with one thing, including the hard parts, to find what's actually underneath it.",
    atBest: "Joyful, versatile, productive, able to turn ideas into experiences others enjoy.",
    atWorst: "Scattered, impulsive, escapist, jumping out of anything that asks them to feel hard things.",
  },
  {
    type: 8,
    name: "The Challenger",
    headline: "You'd rather be direct and risk friction than soften the truth.",
    summary:
      "Eights are decisive, protective, and unusually comfortable with conflict. You take up space, you don't flinch easily, and you tend to read situations through the lens of power, who has it, who's using it well, and who's not. People who earn your trust find that you'll fight for them in ways most people won't, and people who don't, find you very hard to push around.",
    motivation: "To assert yourself, protect your people, and stay in control of your own life.",
    fear: "Being controlled, harmed, or made vulnerable by others.",
    desire: "To protect yourself and to determine your own course.",
    growth:
      "Eights grow by moving toward the warmth and care of Type 2, letting their strength carry tenderness, not just defense.",
    atBest: "Confident, decisive, magnanimous, a real protector of the people around them.",
    atWorst: "Confrontational, domineering, dismissive of vulnerability in themselves and others.",
  },
  {
    type: 9,
    name: "The Peacemaker",
    headline: "You'd rather keep the peace and let small things slide.",
    summary:
      "Nines are easygoing, accepting, and unusually skilled at seeing every side of a situation. You're a calming presence, you don't make a lot of demands, and conflict feels genuinely costly to you. The trade-off is that the question of what you actually want can get a little blurry. You've spent so much practice tuning into other people's signals that your own can fade into the background.",
    motivation: "To maintain inner and outer peace and to stay connected to others.",
    fear: "Loss, separation, or fragmentation being cut off from others.",
    desire: "To have inner stability and peace of mind.",
    growth:
      "Nines grow by moving toward the focused engagement of Type 3 — stepping into their own agenda with energy, instead of merging with whatever's around them.",
    atBest: "Steady, accepting, healing presence, able to bring people together across hard differences.",
    atWorst: "Disengaged, stubbornly passive, numb to their own preferences, conflict-avoidant to the point of self-erasure.",
  },
] as const;

/** Look up a type definition by number. Throws if the input is invalid. */
export function getTypeDef(type: EnneagramType): EnneagramTypeDef {
  const def = TYPE_DEFINITIONS.find((t) => t.type === type);
  if (!def) throw new Error(`Unknown Enneagram type: ${type}`);
  return def;
}
