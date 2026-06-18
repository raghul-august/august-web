import Quiz from "@/app/components/tool/personality-disorder-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Personality Disorder Test. Free 15-Question BPD Self-Screen",
  description:
    "Free borderline personality disorder self-screen built on the DSM-5-TR criteria. Answer 15 short questions and see where your responses fall on the standard severity banding in under 3 minutes.",
  canonical: "/tool/personality-disorder-test",
  keywords: [
    "personality disorder test",
    "borderline personality disorder test",
    "BPD test",
    "DSM-5 BPD criteria",
    "BPD self-assessment",
    "free personality disorder quiz",
    "do i have BPD",
    "BPD severity score",
  ],
});

export default async function PersonalityDisorderTestPage() {
  const landing = await getToolLanding("personality-disorder-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
