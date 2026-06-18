import Quiz from "@/app/components/tool/anxiety-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Anxiety Test. Free 20-Question Generalized Anxiety Self-Screen",
  description:
    "Free anxiety self-screen — 20 short statements covering chronic worry, restlessness, sleep, concentration, and physical anxiety symptoms. Items drawn from the Generalized Anxiety Disorder Questionnaire (GAD-Q-IV) and the GAD-7. See your anxiety severity against a 5-tier banding in under 4 minutes.",
  canonical: "/tool/anxiety-test",
  keywords: [
    "anxiety test",
    "generalized anxiety disorder test",
    "GAD test",
    "GAD-7",
    "GAD-Q-IV",
    "do i have anxiety",
    "anxiety self-assessment",
    "free anxiety quiz",
    "anxiety screening",
  ],
});

export default async function AnxietyTestPage() {
  const landing = await getToolLanding("anxiety-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
