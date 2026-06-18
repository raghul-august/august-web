import PregnancyWeightCalculatorClient from "@/app/components/tool/pregnancy-weight-gain-calculator/PregnancyWeightCalculatorClient";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "Pregnancy Weight Gain Calculator | IOM-Based Weekly Tracker",
  description:
    "Calculate your IOM-recommended pregnancy weight gain range by BMI category and see a week-by-week corridor chart. Free, private, instant results.",
  canonical: "/tool/pregnancy-weight-gain-calculator",
  keywords: [
    "pregnancy weight gain calculator",
    "IOM pregnancy weight gain",
    "pregnancy BMI calculator",
    "week by week pregnancy weight",
    "how much weight should I gain during pregnancy",
  ],
});

export default async function Page() {
  const landing = await getToolLanding("pregnancy-weight-gain-calculator");

  return (
    <PregnancyWeightCalculatorClient
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
