export type OcdTrack = "adult" | "youth";

export interface OcdOption {
  label: string;
  value: number;
}

export interface OcdQuestion {
  id: number;
  text: string;
  subtext?: string;
  preamble?: string;
  options: readonly OcdOption[];
}

export const ADULT_OPTIONS: readonly OcdOption[] = [
  { label: "Not at all", value: 0 },
  { label: "A little", value: 1 },
  { label: "Moderately", value: 2 },
  { label: "A lot", value: 3 },
  { label: "Extremely", value: 4 },
] as const;

export const YOUTH_OPTIONS: readonly OcdOption[] = [
  { label: "Never", value: 0 },
  { label: "Sometimes", value: 1 },
  { label: "Always", value: 2 },
] as const;

const ADULT_PREAMBLE = "Over the past month";
const YOUTH_PREAMBLE = "In the last month";

export const adultQuestions: readonly OcdQuestion[] = [
  {
    id: 1,
    text: "I get upset if objects are not arranged properly.",
    preamble: ADULT_PREAMBLE,
    options: ADULT_OPTIONS,
  },
  {
    id: 2,
    text: "I repeatedly check doors, windows, drawers, etc.",
    preamble: ADULT_PREAMBLE,
    options: ADULT_OPTIONS,
  },
  {
    id: 3,
    text: "I sometimes have to wash or clean myself simply because I feel contaminated.",
    preamble: ADULT_PREAMBLE,
    options: ADULT_OPTIONS,
  },
  {
    id: 4,
    text: "I frequently get nasty thoughts and have difficulty in getting rid of them.",
    preamble: ADULT_PREAMBLE,
    options: ADULT_OPTIONS,
  },
] as const;

export const youthQuestions: readonly OcdQuestion[] = [
  {
    id: 1,
    text: "Even after I'm done, I still worry that I didn't finish things.",
    preamble: YOUTH_PREAMBLE,
    options: YOUTH_OPTIONS,
  },
  {
    id: 2,
    text: "I need things to be in a certain way.",
    preamble: YOUTH_PREAMBLE,
    options: YOUTH_OPTIONS,
  },
  {
    id: 3,
    text: "I need to count while I do things.",
    preamble: YOUTH_PREAMBLE,
    options: YOUTH_OPTIONS,
  },
  {
    id: 4,
    text: "I wash my hands more than other kids.",
    preamble: YOUTH_PREAMBLE,
    options: YOUTH_OPTIONS,
  },
  {
    id: 5,
    text: "I get upset by bad thoughts that pop into my head when I don't want them to.",
    preamble: YOUTH_PREAMBLE,
    options: YOUTH_OPTIONS,
  },
] as const;

export const ADULT_TOTAL = adultQuestions.length; // 4
export const YOUTH_TOTAL = youthQuestions.length; // 5
export const ADULT_MAX_SCORE = 16; // 4 items × 4
export const YOUTH_MAX_SCORE = 10; // 5 items × 2
export const ADULT_CUTOFF = 4; // strictly greater-than
export const YOUTH_CUTOFF = 2; // strictly greater-than

export function getQuestionsForTrack(
  track: OcdTrack,
): readonly OcdQuestion[] {
  return track === "adult" ? adultQuestions : youthQuestions;
}

export function getOptionsForTrack(track: OcdTrack): readonly OcdOption[] {
  return track === "adult" ? ADULT_OPTIONS : YOUTH_OPTIONS;
}

export function getMaxScoreForTrack(track: OcdTrack): number {
  return track === "adult" ? ADULT_MAX_SCORE : YOUTH_MAX_SCORE;
}

export function getCutoffForTrack(track: OcdTrack): number {
  return track === "adult" ? ADULT_CUTOFF : YOUTH_CUTOFF;
}
