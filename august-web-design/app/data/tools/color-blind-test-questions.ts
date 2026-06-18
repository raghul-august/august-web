// Color Blind Test — plate configurations.
// NOTE: No React/JSX in this file. Plain TypeScript only.
// Each plate describes what a normal-vision viewer should see (`displayedNumber`)
// vs. what a color-vision-deficient viewer might see (`alternativeNumber`).
// The IshiharaPlate component reads `figureColors` for the digit and
// `backgroundColors` for the surrounding noise dots.

export type ColorBlindDeficiencyType =
  | "control"
  | "red-green"
  | "protan"
  | "deutan"
  | "tritan"
  | "hidden-red-green";

export interface ColorBlindOption {
  label: string;
  value: string;
}

export interface ColorBlindPlate {
  id: number;
  /** Digit (as string) visible to normal trichromats. Use "" if nothing should be visible. */
  displayedNumber: string;
  /** Digit (as string) likely visible to viewers with the matching deficiency. "" if nothing. */
  alternativeNumber: string;
  /** Which deficiency class this plate is designed to probe. */
  deficiencyType: ColorBlindDeficiencyType;
  /** Palette for the digit dots. */
  figureColors: string[];
  /** Palette for the surrounding background dots. */
  backgroundColors: string[];
  /** 4 multiple choice options. Always include the correct + alternative answers + 1 distractor + "nothing". */
  options: readonly ColorBlindOption[];
  /** Short helper text shown beneath the plate. */
  prompt?: string;
}

// Reusable distractor pool for option labels (kept short to fit tile UI).
const NOTHING_OPTION: ColorBlindOption = { label: "I can't see a number", value: "nothing" };

function makeOptions(values: string[]): readonly ColorBlindOption[] {
  return values.map((v) =>
    v === "nothing" ? NOTHING_OPTION : { label: v, value: v },
  );
}

// Palettes -----------------------------------------------------------------

// Classic red-green Ishihara: warm orange/red figure on olive/green background.
const RG_FIGURE = ["#E04A2A", "#D14118", "#F0794A", "#C53A14", "#E76139"];
const RG_BACKGROUND = ["#7E9648", "#A5B45A", "#8FA84F", "#6F8438", "#B9C36F", "#94A857"];

// Deutan-leaning: red figure on lime/green ground (green-cone struggles to separate from red).
const DEUTAN_FIGURE = ["#D43A18", "#E04A2A", "#C53216", "#EC613D"];
const DEUTAN_BACKGROUND = ["#9FB347", "#B5C25A", "#8AA13C", "#C8D070"];

// Protan-leaning: dark brick/maroon figure on yellow-green ground (red-cone struggles with brick vs olive).
const PROTAN_FIGURE = ["#8C3A1F", "#A04425", "#762E15", "#B85234"];
const PROTAN_BACKGROUND = ["#B6C24B", "#CFD15A", "#A6B73E", "#DCD777"];

// Tritan: blue figure on yellow-green ground (blue-cone deficiency confuses blue/yellow).
const TRITAN_FIGURE = ["#2A5BB8", "#1E4FA8", "#3F71CC", "#264C9B"];
const TRITAN_BACKGROUND = ["#A8B53A", "#C0C547", "#8FA42E", "#D5CE60"];

// Hidden-digit plate (only the deficient see the number).
const HIDDEN_FIGURE = ["#7E9648", "#8FA84F", "#94A857"]; // similar to background-rg
const HIDDEN_BACKGROUND = ["#E04A2A", "#F0794A", "#D14118", "#E76139"];

// Control palette: high-contrast greens/oranges everyone can see.
const CONTROL_FIGURE = ["#206E55", "#1D644D", "#174E3C"]; // brand green
const CONTROL_BACKGROUND = ["#E8D9B5", "#D7C28E", "#EBE0C2", "#C7B07A"];

// Plate set ---------------------------------------------------------------

