export interface MentalAgeOption {
  label: string;
  /** Implicit mental-age value the option points to. */
  value: number;
}

export interface MentalAgeQuestion {
  id: number;
  text: string;
  options: readonly MentalAgeOption[];
}

export const questions: readonly MentalAgeQuestion[] = [
  {
    id: 1,
    text: "What sounds like the perfect Friday night?",
    options: [
      { label: "Playing video games or watching TikToks", value: 18 },
      { label: "Hanging out with friends, maybe a party", value: 22 },
      { label: "Dinner and drinks, chill vibes only", value: 32 },
      { label: "A quiet night in with a book or Netflix", value: 42 },
    ],
  },
  {
    id: 2,
    text: "How do you feel about waking up early?",
    options: [
      { label: "Absolutely not I'm a night owl", value: 20 },
      { label: "I'll do it if I have to", value: 28 },
      { label: "It's part of my routine now", value: 38 },
      { label: "I love early mornings, peaceful and productive", value: 48 },
    ],
  },
  {
    id: 3,
    text: "You're invited to a spontaneous weekend trip. What's your reaction?",
    options: [
      { label: "Count me in! Let me just pack my toothbrush", value: 22 },
      { label: "Sounds fun I'll check my schedule", value: 32 },
      { label: "I'll need time to plan and pack", value: 38 },
      { label: "I prefer to stay home or plan way in advance", value: 50 },
    ],
  },
  {
    id: 4,
    text: "What's your relationship with social media?",
    options: [
      { label: "It's my whole personality", value: 18 },
      { label: "I scroll often, but I'm not obsessed", value: 28 },
      { label: "I use it to stay updated, that's it", value: 40 },
      { label: "I could honestly live without it", value: 52 },
    ],
  },
  {
    id: 5,
    text: "What do you usually eat for breakfast?",
    options: [
      { label: "Whatever's quick, probably nothing", value: 22 },
      { label: "Cereal, toast, or something fast", value: 26 },
      { label: "Eggs, fruit, or yogurt mixing it up a bit", value: 34 },
      { label: "I meal-prep or make a full breakfast", value: 44 },
    ],
  },
  {
    id: 6,
    text: "How do you handle stress?",
    options: [
      { label: "Panic and avoid it", value: 20 },
      { label: "Vent to friends or distract myself", value: 26 },
      { label: "Take a breath and try to work through it", value: 36 },
      { label: "I've got systems to manage it", value: 46 },
    ],
  },
  {
    id: 7,
    text: "What's your idea of financial responsibility?",
    options: [
      { label: "I'll worry about it later", value: 20 },
      { label: "I try to budget when I can", value: 30 },
      { label: "I keep track of expenses regularly", value: 38 },
      { label: "I save, invest, and plan for the future", value: 48 },
    ],
  },
  {
    id: 8,
    text: "You see kids playing loudly in public. What's your reaction?",
    options: [
      { label: "Cute! Let them enjoy it", value: 24 },
      { label: "A little annoying, but whatever", value: 32 },
      { label: "Makes me think about parenting or how I was as a kid", value: 40 },
      { label: "Ugh, make it stop", value: 50 },
    ],
  },
  {
    id: 9,
    text: "What kind of TV shows do you usually prefer?",
    options: [
      { label: "Reality shows or anime", value: 22 },
      { label: "Comedy and action", value: 28 },
      { label: "Drama, documentaries, or thrillers", value: 40 },
      { label: "News, historical, or home-improvement shows", value: 50 },
    ],
  },
  {
    id: 10,
    text: "How do you usually make decisions?",
    options: [
      { label: "Impulsively", value: 18 },
      { label: "Based on how I feel", value: 26 },
      { label: "I weigh pros and cons", value: 38 },
      { label: "I research, plan, and think ahead", value: 48 },
    ],
  },
  {
    id: 11,
    text: "Your room looks like…",
    options: [
      { label: "Controlled chaos… or just chaos", value: 20 },
      { label: "Messy but manageable", value: 26 },
      { label: "Usually pretty tidy", value: 38 },
      { label: "Clean, organized, everything in its place", value: 50 },
    ],
  },
  {
    id: 12,
    text: "What's your approach to health and fitness?",
    options: [
      { label: "It's not a priority", value: 22 },
      { label: "I think about it sometimes", value: 28 },
      { label: "I try to exercise and eat better", value: 36 },
      { label: "I stick to a routine or diet plan", value: 44 },
    ],
  },
  {
    id: 13,
    text: "What kind of music do you usually vibe with?",
    options: [
      { label: "Viral hits and trending playlists", value: 18 },
      { label: "Pop, hip-hop, rock — depends on mood", value: 26 },
      { label: "Indie, jazz, or classic hits", value: 38 },
      { label: "Whatever's relaxing or nostalgic", value: 46 },
    ],
  },
  {
    id: 14,
    text: "How do you feel about birthdays?",
    options: [
      { label: "Big parties or nothing!", value: 20 },
      { label: "Celebrating is fun with friends", value: 26 },
      { label: "I enjoy low-key celebrations", value: 38 },
      { label: "Honestly, I don't care much anymore", value: 50 },
    ],
  },
  {
    id: 15,
    text: "What's your idea of a successful life?",
    options: [
      { label: "Being famous or rich", value: 20 },
      { label: "Doing what I love and having fun", value: 30 },
      { label: "Stability, growth, and relationships", value: 38 },
      { label: "Peace of mind, purpose, and family", value: 48 },
    ],
  },
] as const;

export const totalQuestions = questions.length;
/** Mental age range the test outputs, used by ScoreRing. */
export const MENTAL_AGE_MIN = 18;
export const MENTAL_AGE_MAX = 60;
