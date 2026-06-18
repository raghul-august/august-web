import Quiz from "@/app/components/tool/social-anxiety-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title:
    "Social Anxiety Test. Free 20-Question Social Anxiety Self-Screen",
  description:
    "Free social anxiety self-screen — 20 short statements drawn from the Interaction Anxiousness Scale and the APA Severity Measure for Social Anxiety Disorder. See your social anxiety severity score against a 5-tier banding in under 4 minutes.",
  canonical: "/tool/social-anxiety-test",
  keywords: [
    "social anxiety test",
    "social phobia test",
    "do i have social anxiety",
    "social anxiety self-assessment",
    "free social anxiety quiz",
    "social anxiety disorder screening",
    "interaction anxiousness scale",
    "shyness test",
  ],
});

export default async function SocialAnxietyTestPage() {
  const landing = await getToolLanding("social-anxiety-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
