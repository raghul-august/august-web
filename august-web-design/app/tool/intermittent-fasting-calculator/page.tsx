import IfCalculator from "@/app/components/tool/intermittent-fasting-calculator/IfCalculator";
import JsonLd from "@/app/components/tool/shared/JsonLd";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Intermittent Fasting Calculator: Eating Window & Milestones",
  description:
    "Plan your 16:8, 18:6, 20:4 or OMAD intermittent fasting schedule. See your eating window, fasting window, and when key metabolic milestones land.",
  canonical: "/tool/intermittent-fasting-calculator",
  keywords: [
    "intermittent fasting calculator",
    "if calculator",
    "fasting window calculator",
    "16:8 calculator",
    "18:6 calculator",
    "OMAD calculator",
    "fasting schedule planner",
    "ketosis timer",
  ],
});

const appSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Intermittent Fasting Calculator",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description:
    "Plan an intermittent fasting schedule across the 16:8, 18:6, 20:4, OMAD, and 5:2 protocols, with metabolic milestone estimates.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default async function IfCalculatorPage() {
  const landing = await getToolLanding("intermittent-fasting-calculator");
  return (
    <>
      <JsonLd data={appSchema} />
      <IfCalculator
        afterContent={landing ? <ToolLandingContent {...landing} /> : null}
      />
    </>
  );
}
