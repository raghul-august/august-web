import TitrationCalculator from "@/app/components/tool/glp1-titration-calculator/TitrationCalculator";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "GLP-1 Titration Schedule Calculator | Dose Escalation Timeline",
  description:
    "Build a week-by-week GLP-1 dose escalation schedule with injection units and volume. Supports Wegovy, Ozempic, Mounjaro, and Zepbound. Free, private, instant.",
  canonical: "/tool/glp1-titration-calculator",
});

export default async function TitrationCalculatorPage() {
  const landing = await getToolLanding("glp1-titration-calculator");

  return (
    <TitrationCalculator
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
