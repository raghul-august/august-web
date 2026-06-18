import Quiz from "@/app/components/tool/introversion-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Introvert / Extrovert Test. Free 20-Question Personality Self-Screen",
  description:
    "A free, 20-question test placing you on the introversion–extroversion spectrum — one of the Big Five personality traits. See where you land in about 3 minutes.",
  canonical: "/tool/introversion-test",
  keywords: [
    "introvert test",
    "extrovert test",
    "am i an introvert",
    "introversion extroversion test",
    "big five personality test",
    "free introvert quiz",
    "ambivert test",
  ],
});

export default async function IntroversionTestPage() {
  const landing = await getToolLanding("introversion-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
