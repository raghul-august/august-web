import Quiz from "@/app/components/tool/trauma-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "PTSD Test (PC-PTSD-5). Free 5-Question PTSD Self-Screen",
  description:
    "Free PC-PTSD-5 PTSD self-screen used by the VA and primary care clinicians. Answer 5 short yes/no questions about the past month and see whether your symptoms suggest PTSD in under 2 minutes.",
  canonical: "/tool/trauma-test",
  keywords: [
    "PTSD test",
    "PC-PTSD-5",
    "PTSD self-screen",
    "trauma test",
    "post-traumatic stress disorder test",
    "free PTSD quiz",
    "do i have PTSD",
    "VA PTSD screen",
  ],
});

export default async function TraumaTestPage() {
  const landing = await getToolLanding("trauma-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
