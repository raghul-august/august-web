export interface PillColorOption {
  readonly label: string;
  readonly value: string;
  readonly swatch: string;
  readonly group: "common" | "solid" | "duo";
}

export interface PillShapeOption {
  readonly label: string;
  readonly value: string;
}

// Drugs.com taxonomy preserved (value strings are stable, swatches are
// approximate sRGB representations for the UI swatches).
export const PILL_COLORS: readonly PillColorOption[] = [
  { label: "White", value: "white", swatch: "#FFFFFF", group: "common" },
  { label: "Yellow", value: "yellow", swatch: "#F5D67A", group: "common" },
  { label: "Pink", value: "pink", swatch: "#F1B5B7", group: "common" },
  { label: "Blue", value: "blue", swatch: "#7AA5D2", group: "common" },
  { label: "Orange", value: "orange", swatch: "#F0A567", group: "common" },
  { label: "Beige", value: "beige", swatch: "#E8D9B5", group: "solid" },
  { label: "Black", value: "black", swatch: "#2A2A2A", group: "solid" },
  { label: "Brown", value: "brown", swatch: "#8B5E3C", group: "solid" },
  { label: "Clear", value: "clear", swatch: "#F5F5F5", group: "solid" },
  { label: "Gold", value: "gold", swatch: "#D4A24C", group: "solid" },
  { label: "Gray", value: "gray", swatch: "#B0B0B0", group: "solid" },
  { label: "Green", value: "green", swatch: "#7BAE7F", group: "solid" },
  { label: "Maroon", value: "maroon", swatch: "#7A2E3F", group: "solid" },
  { label: "Peach", value: "peach", swatch: "#F2C4A0", group: "solid" },
  { label: "Purple", value: "purple", swatch: "#A586C0", group: "solid" },
  { label: "Red", value: "red", swatch: "#C75451", group: "solid" },
  { label: "Tan", value: "tan", swatch: "#D8B894", group: "solid" },
  { label: "Blue & White", value: "blue-white", swatch: "#7AA5D2", group: "duo" },
  { label: "Green & White", value: "green-white", swatch: "#7BAE7F", group: "duo" },
  { label: "Red & White", value: "red-white", swatch: "#C75451", group: "duo" },
  { label: "Pink & Purple", value: "pink-purple", swatch: "#F1B5B7", group: "duo" },
  { label: "Yellow & White", value: "yellow-white", swatch: "#F5D67A", group: "duo" },
  { label: "Orange & White", value: "orange-white", swatch: "#F0A567", group: "duo" },
] as const;

export const PILL_SHAPES: readonly PillShapeOption[] = [
  { label: "Round", value: "round" },
  { label: "Oval", value: "oval" },
  { label: "Capsule / Oblong", value: "capsule" },
  { label: "Rectangle", value: "rectangle" },
  { label: "Three-sided", value: "three-sided" },
  { label: "Four-sided", value: "four-sided" },
  { label: "Five-sided", value: "five-sided" },
  { label: "Six-sided", value: "six-sided" },
  { label: "Eight-sided", value: "eight-sided" },
  { label: "Heart-shape", value: "heart" },
  { label: "Kidney-shape", value: "kidney" },
  { label: "Egg-shape", value: "egg" },
  { label: "Barrel", value: "barrel" },
] as const;

export type PillColorValue = (typeof PILL_COLORS)[number]["value"];
export type PillShapeValue = (typeof PILL_SHAPES)[number]["value"];

export const COLOR_BY_VALUE: Record<string, PillColorOption> = PILL_COLORS.reduce(
  (acc, c) => ({ ...acc, [c.value]: c }),
  {} as Record<string, PillColorOption>,
);

export const SHAPE_BY_VALUE: Record<string, PillShapeOption> = PILL_SHAPES.reduce(
  (acc, s) => ({ ...acc, [s.value]: s }),
  {} as Record<string, PillShapeOption>,
);

export interface PillRecord {
  readonly id: string;
  readonly imprint: string;
  readonly drug: string;
  readonly genericName?: string;
  readonly strength: string;
  readonly color: PillColorValue;
  readonly shape: PillShapeValue;
  readonly manufacturer: string;
  readonly ndc?: string;
  readonly drugClass: string;
  readonly use: string;
  readonly schedule?: string;
}

