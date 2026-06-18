import PlateauCalculatorClient from "@/app/components/tool/glp1-plateau-calculator/PlateauCalculatorClient";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "GLP-1 Plateau Calculator | Diagnose and Break Your Weight Loss Stall",
  description:
    "Diagnose whether your GLP-1 weight loss plateau is real and get a personalized action plan. Free, private, instant. For Ozempic, Wegovy, Mounjaro, and Zepbound users.",
  canonical: "/tool/glp1-plateau-calculator",
});

export default async function PlateauCalculatorPage() {
  const landing = await getToolLanding("glp1-plateau-calculator");

  return (
    <PlateauCalculatorClient
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
