import OvulationCalculator from "@/app/components/tool/ovulation-calculator/OvulationCalculator";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Ovulation Calculator. Free Fertile Window & Due Date Predictor",
  description:
    "Predict your ovulation day, fertile window, next period, and estimated due date in seconds. Based on your last menstrual period and average cycle length.",
  canonical: "/tool/ovulation-calculator",
  keywords: [
    "ovulation calculator",
    "fertile window calculator",
    "ovulation date predictor",
    "period tracker",
    "due date calculator",
    "trying to conceive",
    "TTC calculator",
  ],
});

export default async function OvulationCalculatorPage() {
  const landing = await getToolLanding("ovulation-calculator");
  return (
    <>
      <OvulationCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
