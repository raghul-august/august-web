import {
  AGE_OPTIONS,
  AgeBand,
  BodyRegion,
  BODY_REGIONS,
  DURATION_OPTIONS,
  DurationValue,
  FACTORS_BY_SYMPTOM,
  RED_FLAGS,
  SEVERITY_OPTIONS,
  SeverityValue,
  SexValue,
  SYMPTOMS_BY_REGION,
} from "@/app/data/tools/symptoms-checker-questions";

export interface SymptomsAnswers {
  sex?: SexValue;
  age?: AgeBand;
  region?: BodyRegion;
  symptom?: string;
  factors?: string[]; // values across all factor groups for the chosen symptom
  duration?: DurationValue;
  severity?: SeverityValue;
  redFlags?: string[];
}

export type UrgencyId = "emergency" | "urgent" | "soon" | "self-care" | "routine";

export interface UrgencyBand {
  id: UrgencyId;
  label: string;
  short: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
  tone: "info" | "neutral" | "caution" | "warning";
  headline: string;
  description: string;
  cta: string;
}

export const URGENCY_BANDS: Record<UrgencyId, UrgencyBand> = {
  emergency: {
    id: "emergency",
    label: "Emergency care now",
    short: "Call 911 or go to the ER",
    badge: "badge-high",
    tone: "warning",
    headline: "These symptoms can be life-threatening.",
    description:
      "Based on what you described, you need emergency evaluation right now. Call 911 or have someone drive you to the nearest emergency room. Do not try to drive yourself.",
    cta: "Find an emergency room near me",
  },
  urgent: {
    id: "urgent",
    label: "See a clinician today",
    short: "Urgent care within 24 hours",
    badge: "badge-significant",
    tone: "caution",
    headline: "You should be seen by a clinician today.",
    description:
      "Your combination of symptoms is concerning enough that you shouldn’t wait it out. Go to urgent care, call your doctor for a same-day appointment, or use a telehealth visit.",
    cta: "Book a same-day visit",
  },
  soon: {
    id: "soon",
    label: "Schedule a visit this week",
    short: "Routine appointment in 1–7 days",
    badge: "badge-moderate",
    tone: "neutral",
    headline: "Worth getting checked out, but not an emergency.",
    description:
      "Your symptoms have been going on long enough or are severe enough that a routine clinical evaluation is the right next step. Book an appointment in the next few days.",
    cta: "Schedule with your primary care",
  },
  "self-care": {
    id: "self-care",
    label: "Self-care first",
    short: "Watch and monitor",
    badge: "badge-low",
    tone: "info",
    headline: "This looks like something you can manage at home.",
    description:
      "Based on your inputs, home care is reasonable for now — rest, fluids, over-the-counter symptom relief, and tracking how you feel. If things get worse or new red-flag symptoms appear, escalate care.",
    cta: "See self-care tips",
  },
  routine: {
    id: "routine",
    label: "Bring it up at your next visit",
    short: "Mention it at your next checkup",
    badge: "badge-low",
    tone: "info",
    headline: "Not urgent, but worth flagging.",
    description:
      "Your symptom is mild and not associated with red flags right now. It’s still worth mentioning at your next routine visit, especially if it persists or starts to interfere with daily life.",
    cta: "Add to my next visit",
  },
};

export interface PossibleCondition {
  name: string;
  description: string;
  weight: number;
}

