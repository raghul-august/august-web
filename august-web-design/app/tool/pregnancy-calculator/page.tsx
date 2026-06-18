import PregnancyCalculator from "@/app/components/tool/pregnancy-calculator/PregnancyCalculator";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Pregnancy Calculator. Free Due Date & Gestational Age Calculator",
  description:
    "Free pregnancy due-date calculator. Estimate your due date and current gestational age from your last menstrual period, conception date, IVF transfer date, ultrasound dating, or a known due date.",
  canonical: "/tool/pregnancy-calculator",
  keywords: [
    "pregnancy calculator",
    "due date calculator",
    "gestational age calculator",
    "EDD calculator",
    "Naegele's rule",
    "IVF due date",
    "ultrasound dating",
    "trimester calculator",
    "conception date calculator",
    "pregnancy week by week",
  ],
});

export default async function PregnancyCalculatorPage() {
  const landing = await getToolLanding("pregnancy-calculator");
  return (
    <>
      <PregnancyCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
