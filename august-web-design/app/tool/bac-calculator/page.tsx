import BACCalculator from "@/app/components/tool/bac-calculator/BACCalculator";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "BAC Calculator. Free Blood Alcohol Content Calculator",
  description:
    "Estimate your Blood Alcohol Content (BAC) using the Widmark formula. Enter drinks, body weight, sex, and time elapsed to see your BAC, impairment level, and time to sober up.",
  canonical: "/tool/bac-calculator",
  keywords: [
    "BAC calculator",
    "blood alcohol content",
    "Widmark formula",
    "blood alcohol level",
    "drunk calculator",
    "alcohol intoxication",
    "legal driving limit",
    "time to sober",
  ],
});

export default async function BACCalculatorPage() {
  const landing = await getToolLanding("bac-calculator");
  return (
    <>
      <BACCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
