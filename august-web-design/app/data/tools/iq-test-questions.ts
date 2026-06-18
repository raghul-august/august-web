export type IqCategory =
  | "verbal"
  | "numerical"
  | "pattern"
  | "logical"
  | "spatial";

export type IqDifficulty = "easy" | "medium" | "hard";

export interface IqOption {
  label: string;
  /** Index into the parent question's options array (0..3). */
  value: number;
}

export interface IqQuestion {
  id: number;
  category: IqCategory;
  difficulty: IqDifficulty;
  /** Short label shown as a pill above the question. */
  categoryLabel: string;
  text: string;
  options: readonly IqOption[];
  /** Index of the correct option in `options`. */
  correctIndex: number;
  /** Brief explanation, available for future "review answers" UI. */
  explanation: string;
}

const opt = (labels: readonly string[]): readonly IqOption[] =>
  labels.map((label, i) => ({ label, value: i }));

/**
 * 20 original IQ-style items across five reasoning domains.
 * No item is taken from any commercial test; structures mirror standard
 * categories used in WAIS-style screens (verbal analogy, number series,
 * pattern completion, logical deduction, spatial reasoning).
 */
export const IQ_QUESTIONS: readonly IqQuestion[] = [
  // ───── Verbal analogy ─────
  {
    id: 1,
    category: "verbal",
    difficulty: "easy",
    categoryLabel: "Verbal analogy",
    text: "Bird is to sky as fish is to ___?",
    options: opt(["Water", "Scales", "Net", "Air"]),
    correctIndex: 0,
    explanation:
      "Birds inhabit the sky; the parallel environment for fish is water.",
  },
  {
    id: 2,
    category: "verbal",
    difficulty: "medium",
    categoryLabel: "Verbal analogy",
    text: "Author is to novel as composer is to ___?",
    options: opt(["Audience", "Symphony", "Conductor", "Stage"]),
    correctIndex: 1,
    explanation:
      "An author produces a novel; the parallel creative output of a composer is a symphony.",
  },
  {
    id: 3,
    category: "verbal",
    difficulty: "medium",
    categoryLabel: "Verbal analogy",
    text: "Drought is to rainfall as famine is to ___?",
    options: opt(["Hunger", "Food", "Desert", "Crop"]),
    correctIndex: 1,
    explanation:
      "A drought is a deficit of rainfall; a famine is a deficit of food.",
  },
  {
    id: 4,
    category: "verbal",
    difficulty: "hard",
    categoryLabel: "Verbal analogy",
    text: "Whisper is to shout as glance is to ___?",
    options: opt(["Stare", "Blink", "Look", "Eye"]),
    correctIndex: 0,
    explanation:
      "Whisper and shout are low/high intensity versions of the same act (speaking). A glance is a low-intensity look; a stare is the high-intensity counterpart.",
  },

  // ───── Number sequence ─────
  {
    id: 5,
    category: "numerical",
    difficulty: "easy",
    categoryLabel: "Number sequence",
    text: "What number comes next? 3, 6, 12, 24, ___",
    options: opt(["30", "36", "48", "60"]),
    correctIndex: 2,
    explanation: "Each term doubles the previous one. 24 × 2 = 48.",
  },
  {
    id: 6,
    category: "numerical",
    difficulty: "medium",
    categoryLabel: "Number sequence",
    text: "What number completes the sequence? 2, 6, 12, 20, 30, ___",
    options: opt(["36", "40", "42", "48"]),
    correctIndex: 2,
    explanation:
      "The differences are 4, 6, 8, 10, 12 — each gap grows by 2. 30 + 12 = 42.",
  },
  {
    id: 7,
    category: "numerical",
    difficulty: "medium",
    categoryLabel: "Number sequence",
    text: "What comes next? 1, 4, 9, 16, 25, ___",
    options: opt(["30", "35", "36", "49"]),
    correctIndex: 2,
    explanation: "These are perfect squares (1², 2², 3², 4², 5²). Next is 6² = 36.",
  },
  {
    id: 8,
    category: "numerical",
    difficulty: "hard",
    categoryLabel: "Number sequence",
    text: "What number comes next? 1, 1, 2, 3, 5, 8, 13, ___",
    options: opt(["18", "21", "24", "26"]),
    correctIndex: 1,
    explanation:
      "Fibonacci: each term is the sum of the previous two. 8 + 13 = 21.",
  },

  // ───── Pattern completion ─────
  {
    id: 9,
    category: "pattern",
    difficulty: "easy",
    categoryLabel: "Pattern completion",
    text: "If the pattern is A, B, C, A, B, C, A, B, ___, what comes next?",
    options: opt(["A", "B", "C", "D"]),
    correctIndex: 2,
    explanation: "The pattern A, B, C repeats. After A, B comes C.",
  },
  {
    id: 10,
    category: "pattern",
    difficulty: "medium",
    categoryLabel: "Pattern completion",
    text: "Which letter completes the pattern? Z, X, V, T, R, ___",
    options: opt(["P", "Q", "O", "S"]),
    correctIndex: 0,
    explanation:
      "Letters skip one each step: Z (skip Y) X (skip W) V (skip U) T (skip S) R (skip Q) → P.",
  },
  {
    id: 11,
    category: "pattern",
    difficulty: "medium",
    categoryLabel: "Pattern completion",
    text: "In the series A1, C3, E5, G7, ___ what comes next?",
    options: opt(["H8", "I9", "J10", "K11"]),
    correctIndex: 1,
    explanation:
      "Letters skip one each step (A, C, E, G → I) and numbers count odd numbers (1, 3, 5, 7 → 9). So I9.",
  },
  {
    id: 12,
    category: "pattern",
    difficulty: "hard",
    categoryLabel: "Pattern completion",
    text: "Continue the pattern: 2, 3, 5, 7, 11, 13, ___",
    options: opt(["15", "16", "17", "19"]),
    correctIndex: 2,
    explanation: "These are consecutive prime numbers. The next prime after 13 is 17.",
  },

  // ───── Logical deduction ─────
  {
    id: 13,
    category: "logical",
    difficulty: "easy",
    categoryLabel: "Logical deduction",
    text: "All roses are flowers. Some flowers fade quickly. Which statement must be true?",
    options: opt([
      "All roses fade quickly.",
      "Some roses fade quickly.",
      "No roses fade quickly.",
      "None of the above must be true.",
    ]),
    correctIndex: 3,
    explanation:
      "We know roses are flowers and that *some* flowers fade quickly, but the fading ones might not include any roses. None of the first three are guaranteed.",
  },
  {
    id: 14,
    category: "logical",
    difficulty: "medium",
    categoryLabel: "Logical deduction",
    text: "If it is raining, the ground is wet. The ground is not wet. Therefore:",
    options: opt([
      "It is raining.",
      "It is not raining.",
      "It might be raining.",
      "We cannot say anything.",
    ]),
    correctIndex: 1,
    explanation:
      "Modus tollens: if P → Q and Q is false, then P must be false. Not wet means not raining.",
  },
  {
    id: 15,
    category: "logical",
    difficulty: "medium",
    categoryLabel: "Logical deduction",
    text: "Maya is older than Leo. Leo is older than Sam. Sam is older than Pia. Who is youngest?",
    options: opt(["Maya", "Leo", "Sam", "Pia"]),
    correctIndex: 3,
    explanation: "Ordering: Maya > Leo > Sam > Pia. Pia is youngest.",
  },
  {
    id: 16,
    category: "logical",
    difficulty: "hard",
    categoryLabel: "Logical deduction",
    text: "Five friends sit in a row. Ana is left of Ben. Carl is right of Ben. Dee is left of Ana. Ed is right of Carl. Who sits in the middle?",
    options: opt(["Ana", "Ben", "Carl", "Dee"]),
    correctIndex: 1,
    explanation:
      "Building the order: Dee, Ana, Ben, Carl, Ed. The middle (3rd of 5) is Ben.",
  },

  // ───── Spatial reasoning ─────
  {
    id: 17,
    category: "spatial",
    difficulty: "easy",
    categoryLabel: "Spatial reasoning",
    text: "A cube is painted blue on all sides, then cut into 27 smaller equal cubes. How many small cubes have exactly three blue faces?",
    options: opt(["4", "6", "8", "12"]),
    correctIndex: 2,
    explanation:
      "Only the 8 corner cubes of the 3×3×3 stack have three painted faces (one per corner).",
  },
  {
    id: 18,
    category: "spatial",
    difficulty: "medium",
    categoryLabel: "Spatial reasoning",
    text: "If you rotate the letter 'b' 180° around a horizontal axis (top-bottom flip), which letter does it most resemble?",
    options: opt(["d", "p", "q", "b"]),
    correctIndex: 1,
    explanation:
      "Flipping 'b' top-to-bottom puts the bowl on top of the stem, producing a 'p' shape.",
  },
  {
    id: 19,
    category: "spatial",
    difficulty: "medium",
    categoryLabel: "Spatial reasoning",
    text: "A square piece of paper is folded in half twice, then a single round hole is punched through the center of the folded square. When unfolded, how many holes will the paper have?",
    options: opt(["1", "2", "3", "4"]),
    correctIndex: 3,
    explanation:
      "Two folds produce four layers; one punch through all four layers makes four holes in the unfolded paper.",
  },
  {
    id: 20,
    category: "spatial",
    difficulty: "hard",
    categoryLabel: "Spatial reasoning",
    text: "Imagine a cube sitting on a table. You paint the top face red, then tip the cube forward (away from you) so the previously-front face is now on top. Which face is now on the bottom?",
    options: opt([
      "The originally red (top) face",
      "The originally bottom face",
      "The originally back face",
      "The originally front face",
    ]),
    correctIndex: 2,
    explanation:
      "Tipping forward rolls the cube along its front-bottom edge. The front face moves to the top, the top moves to the back, the back moves to the bottom, and the bottom moves to the front.",
  },
] as const;

export const IQ_TOTAL = IQ_QUESTIONS.length; // 20
export const IQ_MAX_RAW = IQ_QUESTIONS.length; // each item is 0 or 1

export const IQ_CATEGORY_LABELS: Record<IqCategory, string> = {
  verbal: "Verbal analogy",
  numerical: "Number sequence",
  pattern: "Pattern completion",
  logical: "Logical deduction",
  spatial: "Spatial reasoning",
};

export function getIqQuestion(id: number): IqQuestion | undefined {
  return IQ_QUESTIONS.find((q) => q.id === id);
}
