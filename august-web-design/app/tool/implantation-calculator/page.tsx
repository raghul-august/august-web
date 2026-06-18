import ImplantationCalculator from "@/app/components/tool/implantation-calculator/ImplantationCalculator";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "Implantation Calculator: When Did Implantation Happen?",
  description:
    "Estimate the implantation window from your ovulation date or last menstrual period. Free, private, instant client-side results with a day-by-day probability table.",
  canonical: "/tool/implantation-calculator",
  keywords: [
    "implantation calculator",
    "implantation date",
    "days past ovulation",
    "dpo implantation",
    "when does implantation happen",
    "implantation window",
    "early pregnancy timing",
  ],
});

export default async function ImplantationCalculatorPage() {
  const landing = await getToolLanding("implantation-calculator");

  return (
    <ImplantationCalculator
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