export const POSSIBLE_CONDITIONS: Record<string, readonly PossibleCondition[]> = {
  headache: [
    { name: "Tension-type headache", description: "Dull, band-like pressure across the head, often from stress, poor sleep, or screen use.", weight: 3 },
    { name: "Migraine", description: "Throbbing pain, often one-sided, sometimes with nausea or light sensitivity.", weight: 2 },
    { name: "Dehydration headache", description: "Headache that improves quickly with water and rest.", weight: 2 },
    { name: "Sinus or referred headache", description: "Pressure across forehead or cheeks during a cold or allergy flare.", weight: 1 },
  ],
  dizziness: [
    { name: "Benign positional vertigo (BPPV)", description: "Spinning triggered by head movement; usually settles in days.", weight: 3 },
    { name: "Orthostatic hypotension", description: "Lightheaded on standing, often from dehydration or rapid position changes.", weight: 2 },
    { name: "Inner-ear inflammation", description: "Dizziness with hearing change after a cold.", weight: 1 },
  ],
  "numbness-hands": [
    { name: "Carpal tunnel syndrome", description: "Hand numbness worse at night or with sustained gripping.", weight: 3 },
    { name: "Cervical nerve root irritation", description: "Numbness following one arm, often with neck pain.", weight: 2 },
  ],
  "eye-discomfort": [
    { name: "Conjunctivitis", description: "Redness with watery or sticky discharge — often viral.", weight: 3 },
    { name: "Allergic eye irritation", description: "Itchy, red eyes around dust, pollen, or pets.", weight: 2 },
    { name: "Dry eye / digital strain", description: "Burning, gritty sensation after screen use.", weight: 2 },
  ],
  "eye-problems": [
    { name: "Refractive change", description: "Gradually blurry vision that improves with updated glasses.", weight: 2 },
    { name: "Migraine aura", description: "Brief visual disturbance that resolves within an hour.", weight: 2 },
  ],
  "sore-throat": [
    { name: "Viral pharyngitis", description: "Sore throat with cold-like symptoms, resolves in a week.", weight: 3 },
    { name: "Strep throat", description: "Sudden pain, fever, swollen glands — worth a swab if severe.", weight: 2 },
  ],
  "difficulty-swallowing": [
    { name: "Reflux-related esophagitis", description: "Trouble swallowing with heartburn.", weight: 2 },
    { name: "Esophageal motility issue", description: "Persistent swallowing trouble worth evaluating.", weight: 1 },
  ],
  "nasal-congestion": [
    { name: "Common cold", description: "Clear or yellow drainage with mild fatigue.", weight: 3 },
    { name: "Seasonal allergies", description: "Itchy nose and eyes with clear drainage.", weight: 2 },
    { name: "Sinusitis", description: "Pressure across forehead or cheeks with green discharge.", weight: 1 },
  ],
  "chest-pain": [
    { name: "Cardiac chest pain (ACS)", description: "Pressure that radiates or is brought on by exertion — needs urgent evaluation.", weight: 2 },
    { name: "Acid reflux (GERD)", description: "Burning behind the breastbone after meals or lying down.", weight: 2 },
    { name: "Costochondritis", description: "Sharp chest-wall pain reproducible with pressure.", weight: 2 },
    { name: "Anxiety-related chest tightness", description: "Tightness with rapid breathing during stress.", weight: 1 },
  ],
  "shortness-of-breath": [
    { name: "Asthma or bronchospasm", description: "Wheeze and tightness, often with triggers.", weight: 2 },
    { name: "Respiratory infection", description: "Cough plus difficulty breathing.", weight: 2 },
    { name: "Heart-related shortness of breath", description: "Worse with exertion or lying flat — needs evaluation.", weight: 2 },
    { name: "Anxiety-driven breathing", description: "Air hunger during stress without low oxygen.", weight: 1 },
  ],
  palpitations: [
    { name: "Benign extra beats", description: "Occasional skipped beats, often noticed at rest.", weight: 2 },
    { name: "Anxiety", description: "Racing heart with adrenaline surge.", weight: 2 },
    { name: "Arrhythmia", description: "Sustained racing or irregular heartbeat — worth evaluating.", weight: 1 },
  ],
  cough: [
    { name: "Viral upper respiratory infection", description: "Cough with cold symptoms — resolves over 1–2 weeks.", weight: 3 },
    { name: "Post-nasal drip", description: "Dry cough worse at night from drainage.", weight: 2 },
    { name: "Asthma flare", description: "Cough with wheeze, often triggered by exercise or allergens.", weight: 1 },
    { name: "GERD cough", description: "Chronic dry cough from reflux.", weight: 1 },
  ],
  wheezing: [
    { name: "Asthma", description: "Whistling on exhale, often with exercise or allergens.", weight: 2 },
    { name: "Viral bronchitis", description: "Wheeze with a recent cold.", weight: 2 },
  ],
  "abdominal-pain": [
    { name: "Indigestion", description: "Upper-belly discomfort after meals.", weight: 3 },
    { name: "Viral gastroenteritis", description: "Cramps with nausea or diarrhea.", weight: 2 },
    { name: "Constipation", description: "Lower-belly ache that improves after a bowel movement.", weight: 2 },
    { name: "Appendicitis", description: "Pain that moves to the lower right and worsens over hours.", weight: 1 },
  ],
  "blood-in-stool": [
    { name: "Hemorrhoids", description: "Bright red blood on tissue or in the bowl after a hard stool.", weight: 3 },
    { name: "Anal fissure", description: "Sharp pain with bright blood after a bowel movement.", weight: 2 },
    { name: "Lower GI source", description: "Darker blood or any large amount needs evaluation.", weight: 1 },
  ],
  constipation: [
    { name: "Low-fiber / low-fluid pattern", description: "Hard stools improving with hydration and fiber.", weight: 3 },
    { name: "Medication side effect", description: "New medication can slow the bowel.", weight: 1 },
  ],
  diarrhea: [
    { name: "Viral gastroenteritis", description: "Several loose stools per day, resolves in 2–3 days.", weight: 3 },
    { name: "Food intolerance", description: "Diarrhea after specific foods.", weight: 1 },
  ],
  "nausea-vomiting": [
    { name: "Viral stomach bug", description: "Short-lived nausea with vomiting or diarrhea.", weight: 3 },
    { name: "Migraine-associated nausea", description: "Comes with a headache.", weight: 2 },
  ],
  "low-back-pain": [
    { name: "Mechanical low-back pain", description: "Pain from posture or lifting; usually improves in days.", weight: 3 },
    { name: "Disc irritation", description: "Pain that shoots into the leg.", weight: 2 },
    { name: "Cauda equina syndrome", description: "Bladder/bowel changes or saddle numbness — needs emergency evaluation.", weight: 1 },
  ],
  "neck-pain": [
    { name: "Muscle strain", description: "Stiffness after sleeping in an odd position or new activity.", weight: 3 },
    { name: "Cervical disc irritation", description: "Pain that radiates into the arm.", weight: 2 },
  ],
  "shoulder-pain": [
    { name: "Rotator cuff strain", description: "Pain reaching overhead or behind your back.", weight: 3 },
    { name: "Adhesive capsulitis (frozen shoulder)", description: "Gradual stiffness with progressive loss of range.", weight: 1 },
  ],
  "foot-ankle-pain": [
    { name: "Plantar fasciitis", description: "Sharp heel pain on first steps in the morning.", weight: 3 },
    { name: "Ankle sprain", description: "Pain after twisting the ankle, often with swelling.", weight: 2 },
  ],
  "leg-swelling": [
    { name: "Venous insufficiency", description: "Swelling worse after standing, better with elevation.", weight: 2 },
    { name: "Deep vein thrombosis", description: "One-sided calf swelling and pain — needs evaluation.", weight: 1 },
  ],
  "hip-pain": [
    { name: "Hip bursitis", description: "Pain on the outside of the hip, worse lying on that side.", weight: 3 },
    { name: "Osteoarthritis of the hip", description: "Slow morning stiffness with weight-bearing pain.", weight: 2 },
  ],
  "knee-pain": [
    { name: "Patellofemoral pain", description: "Front-of-knee pain on stairs or after sitting.", weight: 3 },
    { name: "Meniscus injury", description: "Pain with locking or catching after a twist.", weight: 2 },
  ],
  "urinary-problems": [
    { name: "Urinary tract infection (UTI)", description: "Burning with urination, urgency, and frequency.", weight: 3 },
    { name: "Overactive bladder", description: "Frequent urge without infection signs.", weight: 1 },
  ],
  "pelvic-pain-female": [
    { name: "Menstrual / ovulation pain", description: "Cyclical pelvic pain that lines up with your cycle.", weight: 3 },
    { name: "Pelvic inflammatory disease", description: "Pain with fever or discharge — needs same-day evaluation.", weight: 1 },
  ],
  "pelvic-pain-male": [
    { name: "Prostatitis", description: "Pelvic and urinary pain in men, often with frequency.", weight: 2 },
    { name: "Pelvic-floor muscle pain", description: "Pelvic ache without urinary infection.", weight: 2 },
  ],
  "skin-rash": [
    { name: "Contact dermatitis", description: "Itchy rash after a new soap, plant, or fabric.", weight: 3 },
    { name: "Viral rash", description: "Rash with a recent illness.", weight: 2 },
  ],
  itching: [
    { name: "Dry skin", description: "Itch worse in cold or low humidity.", weight: 3 },
    { name: "Eczema flare", description: "Itchy patches in known areas.", weight: 2 },
  ],
  hives: [
    { name: "Allergic hives", description: "Welts after a new food, medication, or insect bite.", weight: 3 },
    { name: "Stress-related hives", description: "Hives triggered by heat, exercise, or stress.", weight: 2 },
  ],
  anxiety: [
    { name: "Generalized anxiety", description: "Persistent worry, sleep impact, and physical tension.", weight: 3 },
    { name: "Panic attacks", description: "Sudden surges of anxiety with physical symptoms.", weight: 2 },
  ],
  "low-mood": [
    { name: "Adjustment / situational low mood", description: "Mood drop linked to a recent stressor.", weight: 3 },
    { name: "Depression", description: "Persistent low mood and loss of interest for 2+ weeks.", weight: 2 },
  ],
  insomnia: [
    { name: "Sleep-onset insomnia", description: "Trouble falling asleep tied to stress or screens.", weight: 3 },
    { name: "Maintenance insomnia", description: "Waking up at night and unable to fall back asleep.", weight: 2 },
  ],
};

