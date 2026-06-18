import { buildSoftwareSchema, buildFaqSchema } from "@/app/utils/tools/tool-schema-helpers";

export const VO2MAX_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What is VO2 max?",
    a: "VO2 max is the maximum volume of oxygen your body can use during all-out exercise, expressed in millilitres of oxygen per kilogram of body weight per minute (ml/kg/min). It reflects how well your lungs, heart, blood, and muscles work together — and is one of the strongest single predictors of cardiorespiratory fitness and long-term health.",
  },
  {
    q: "Which method should I pick?",
    a: "Pick the test that matches your current fitness. If you race, the race-time (Jack Daniels VDOT) method is the most accurate. If you can jog, the Cooper 12-minute run or the 1.5-mile run give a solid lab-comparable estimate. If you can't run, use the Rockport 1-mile walk. If you can't do any exercise test, the resting-heart-rate method (Uth-Sørensen) gives a rough estimate from your morning pulse.",
  },
  {
    q: "How accurate are these estimates?",
    a: "Submaximal tests typically estimate VO2 max within ±10–15% of a lab measurement. The race-time, Cooper, and 1.5-mile tests are the most accurate for trained individuals; the Rockport walk and resting-HR methods carry more error. Treat the result as a fitness benchmark, not a diagnostic number.",
  },
  {
    q: "What is a good VO2 max?",
    a: "It depends on your age and sex. A 30-year-old man with a VO2 max of 50 ml/kg/min is in the 'good' range; the same value in a 60-year-old man is 'excellent.' This calculator compares your value to published norms for your specific age and sex band.",
  },
  {
    q: "How can I improve my VO2 max?",
    a: "Aerobic training that combines long easy efforts (60–70% max heart rate) with shorter intervals at threshold or near-maximal effort (4–6 min repeats) raises VO2 max fastest. Most untrained adults can lift their value 10–20% within 8–12 weeks of consistent training.",
  },
  {
    q: "What is VDOT?",
    a: "VDOT is a single fitness number from coach Jack Daniels that combines your VO2 max with your running economy and lactate threshold. Two runners with the same VO2 max can have different VDOTs if one has better running economy. The race-time method on this calculator computes a VDOT-equivalent value and uses it to estimate equivalent race times at other distances.",
  },
  {
    q: "What is METs and how does it relate?",
    a: "One MET (metabolic equivalent) equals 3.5 ml/kg/min — the oxygen cost of sitting quietly. Dividing your VO2 max by 3.5 gives your peak MET capacity. Walking briskly is ~3–4 METs; running 6 mph is ~10 METs; an elite endurance athlete can sustain 20+ METs.",
  },
  {
    q: "Is this a medical assessment?",
    a: "No. These are educational estimates from published submaximal-test equations. They are not a substitute for a graded exercise test or a cardiology consultation, especially if you have known heart-disease risk factors.",
  },
];

export const VO2MAX_SOFTWARE_SCHEMA = buildSoftwareSchema(
  "VO2 Max Calculator",
  "Estimate your VO2 max from a race time, the Cooper 12-minute run, the 1.5-mile run, the Rockport walk, or your resting heart rate. Free, no signup.",
);

export const VO2MAX_FAQ_SCHEMA = buildFaqSchema(VO2MAX_FAQS);

export const METHOD_LABELS = [
  { value: "race-time", label: "Race time", short: "Race", helper: "Enter a recent race result (Jack Daniels VDOT)." },
  { value: "cooper", label: "Cooper 12-min", short: "Cooper", helper: "Run as far as you can in 12 minutes — record the distance." },
  { value: "mile15", label: "1.5-mile run", short: "1.5 mi", helper: "Run 1.5 miles as fast as you can — record the time." },
  { value: "rockport", label: "Rockport walk", short: "Rockport", helper: "Walk 1 mile as fast as possible — record the time and your heart rate." },
  { value: "resting-hr", label: "Resting HR", short: "Resting HR", helper: "No exercise needed. Use your true resting pulse (morning, in bed)." },
] as const;

export const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];
