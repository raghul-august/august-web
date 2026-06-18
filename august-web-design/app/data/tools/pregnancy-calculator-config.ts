// Pure data config for Pregnancy Calculator tool. No React.

import { buildSoftwareSchema, buildFaqSchema } from "@/app/utils/tools/tool-schema-helpers";

export const PREGNANCY_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "How is my due date calculated?",
    a: "The standard approach is Naegele's rule: add 280 days (40 weeks) to the first day of your last menstrual period (LMP). If you know your conception date, we add 266 days instead. The same equations are used by ACOG, the NHS, and most fetal-medicine guidelines.",
  },
  {
    q: "What if my cycle isn't 28 days?",
    a: "Naegele's rule assumes ovulation on day 14 of a 28-day cycle. If your cycle is longer or shorter, we shift the implied ovulation day so the estimate stays anchored to conception instead of LMP. A 32-day cycle pushes the due date about 4 days later; a 25-day cycle pulls it about 3 days earlier.",
  },
  {
    q: "How do you calculate the IVF due date?",
    a: "Because conception is timed precisely, IVF dating is the most accurate. Day-3 (cleavage) transfers add 263 days to the transfer date. Day-5 (blastocyst) transfers add 261 days. Day-6 transfers add 260 days. Frozen embryo transfers follow the same offsets — the transfer date is what matters, not the original retrieval.",
  },
  {
    q: "What's the difference between gestational age and fetal age?",
    a: "Gestational age (GA) is measured from the first day of your LMP and is what every OB-GYN uses. Fetal or embryonic age starts at conception, so it's roughly two weeks behind gestational age. When someone says you're 12 weeks pregnant, that's gestational age.",
  },
  {
    q: "When is the first trimester over?",
    a: "Trimesters are usually defined as: 1st trimester through the end of week 13, 2nd trimester from weeks 14 through 27, and 3rd trimester from week 28 through delivery. Miscarriage risk falls sharply once you cross 12 to 13 weeks.",
  },
  {
    q: "How accurate is the due date?",
    a: "Only about 5% of babies are born on the exact due date. Roughly 80% arrive within 10 days either side. An early ultrasound (before 13 weeks) is the most accurate dating method available and may shift the date a few days in either direction.",
  },
  {
    q: "Can I use this if I don't remember my LMP?",
    a: "Yes. Use the 'Conception', 'IVF transfer', or 'Ultrasound' methods instead. Ultrasound is particularly useful because it back-calculates an LMP from the measurements taken at your scan.",
  },
  {
    q: "Is this calculator a substitute for medical care?",
    a: "No. It is an educational estimate. Your OB-GYN, midwife, or family physician will give you a definitive due date, usually combining LMP and an early dating ultrasound. Always confirm clinical decisions with your healthcare team.",
  },
];

export const PREGNANCY_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "Pregnancy Calculator",
  "Free pregnancy due-date and gestational-age calculator. Estimate your due date and current week of pregnancy from your last menstrual period, conception date, IVF transfer date, ultrasound, or known due date.",
);

export const PREGNANCY_FAQ_SCHEMA = buildFaqSchema(PREGNANCY_FAQS);
