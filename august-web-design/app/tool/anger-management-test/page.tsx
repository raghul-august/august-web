import Quiz from "@/app/components/tool/anger-management-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Anger Management Test. Free 25-Question Anger Self-Assessment",
  description:
    "Free anger management test based on the Novaco Anger Inventory. Answer 25 short scenarios and see your anger reactivity score against published norms in under 5 minutes.",
  canonical: "/tool/anger-management-test",
  keywords: [
    "anger management test",
    "anger test",
    "anger self-assessment",
    "Novaco anger inventory",
    "free anger quiz",
    "anger reactivity score",
    "am i an angry person",
  ],
});

export default async function AngerManagementTestPage() {
  const landing = await getToolLanding("anger-management-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
