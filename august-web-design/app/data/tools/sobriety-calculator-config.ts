export interface SobrietyMilestone {
  id: string;
  label: string;
  /** Threshold in whole days. */
  days: number;
  description: string;
}

export const SOBRIETY_MILESTONES: readonly SobrietyMilestone[] = [
  {
    id: "24-hours",
    label: "24 hours",
    days: 1,
    description:
      "The first day. The hardest decision you've made all week is the one you keep making every hour.",
  },
  {
    id: "72-hours",
    label: "72 hours",
    days: 3,
    description:
      "Most acute withdrawal symptoms peak and start to ease around now. The fog is lifting.",
  },
  {
    id: "1-week",
    label: "1 week",
    days: 7,
    description:
      "A full week. Sleep is starting to settle and your body is finding a new rhythm.",
  },
  {
    id: "2-weeks",
    label: "2 weeks",
    days: 14,
    description:
      "Two weeks. Liver enzymes begin recovering, energy returns, and cravings come in shorter waves.",
  },
  {
    id: "30-days",
    label: "30 days",
    days: 30,
    description:
      "A full month. In recovery circles, the 30-day chip is one of the most meaningful markers.",
  },
  {
    id: "60-days",
    label: "60 days",
    days: 60,
    description:
      "Two months. The early-recovery rebuild is well underway, sleep, mood, and focus are evening out.",
  },
  {
    id: "90-days",
    label: "90 days",
    days: 90,
    description:
      "90 days. Many clinicians consider this the milestone where new habits start to feel like the default.",
  },
  {
    id: "6-months",
    label: "6 months",
    days: 182,
    description:
      "Six months. Recovery is becoming who you are, not just what you're doing.",
  },
  {
    id: "9-months",
    label: "9 months",
    days: 274,
    description:
      "Three quarters of a year. The hard-won routine is now your life, not your effort.",
  },
  {
    id: "1-year",
    label: "1 year",
    days: 365,
    description:
      "One year sober. Every season of the year has now been lived clean.",
  },
  {
    id: "18-months",
    label: "18 months",
    days: 547,
    description:
      "A year and a half. Long-term changes in mood, sleep, and brain chemistry are well established.",
  },
  {
    id: "2-years",
    label: "2 years",
    days: 730,
    description:
      "Two years. Relapse risk drops meaningfully after this point in most longitudinal studies.",
  },
  {
    id: "5-years",
    label: "5 years",
    days: 1825,
    description:
      "Five years. The data is clear, the longer the abstinence, the lower the lifetime relapse risk.",
  },
  {
    id: "10-years",
    label: "10 years",
    days: 3653,
    description:
      "A decade sober. Your story is now a lighthouse for someone else just starting out.",
  },
];

export const TODAY_MILESTONE_HELPER =
  "Day one is just as worth celebrating as day one-thousand.";

export const PROGRAM_LANGUAGE_NOTE =
  "Sobriety is counted as continuous calendar days from your sobriety date.";

export const FAQ_ITEMS = [
  {
    q: "How do you calculate sobriety days?",
    a: "We count the number of full calendar days between your sobriety date and today. Today is included as a day, so if your sobriety date is yesterday, you have 2 days.",
  },
  {
    q: "What if I had a slip — when does my date reset?",
    a: "Most recovery programs reset the sobriety date to the day after your last use. This is a personal choice — what matters most is staying honest with yourself and continuing forward.",
  },
  {
    q: "Why are 30, 60, and 90 days milestones?",
    a: "These are the chip milestones used in 12-step programs like AA and NA. Clinical research also shows that sleep, mood, and cravings change meaningfully across these windows, with 90 days widely seen as the point where new habits feel automatic.",
  },
  {
    q: "Is this calculator confidential?",
    a: "Yes. Your sobriety date is processed entirely in your browser — nothing is sent to a server or stored after you leave the page.",
  },
  {
    q: "Is this a medical tool?",
    a: "No. This is a counting tool to mark progress, not a substitute for medical care. If you're going through withdrawal or in crisis, contact a clinician or call SAMHSA's National Helpline at 1-800-662-HELP (4357).",
  },
];

export const SOBRIETY_FROM_LABEL = "What's been your sobriety date?";
export const SOBRIETY_FROM_HELPER =
  "The first day of your current continuous sobriety.";