export const COLOR_BLIND_PLATES: readonly ColorBlindPlate[] = [
  {
    id: 1,
    displayedNumber: "12",
    alternativeNumber: "12",
    deficiencyType: "control",
    figureColors: CONTROL_FIGURE,
    backgroundColors: CONTROL_BACKGROUND,
    options: makeOptions(["12", "17", "72", "nothing"]),
    prompt: "What number do you see?",
  },
  {
    id: 2,
    displayedNumber: "8",
    alternativeNumber: "3",
    deficiencyType: "red-green",
    figureColors: RG_FIGURE,
    backgroundColors: RG_BACKGROUND,
    options: makeOptions(["8", "3", "5", "nothing"]),
    prompt: "What number do you see?",
  },
  {
    id: 3,
    displayedNumber: "29",
    alternativeNumber: "70",
    deficiencyType: "red-green",
    figureColors: RG_FIGURE,
    backgroundColors: RG_BACKGROUND,
    options: makeOptions(["29", "70", "20", "nothing"]),
    prompt: "What number do you see?",
  },
  {
    id: 4,
    displayedNumber: "5",
    alternativeNumber: "2",
    deficiencyType: "red-green",
    figureColors: RG_FIGURE,
    backgroundColors: RG_BACKGROUND,
    options: makeOptions(["5", "2", "8", "nothing"]),
    prompt: "What number do you see?",
  },
  {
    id: 5,
    displayedNumber: "74",
    alternativeNumber: "21",
    deficiencyType: "red-green",
    figureColors: RG_FIGURE,
    backgroundColors: RG_BACKGROUND,
    options: makeOptions(["74", "21", "47", "nothing"]),
    prompt: "What number do you see?",
  },
  {
    id: 6,
    displayedNumber: "6",
    alternativeNumber: "",
    deficiencyType: "red-green",
    figureColors: RG_FIGURE,
    backgroundColors: RG_BACKGROUND,
    options: makeOptions(["6", "5", "8", "nothing"]),
    prompt: "What number do you see?",
  },
  {
    id: 7,
    displayedNumber: "",
    alternativeNumber: "5",
    deficiencyType: "hidden-red-green",
    figureColors: HIDDEN_FIGURE,
    backgroundColors: HIDDEN_BACKGROUND,
    options: makeOptions(["5", "2", "3", "nothing"]),
    prompt: "What number do you see? (If you can't see one, that's a normal result.)",
  },
  {
    id: 8,
    displayedNumber: "26",
    alternativeNumber: "6",
    deficiencyType: "deutan",
    figureColors: DEUTAN_FIGURE,
    backgroundColors: DEUTAN_BACKGROUND,
    options: makeOptions(["26", "6", "20", "nothing"]),
    prompt: "What number do you see?",
  },
  {
    id: 9,
    displayedNumber: "42",
    alternativeNumber: "2",
    deficiencyType: "protan",
    figureColors: PROTAN_FIGURE,
    backgroundColors: PROTAN_BACKGROUND,
    options: makeOptions(["42", "2", "47", "nothing"]),
    prompt: "What number do you see?",
  },
  {
    id: 10,
    displayedNumber: "73",
    alternativeNumber: "",
    deficiencyType: "tritan",
    figureColors: TRITAN_FIGURE,
    backgroundColors: TRITAN_BACKGROUND,
    options: makeOptions(["73", "78", "13", "nothing"]),
    prompt: "What number do you see?",
  },
  {
    id: 11,
    displayedNumber: "16",
    alternativeNumber: "",
    deficiencyType: "tritan",
    figureColors: TRITAN_FIGURE,
    backgroundColors: TRITAN_BACKGROUND,
    options: makeOptions(["16", "10", "76", "nothing"]),
    prompt: "What number do you see?",
  },
  {
    id: 12,
    displayedNumber: "35",
    alternativeNumber: "",
    deficiencyType: "red-green",
    figureColors: RG_FIGURE,
    backgroundColors: RG_BACKGROUND,
    options: makeOptions(["35", "30", "8", "nothing"]),
    prompt: "What number do you see?",
  },
] as const;

export const COLOR_BLIND_TOTAL = COLOR_BLIND_PLATES.length;

export function getPlateById(id: number): ColorBlindPlate | undefined {
  return COLOR_BLIND_PLATES.find((p) => p.id === id);
}
