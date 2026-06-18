import BodyFatCalculatorClient from "@/app/components/tool/body-fat-calculator/BodyFatCalculatorClient";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "Body Fat Calculator: Navy & Army ABCP Methods",
  description:
    "Calculate your body fat percentage using the U.S. Navy circumference method or Army ABCP 2023 standard. Free, instant, private — no account required.",
  canonical: "/tool/body-fat-calculator",
  keywords: [
    "body fat calculator",
    "navy body fat calculator",
    "army body fat calculator",
    "body fat percentage",
    "ABCP body fat",
    "circumference body fat method",
    "body composition calculator",
  ],
});

export default async function BodyFatCalculatorPage() {
  const landing = await getToolLanding("body-fat-calculator");

  return (
    <BodyFatCalculatorClient
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
