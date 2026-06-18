import ThcDetoxCalculator from "@/app/components/tool/thc-detox-calculator/ThcDetoxCalculator";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "THC Detox Calculator. Free THC Detection Window Estimator",
  description:
    "Estimate how long THC stays detectable by test type — urine, blood, saliva, hair — based on your usage frequency, body composition, and last use date.",
  canonical: "/tool/thc-detox-calculator",
  keywords: [
    "THC detox calculator",
    "THC detection window",
    "how long does THC stay in your system",
    "urine drug test THC",
    "marijuana detox time",
    "weed test calculator",
  ],
});

export default async function ThcDetoxPage() {
  const landing = await getToolLanding("thc-detox-calculator");
  return (
    <>
      <ThcDetoxCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
