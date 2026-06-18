import Quiz from "@/app/components/tool/body-dysmorphia-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Body Dysmorphia Test. Free 20-Question Self-Screen",
  description:
    "A short, free body dysmorphic disorder (BDD) self-screen. Twenty Likert items adapted from clinical BDD assessments — see whether your relationship with your appearance overlaps with patterns clinicians look for.",
  canonical: "/tool/body-dysmorphia-test",
  keywords: [
    "body dysmorphia test",
    "BDD test",
    "do i have body dysmorphia",
    "body dysmorphic disorder quiz",
    "free body dysmorphia self-screen",
    "appearance preoccupation test",
  ],
});

export default async function BodyDysmorphiaTestPage() {
  const landing = await getToolLanding("body-dysmorphia-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
