export const CYCLE_LENGTH_MIN = 20;
export const CYCLE_LENGTH_MAX = 45;
export const CYCLE_LENGTH_DEFAULT = 28;

/** Luteal phase is biologically stable around ~14 days. */
export const LUTEAL_PHASE_DAYS = 14;

/** DPO window rendered in the result table (inclusive). */
export const IMPLANTATION_DPO_MIN = 6;
export const IMPLANTATION_DPO_MAX = 12;

/** DPO with the highest reported implantation probability. */
export const PEAK_IMPLANTATION_DPO = 9;

/** Days from implantation until hCG is typically detectable on a sensitive home test. */
export const HCG_DETECTABLE_OFFSET_DAYS = 3;

export type ImplantationProbability = "less-common" | "common" | "most-common";

export const PROBABILITY_BY_DPO: Record<number, ImplantationProbability> = {
  6: "less-common",
  7: "common",
  8: "common",
  9: "most-common",
  10: "common",
  11: "common",
  12: "less-common",
};

export const PROBABILITY_LABEL: Record<ImplantationProbability, string> = {
  "less-common": "Less common",
  common: "Common",
  "most-common": "Most common",
};

export const FAQ_ITEMS = [
  {
    q: "When does implantation usually happen?",
    a: "Implantation typically happens between 6 and 12 days after ovulation, with the peak around 8 to 10 days. Day 9 after ovulation is when the largest share of pregnancies implant.",
  },
  {
    q: "How does the calculator know my ovulation date if I only know my last period?",
    a: "The luteal phase (from ovulation to your next period) is the relatively fixed part of the cycle, averaging 14 days. We estimate ovulation as the first day of your last period plus your cycle length minus 14 days.",
  },
  {
    q: "When can I take a pregnancy test after implantation?",
    a: "After implantation, hCG starts rising and is usually detectable on a sensitive home test about 3 to 4 days later. The most reliable result is on the day of, or a few days after, your missed period.",
  },
  {
    q: "Can I feel implantation?",
    a: "Most people feel nothing. A minority report light spotting (implantation bleeding) or mild cramping around the predicted window. Symptoms are not a reliable signal on their own.",
  },
  {
    q: "Is this calculator a substitute for medical advice?",
    a: "No. The dates are estimates based on average biology and don't account for irregular cycles, late or early ovulation, or individual variation. Use it as a planning aid, not a diagnosis.",
  },
  {
    q: "Why does the table show 'Less common' for days 6 and 12?",
    a: "Implantation outside the 7 to 11 day window does happen, but it's uncommon. Day 6 and day 12 are at the edges of the biological range reported in research; most pregnancies implant in the middle of the window.",
  },
];
