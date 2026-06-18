export interface ChildhoodTraumaQuestion {
  id: number;
  text: string;
  category: "abuse_neglect" | "household_dysfunction";
  categoryLabel: string;
}

export const questions: ChildhoodTraumaQuestion[] = [
  {
    id: 1,
    text: "Did a parent or other adult in the household often swear at you, insult you, put you down, or humiliate you? Or act in a way that made you afraid you might be physically hurt?",
    category: "abuse_neglect",
    categoryLabel: "Emotional Abuse",
  },
  {
    id: 2,
    text: "Did a parent or other adult in the household often push, grab, slap, or throw something at you? Or ever hit you so hard that you had marks or were injured?",
    category: "abuse_neglect",
    categoryLabel: "Physical Abuse",
  },
  {
    id: 3,
    text: "Did an adult or person at least 5 years older than you ever touch or fondle you in a sexual way? Or have you touch their body in a sexual way? Or attempt or actually have oral, anal, or vaginal intercourse with you?",
    category: "abuse_neglect",
    categoryLabel: "Sexual Abuse",
  },
  {
    id: 4,
    text: "Did you often feel that no one in your family loved you or thought you were important or special? Or that your family didn\u2019t look out for each other, feel close to each other, or support each other?",
    category: "abuse_neglect",
    categoryLabel: "Emotional Neglect",
  },
  {
    id: 5,
    text: "Did you often feel that you didn\u2019t have enough to eat, had to wear dirty clothes, or had no one to protect you? Or were your parents too drunk or high to take care of you or take you to the doctor if you needed it?",
    category: "abuse_neglect",
    categoryLabel: "Physical Neglect",
  },
  {
    id: 6,
    text: "Were your parents ever separated or divorced?",
    category: "household_dysfunction",
    categoryLabel: "Parental Separation",
  },
  {
    id: 7,
    text: "Was your mother or stepmother often pushed, grabbed, slapped, or had something thrown at her? Or sometimes or often kicked, bitten, hit with a fist, or hit with something hard? Or ever repeatedly hit or threatened with a gun or knife?",
    category: "household_dysfunction",
    categoryLabel: "Domestic Violence",
  },
  {
    id: 8,
    text: "Did you live with anyone who was a problem drinker or alcoholic, or who used street drugs?",
    category: "household_dysfunction",
    categoryLabel: "Substance Abuse",
  },
  {
    id: 9,
    text: "Was a household member depressed or mentally ill, or did a household member attempt suicide?",
    category: "household_dysfunction",
    categoryLabel: "Mental Illness",
  },
  {
    id: 10,
    text: "Did a household member go to prison?",
    category: "household_dysfunction",
    categoryLabel: "Incarcerated Member",
  },
];
