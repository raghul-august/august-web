import DriCalculator from "@/app/components/tool/dri-calculator/DriCalculator";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "DRI Calculator. Free Daily Vitamin, Mineral & Calorie Targets",
  description:
    "Your personal Dietary Reference Intakes — calories, macros, vitamins, and minerals — based on the IOM Food & Nutrition Board and NIH Office of Dietary Supplements tables.",
  canonical: "/tool/dri-calculator",
  keywords: [
    "DRI calculator",
    "dietary reference intake",
    "RDA calculator",
    "personal nutrient needs",
    "daily vitamin requirements",
    "NIH nutrient calculator",
    "USDA DRI",
  ],
});

export default async function DriCalculatorPage() {
  const landing = await getToolLanding("dri-calculator");
  return (
    <>
      <DriCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
