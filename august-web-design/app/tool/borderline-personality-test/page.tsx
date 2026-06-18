import Quiz from "@/app/components/tool/borderline-personality-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title:
    "Borderline Personality Disorder Test. Free 20-Question BPD Self-Assessment",
  description:
    "Free borderline personality disorder test based on the DSM-5-TR BPD criteria. Answer 20 short statements on a 5-point scale and see how strongly your experiences match BPD trait patterns — in under five minutes.",
  canonical: "/tool/borderline-personality-test",
  keywords: [
    "borderline personality disorder test",
    "BPD test",
    "BPD quiz",
    "BPD self-assessment",
    "borderline personality test",
    "do I have BPD",
    "DSM-5 BPD criteria test",
    "free BPD test",
  ],
});

export default async function BorderlinePersonalityTestPage() {
  const landing = await getToolLanding("borderline-personality-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
