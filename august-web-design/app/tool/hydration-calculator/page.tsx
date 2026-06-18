import HydrationCalculatorClient from "@/app/components/tool/hydration-calculator/HydrationCalculatorClient";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "Hydration Calculator | How Much Water Should You Drink?",
  description:
    "Calculate your daily water needs based on your body, activity level, and beverage intake. Free, private, instant results.",
  canonical: "/tool/hydration-calculator",
});

export default async function HydrationCalculatorPage() {
  const landing = await getToolLanding("hydration-calculator");

  return (
    <HydrationCalculatorClient
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
