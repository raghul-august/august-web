import BudgetCalculator from "@/app/components/tool/glp1-budget-calculator/BudgetCalculator";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "GLP-1 Budget Calculator | Monthly Medication Affordability",
  description:
    "Estimate how much you can comfortably allocate toward GLP-1 medication each month. Free, private, instant — 100% client-side.",
  canonical: "/tool/glp1-budget-calculator",
});

export default async function BudgetCalculatorPage() {
  const landing = await getToolLanding("glp1-budget-calculator");

  return (
    <BudgetCalculator
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
