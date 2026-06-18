// Enneagram Test — 36 Likert items (4 per type), original prose.
// All items are author-original, paraphrased from public-domain Enneagram
// trait categories (Riso-Hudson nine-type framework). No verbatim copying.
//
// NO React, NO JSX in this file. Pure data + types.

export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface LikertOption {
  label: string;
  value: number;
}

export interface EnneagramQuestion {
  id: number;
  /** First-person statement the user agrees/disagrees with. */
  text: string;
  /** Which Enneagram type this item scores toward when answered "Agree". */
  type: EnneagramType;
}

export const LIKERT_OPTIONS: readonly LikertOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 },
] as const;

export const MIN_LIKERT = 1;
export const MAX_LIKERT = 5;
export const ITEMS_PER_TYPE = 4;
export const TYPE_MIN_RAW = ITEMS_PER_TYPE * MIN_LIKERT; // 4
export const TYPE_MAX_RAW = ITEMS_PER_TYPE * MAX_LIKERT; // 20

/**
 * Items are interleaved across types so the same theme doesn't repeat in a row.
 * The `type` field determines which type's bucket the response sums into.
 */
export const questions: readonly EnneagramQuestion[] = [
  // Round 1 — one item per type
  { id: 1, text: "I notice mistakes others overlook and feel a quiet pull to correct them.", type: 1 },
  { id: 2, text: "I can usually sense what someone around me needs before they ask.", type: 2 },
  { id: 3, text: "How I'm coming across to others matters a lot to me, even when I pretend it doesn't.", type: 3 },
  { id: 4, text: "I've often felt like I don't quite fit the world other people seem to live in.", type: 4 },
  { id: 5, text: "I'd rather understand something deeply on my own than discuss it half-formed.", type: 5 },
  { id: 6, text: "I tend to think through what could go wrong so I'm not caught off guard.", type: 6 },
  { id: 7, text: "When something stops being interesting, I move on quickly to the next thing.", type: 7 },
  { id: 8, text: "I'd rather be direct and risk friction than tiptoe around what I think.", type: 8 },
  { id: 9, text: "I find it easy to go along with what other people want.", type: 9 },

  // Round 2 — second item per type
  { id: 10, text: "I hold myself to a higher standard than I would ever apply to someone else.", type: 1 },
  { id: 11, text: "I feel a warm satisfaction when I'm the person someone leans on.", type: 2 },
  { id: 12, text: "I'm willing to keep adjusting myself to whatever situation will help me succeed.", type: 3 },
  { id: 13, text: "My feelings tend to run deeper and last longer than most people's seem to.", type: 4 },
  { id: 14, text: "I get drained quickly by social demands and need real time alone to refill.", type: 5 },
  { id: 15, text: "When something feels too good to be true, my first reaction is to look for the catch.", type: 6 },
  { id: 16, text: "I'd rather have several open options than commit early to one path.", type: 7 },
  { id: 17, text: "People who lean on me find that I will go to bat for them without hesitation.", type: 8 },
  { id: 18, text: "I'd rather a small annoyance slide by than make a fuss about it.", type: 9 },

  // Round 3 — third item per type
  { id: 19, text: "There's a voice inside me that critiques almost everything I do.", type: 1 },
  { id: 20, text: "I sometimes pour so much into helping others that my own needs disappear.", type: 2 },
  { id: 21, text: "I work hard, and I want people to notice the results.", type: 3 },
  { id: 22, text: "I'm drawn to what's beautiful, sad, or rare more than to what's ordinary.", type: 4 },
  { id: 23, text: "I'd rather be the observer in a room than the center of attention.", type: 5 },
  { id: 24, text: "I keep mental contingency plans running in the background, even for calm days.", type: 6 },
  { id: 25, text: "I tend to reframe difficult moments into stories with a positive spin.", type: 7 },
  { id: 26, text: "I don't trust people easily, but once I do, I protect them fiercely.", type: 8 },
  { id: 27, text: "I lose track of what I want when I'm too aware of what everyone else wants.", type: 9 },

  // Round 4 — fourth item per type
  { id: 28, text: "Doing something well, and ethically, matters more to me than doing it fast.", type: 1 },
  { id: 29, text: "I feel a little uncomfortable being on the receiving end of someone's care.", type: 2 },
  { id: 30, text: "I'm afraid that without my accomplishments, people wouldn't find me worth much.", type: 3 },
  { id: 31, text: "I'd rather feel something painful intensely than feel nothing at all.", type: 4 },
  { id: 32, text: "I collect knowledge in case I need it later, and I dislike being caught uninformed.", type: 5 },
  { id: 33, text: "I question my own decisions a lot, even after I've made them.", type: 6 },
  { id: 34, text: "I dodge sadness and boredom the same way some people dodge physical pain.", type: 7 },
  { id: 35, text: "I'm uncomfortable being controlled, and I tend to push back on rules that don't make sense to me.", type: 8 },
  { id: 36, text: "A peaceful, low-conflict day feels like a real success to me.", type: 9 },
] as const;

export const TOTAL_QUESTIONS = questions.length; // 36

/** Adjacent (wing) types on the Enneagram circle. */
export const WING_MAP: Readonly<Record<EnneagramType, readonly [EnneagramType, EnneagramType]>> = {
  1: [9, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 5],
  5: [4, 6],
  6: [5, 7],
  7: [6, 8],
  8: [7, 9],
  9: [8, 1],
} as const;
