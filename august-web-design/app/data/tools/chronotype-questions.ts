export interface ChronotypePoints {
  lion: number;
  bear: number;
  wolf: number;
  dolphin: number;
}

export interface ChronotypeOption {
  label: string;
  points: ChronotypePoints; // points awarded to each chronotype
  sleepScore?: number; // optional sleep score contribution
}

export interface ChronotypeQuestion {
  id: number;
  text: string;
  subtitle?: string;
  options: ChronotypeOption[];
}

export const chronotypeQuestions: ChronotypeQuestion[] = [
  {
    id: 1,
    text: "When does your body naturally want to wake up?",
    options: [
      {
        label: "Around 5-6 a.m.",
        points: { lion: 3, bear: 0, wolf: 0, dolphin: 1 },
      },
      {
        label: "Around 7-8 a.m.",
        points: { lion: 0, bear: 3, wolf: 0, dolphin: 0 },
      },
      {
        label: "After 9 a.m.",
        points: { lion: 0, bear: 0, wolf: 3, dolphin: 0 },
      },
    ],
  },
  {
    id: 2,
    text: "Without any schedule, when would you go to sleep?",
    options: [
      {
        label: "Before 9 p.m.",
        points: { lion: 3, bear: 0, wolf: 0, dolphin: 0 },
        sleepScore: 8,
      },
      {
        label: "Around 10-11 p.m.",
        points: { lion: 0, bear: 3, wolf: 0, dolphin: 1 },
        sleepScore: 10,
      },
      {
        label: "After midnight",
        points: { lion: 0, bear: 0, wolf: 3, dolphin: 1 },
        sleepScore: 5,
      },
    ],
  },
  {
    id: 3,
    text: "When do you get your best work done?",
    options: [
      {
        label: "Early morning (8-10 a.m.)",
        points: { lion: 3, bear: 1, wolf: 0, dolphin: 0 },
      },
      {
        label: "Late morning (11 a.m. - 1 p.m.)",
        points: { lion: 0, bear: 3, wolf: 0, dolphin: 2 },
      },
      {
        label: "Afternoon or evening (after 3 p.m.)",
        points: { lion: 0, bear: 0, wolf: 3, dolphin: 0 },
      },
    ],
  },
  {
    id: 4,
    text: "If you could nap, what time works best?",
    options: [
      {
        label: "Mid-morning",
        points: { lion: 2, bear: 0, wolf: 0, dolphin: 1 },
        sleepScore: 5,
      },
      {
        label: "Early afternoon",
        points: { lion: 0, bear: 3, wolf: 1, dolphin: 0 },
        sleepScore: 10,
      },
      {
        label: "I rarely nap",
        points: { lion: 1, bear: 0, wolf: 2, dolphin: 2 },
        sleepScore: 8,
      },
    ],
  },
  {
    id: 5,
    text: "A friend invites you to dinner at 8 p.m. Your reaction?",
    options: [
      {
        label: "Too late for me",
        points: { lion: 3, bear: 0, wolf: 0, dolphin: 0 },
      },
      {
        label: "Works fine",
        points: { lion: 0, bear: 3, wolf: 1, dolphin: 1 },
      },
      {
        label: "Perfect, I come alive at night",
        points: { lion: 0, bear: 0, wolf: 3, dolphin: 0 },
      },
    ],
  },
  {
    id: 6,
    text: "How would you describe your bedroom?",
    options: [
      {
        label: "Calm and organized",
        points: { lion: 2, bear: 2, wolf: 0, dolphin: 1 },
        sleepScore: 10,
      },
      {
        label: "Comfortable but cluttered",
        points: { lion: 0, bear: 1, wolf: 2, dolphin: 0 },
        sleepScore: 6,
      },
      {
        label: "I have not thought much about it",
        points: { lion: 0, bear: 0, wolf: 1, dolphin: 2 },
        sleepScore: 3,
      },
    ],
  },
  {
    id: 7,
    text: "When you cannot sleep, what do you do?",
    options: [
      {
        label: "Read a book",
        points: { lion: 2, bear: 1, wolf: 0, dolphin: 1 },
        sleepScore: 8,
      },
      {
        label: "Watch TV or browse my phone",
        points: { lion: 0, bear: 1, wolf: 2, dolphin: 1 },
        sleepScore: 3,
      },
      {
        label: "Practice deep breathing or meditation",
        points: { lion: 1, bear: 2, wolf: 0, dolphin: 2 },
        sleepScore: 10,
      },
      {
        label: "Grab a snack",
        points: { lion: 0, bear: 1, wolf: 2, dolphin: 0 },
        sleepScore: 4,
      },
    ],
  },
  {
    id: 8,
    text: "How easily do you wake up in the morning?",
    options: [
      {
        label: "I pop up before my alarm",
        points: { lion: 3, bear: 0, wolf: 0, dolphin: 1 },
        sleepScore: 10,
      },
      {
        label: "I need one alarm and maybe one snooze",
        points: { lion: 0, bear: 3, wolf: 0, dolphin: 0 },
        sleepScore: 7,
      },
      {
        label: "Multiple alarms and still struggle",
        points: { lion: 0, bear: 0, wolf: 3, dolphin: 1 },
        sleepScore: 3,
      },
    ],
  },
  {
    id: 9,
    text: "When do you feel most mentally sharp?",
    options: [
      {
        label: "First thing in the morning",
        points: { lion: 3, bear: 1, wolf: 0, dolphin: 0 },
      },
      {
        label: "A few hours after waking",
        points: { lion: 0, bear: 3, wolf: 0, dolphin: 2 },
      },
      {
        label: "Late afternoon or evening",
        points: { lion: 0, bear: 0, wolf: 3, dolphin: 0 },
      },
    ],
  },
  {
    id: 10,
    text: "How would you describe your sleep quality?",
    options: [
      {
        label: "I sleep deeply through the night",
        points: { lion: 2, bear: 3, wolf: 1, dolphin: 0 },
        sleepScore: 10,
      },
      {
        label: "I wake up occasionally",
        points: { lion: 1, bear: 1, wolf: 2, dolphin: 1 },
        sleepScore: 6,
      },
      {
        label: "I am a very light sleeper",
        points: { lion: 0, bear: 0, wolf: 0, dolphin: 3 },
        sleepScore: 3,
      },
    ],
  },
  {
    id: 11,
    text: "How do you feel about early morning meetings?",
    options: [
      {
        label: "No problem at all",
        points: { lion: 3, bear: 1, wolf: 0, dolphin: 0 },
        sleepScore: 10,
      },
      {
        label: "I can manage",
        points: { lion: 0, bear: 3, wolf: 0, dolphin: 1 },
        sleepScore: 7,
      },
      {
        label: "Please, anything but that",
        points: { lion: 0, bear: 0, wolf: 3, dolphin: 1 },
        sleepScore: 4,
      },
    ],
  },
  {
    id: 12,
    text: "Rate your energy level by evening.",
    options: [
      {
        label: "Very low, ready for bed",
        points: { lion: 3, bear: 1, wolf: 0, dolphin: 0 },
        sleepScore: 10,
      },
      {
        label: "Still have some energy",
        points: { lion: 0, bear: 3, wolf: 1, dolphin: 1 },
        sleepScore: 7,
      },
      {
        label: "This is when I peak",
        points: { lion: 0, bear: 0, wolf: 3, dolphin: 0 },
        sleepScore: 5,
      },
    ],
  },
  {
    id: 13,
    text: "How hungry are you when you wake up?",
    options: [
      {
        label: "Starving, need breakfast immediately",
        points: { lion: 3, bear: 2, wolf: 0, dolphin: 0 },
      },
      {
        label: "Moderately hungry",
        points: { lion: 0, bear: 2, wolf: 1, dolphin: 1 },
      },
      {
        label: "Not hungry until later",
        points: { lion: 0, bear: 0, wolf: 3, dolphin: 2 },
      },
    ],
  },
  {
    id: 14,
    text: "On weekends, when do you wake up compared to weekdays?",
    options: [
      {
        label: "Same time",
        points: { lion: 3, bear: 1, wolf: 0, dolphin: 1 },
        sleepScore: 10,
      },
      {
        label: "About an hour later",
        points: { lion: 0, bear: 3, wolf: 1, dolphin: 0 },
        sleepScore: 7,
      },
      {
        label: "Much later",
        points: { lion: 0, bear: 0, wolf: 3, dolphin: 1 },
        sleepScore: 4,
      },
    ],
  },
  {
    id: 15,
    text: "Which statement fits you best?",
    options: [
      {
        label: "I am a morning person who fades by evening",
        points: { lion: 4, bear: 0, wolf: 0, dolphin: 0 },
        sleepScore: 5,
      },
      {
        label: "I follow a steady rhythm throughout the day",
        points: { lion: 0, bear: 4, wolf: 0, dolphin: 0 },
        sleepScore: 5,
      },
      {
        label: "I struggle mornings but thrive at night",
        points: { lion: 0, bear: 0, wolf: 4, dolphin: 0 },
        sleepScore: 5,
      },
      {
        label: "My energy is unpredictable and sleep is light",
        points: { lion: 0, bear: 0, wolf: 0, dolphin: 4 },
        sleepScore: 5,
      },
    ],
  },
];

export const totalQuestions = chronotypeQuestions.length;