export interface SymptomsResult {
  urgency: UrgencyBand;
  conditions: PossibleCondition[];
  recommendations: string[];
  matchedRedFlags: string[];
  matchedFactors: { groupTitle: string; label: string }[];
  summary: {
    sexLabel?: string;
    ageLabel?: string;
    regionLabel?: string;
    symptomLabel?: string;
    durationLabel?: string;
    severityLabel?: string;
  };
}

function findLabel<T extends { value: string; label: string }>(
  list: readonly T[],
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  return list.find((o) => o.value === value)?.label;
}

export function computeSymptomsResult(answers: SymptomsAnswers): SymptomsResult {
  // Red-flag scoring
  const flags = (answers.redFlags ?? []).filter((v) => v !== "none");
  const redFlagObjects = RED_FLAGS.filter((rf) => flags.includes(rf.value));
  const redFlagScore = redFlagObjects.reduce((s, rf) => s + rf.weight, 0);
  const hasEmergencyFlag = redFlagObjects.some((rf) => rf.weight >= 2);

  // Factor scoring
  const factorValues = answers.factors ?? [];
  const symptomGroups = answers.symptom ? FACTORS_BY_SYMPTOM[answers.symptom] ?? [] : [];
  const matchedFactors: { groupTitle: string; label: string; weight: number }[] = [];
  for (const g of symptomGroups) {
    for (const opt of g.options) {
      if (factorValues.includes(opt.value)) {
        matchedFactors.push({ groupTitle: g.title, label: opt.label, weight: opt.weight });
      }
    }
  }
  const factorScore = matchedFactors.reduce((s, f) => s + f.weight, 0);
  const hasEmergencyFactor = matchedFactors.some((f) => f.weight >= 2);

  const severityScore =
    answers.severity === "unbearable"
      ? 3
      : answers.severity === "severe"
        ? 2
        : answers.severity === "moderate"
          ? 1
          : 0;

  const durationScore =
    answers.duration === "2-plus-weeks"
      ? 2
      : answers.duration === "1-2-weeks"
        ? 1
        : 0;

  const heartShaped =
    answers.symptom === "chest-pain" ||
    answers.symptom === "shortness-of-breath" ||
    answers.symptom === "palpitations";
  const olderAdult = answers.age === "40-64" || answers.age === "65-plus";

  let urgencyId: UrgencyId;
  if (hasEmergencyFlag || hasEmergencyFactor || redFlagScore >= 2 || factorScore >= 3) {
    urgencyId = "emergency";
  } else if (
    redFlagScore >= 1 ||
    factorScore >= 1 ||
    severityScore >= 3 ||
    (heartShaped && olderAdult) ||
    (heartShaped && severityScore >= 2)
  ) {
    urgencyId = "urgent";
  } else if (severityScore >= 2 || durationScore >= 2) {
    urgencyId = "soon";
  } else if (severityScore >= 1 || durationScore >= 1) {
    urgencyId = "self-care";
  } else {
    urgencyId = "routine";
  }

  const candidatePool = answers.symptom ? POSSIBLE_CONDITIONS[answers.symptom] ?? [] : [];
  const conditions = [...candidatePool].sort((a, b) => b.weight - a.weight).slice(0, 4);

  const recommendations = buildRecommendations(answers, urgencyId, redFlagObjects.length > 0);

  return {
    urgency: URGENCY_BANDS[urgencyId],
    conditions,
    recommendations,
    matchedRedFlags: redFlagObjects.map((r) => r.label),
    matchedFactors: matchedFactors.map((f) => ({ groupTitle: f.groupTitle, label: f.label })),
    summary: {
      sexLabel: answers.sex ? (answers.sex === "male" ? "Male" : "Female") : undefined,
      ageLabel: findLabel(AGE_OPTIONS, answers.age),
      regionLabel: findLabel(BODY_REGIONS, answers.region),
      symptomLabel: findLabel(
        answers.region ? SYMPTOMS_BY_REGION[answers.region] : [],
        answers.symptom,
      ),
      durationLabel: findLabel(DURATION_OPTIONS, answers.duration),
      severityLabel: findLabel(SEVERITY_OPTIONS, answers.severity),
    },
  };
}

