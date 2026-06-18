import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import BMICalculator from "@/app/components/tool/bmi-calculator/BMICalculator";

export const metadata = buildToolMetadata({
  title: "BMI Calculator — Free Body Mass Index Calculator for Adults",
  description:
    "Calculate your BMI for free. Get your Body Mass Index, weight category, healthy weight range, BMI Prime, and Ponderal Index — in metric or US units, with no signup.",
  canonical: "/tool/bmi-calculator",
  keywords: [
    "BMI calculator",
    "body mass index",
    "healthy weight range",
    "BMI Prime",
    "Ponderal Index",
    "adult BMI",
    "WHO BMI",
    "CDC BMI",
  ],
});

export default async function BMICalculatorPage() {
  const landing = await getToolLanding("bmi-calculator");
  return (
    <BMICalculator
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
