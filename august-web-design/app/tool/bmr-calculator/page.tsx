import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import BMRCalculator from "@/app/components/tool/bmr-calculator/BMRCalculator";

export const metadata = buildToolMetadata({
  title: "BMR Calculator. Free Basal Metabolic Rate Calculator",
  description:
    "Calculate your Basal Metabolic Rate (BMR) for free. Choose between Mifflin-St Jeor, Harris-Benedict, or Katch-McArdle formulas and see daily calories by activity level, in metric or US units, with no signup.",
  canonical: "/tool/bmr-calculator",
  keywords: [
    "BMR calculator",
    "basal metabolic rate",
    "Mifflin-St Jeor",
    "Harris-Benedict",
    "Katch-McArdle",
    "daily calorie needs",
    "resting metabolic rate",
    "metabolism calculator",
  ],
});

export default async function BMRCalculatorPage() {
  const landing = await getToolLanding("bmr-calculator");
  return (
    <BMRCalculator
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
