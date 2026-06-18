import Quiz from "@/app/components/tool/eating-disorder-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Eating Disorder Test. Free 25-Question Eating Disorder Self-Screen",
  description:
    "Free eating disorder self-test built on the SWED screener (Stanford-Washington University Eating Disorder Screen) used by Mental Health America. Answer 25 short questions across body image, binge eating, compensatory behaviours, and restrictive eating — see your severity score in under 4 minutes.",
  canonical: "/tool/eating-disorder-test",
  keywords: [
    "eating disorder test",
    "eating disorder quiz",
    "anorexia test",
    "bulimia test",
    "binge eating disorder test",
    "ARFID test",
    "do i have an eating disorder",
    "free eating disorder screening",
    "MHA eating disorder",
  ],
});

export default async function EatingDisorderTestPage() {
  const landing = await getToolLanding("eating-disorder-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
