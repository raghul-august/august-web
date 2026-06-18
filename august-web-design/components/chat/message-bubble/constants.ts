import { TextSize } from "@/types";

export const BOT_TEXT_SIZE_MAP: Record<TextSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 18, lineHeight: 26 },
  medium: { fontSize: 20, lineHeight: 28 },
  large: { fontSize: 24, lineHeight: 32 },
};

export const USER_TEXT_SIZE_MAP: Record<TextSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 17, lineHeight: 25 },
  medium: { fontSize: 19, lineHeight: 27 },
  large: { fontSize: 23, lineHeight: 31 },
};

export const MOBILE_BOT_TEXT_SIZE_MAP: Record<TextSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 16, lineHeight: 24 },
  medium: { fontSize: 18, lineHeight: 26 },
  large: { fontSize: 22, lineHeight: 30 },
};

export const MOBILE_USER_TEXT_SIZE_MAP: Record<TextSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 15, lineHeight: 23 },
  medium: { fontSize: 17, lineHeight: 25 },
  large: { fontSize: 21, lineHeight: 29 },
};
