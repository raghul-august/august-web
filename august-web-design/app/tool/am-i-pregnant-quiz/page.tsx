import Quiz from "@/app/components/tool/am-i-pregnant-quiz/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Am I Pregnant Quiz. Free Early-Pregnancy Symptom Check",
  description:
    "Free, anonymous quiz that weighs cycle timing, recent exposure, and the most common early-pregnancy symptoms to give you a likelihood band and a recommendation for when to take a home test — in about two minutes.",
  canonical: "/tool/am-i-pregnant-quiz",
  keywords: [
    "am i pregnant",
    "am i pregnant quiz",
    "early pregnancy symptoms",
    "pregnancy test",
    "missed period",
    "implantation bleeding",
    "first signs of pregnancy",
    "could i be pregnant",
    "free pregnancy quiz",
  ],
});

export default async function AmIPregnantQuizPage() {
  const landing = await getToolLanding("am-i-pregnant-quiz");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
