import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import MacroCalculator from "@/app/components/tool/macro-calculator/MacroCalculator";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";

export const metadata = buildToolMetadata({
  title: "Macro Calculator: Daily Protein, Carbs, and Fat in Grams",
  description:
    "Get personalized daily macronutrient targets — protein, carbs, and fat in grams — plus your total calorie target based on age, sex, height, weight, activity, and goal.",
  canonical: "/tool/macro-calculator",
  keywords: [
    "macro calculator",
    "macronutrient calculator",
    "protein carbs fat calculator",
    "TDEE macros",
    "Mifflin St Jeor",
    "Katch-McArdle",
    "macro split",
    "daily calorie calculator",
  ],
});


export default async function MacroCalculatorPage() {
  const landing = await getToolLanding("macro-calculator");

  return (
    <>
      <MacroCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
