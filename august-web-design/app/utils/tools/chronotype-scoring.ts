import { chronotypeQuestions } from "@/app/data/tools/chronotype-questions";

export type ChronotypeAnimal = "lion" | "bear" | "wolf" | "dolphin";

export type SleepScoreRating = "Excellent" | "Good" | "Fair" | "Needs Improvement" | "Poor";

export interface ChronotypeResult {
  animal: ChronotypeAnimal;
  name: string;
  emoji: string;
  description: string;
  chronotypeScore: number; // total points for winning chronotype
  sleepScore: number; // 0-100
  sleepScoreRating: SleepScoreRating;
  schedule: {
    wakeTime: string;
    peakFocus: string;
    exercise: string;
    bedtime: string;
  };
  population: string;
  traits: string[];
}

const chronotypeData: Record<ChronotypeAnimal, Omit<ChronotypeResult, "chronotypeScore" | "sleepScore" | "sleepScoreRating">> = {
  lion: {
    animal: "lion",
    name: "The Early Lion",
    emoji: "🦁",
    description:
      "You're a natural early riser. Your energy peaks in the morning, and you're at your sharpest before most people have finished their coffee. You tend to be optimistic, proactive, and goal-oriented.",
    schedule: {
      wakeTime: "5:30-6:00 AM",
      peakFocus: "8:00 AM-12:00 PM",
      exercise: "5:00 PM",
      bedtime: "9:30-10:00 PM",
    },
    population: "~15-20%",
    traits: [
      "Early riser",
      "Morning productivity",
      "Optimistic & driven",
      "Energy fades by evening",
    ],
  },
  bear: {
    animal: "bear",
    name: "The Steady Bear",
    emoji: "🐻",
    description:
      "You follow the solar cycle naturally. Your energy rises with the sun and winds down as it sets. You're part of the majority, about 55% of people share your rhythm. You tend to be sociable, easy-going, and team-oriented.",
    schedule: {
      wakeTime: "7:00 AM",
      peakFocus: "10:00 AM-2:00 PM",
      exercise: "7:30 AM or 12:00 PM",
      bedtime: "11:00 PM",
    },
    population: "~50-55%",
    traits: [
      "Solar cycle aligned",
      "Steady energy levels",
      "Sociable & adaptable",
      "Afternoon dip is normal",
    ],
  },
  wolf: {
    animal: "wolf",
    name: "The Night Wolf",
    emoji: "🐺",
    description:
      "You come alive when the sun goes down. Your creativity and focus peak in the evening and late at night. You tend to be creative, introspective, and independent. Mornings are not your friend.",
    schedule: {
      wakeTime: "7:30-9:00 AM",
      peakFocus: "5:00 PM-12:00 AM",
      exercise: "6:00 PM",
      bedtime: "12:00-1:00 AM",
    },
    population: "~15-20%",
    traits: [
      "Night owl",
      "Creative peak after dark",
      "Introspective & independent",
      "Slow morning start",
    ],
  },
  dolphin: {
    animal: "dolphin",
    name: "The Light-Sleeping Dolphin",
    emoji: "🐬",
    description:
      "You're a light sleeper who often struggles with a regular sleep schedule. Your mind tends to race, and you may find it hard to fully switch off. You're often highly intelligent, detail-oriented, and a perfectionist.",
    schedule: {
      wakeTime: "6:30 AM",
      peakFocus: "10:00 AM-12:00 PM",
      exercise: "7:30 AM",
      bedtime: "11:30 PM",
    },
    population: "~10%",
    traits: [
      "Light sleeper",
      "Detail-oriented mind",
      "Perfectionist tendencies",
      "Variable energy patterns",
    ],
  },
};

function getSleepScoreRating(score: number): SleepScoreRating {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
}

/**
 * Computes chronotype based on point allocation system and calculates sleep score.
 *
 * Scoring logic:
 * 1. Each answer awards points to each chronotype (lion, bear, wolf, dolphin)
 * 2. Chronotype with highest total points wins
 * 3. Tie-breaking priority: Dolphin > Wolf > Lion > Bear
 * 4. Sleep score calculated separately from specific questions (0-100 scale)
 *
 * @param answers - Record mapping question ID to selected option index
 * @returns Complete chronotype result with animal type, scores, and recommendations
 */
export function computeChronotype(
  answers: Record<number, number>
): ChronotypeResult {
  // Initialize point totals for each chronotype
  const totals = {
    lion: 0,
    bear: 0,
    wolf: 0,
    dolphin: 0,
  };

  let sleepScore = 0;

  // Accumulate points from each question
  chronotypeQuestions.forEach((question) => {
    const selectedOptionIndex = answers[question.id];
    if (selectedOptionIndex !== undefined) {
      const selectedOption = question.options[selectedOptionIndex];
      if (selectedOption) {
        // Add chronotype points
        totals.lion += selectedOption.points.lion;
        totals.bear += selectedOption.points.bear;
        totals.wolf += selectedOption.points.wolf;
        totals.dolphin += selectedOption.points.dolphin;

        // Add sleep score if present
        if (selectedOption.sleepScore !== undefined) {
          sleepScore += selectedOption.sleepScore;
        }
      }
    }
  });

  // Determine winning chronotype with tie-breaking
  let winningAnimal: ChronotypeAnimal;
  const maxScore = Math.max(totals.lion, totals.bear, totals.wolf, totals.dolphin);

  // Check for ties and apply priority: Dolphin > Wolf > Lion > Bear
  const tiedAnimals: ChronotypeAnimal[] = [];
  if (totals.dolphin === maxScore) tiedAnimals.push("dolphin");
  if (totals.wolf === maxScore) tiedAnimals.push("wolf");
  if (totals.lion === maxScore) tiedAnimals.push("lion");
  if (totals.bear === maxScore) tiedAnimals.push("bear");

  // Priority order for tie-breaking
  const priorityOrder: ChronotypeAnimal[] = ["dolphin", "wolf", "lion", "bear"];
  winningAnimal = priorityOrder.find((animal) => tiedAnimals.includes(animal)) || "bear";

  const sleepScoreRating = getSleepScoreRating(sleepScore);

  return {
    ...chronotypeData[winningAnimal],
    chronotypeScore: totals[winningAnimal],
    sleepScore,
    sleepScoreRating,
  };
}
