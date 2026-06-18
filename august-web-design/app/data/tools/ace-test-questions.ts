export interface AceOption {
  label: string;
  value: 0 | 1;
}

export interface AceQuestion {
  id: number;
  /** Short category for the results breakdown. */
  category: "abuse" | "neglect" | "household";
  /** Verbatim question text from the Felitti et al. 1998 ACE study. */
  text: string;
  /** Helper text shown beneath the question. */
  helper?: string;
}

export const ACE_OPTIONS: readonly AceOption[] = [
  { label: "No", value: 0 },
  { label: "Yes", value: 1 },
] as const;

const PREAMBLE = "Before your 18th birthday";

/**
 * The standardized 10-item Adverse Childhood Experiences questionnaire,
 * as published in Felitti, Anda et al. (Am J Prev Med, 1998).
 * Wording is preserved verbatim from the CDC/Kaiser ACE study instrument.
 */
export const ACE_QUESTIONS: readonly AceQuestion[] = [
  {
    id: 1,
    category: "abuse",
    text: "Did a parent or other adult in the household often or very often swear at you, insult you, put you down, or humiliate you? Or act in a way that made you afraid that you might be physically hurt?",
  },
  {
    id: 2,
    category: "abuse",
    text: "Did a parent or other adult in the household often or very often push, grab, slap, or throw something at you? Or ever hit you so hard that you had marks or were injured?",
  },
  {
    id: 3,
    category: "abuse",
    text: "Did an adult or person at least 5 years older than you ever touch or fondle you or have you touch their body in a sexual way? Or attempt or actually have oral, anal, or vaginal intercourse with you?",
  },
  {
    id: 4,
    category: "neglect",
    text: "Did you often or very often feel that no one in your family loved you or thought you were important or special? Or your family didn't look out for each other, feel close to each other, or support each other?",
  },
  {
    id: 5,
    category: "neglect",
    text: "Did you often or very often feel that you didn't have enough to eat, had to wear dirty clothes, and had no one to protect you? Or your parents were too drunk or high to take care of you or take you to the doctor if you needed it?",
  },
  {
    id: 6,
    category: "household",
    text: "Were your parents ever separated or divorced?",
  },
  {
    id: 7,
    category: "household",
    text: "Was your mother or stepmother often or very often pushed, grabbed, slapped, or had something thrown at her? Or sometimes, often, or very often kicked, bitten, hit with a fist, or hit with something hard? Or ever repeatedly hit for at least a few minutes or threatened with a gun or knife?",
  },
  {
    id: 8,
    category: "household",
    text: "Did you live with anyone who was a problem drinker or alcoholic, or who used street drugs?",
  },
  {
    id: 9,
    category: "household",
    text: "Was a household member depressed or mentally ill, or did a household member attempt suicide?",
  },
  {
    id: 10,
    category: "household",
    text: "Did a household member go to prison?",
  },
] as const;

export const ACE_TOTAL = ACE_QUESTIONS.length; // 10
export const ACE_MAX_SCORE = 10; // Each "Yes" = 1 point
export const ACE_PREAMBLE = PREAMBLE;

export const ACE_CATEGORIES: Record<
  AceQuestion["category"],
  { label: string; description: string }
> = {
  abuse: {
    label: "Abuse",
    description: "Emotional, physical, and sexual abuse before age 18.",
  },
  neglect: {
    label: "Neglect",
    description: "Emotional and physical neglect before age 18.",
  },
  household: {
    label: "Household dysfunction",
    description:
      "Divorce, household substance use, mental illness, domestic violence, or incarceration.",
  },
};
