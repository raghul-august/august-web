import Quiz from "@/app/components/tool/burnout-at-work/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Burnout at Work Test. Free 20-Question Burnout Self-Screen",
  description:
    "A free, 20-question burnout-at-work self-test. See where your emotional exhaustion, cynicism, and reduced effectiveness sit on a 5-tier burnout spectrum in about 3 minutes.",
  canonical: "/tool/burnout-at-work",
  keywords: [
    "burnout test",
    "am i burned out",
    "work burnout quiz",
    "Maslach burnout inventory",
    "job burnout self-test",
    "burnout assessment free",
    "burnout symptoms test",
  ],
});

export default async function BurnoutTestPage() {
  const landing = await getToolLanding("burnout-at-work");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
