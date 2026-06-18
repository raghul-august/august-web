export interface BpdOption {
  label: string;
  value: number;
}

export interface BpdQuestion {
  id: number;
  text: string;
  reverse: boolean;
}

export const BPD_OPTIONS: readonly BpdOption[] = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 },
] as const;

export const questions: readonly BpdQuestion[] = [
  {
    id: 1,
    text: "I often worry that someone close to me might abandon me.",
    reverse: false,
  },
  {
    id: 2,
    text: "I have intense episodes of anger or anxiety that can last hours or even days.",
    reverse: false,
  },
  {
    id: 3,
    text: "I can act impulsively when I am upset.",
    reverse: false,
  },
  {
    id: 4,
    text: "I often change my long-term goals or career plans.",
    reverse: false,
  },
  {
    id: 5,
    text: "I stay loyal to anyone who has ever been close to me.",
    reverse: true,
  },
  {
    id: 6,
    text: "Sometimes I see myself as bad or unworthy.",
    reverse: false,
  },
  {
    id: 7,
    text: "I can be hostile or aggressive.",
    reverse: false,
  },
  {
    id: 8,
    text: "When I worry about a relationship ending, I take frantic action to avoid it.",
    reverse: false,
  },
  {
    id: 9,
    text: "I have felt misunderstood or mistreated.",
    reverse: false,
  },
  {
    id: 10,
    text: "At times, my anger seems beyond my control.",
    reverse: false,
  },
  {
    id: 11,
    text: "I have had episodes when I have threatened self-harm or suicide.",
    reverse: false,
  },
  {
    id: 12,
    text: "I come across as fundamentally the same, regardless of who I am dealing with.",
    reverse: true,
  },
  {
    id: 13,
    text: "I have episodes of paranoid thinking when I feel I have lost touch with reality.",
    reverse: false,
  },
  {
    id: 14,
    text: "I alternate between idealizing and tearing down friends or partners.",
    reverse: false,
  },
  {
    id: 15,
    text: "I sometimes feel empty.",
    reverse: false,
  },
  {
    id: 16,
    text: "I often have intense but unstable relationships.",
    reverse: false,
  },
  {
    id: 17,
    text: "My self-image seems to change rapidly and widely.",
    reverse: false,
  },
  {
    id: 18,
    text: "I am prone to episodes of reckless behavior — sex, shopping, substance use, driving, or eating.",
    reverse: false,
  },
  {
    id: 19,
    text: "I often worry whether people close to me really care about me.",
    reverse: false,
  },
  {
    id: 20,
    text: "My mood can swing widely, from calm to highly irritable or anxious.",
    reverse: false,
  },
];

export const totalQuestions = questions.length;
export const MIN_SCORE = totalQuestions * 1;
export const MAX_SCORE = totalQuestions * 5;
