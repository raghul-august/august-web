export interface SchizophreniaOption {
  label: string;
  value: number;
}

export type SchizophreniaDomain =
  | "perceptual"
  | "paranoia"
  | "disorganization"
  | "self-reality";

export interface SchizophreniaQuestion {
  id: number;
  text: string;
  subtext?: string;
  preamble?: string;
  domain: SchizophreniaDomain;
  options: readonly SchizophreniaOption[];
}

/**
 * Single-tap collapse of the canonical PQ-B Yes/No + 5-pt distress Likert.
 * value 0 = endorsed=no. value 1..5 = endorsed=yes, distress rating 1..5.
 */
export const PQB_OPTIONS: readonly SchizophreniaOption[] = [
  { label: "No, this hasn't happened", value: 0 },
  { label: "Yes, but it doesn't bother me", value: 1 },
  { label: "Yes, slightly distressing", value: 2 },
  { label: "Yes, moderately distressing", value: 3 },
  { label: "Yes, quite distressing", value: 4 },
  { label: "Yes, very distressing", value: 5 },
] as const;

const PREAMBLE = "In the past month";

export const questions: readonly SchizophreniaQuestion[] = [
  {
    id: 1,
    text: "Do familiar surroundings sometimes seem strange, confusing, threatening or unreal to you?",
    preamble: PREAMBLE,
    domain: "perceptual",
    options: PQB_OPTIONS,
  },
  {
    id: 2,
    text: "Have you heard unusual sounds like banging, clicking, hissing, clapping or ringing in your ears?",
    preamble: PREAMBLE,
    domain: "perceptual",
    options: PQB_OPTIONS,
  },
  {
    id: 3,
    text: "Do things that you see appear different from the way they usually do?",
    preamble: PREAMBLE,
    domain: "perceptual",
    options: PQB_OPTIONS,
  },
  {
    id: 4,
    text: "Have you had experiences with telepathy, psychic forces, or fortune telling?",
    preamble: PREAMBLE,
    domain: "paranoia",
    options: PQB_OPTIONS,
  },
  {
    id: 5,
    text: "Have you felt that you are not in control of your own ideas or thoughts?",
    preamble: PREAMBLE,
    domain: "disorganization",
    options: PQB_OPTIONS,
  },
  {
    id: 6,
    text: "Do you have difficulty getting your point across, because you ramble or go off the track a lot when you talk?",
    preamble: PREAMBLE,
    domain: "disorganization",
    options: PQB_OPTIONS,
  },
  {
    id: 7,
    text: "Do you have strong feelings or beliefs about being unusually gifted or talented in some way?",
    preamble: PREAMBLE,
    domain: "paranoia",
    options: PQB_OPTIONS,
  },
  {
    id: 8,
    text: "Do you feel that other people are watching you or talking about you?",
    preamble: PREAMBLE,
    domain: "paranoia",
    options: PQB_OPTIONS,
  },
  {
    id: 9,
    text: "Do you sometimes get strange feelings on or just beneath your skin, like bugs crawling?",
    preamble: PREAMBLE,
    domain: "perceptual",
    options: PQB_OPTIONS,
  },
  {
    id: 10,
    text: "Do you sometimes feel suddenly distracted by distant sounds that you are not normally aware of?",
    preamble: PREAMBLE,
    domain: "perceptual",
    options: PQB_OPTIONS,
  },
  {
    id: 11,
    text: "Have you had the sense that some person or force is around you, although you couldn't see anyone?",
    preamble: PREAMBLE,
    domain: "perceptual",
    options: PQB_OPTIONS,
  },
  {
    id: 12,
    text: "Do you worry at times that something may be wrong with your mind?",
    preamble: PREAMBLE,
    domain: "self-reality",
    options: PQB_OPTIONS,
  },
  {
    id: 13,
    text: "Have you ever felt that you don't exist, the world does not exist, or that you are dead?",
    preamble: PREAMBLE,
    domain: "self-reality",
    options: PQB_OPTIONS,
  },
  {
    id: 14,
    text: "Have you been confused at times whether something you experienced was real or imaginary?",
    preamble: PREAMBLE,
    domain: "self-reality",
    options: PQB_OPTIONS,
  },
  {
    id: 15,
    text: "Do you hold beliefs that other people would find unusual or bizarre?",
    preamble: PREAMBLE,
    domain: "paranoia",
    options: PQB_OPTIONS,
  },
  {
    id: 16,
    text: "Do you feel that parts of your body have changed in some way, or that parts of your body are working differently?",
    preamble: PREAMBLE,
    domain: "self-reality",
    options: PQB_OPTIONS,
  },
  {
    id: 17,
    text: "Are your thoughts sometimes so strong that you can almost hear them?",
    preamble: PREAMBLE,
    domain: "disorganization",
    options: PQB_OPTIONS,
  },
  {
    id: 18,
    text: "Do you find yourself feeling mistrustful or suspicious of other people?",
    preamble: PREAMBLE,
    domain: "paranoia",
    options: PQB_OPTIONS,
  },
  {
    id: 19,
    text: "Have you seen unusual things like flashes, flames, blinding light, or geometric figures?",
    preamble: PREAMBLE,
    domain: "perceptual",
    options: PQB_OPTIONS,
  },
  {
    id: 20,
    text: "Have you seen things that other people can't see or don't seem to see?",
    preamble: PREAMBLE,
    domain: "perceptual",
    options: PQB_OPTIONS,
  },
  {
    id: 21,
    text: "Do people sometimes find it hard to understand what you are saying?",
    preamble: PREAMBLE,
    domain: "disorganization",
    options: PQB_OPTIONS,
  },
] as const;

export const totalQuestions = questions.length; // 21
export const PQB_MAX_DISTRESS = totalQuestions * 5; // 105
export const PQB_POSITIVE_SCREEN_THRESHOLD = 3; // canonical Loewy 2011 cutoff
