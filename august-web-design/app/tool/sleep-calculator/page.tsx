import SleepCalculator from "@/app/components/tool/sleep-calculator/SleepCalculator";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Sleep Calculator. Free 90-Minute Sleep Cycle Calculator",
  description:
    "Free sleep cycle calculator. Enter a bedtime or wake time and see when to fall asleep or wake up so you finish a full 90-minute sleep cycle and feel refreshed instead of groggy.",
  canonical: "/tool/sleep-calculator",
  keywords: [
    "sleep calculator",
    "sleep cycle calculator",
    "bedtime calculator",
    "wake up calculator",
    "90 minute sleep cycle",
    "what time should i go to bed",
    "how much sleep do i need",
    "sleep cycle bedtime",
  ],
});

export default async function SleepCalculatorPage() {
  const landing = await getToolLanding("sleep-calculator");
  return (
    <>
      <SleepCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
