// ACE-10 scoring: binary sum of "yes" answers (0-10)
import { questions, ChildhoodTraumaQuestion } from "@/app/data/tools/childhood-trauma-questions";
export { getBadgeTone } from "./tool-colors";

export function computeScore(answers: Record<number, boolean>): number {
  return Object.values(answers).filter(Boolean).length;
}

export interface ScoreTier {
  title: string;
  message: string;
  badge: "badge-low" | "badge-moderate" | "badge-significant" | "badge-high";
}

export function getScoreTier(score: number): ScoreTier {
  if (score === 0) {
    return {
      title: "Low Likelihood of Childhood Trauma",
      message:
        "Your responses suggest you were not exposed to the adverse childhood experiences measured by this trauma test. That is a positive sign. Keep in mind that this quiz only measures 10 specific types of ACEs, and everyone\u2019s experience is different. If you are still struggling with emotional or mental health challenges, speaking with a professional can always help.",
      badge: "badge-low",
    };
  }
  if (score <= 3) {
    return {
      title: "Mild to Moderate Exposure",
      message:
        "Your score suggests some exposure to adverse childhood experiences during your early years. Research shows that even one or two ACEs can have a noticeable impact on emotional wellbeing, relationships, and how you handle stress as an adult. This does not mean something is wrong with you it just means your early environment may have shaped some of the patterns you notice in your life today. Talking to a mental health professional can help you understand these patterns better and work through them.",
      badge: "badge-moderate",
    };
  }
  if (score <= 6) {
    return {
      title: "Significant Exposure",
      message:
        "A score in this range indicates significant exposure to childhood trauma. Studies consistently show that an ACE score of 4 or higher is associated with a much greater risk for challenges like depression, anxiety, chronic health conditions, and difficulty in relationships. This is not a life sentence it is information. Many people with higher ACE scores go on to live healthy and fulfilling lives, especially when they get the right support. Working with a trauma-informed therapist is a strong next step.",
      badge: "badge-significant",
    };
  }
  return {
    title: "High Exposure",
    message:
      "Your responses indicate substantial exposure to adverse childhood experiences. A score this high means you went through a lot during your formative years, and it is very likely that those experiences are still affecting how you feel, think, and relate to others today. Please know that healing is possible. Research shows that trauma-informed therapy, supportive relationships, and consistent self-care can significantly reduce the long-term effects of childhood adversity. Reaching out to a licensed mental health professional is strongly encouraged.",
    badge: "badge-high",
  };
}

// Category breakdown
export interface CategoryBreakdown {
  label: string;
  count: number;
  total: number;
}

export function getCategoryBreakdowns(
  answers: Record<number, boolean>
): CategoryBreakdown[] {
  const abuseCount = questions
    .filter((q: ChildhoodTraumaQuestion) => q.category === "abuse_neglect" && answers[q.id])
    .length;
  const dysfunctionCount = questions
    .filter((q: ChildhoodTraumaQuestion) => q.category === "household_dysfunction" && answers[q.id])
    .length;
  const abuseTotal = questions.filter((q: ChildhoodTraumaQuestion) => q.category === "abuse_neglect").length;
  const dysfunctionTotal = questions.filter((q: ChildhoodTraumaQuestion) => q.category === "household_dysfunction").length;

  return [
    { label: "Abuse & Neglect", count: abuseCount, total: abuseTotal },
    { label: "Household Dysfunction", count: dysfunctionCount, total: dysfunctionTotal },
  ];
}
