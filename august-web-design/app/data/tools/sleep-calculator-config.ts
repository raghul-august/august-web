// Pure config for the Sleep Calculator tool. No React.

import { buildSoftwareSchema, buildFaqSchema } from "@/app/utils/tools/tool-schema-helpers";

export const SLEEP_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "How does a sleep calculator work?",
    a: "A sleep calculator uses the 90-minute sleep cycle to suggest bedtimes or wake times that line up with the end of a cycle, when most people feel less groggy. It assumes you spend a few minutes falling asleep, then cycle between non-REM and REM sleep roughly every 90 minutes, four to six times across the night.",
  },
  {
    q: "What is a sleep cycle?",
    a: "A sleep cycle is one full pass through the four stages of sleep — three non-REM stages (light to deep) plus one REM stage where dreaming happens. A typical adult cycle lasts about 90 minutes, though it can range from 70 to 120 minutes depending on age, sleep stage, and individual physiology.",
  },
  {
    q: "Why subtract 15 minutes for falling asleep?",
    a: "Healthy adults take roughly 10 to 20 minutes to fall asleep — a delay called sleep latency. The calculator adds that buffer so the suggested bedtime is the time you should actually be in bed with the lights out, not the time you expect to be unconscious. You can change the buffer in the advanced settings.",
  },
  {
    q: "How many sleep cycles do I need?",
    a: "Most adults feel best after five or six full cycles, which works out to about 7.5 to 9 hours of sleep. The American Academy of Sleep Medicine and CDC both recommend at least seven hours per night for adults; teens need eight to ten.",
  },
  {
    q: "Is 6 hours of sleep enough?",
    a: "Six hours (four full cycles) is on the low end. It works for a small minority of people genetically wired for short sleep, but for most adults it builds up sleep debt that hurts memory, mood, and immune function within a few days. Use it as an occasional rescue, not a target.",
  },
  {
    q: "Should I wake up at the end of a cycle?",
    a: "Yes — that is the whole point of cycle-based timing. Waking during deep non-REM sleep produces sleep inertia, the groggy 'sleep drunkenness' that lingers up to an hour. Waking at the end of a cycle, when you are in light sleep, generally feels easier.",
  },
  {
    q: "What time should I go to bed if I have to wake up at 6 a.m.?",
    a: "For five complete cycles plus a 15-minute fall-asleep buffer, go to bed at 10:15 p.m. For six cycles, go to bed at 8:45 p.m. Pick the option that fits your schedule and feels sustainable for a full week.",
  },
  {
    q: "Does the calculator account for age?",
    a: "Yes. We surface the recommended hours from the American Academy of Sleep Medicine and CDC for your age band — teens need more sleep than adults, and older adults typically sleep slightly less — and use that to highlight the cycle option closest to your range.",
  },
  {
    q: "Is this a substitute for a sleep study?",
    a: "No. A sleep calculator is a scheduling aid, not a diagnostic tool. If you sleep the recommended hours and still feel exhausted, snore loudly, or wake gasping, talk to a clinician about a sleep study to rule out apnea or other disorders.",
  },
];

export const SLEEP_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "Sleep Calculator",
  "Free sleep cycle calculator. Plan an optimal bedtime or wake time around 90-minute sleep cycles so you wake feeling refreshed instead of groggy.",
);

export const SLEEP_FAQ_SCHEMA = buildFaqSchema(SLEEP_FAQS);
