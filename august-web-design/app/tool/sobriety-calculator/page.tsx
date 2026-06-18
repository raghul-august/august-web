import SobrietyCalculator from "@/app/components/tool/sobriety-calculator/SobrietyCalculator";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Sobriety Calculator. Free Days, Months & Milestones Counter",
  description:
    "Count your sobriety in days, weeks, months, and years. Enter your sobriety date to see every milestone you've reached, the next one you're working toward, and a personal milestone ladder.",
  canonical: "/tool/sobriety-calculator",
  keywords: [
    "sobriety calculator",
    "days sober calculator",
    "sobriety counter",
    "AA sobriety chip",
    "recovery milestone tracker",
    "how many days sober",
  ],
});

export default async function SobrietyCalculatorPage() {
  const landing = await getToolLanding("sobriety-calculator");
  return (
    <>
      <SobrietyCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
