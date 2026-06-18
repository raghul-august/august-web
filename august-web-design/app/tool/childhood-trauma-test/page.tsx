import Quiz from "@/app/components/tool/childhood-trauma-test/Quiz";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "Free Childhood Trauma Test | August AI",
  description:
    "Take the free Adverse Childhood Experiences test. 10 research-backed questions to help you understand how early life experiences may be affecting your wellbeing today.",
  canonical: "/tool/childhood-trauma-test",
});

export default async function Home() {
  const landing = await getToolLanding("childhood-trauma-test");

  return (
    <Quiz
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
