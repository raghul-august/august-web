import Quiz from "@/app/components/tool/symptoms-checker/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Symptoms Checker. Free Guided Triage in Under 3 Minutes",
  description:
    "Free guided symptoms checker. Pick a body region, primary symptom, duration, severity, and red flags — then see whether self-care, a routine visit, urgent care, or the ER is the right next step.",
  canonical: "/tool/symptoms-checker",
  keywords: [
    "symptoms checker",
    "symptom checker",
    "free symptom checker",
    "online triage",
    "what is causing my symptoms",
    "should i go to the ER",
    "self diagnosis",
  ],
});

export default async function SymptomsCheckerPage() {
  const landing = await getToolLanding("symptoms-checker");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
