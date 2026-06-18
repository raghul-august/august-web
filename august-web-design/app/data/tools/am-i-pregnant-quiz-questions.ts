// "Am I Pregnant?" early-pregnancy symptom screen.
// Original prose, synthesized from the standard early-pregnancy symptom
// list used by Clearblue, Planned Parenthood, and the American Pregnancy
// Association. No verbatim copying.
//
// NO React, NO JSX in this file. Pure data + types.

export interface PregnancyOption {
  label: string;
  /** Point value contributed to the overall likelihood score. */
  value: number;
  /** Optional helper subtext under the option. */
  hint?: string;
}

export interface PregnancyQuestion {
  id: number;
  /** Short, anonymized label for analytics. */
  key: string;
  text: string;
  subtext?: string;
  /** Soft section header — purely for grouping in code/analytics. */
  section: "timing" | "early-symptoms" | "context";
  options: readonly PregnancyOption[];
}

/** Weights are tuned so a "no symptoms / period not late / no sex" run lands
 *  comfortably in the "unlikely" tier, and a "missed period + nausea + sore
 *  breasts + unprotected sex around ovulation" run lands in "very likely". */
export const questions: readonly PregnancyQuestion[] = [
  {
    id: 1,
    key: "period_status",
    section: "timing",
    text: "Where are you in your cycle right now?",
    subtext: "Count from the first day of your last period.",
    options: [
      { label: "My period is late by a week or more", value: 8 },
      { label: "My period is late by a few days", value: 5 },
      { label: "My period is due in the next few days", value: 2 },
      { label: "I'm mid-cycle (period not expected for a while)", value: 1 },
      { label: "I don't track my cycle / I'm not sure", value: 2 },
      { label: "I don't have regular periods", value: 2 },
    ],
  },
  {
    id: 2,
    key: "sex_timing",
    section: "context",
    text: "Have you had unprotected sex in the last 3–4 weeks?",
    subtext: "Includes broken condoms, withdrawal, or a missed pill.",
    options: [
      { label: "Yes, around the time I was ovulating", value: 6 },
      { label: "Yes, but I'm not sure of the timing", value: 4 },
      { label: "Yes, but I'm pretty sure it was outside my fertile window", value: 2 },
      { label: "No, I've been consistent with birth control", value: 0 },
      { label: "I haven't had sex in the last few weeks", value: 0 },
    ],
  },
  {
    id: 3,
    key: "missed_period",
    section: "timing",
    text: "Have you missed an expected period?",
    options: [
      { label: "Yes, completely missed it", value: 5 },
      { label: "I spotted lightly when my period was due, but no real flow", value: 4 },
      { label: "It came, but it was much lighter or shorter than usual", value: 2 },
      { label: "No, my period came as expected", value: -3 },
      { label: "It hasn't been due yet", value: 0 },
    ],
  },
  {
    id: 4,
    key: "nausea",
    section: "early-symptoms",
    text: "Have you felt unusually nauseous, especially in the morning?",
    options: [
      { label: "Yes, often, sometimes with vomiting", value: 4 },
      { label: "Yes, on and off — a mild queasy feeling", value: 2 },
      { label: "No, not really", value: 0 },
    ],
  },
  {
    id: 5,
    key: "breast_changes",
    section: "early-symptoms",
    text: "Do your breasts feel different like sore, tender, fuller, or tingly?",
    subtext: "Compared with how they usually feel before a period.",
    options: [
      { label: "Yes, more sore or fuller than my usual PMS", value: 3 },
      { label: "About the same as my usual PMS soreness", value: 1 },
      { label: "No noticeable change", value: 0 },
    ],
  },
  {
    id: 6,
    key: "fatigue",
    section: "early-symptoms",
    text: "Have you been unusually tired for no clear reason?",
    options: [
      { label: "Yes, exhausted even after enough sleep", value: 2 },
      { label: "A little more tired than usual", value: 1 },
      { label: "Not really", value: 0 },
    ],
  },
  {
    id: 7,
    key: "urination",
    section: "early-symptoms",
    text: "Are you peeing more often than usual?",
    options: [
      { label: "Yes, noticeably more, including waking up at night", value: 2 },
      { label: "A little more often than usual", value: 1 },
      { label: "No change", value: 0 },
    ],
  },
  {
    id: 8,
    key: "cravings_aversions",
    section: "early-symptoms",
    text: "Have you noticed new food cravings, aversions, or a strong sensitivity to smells?",
    options: [
      { label: "Yes, foods I normally like suddenly turn me off", value: 2 },
      { label: "Yes, strong new cravings", value: 1 },
      { label: "Smells seem much stronger than usual", value: 2 },
      { label: "No change", value: 0 },
    ],
  },
  {
    id: 9,
    key: "cramping_spotting",
    section: "early-symptoms",
    text: "Have you had mild cramping or light pink/brown spotting around when your period was due?",
    subtext: "Light, brief spotting 6–12 days after conception is sometimes called implantation bleeding.",
    options: [
      { label: "Yes, light spotting and mild cramping", value: 3 },
      { label: "Cramping, but no spotting", value: 1 },
      { label: "Light spotting but no cramping", value: 2 },
      { label: "No, nothing like that", value: 0 },
    ],
  },
  {
    id: 10,
    key: "mood_changes",
    section: "early-symptoms",
    text: "Have your moods felt more intense or unpredictable than usual?",
    options: [
      { label: "Yes, much more emotional than my normal PMS", value: 2 },
      { label: "About the same as my usual PMS", value: 1 },
      { label: "No real change", value: 0 },
    ],
  },
  {
    id: 11,
    key: "test_taken",
    section: "context",
    text: "Have you taken a home pregnancy test?",
    subtext: "Home tests are most accurate from the day your period is due.",
    options: [
      { label: "Yes, it was positive", value: 12 },
      { label: "Yes, it was negative, but I tested very early", value: 1 },
      { label: "Yes, it was negative after my period was already late", value: -4 },
      { label: "No, not yet", value: 0 },
    ],
  },
] as const;

export const TOTAL_QUESTIONS = questions.length;
