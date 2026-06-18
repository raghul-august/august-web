export interface AngerOption {
  label: string;
  value: number;
}

export interface AngerQuestion {
  id: number;
  text: string;
}

export const ANGER_OPTIONS: readonly AngerOption[] = [
  { label: "Not at all", value: 0 },
  { label: "Little", value: 1 },
  { label: "Moderate", value: 2 },
  { label: "Much", value: 3 },
  { label: "Very much", value: 4 },
] as const;

export const QUESTIONS_PER_STEP = 5;

export const questions: readonly AngerQuestion[] = [
  {
    id: 1,
    text: "You unpack an appliance you have just bought, plug it in, and discover that it doesn't work.",
  },
  {
    id: 2,
    text: "Being overcharged by a repair person who has you over a barrel.",
  },
  {
    id: 3,
    text: "Being singled out for a correction, while the actions of others go unnoticed.",
  },
  {
    id: 4,
    text: "Getting your car stuck in the mud or sand.",
  },
  {
    id: 5,
    text: "You are talking to someone and they don't answer you.",
  },
  {
    id: 6,
    text: "Someone pretends to be something they are not.",
  },
  {
    id: 7,
    text: "While you are struggling to carry four cups of coffee to your table, someone bumps into you, spilling the coffee.",
  },
  {
    id: 8,
    text: "You have hung up your clothes, but someone knocks them to the floor and fails to pick them up.",
  },
  {
    id: 9,
    text: "You are hounded by a salesperson from the moment you walk into the store.",
  },
  {
    id: 10,
    text: "You have made arrangements to go somewhere with a person who backs off at the last minute and leaves you dangling.",
  },
  {
    id: 11,
    text: "Being joked about or teased.",
  },
  {
    id: 12,
    text: "Your car is stalled at a traffic light, and the person behind you keeps blowing their horn.",
  },
  {
    id: 13,
    text: "You accidentally make the wrong kind of turn in a car park. As you get out of your car someone yells at you, “where did you learn to drive?”",
  },
  {
    id: 14,
    text: "Someone makes a mistake and blames it on you.",
  },
  {
    id: 15,
    text: "You are trying to concentrate, but a person near you is tapping their foot.",
  },
  {
    id: 16,
    text: "You lend someone an important book or tool, and they fail to return it.",
  },
  {
    id: 17,
    text: "You have had a busy day, and the person you live with starts to complain about how you forgot to do something you agreed to.",
  },
  {
    id: 18,
    text: "You are trying to discuss something important with your partner who isn't giving you a chance to express your feelings.",
  },
  {
    id: 19,
    text: "You are in a discussion with someone who persists in arguing about a topic they know very little about.",
  },
  {
    id: 20,
    text: "Someone sticks their nose into an argument between you and someone else.",
  },
  {
    id: 21,
    text: "You need to get somewhere quickly, but the car in front of you is going far below the speed limit, and you can't pass.",
  },
  {
    id: 22,
    text: "Stepping on a lump of chewing gum.",
  },
  {
    id: 23,
    text: "Being mocked by a small group of people as you pass them.",
  },
  {
    id: 24,
    text: "In a hurry to get somewhere, you tear a good pair of trousers or skirt on a sharp object.",
  },
  {
    id: 25,
    text: "You use your last coin to make a phone call, but you are disconnected before you finish dialling and the coin is lost.",
  },
];

export const totalQuestions = questions.length;
export const MAX_SCORE = totalQuestions * 4;
