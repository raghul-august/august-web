import Quiz from "@/app/components/tool/free-adhd-test/Quiz";
import { buildToolMetadata, buildResultMetadata, BASE_URL } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

interface Props {
  searchParams: Promise<{ score?: string; d?: string }>;
}

function getVibeLabel(score: number) {
  if (score <= 9) return "Low-key";
  if (score <= 13) return "Maybe something";
  if (score <= 17) return "Notable vibes";
  return "Significant signs";
}

export async function generateMetadata({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const scoreParam = resolvedSearchParams.score;

  if (!scoreParam) {
    return buildToolMetadata({
      title: "ADHD Test for Adults and Teens | Online Screening",
      description:
        "Difficulty concentrating, staying organized, or sitting still? Take this free ADHD test to screen symptoms in adults and teens. Results are private and instant.",
      canonical: "/tool/free-adhd-test",
      ogImage: `${BASE_URL}/adhd-quiz/og-image.png`,
      ogImageAlt: "The ADHD Quiz - Free screening tool",
    });
  }

  const score = parseInt(scoreParam, 10);
  const clampedScore = Math.max(0, Math.min(24, score));
  const vibeLabel = getVibeLabel(clampedScore);

  return buildResultMetadata({
    baseTitle: "ADHD Test for Adults and Teens | Online Screening",
    baseDescription:
      "Difficulty concentrating, staying organized, or sitting still? Take this free ADHD test to screen symptoms in adults and teens. Results are private and instant.",
    canonical: "/tool/free-adhd-test",
    ogRoute: "/api/og/adhd-result",
    paramKey: "score",
    paramValue: scoreParam,
    clamp: { min: 0, max: 24 },
    titleSuffix: (val) => `I scored ${val}/24 on the ADHD Quiz - ${getVibeLabel(Number(val))}`,
    ogImageAlt: `ADHD Quiz Result: ${clampedScore}/24 - ${vibeLabel}`,
    ogImageWidth: 600,
    ogImageHeight: 780,
  });
}

export default async function Home() {
  const landing = await getToolLanding("free-adhd-test");

  return (
    <Quiz
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
