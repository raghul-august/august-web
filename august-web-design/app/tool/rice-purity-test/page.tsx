import Quiz from "@/app/components/tool/rice-purity-test/Quiz";
import { buildToolMetadata, buildResultMetadata, BASE_URL } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

interface Props {
  searchParams: Promise<{ score?: string }>;
}

function getTierTitle(score: number) {
  if (score >= 90) return "Impossibly Pure";
  if (score >= 70) return "Pretty Open";
  if (score >= 50) return "Average Human";
  if (score >= 30) return "Secret Hoarder";
  return "Body Secrets Master";
}

export async function generateMetadata({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const scoreParam = resolvedSearchParams.score;

  if (!scoreParam) {
    return buildToolMetadata({
      title: "Rice Purity Test - But For Your Health | August AI",
      description:
        "34 body secrets. One score. How much have you been carrying alone? Take the rice purity test and find out.",
      canonical: "/tool/rice-purity-test",
      ogImage: `${BASE_URL}/api/og/rice-purity`,
      ogImageAlt: "Rice Purity Test - How many body secrets are you keeping?",
    });
  }

  const score = Math.max(0, Math.min(100, parseInt(scoreParam, 10)));
  const tierTitle = getTierTitle(score);

  return buildResultMetadata({
    baseTitle: "Rice Purity Test - But For Your Health | August AI",
    baseDescription:
      "34 body secrets. One score. How much have you been carrying alone? Take the rice purity test and find out.",
    canonical: "/tool/rice-purity-test",
    ogRoute: "/api/og/rice-purity-result",
    paramKey: "score",
    paramValue: scoreParam,
    clamp: { min: 0, max: 100 },
    titleSuffix: (val) =>
      `I scored ${val}/100 on the Rice Purity Test - ${getTierTitle(Number(val))}`,
    ogImageAlt: `Rice Purity Test Result: ${score}/100 - ${tierTitle}`,
  });
}

export default async function Home() {
  const landing = await getToolLanding("rice-purity-test");

  return (
    <Quiz
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
