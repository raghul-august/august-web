import Quiz from "@/app/components/tool/emotional-availability-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Emotional Availability Test. Free 20-Question Self-Screen",
  description:
    "A short, free emotional availability self-test. Twenty Likert items see whether you tend to open up or close off in close relationships — in about 3 minutes.",
  canonical: "/tool/emotional-availability-test",
  keywords: [
    "emotional availability test",
    "am i emotionally available",
    "emotionally unavailable quiz",
    "attachment style test",
    "free relationship test",
    "emotional intimacy assessment",
  ],
});

export default async function EmotionalAvailabilityTestPage() {
  const landing = await getToolLanding("emotional-availability-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
