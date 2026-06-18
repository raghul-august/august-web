import Quiz from "@/app/components/tool/chronotype-test/Quiz";
import { buildToolMetadata, buildResultMetadata, BASE_URL } from "@/app/utils/tools/tool-metadata";
import { Viewport } from "next";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

interface Props {
  searchParams: Promise<{ type?: string }>;
}

const animalLabels: Record<string, string> = {
  lion: "Early Lion",
  bear: "Steady Bear",
  wolf: "Night Wolf",
  dolphin: "Light-Sleeping Dolphin",
};

export async function generateMetadata({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const typeParam = resolvedSearchParams.type;

  const ogImage = `${BASE_URL}/api/og/chronotype`;

  if (!typeParam || !animalLabels[typeParam]) {
    return buildToolMetadata({
      title: "Chronotype Quiz | Find Your Ideal Sleep Wake Rhythm",
      description:
        "Chronotypes describe your body's natural preference for sleep and wake times. Take this free chronotype quiz to discover your inner sleep animal and optimize your schedule.",
      canonical: "/tool/chronotype-test",
      ogImage,
    });
  }

  const label = animalLabels[typeParam];
  return buildResultMetadata({
    baseTitle: "Chronotype Quiz | Find Your Ideal Sleep Wake Rhythm",
    baseDescription:
      "Chronotypes describe your body's natural preference for sleep and wake times. Take this free chronotype quiz to discover your inner sleep animal and optimize your schedule.",
    canonical: "/tool/chronotype-test",
    ogRoute: "/api/og/chronotype",
    paramKey: "type",
    paramValue: typeParam,
    titleSuffix: () => `I'm a ${label}! - Chronotype Quiz`,
  });
}

export default async function ChronotypeTestPage() {
  const landing = await getToolLanding("chronotype-test");

  return (
    <Quiz
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
