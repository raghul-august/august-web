import TDEECalculatorClient from "@/app/components/tool/tdee-calculator/TDEECalculatorClient";
import { buildToolMetadata, BASE_URL } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "TDEE Calculator: Learn Your Total Daily Energy Expenditure",
  description:
    "Calculate how many calories you burn per day with this free TDEE calculator. Includes BMR, activity level, and personalized calorie estimates.",
  canonical: "/tool/tdee-calculator",
  ogImage: `${BASE_URL}/images/tdee-og-image.png`,
  ogImageAlt: "TDEE Calculator - Calculate Your Daily Calorie Needs",
  keywords: [
    "TDEE calculator",
    "total daily energy expenditure",
    "calorie calculator",
    "BMR calculator",
    "weight loss calculator",
    "maintenance calories",
    "fitness calculator",
    "metabolism calculator",
  ],
});

export default async function TDEECalculatorPage() {
  const landing = await getToolLanding("tdee-calculator");

  return (
    <TDEECalculatorClient
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
