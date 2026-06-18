import DoseCalculator from "@/app/components/tool/glp1-dose-calculator/DoseCalculator";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "GLP-1 Dose Calculator | Semaglutide & Tirzepatide Units",
  description:
    "Convert your prescribed GLP-1 dose to the exact units on your insulin syringe. Free, private, instant - for semaglutide and tirzepatide at any vial concentration.",
  canonical: "/tool/glp1-dose-calculator",
});

export default async function DoseCalculatorPage() {
  const landing = await getToolLanding("glp1-dose-calculator");

  return (
    <DoseCalculator
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