function buildRecommendations(
  answers: SymptomsAnswers,
  urgency: UrgencyId,
  hasFlags: boolean,
): string[] {
  const recs: string[] = [];
  if (urgency === "emergency") {
    recs.push(
      "Call 911 or have someone take you to the nearest emergency room. Do not drive yourself.",
    );
    if (hasFlags) {
      recs.push("Bring a list of your symptoms, current medications, and any allergies.");
    }
    return recs;
  }
  if (urgency === "urgent") {
    recs.push("Get evaluated today by urgent care, your primary care, or a telehealth visit.");
    recs.push("Track any new red-flag symptoms and escalate to the ER if they appear.");
    return recs;
  }
  if (urgency === "soon") {
    recs.push("Schedule a visit with your primary care or relevant specialist in the next few days.");
    recs.push("Note when symptoms started, what makes them better or worse, and any patterns.");
  }
  if (urgency === "self-care" || urgency === "routine") {
    recs.push("Try targeted self-care for a few days and track how you feel each morning.");
    recs.push("Common helpers: rest, hydration, balanced meals, and over-the-counter relief as appropriate.");
  }
  if (answers.symptom === "headache") {
    recs.push("Drink water, dim screens, and take a short rest in a quiet room.");
  }
  if (answers.symptom === "cough") {
    recs.push("Warm fluids, honey, and a humidifier can ease cough irritation.");
  }
  if (answers.symptom === "sore-throat") {
    recs.push("Warm salt-water gargles and lozenges help symptomatic relief.");
  }
  if (answers.symptom === "abdominal-pain" || answers.symptom === "diarrhea") {
    recs.push("Focus on small sips of fluids, electrolytes, and bland foods.");
  }
  if (answers.symptom === "insomnia") {
    recs.push("Wind down without screens, keep the room cool and dark, and wake at a consistent time.");
  }
  return recs;
}

export function urgencyBucket(id: UrgencyId): string {
  return id;
}
