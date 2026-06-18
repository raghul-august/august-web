export interface QuestionOption {
  emoji: string;
  label: string;
  subtext: string;
}

export interface Question {
  id: number;
  time: string;
  location: string;
  scenario: string;
  text: string;
  type: "binary" | "scale";
  options?: QuestionOption[];
}

export interface Section {
  section_id: string;
  title: string;
  tag: string;
  questions: Question[];
}

export const scaleOptions: QuestionOption[] = [
  { emoji: "😌", label: "Never ever", subtext: "Not me" },
  { emoji: "🤷", label: "Rarely", subtext: "Once in a blue moon" },
  { emoji: "😅", label: "Sometimes", subtext: "It happens" },
  { emoji: "😬", label: "Often", subtext: "More than I'd like" },
  { emoji: "🫠", label: "Always", subtext: "It's a lifestyle" },
];

export const sections: Section[] = [
  {
    section_id: "preliminary",
    title: "The warm-up",
    tag: "Quick hits",
    questions: [
      {
        id: 1,
        time: "Monday, 8:00 AM",
        location: "Coffee Shop",
        scenario:
          "You're reviewing an important document at your favorite coffee shop. The espresso machine hisses, someone's on a loud phone call, and there's a dog outside the window that keeps catching your eye.",
        text: "Does your attention get pulled away by everything around you?",
        type: "binary",
        options: [
          { emoji: "🎯", label: "Constantly", subtext: "Every sound derails me" },
          { emoji: "✓", label: "I can focus", subtext: "Noise doesn't bother me" },
        ],
      },
      {
        id: 2,
        time: "Monday, 8:15 AM",
        location: "Coffee Shop",
        scenario:
          "You came here with a clear plan: review the document, reply to three emails, then head to work. Wait... what was the second thing again?",
        text: "Do you forget things you just planned to do moments ago?",
        type: "binary",
        options: [
          { emoji: "🤔", label: "All the time", subtext: "Plans vanish instantly" },
          { emoji: "✓", label: "I remember", subtext: "My memory's solid" },
        ],
      },
      {
        id: 3,
        time: "Monday, 8:40 AM",
        location: "Walking to Work",
        scenario:
          "You're walking to work listening to a podcast. A car honks, someone calls your name, construction noise erupts nearby. Each sound completely derails your train of thought.",
        text: "Do background noises throw off your concentration?",
        type: "binary",
        options: [
          { emoji: "🔊", label: "Constantly", subtext: "Sounds hijack my brain" },
          { emoji: "✓", label: "I can tune it out", subtext: "I stay focused" },
        ],
      },
      {
        id: 4,
        time: "Monday, 9:00 AM",
        location: "Your Desk",
        scenario:
          "You sit down and look at your to-do list. That big report needs deep focus. But suddenly, reorganizing your desk drawer seems really, really important.",
        text: "Do you avoid tasks that require sustained concentration?",
        type: "binary",
        options: [
          { emoji: "📋", label: "I avoid them", subtext: "I'll do anything else" },
          { emoji: "✓", label: "I tackle them", subtext: "I dive right in" },
        ],
      },
      {
        id: 5,
        time: "Monday, 9:20 AM",
        location: "Email",
        scenario:
          "You're speedrunning through emails to clear your inbox. Done! Wait... you attached the wrong file, wrote the wrong date, and misspelled someone's name.",
        text: "Do you rush through tasks and make careless mistakes?",
        type: "binary",
        options: [
          { emoji: "⚡", label: "Frequently", subtext: "Speed over accuracy" },
          { emoji: "✓", label: "Rarely", subtext: "I'm careful" },
        ],
      },
      {
        id: 6,
        time: "Monday, 9:45 AM",
        location: "Morning Meeting",
        scenario:
          "Everyone else seems perfectly fine sitting still in this meeting. You're bouncing your leg, clicking your pen, shifting constantly. Sitting still feels physically uncomfortable.",
        text: "Do you feel restless when you have to sit still?",
        type: "binary",
        options: [
          { emoji: "🪑", label: "Always", subtext: "I need to move" },
          { emoji: "✓", label: "I'm fine", subtext: "Sitting still is easy" },
        ],
      },
      {
        id: 7,
        time: "Monday, 10:00 AM",
        location: "Quick Check-in",
        scenario:
          "Before we continue through your Monday, a quick background question to help contextualize your experience.",
        text: "Have you taken any focus or ADHD medication in the past year?",
        type: "binary",
        options: [
          { emoji: "💊", label: "Yes", subtext: "Currently or previously" },
          { emoji: "✓", label: "No", subtext: "No ADHD medication" },
        ],
      },
    ],
  },
  {
    section_id: "deep_dive",
    title: "The deep dive",
    tag: "Past 6 months",
    questions: [
      {
        id: 8,
        time: "Monday, 10:30 AM",
        location: "Your Desk",
        scenario:
          "That project from last week sits at 95% complete. All that's left is formatting, proofreading, the boring final details. It's been taunting you for days.",
        text: "How often do you struggle to finish the boring parts after the fun work is done?",
        type: "scale",
      },
      {
        id: 9,
        time: "Monday, 11:00 AM",
        location: "New Assignment",
        scenario:
          "Your boss asks you to organize the team offsite. Flights, hotels, coordinating everyone's schedules, budget spreadsheets. Your brain is already overheating thinking about where to start.",
        text: "How often does organizing complex tasks feel overwhelming?",
        type: "scale",
      },
      {
        id: 10,
        time: "Monday, 11:30 AM",
        location: "Calendar Alert",
        scenario:
          "Your phone buzzes. Missed dentist appointment. You set three reminders for it this morning. You forgot to check all three of them.",
        text: "How often do you forget appointments despite setting reminders?",
        type: "scale",
      },
      {
        id: 11,
        time: "Monday, 12:00 PM",
        location: "Lunch Break",
        scenario:
          "You need to write that difficult email. The one requiring real thinking, not just busy work. It's been on your list all week. Every day you do literally anything else.",
        text: "How often do you delay tasks that require serious mental effort?",
        type: "scale",
      },
      {
        id: 12,
        time: "Monday, 1:00 PM",
        location: "Back at Desk",
        scenario:
          "Back at your desk after lunch. You're trying to read a long document. Your leg bounces. You've checked your phone seven times. You reorganized the desk items. Why can't you just... sit?",
        text: "How often do you fidget or squirm when sitting for extended periods?",
        type: "scale",
      },
      {
        id: 13,
        time: "Monday, 1:30 PM",
        location: "Quiet Work Time",
        scenario:
          "It's supposed to be focused work time. But your brain won't stop spinning. You feel compelled to DO something - clean, organize, start a project, anything. Just sitting feels impossible.",
        text: "How often do you feel like your brain won't let you slow down?",
        type: "scale",
      },
      {
        id: 14,
        time: "Monday, 2:00 PM",
        location: "Form Filling",
        scenario:
          "You're filling out expense reports. Boring, repetitive forms. When you finally submit, you notice you put your address where your phone number should be. Again.",
        text: "How often do you make careless mistakes on routine tasks?",
        type: "scale",
      },
      {
        id: 15,
        time: "Monday, 2:30 PM",
        location: "Data Entry",
        scenario:
          "Spreadsheets. Data entry. Reading the same type of document for hours. Your eyes are open, you're typing, but your brain has completely left the building.",
        text: "How often does your mind wander during repetitive work?",
        type: "scale",
      },
      {
        id: 16,
        time: "Monday, 2:45 PM",
        location: "Team Check-in",
        scenario:
          "Your coworker is explaining something important about their project. You're nodding, making eye contact. But internally? You're wondering if you remembered to lock your door this morning.",
        text: "How often does your mind wander when people are talking directly to you?",
        type: "scale",
      },
      {
        id: 17,
        time: "Monday, 3:00 PM",
        location: "The Daily Search",
        scenario:
          "'Where are my keys?' You ask this at least once a day. Sometimes it's your phone. Your wallet. The pen you were just holding. The thing you put down five seconds ago.",
        text: "How often do you misplace everyday items?",
        type: "scale",
      },
      {
        id: 18,
        time: "Monday, 3:15 PM",
        location: "Office Chaos",
        scenario:
          "You're trying to finish an important task. Someone walks by your desk. A notification pings. Construction noise outside. Each one completely derails your focus.",
        text: "How easily do external noises or movements steal your attention?",
        type: "scale",
      },
      {
        id: 19,
        time: "Monday, 3:30 PM",
        location: "Long Presentation",
        scenario:
          "This presentation has been going for 45 minutes. Everyone else seems fine sitting here. You've gotten up twice for water, once for the bathroom. Any excuse to move.",
        text: "How often do you leave your seat when you're supposed to stay put?",
        type: "scale",
      },
      {
        id: 20,
        time: "Monday, 4:00 PM",
        location: "The Final Push",
        scenario:
          "That feeling like you need to move. Like there are ants under your skin. Like staying still is physically uncomfortable. It's getting worse as the afternoon drags on.",
        text: "How often do you feel restless or unable to sit still?",
        type: "scale",
      },
      {
        id: 21,
        time: "Monday, 4:30 PM",
        location: "Brief Break",
        scenario:
          "You have 15 minutes of downtime. This should be relaxing. But your brain won't stop spinning. You can't just... be. Even relaxation feels like work somehow.",
        text: "How often do you struggle to actually unwind during downtime?",
        type: "scale",
      },
      {
        id: 22,
        time: "Monday, 5:00 PM",
        location: "Water Cooler",
        scenario:
          "Casual chat with a colleague. You started telling a short story about your weekend. Ten minutes later you're still talking. You can see their eyes glazing over but you can't seem to stop.",
        text: "How often do you talk way more than you meant to?",
        type: "scale",
      },
      {
        id: 23,
        time: "Monday, 5:30 PM",
        location: "Team Discussion",
        scenario:
          "Your teammate is telling a story. You know exactly where it's going. Before they finish their sentence, the words are already coming out of your mouth, completing it for them.",
        text: "How often do you finish other people's sentences?",
        type: "scale",
      },
      {
        id: 24,
        time: "Monday, 6:00 PM",
        location: "Wrapping Up",
        scenario:
          "Waiting in line at the coffee shop. Waiting for your turn in a conversation. Waiting for anything. Time feels like molasses and you might explode from the impatience.",
        text: "How often do you find waiting in lines or for your turn unbearable?",
        type: "scale",
      },
      {
        id: 25,
        time: "Monday, 6:30 PM",
        location: "End of Day",
        scenario:
          "You're wrapping up for the day. Your coworker is clearly focused on something important. But you have a quick question. You know you should wait. You're already asking it.",
        text: "How often do you interrupt people when they're busy?",
        type: "scale",
      },
    ],
  },
];

