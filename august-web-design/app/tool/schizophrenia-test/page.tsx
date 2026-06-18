import Quiz from "@/app/components/tool/schizophrenia-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title:
    "Schizophrenia Test (PQ-B). Free 21-Question Psychosis Risk Self-Screen",
  description:
    "Free schizophrenia self-test built on the Prodromal Questionnaire — Brief (PQ-B), the same screener used by Mental Health America. Answer 21 short questions covering perceptual, paranoid, disorganized, and self/reality experiences — see your distress score and whether you meet the positive-screen threshold in under 4 minutes.",
  canonical: "/tool/schizophrenia-test",
  keywords: [
    "schizophrenia test",
    "psychosis test",
    "PQ-B",
    "prodromal questionnaire",
    "early psychosis screening",
    "do i have schizophrenia",
    "schizophrenia self-test",
    "psychosis self-test",
    "free psychosis screening",
    "MHA psychosis test",
  ],
});

export default async function SchizophreniaTestPage() {
  const landing = await getToolLanding("schizophrenia-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
