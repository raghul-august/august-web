import VO2MaxCalculator from "@/app/components/tool/vo2max-calculator/VO2MaxCalculator";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";

export const metadata = buildToolMetadata({
  title: "VO2 Max Calculator. Free Cardiovascular Fitness Estimator",
  description:
    "Free VO2 max calculator. Enter a race time, Cooper 12-minute run distance, 1.5-mile time, Rockport walk, or your resting heart rate to estimate your VO2 max and see how you compare to published norms for your age and sex.",
  canonical: "/tool/vo2max-calculator",
  keywords: [
    "VO2 max calculator",
    "VO2max estimator",
    "Cooper test calculator",
    "Rockport walk test",
    "1.5 mile run test",
    "VDOT calculator",
    "Jack Daniels VDOT",
    "cardiorespiratory fitness",
  ],
});

export default async function VO2MaxCalculatorPage() {

  const landing = await getToolLanding('vo2max-calculator');
  return (
    <>
      <VO2MaxCalculator afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
