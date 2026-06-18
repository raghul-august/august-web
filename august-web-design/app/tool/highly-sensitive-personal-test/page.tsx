import Quiz from "@/app/components/tool/highly-sensitive-personal-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Highly Sensitive Person Test. Free 20-Question HSP Self-Screen",
  description:
    "A free, 20-question Highly Sensitive Person (HSP) self-test adapted from Elaine Aron's HSPS. See how strongly sensory-processing sensitivity describes you, banded into a 5-tier spectrum.",
  canonical: "/tool/highly-sensitive-personal-test",
  keywords: [
    "highly sensitive person test",
    "HSP test",
    "am i a highly sensitive person",
    "Aron HSP scale",
    "sensory processing sensitivity test",
    "free HSP quiz",
    "empath test",
  ],
});

export default async function HighlySensitiveTestPage() {
  const landing = await getToolLanding("highly-sensitive-personal-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
