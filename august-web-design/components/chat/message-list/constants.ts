import { TextSize } from "@/types";

export const PROCESSING_TEXT_KEYS = [
  'chat.processing.reading',
  'chat.processing.understanding',
  'chat.processing.summarising',
] as const;

export const PROCESSING_CYCLE_TIME = 20000; // 20 seconds per text
export const MAX_PROCESSING_TIME = 120000; // 2 minutes max

export const CITATION_MAX_TIMEOUT = 30000; // 30 seconds
export const CITATION_STEP_DELAY = 1500; // ms between each citation point
export const CITATION_COMPLETION_DELAY = 1500; // ms after final point before finishing

export const DATE_SEPARATOR_SIZE_MAP: Record<TextSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 12, lineHeight: 16 },
  medium: { fontSize: 14, lineHeight: 18 },
  large: { fontSize: 16, lineHeight: 20 },
};
