import MenopauseCalculator from "@/app/components/tool/menopause/MenopauseCalculator";
import JsonLd from "@/app/components/tool/shared/JsonLd";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import {
  MENOPAUSE_FAQ_SCHEMA,
  MENOPAUSE_SOFTWARE_SCHEMA,
} from "@/app/data/tools/menopause-config";

export const metadata = buildToolMetadata({
  title: "Menopause Age Calculator. Predict When Your Menopause Will Happen",
  description:
    "Estimate your menopause age in two minutes. Built on the SWAN study and meta-analyses, the calculator weighs maternal menopause age, ethnicity, smoking, alcohol, BMI, cycle status, and a small set of health conditions to project when natural menopause is most likely — no email, no labs.",
  canonical: "/tool/menopause",
  keywords: [
    "menopause age calculator",
    "when will I go through menopause",
    "menopause predictor",
    "perimenopause calculator",
    "average age of menopause",
    "menopause age estimator",
    "SWAN menopause",
    "natural menopause age",
  ],
});

export default async function MenopausePage() {
  const landing = await getToolLanding("menopause");
  return (
    <>
      <JsonLd data={MENOPAUSE_SOFTWARE_SCHEMA} />
      <JsonLd data={MENOPAUSE_FAQ_SCHEMA} />
      <MenopauseCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
