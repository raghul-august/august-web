import Quiz from "@/app/components/tool/depression-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Depression Test (PHQ-9). Free 9-Question Depression Self-Screen",
  description:
    "Free PHQ-9 depression test used by clinicians worldwide. Answer 9 short questions and see your depression severity score (0–27) with standard banding in under 3 minutes.",
  canonical: "/tool/depression-test",
  keywords: [
    "depression test",
    "PHQ-9",
    "PHQ-9 test",
    "depression self-assessment",
    "free depression quiz",
    "am i depressed",
    "depression severity score",
  ],
});

export default async function DepressionTestPage() {
  const landing = await getToolLanding("depression-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
