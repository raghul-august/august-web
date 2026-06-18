export const CYCLE_LENGTH_MIN = 21;
export const CYCLE_LENGTH_MAX = 45;
export const CYCLE_LENGTH_DEFAULT = 28;

export const PERIOD_LENGTH_MIN = 2;
export const PERIOD_LENGTH_MAX = 10;
export const PERIOD_LENGTH_DEFAULT = 5;

/** Luteal phase is biologically stable around ~14 days. */
export const LUTEAL_PHASE_DAYS = 14;

/** Sperm survives up to ~5 days; egg survives ~24 hours. */
export const FERTILE_WINDOW_PRE_OVULATION_DAYS = 5;
export const FERTILE_WINDOW_POST_OVULATION_DAYS = 1;

export const PREGNANCY_LENGTH_DAYS = 280; // Naegele's rule

export const FAQ_ITEMS = [
  {
    q: "How is my ovulation day calculated?",
    a: "Ovulation typically happens about 14 days before your next period, regardless of cycle length. We calculate it as the date of your last menstrual period plus your cycle length minus 14 days.",
  },
  {
    q: "What is the 'fertile window'?",
    a: "Sperm can survive in the reproductive tract for up to 5 days, and the egg lives for about 24 hours after ovulation. That gives a roughly six-day window — the five days leading up to ovulation plus the day of ovulation — when intercourse is most likely to result in pregnancy.",
  },
  {
    q: "How accurate is a calculator-based ovulation prediction?",
    a: "These calculators are most accurate for people with regular cycles. If your cycles vary by more than a few days, tracking basal body temperature, cervical mucus, or using ovulation predictor kits gives a much more precise picture.",
  },
  {
    q: "How is the due date estimated?",
    a: "We use Naegele's rule: estimated due date = last menstrual period + 280 days (40 weeks). This is the standard obstetric estimate used worldwide.",
  },
  {
    q: "Does cycle length affect ovulation timing?",
    a: "Yes. Because the luteal phase (ovulation → next period) is the relatively fixed part of the cycle, a longer cycle means ovulation happens later, not in the middle. For a 35-day cycle, ovulation is typically around day 21, not day 17.5.",
  },
  {
    q: "Is this calculator a substitute for medical advice?",
    a: "No. This is an educational planning tool. If you've been trying to conceive for 12+ months (or 6+ months if you're 35+) or have irregular cycles, talk to a healthcare provider.",
  },
];