export const allQuestions: Question[] = sections.flatMap((s) => s.questions);

export const encouragementCheckpoints = [7, 14, 21];

export interface EncouragementData {
  illustration: string;
  chapter: string;
  headline: string;
  narrative: string;
  button: string;
  progress: number;
  timeEmoji: string;
}

export const encouragementStories: Record<number, EncouragementData> = {
  7: {
    illustration: "/quiz/morning.png",
    chapter: "",
    headline: "",
    narrative:
      "Coffee shop chaos? Handled. The commute? Done. You're finally at your desk, inbox glaring at you. The morning rush is behind you. Now the real test begins.",
    button: "Dive into the deep end",
    progress: 1,
    timeEmoji: "☀️",
  },
  14: {
    illustration: "/quiz/afternoon.png",
    chapter: "",
    headline: "",
    narrative:
      "Lunch is a distant memory. The post-meal slump hits different. Meetings blurred together, forms got filled (mostly correctly), and your brain is now running on autopilot.",
    button: "Power through",
    progress: 2,
    timeEmoji: "🌤️",
  },
  21: {
    illustration: "/quiz/evening.png",
    chapter: "",
    headline: "",
    narrative:
      "You can almost taste the end of the day. The clock seems to move slower now. Just a few more tasks, a couple more questions, and you'll finally know what your brain's been trying to tell you.",
    button: "Finish strong",
    progress: 3,
    timeEmoji: "🌅",
  },
};
