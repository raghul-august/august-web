import Quiz from "@/app/components/tool/perimenopause-symptom/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Perimenopause Symptom Quiz. Free Greene-Style 21-Item Checklist",
  description:
    "Take a 21-item perimenopause symptom inventory modelled on the Greene Climacteric Scale, the research instrument used to track perimenopause across hot flushes, mood, sleep, joint pain, and more.",
  canonical: "/tool/perimenopause-symptom",
  keywords: [
    "perimenopause quiz",
    "perimenopause symptoms",
    "Greene Climacteric Scale",
    "menopause symptom checker",
    "am I in perimenopause",
    "menopause test",
  ],
});

export default async function PerimenopausePage() {
  const landing = await getToolLanding("perimenopause-symptom");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
