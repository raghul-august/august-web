import HeartAgeCalculator from "@/app/components/tool/heart-age-calculator/HeartAgeCalculator";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Heart Age Calculator. Free Cardiovascular Age Estimator",
  description:
    "Estimate your heart age using the non-laboratory Framingham cardiovascular risk model. Enter age, sex, height, weight, and a few health questions to see your projected heart age, 10-year CVD risk, and what changes would lower it.",
  canonical: "/tool/heart-age-calculator",
  keywords: [
    "heart age calculator",
    "cardiovascular age",
    "Framingham risk score",
    "non-laboratory CVD risk",
    "heart age test",
    "10-year heart risk",
    "BMI cardiovascular risk",
  ],
});

export default async function HeartAgeCalculatorPage() {
  const landing = await getToolLanding("heart-age-calculator");
  return (
    <>
      <HeartAgeCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
