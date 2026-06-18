import Quiz from "@/app/components/tool/autism-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Autism Test (AQ-10). Free NHS-Recommended Adult Autism Screener",
  description:
    "Free AQ-10 autism test — the 10-item adult autism screener used by the NHS. Answer 10 short statements and see your 0–10 score plus whether you meet the published referral threshold, in about two minutes.",
  canonical: "/tool/autism-test",
  keywords: [
    "autism test",
    "AQ-10 test",
    "autism quiz",
    "adult autism test",
    "NHS autism screening",
    "do I have autism",
    "autism spectrum quotient",
    "free autism test",
    "Baron-Cohen autism test",
  ],
});

export default async function AutismTestPage() {
  const landing = await getToolLanding("autism-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
