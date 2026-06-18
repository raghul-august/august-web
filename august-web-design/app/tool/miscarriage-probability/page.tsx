import MiscarriageCalculator from "@/app/components/tool/miscarriage-probability/MiscarriageCalculator";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";


export const metadata = buildToolMetadata({
  title: "Miscarriage Probability Calculator & Reassurer.",
  description:
    "Free miscarriage probability and reassurer calculator. See your remaining risk of miscarriage and the chance your pregnancy continues to 20 weeks, based on maternal age, current gestational age, and previous miscarriages.",
  canonical: "/tool/miscarriage-probability",
  keywords: [
    "miscarriage probability calculator",
    "miscarriage risk calculator",
    "miscarriage reassurer",
    "miscarriage chart",
    "pregnancy loss risk",
    "first trimester miscarriage risk",
    "maternal age miscarriage",
  ],
});

export default async function MiscarriageProbabilityPage() {
  const landing = await getToolLanding("miscarriage-probability");
  return (
    <>
      <MiscarriageCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
