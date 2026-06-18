export const colors = {
  green50: "#e9f1ee",
  green100: "#bad2ca",
  green200: "#98bcb1",
  green300: "#6a9e8d",
  green400: "#4d8b77",
  green500: "#206e55",
  green600: "#1d644d",
  green700: "#174e3c",
  green800: "#123d2f",
  green900: "#0d2e24",
  greenVibrant: "#00EC92",
  neutral50: "#f4f5f5",
  neutral100: "#dfe2e1",
  neutral200: "#cacecd",
  neutral300: "#b5bab9",
  neutral400: "#a0a7a5",
  neutral500: "#8a9390",
  neutral600: "#767f7c",
  neutral700: "#626a67",
  neutral800: "#4e5553",
  neutral900: "#3b403e",
  neutral950: "#272a29",
  neutral1000: "#141515",
  // canvas
  bg: "#FAF9F5",
  surface: "#FEFEFD",
  border: "#E8EAE8",
  textPrimary: "#1C1917",
  textMuted: "rgba(28, 25, 23, 0.7)",
  textSecondary: "#767f7c",
  // semantic
  error: "#DC503C",
  caution: "#FAD82D",
  info: "#00B2FF",
  lime: "#CFFB20",
  limeSoft: "#bef264",
} as const;

export type ColorToken = keyof typeof colors;

export type BadgeTone = "brand" | "neutral" | "success" | "warning" | "danger" | "info";

const BADGE_TONE_MAP: Record<string, BadgeTone> = {
  // adhd
  "badge-low": "success",
  "badge-medium": "info",
  "badge-high": "danger",
  // childhood-trauma
  "badge-moderate": "info",
  "badge-significant": "warning",
  // rice-purity
  "badge-pure": "success",
  "badge-open": "info",
  "badge-average": "neutral",
  "badge-hoarder": "warning",
  "badge-master": "danger",
};

export function getBadgeTone(badge: string): BadgeTone {
  return BADGE_TONE_MAP[badge] ?? "neutral";
}

export const radius = {
  pill: 100,
  card: 16,
  cardLg: 24,
  sm: 8,
  xs: 4,
} as const;
