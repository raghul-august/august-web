export interface RicePurityQuestion {
  id: number;
  text: string;
}

export interface RicePurityCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  questions: RicePurityQuestion[];
}

export const categories: RicePurityCategory[] = [
  {
    id: "late_night_searches",
    title: "The 3AM Google Spiral",
    emoji: "🌙",
    description: "The things your phone knows about you at 3am",
    questions: [
      { id: 1, text: "Googled a symptom after midnight and convinced yourself it was serious" },
      { id: 2, text: "Found a Reddit thread from 10 years ago and wondered if that person survived" },
      { id: 3, text: "Screenshotted medical information to look at later \"just in case\"" },
      { id: 4, text: "Felt relieved after finding one comment that matched your exact situation" },
      { id: 5, text: "Cleared your search history because of embarrassing health questions" },
    ],
  },
  {
    id: "body_stuff",
    title: "Body Stuff You've Never Mentioned",
    emoji: "🫣",
    description: "The silent observations only you know about",
    questions: [
      { id: 6, text: "Discovered a new mole/spot and watched it for weeks without telling anyone" },
      { id: 7, text: "Noticed a weird smell from your body and secretly tried to figure out the source" },
      { id: 8, text: "Had a bodily function happen at the worst possible moment in public" },
      { id: 9, text: "Checked if something about your body was \"normal\" by secretly comparing to others" },
      { id: 10, text: "Experienced a random sharp pain, froze, waited for it to pass, and never mentioned it" },
      { id: 11, text: "Found something weird while showering and pretended you didn't" },
      { id: 12, text: "Had a bathroom experience that made you question your entire diet" },
      { id: 13, text: "Noticed your body making a new sound and just accepted it as part of aging" },
      { id: 14, text: "Poked, squeezed, or prodded something on your body that you probably shouldn't have" },
      { id: 15, text: "Had a physical sensation you couldn't even describe in words" },
      { id: 16, text: "Experienced something in your body that you've never seen anyone else talk about" },
      { id: 17, text: "Waited to see if \"it would just go away\" instead of getting it checked (and it did)" },
    ],
  },
  {
    id: "unasked_questions",
    title: "The Things You've Never Asked",
    emoji: "🤐",
    description: "The words you rehearsed but never said out loud",
    questions: [
      { id: 18, text: "Wondered \"is everyone's [body part] like this or just mine?\"" },
      { id: 19, text: "Had a question so embarrassing you created an anonymous account to ask it" },
      { id: 20, text: "Wanted to ask someone \"is this normal?\" but couldn't figure out how to bring it up" },
      { id: 21, text: "Rehearsed how to describe a symptom before a doctor's visit" },
    ],
  },
  {
    id: "health_lies",
    title: "Health Lies & Denial",
    emoji: "🤥",
    description: "The gap between what you said and what was true",
    questions: [
      { id: 22, text: "Told a doctor \"occasionally\" when the real answer was \"daily\"" },
      { id: 23, text: "Ignored a symptom hoping it would disappear before anyone noticed" },
      { id: 24, text: "Said you understood what the doctor said when you absolutely did not" },
      { id: 25, text: "Kept a health worry completely to yourself for months" },
      { id: 26, text: "Answered \"no\" on a medical form when the real answer was \"yes\"" },
    ],
  },
  {
    id: "secret_habits",
    title: "The Secret Health Behaviors",
    emoji: "🔍",
    description: "Your private health monitoring system",
    questions: [
      { id: 27, text: "Checked your heart rate or pulse randomly to make sure you were okay" },
      { id: 28, text: "Held your breath to see if a pain would come back" },
      { id: 29, text: "Pressed on a body part repeatedly to confirm it still hurt" },
      { id: 30, text: "Taken a photo of something on your body \"for documentation\"" },
      { id: 31, text: "Set a mental deadline: \"if it's still there by Friday, I'll do something\"" },
      { id: 32, text: "Asked the internet before asking a real person about a health concern" },
      { id: 33, text: "Monitored a symptom obsessively without telling anyone you were doing it" },
      { id: 34, text: "Felt a wave of relief when someone else finally mentioned experiencing the same thing" },
    ],
  },
];

export const allQuestions: RicePurityQuestion[] = categories.flatMap((c) => c.questions);
export const totalQuestions = allQuestions.length;

// Encouragement screen data between categories
export interface EncouragementData {
  emoji: string;
  headline: string;
  narrative: string;
  button: string;
  progress: number;
}

export const categoryEncouragements: Record<string, EncouragementData> = {
  body_stuff: {
    emoji: "👀",
    headline: "Getting real now",
    narrative:
      "That was just the warm-up. The next section gets into the stuff you notice about your body but never mention to anyone. This is where most people start checking a lot more boxes.",
    button: "Keep going",
    progress: 1,
  },
  unasked_questions: {
    emoji: "🤫",
    headline: "You're not alone",
    narrative:
      "If the last section hit close to home, you're in good company. Almost everyone has body stuff they've never shared. Now let's talk about the questions you've been holding onto.",
    button: "Almost there",
    progress: 2,
  },
  health_lies: {
    emoji: "😶",
    headline: "The quiet ones",
    narrative:
      "The questions you never asked carry more weight than you'd think. This next section is about the little adjustments you make when talking about your health. No judgment here.",
    button: "Let's see",
    progress: 3,
  },
  secret_habits: {
    emoji: "🔒",
    headline: "Last stretch",
    narrative:
      "Almost done. This final section is about the private health routines you've built for yourself. The ones nobody in your life knows about.",
    button: "Finish this",
    progress: 4,
  },
};
