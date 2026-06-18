import Quiz from "@/app/components/tool/bipolar-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Bipolar Test. Free 20-Question Bipolar Disorder Self-Screen",
  description:
    "Free bipolar disorder self-screen — 20 short statements covering manic-side energy, mood swings, sleep, impulsivity, and depressive episodes. Items modeled on the Mood Disorder Questionnaire (MDQ) and DSM-5 bipolar-spectrum criteria. See your severity against a 5-tier banding in under 4 minutes.",
  canonical: "/tool/bipolar-test",
  keywords: [
    "bipolar test",
    "bipolar disorder test",
    "bipolar quiz",
    "MDQ",
    "Mood Disorder Questionnaire",
    "manic depression test",
    "am i bipolar",
    "bipolar self-assessment",
    "free bipolar screening",
  ],
});

export default async function BipolarTestPage() {
  const landing = await getToolLanding("bipolar-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
