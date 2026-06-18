import { categories, type RicePurityCategory } from "@/app/data/tools/rice-purity-questions";
export { getBadgeTone } from "./tool-colors";

// Scoring: 100 - (checkedCount × 3), clamped to 0-100
export function computeScore(checked: Set<number>): number {
  const raw = 100 - checked.size * 3;
  return Math.max(0, Math.min(100, raw));
}

export interface ScoreTier {
  title: string;
  message: string;
  badge: "badge-pure" | "badge-open" | "badge-average" | "badge-hoarder" | "badge-master";
}

export function getScoreTier(score: number): ScoreTier {
  if (score >= 90) {
    return {
      title: "Impossibly Pure",
      message: "Are you even human?",
      badge: "badge-pure",
    };
  }
  if (score >= 70) {
    return {
      title: "Pretty Open",
      message: "You share more than most people",
      badge: "badge-open",
    };
  }
  if (score >= 50) {
    return {
      title: "Average Human",
      message: "You've got secrets like everyone else",
      badge: "badge-average",
    };
  }
  if (score >= 30) {
    return {
      title: "Secret Hoarder",
      message: "There's a lot you've never said out loud",
      badge: "badge-hoarder",
    };
  }
  return {
    title: "Body Secrets Master",
    message: "You could write a book about things you've never told anyone",
    badge: "badge-master",
  };
}

// Find the category where the user checked the most items
export interface SecretZone {
  category: RicePurityCategory;
  count: number;
  percentage: number;
  label: string;
  description: string;
}

const zoneLabels: Record<string, { label: string; description: string }> = {
  late_night_searches: {
    label: "The Midnight Googler",
    description:
      "Your phone knows more about your health fears than any person in your life. You've read Reddit threads from a decade ago wondering if that person ever got better.",
  },
  body_stuff: {
    label: "The Silent Observer",
    description:
      "You notice everything about your body but tell absolutely no one. You have a running mental catalog that exists entirely in your own head.",
  },
  unasked_questions: {
    label: "The Quiet Wonderer",
    description:
      "You have health questions that have been living in your brain rent free for months. Maybe years. You've rehearsed how to bring them up but the moment never felt right.",
  },
  health_lies: {
    label: "The Smooth Talker",
    description:
      "You've gotten really good at performing \"fine and healthy\" even when you're confused or worried underneath. You know exactly how to nod convincingly.",
  },
  secret_habits: {
    label: "The Secret Tracker",
    description:
      "You've built an entire private health monitoring system that nobody knows about. You check your pulse randomly, press on sore spots, and set mental deadlines.",
  },
};

export function getSecretZone(checked: Set<number>): SecretZone | null {
  let maxCategory: RicePurityCategory | null = null;
  let maxCount = 0;

  for (const category of categories) {
    const count = category.questions.filter((q) => checked.has(q.id)).length;
    if (count > maxCount) {
      maxCount = count;
      maxCategory = category;
    }
  }

  if (!maxCategory || maxCount === 0) return null;

  const percentage = Math.round((maxCount / maxCategory.questions.length) * 100);
  const zone = zoneLabels[maxCategory.id];

  return {
    category: maxCategory,
    count: maxCount,
    percentage,
    label: zone.label,
    description: zone.description,
  };
}

// Per-category breakdown for results
export interface CategoryBreakdown {
  category: RicePurityCategory;
  checked: number;
  total: number;
  percentage: number;
}

export function getCategoryBreakdowns(checked: Set<number>): CategoryBreakdown[] {
  return categories.map((category) => {
    const count = category.questions.filter((q) => checked.has(q.id)).length;
    return {
      category,
      checked: count,
      total: category.questions.length,
      percentage: Math.round((count / category.questions.length) * 100),
    };
  });
}
