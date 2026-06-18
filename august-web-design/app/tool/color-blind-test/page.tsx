import Quiz from "@/app/components/tool/color-blind-test/Quiz";
import JsonLd from "@/app/components/tool/shared/JsonLd";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import {
  buildFaqSchema,
  buildMedicalWebpageSchema,
  buildSoftwareSchema,
} from "@/app/utils/tools/tool-schema-helpers";
import { FAQ_ITEMS } from "@/app/data/tools/color-blind-test-landing";

export const metadata = buildToolMetadata({
  title: "Color Blind Test. Free Online Ishihara-Style Color Vision Screen",
  description:
    "Free 12-plate color blind screening based on the Ishihara test. Identify likely red-green (protan/deutan) and blue-yellow (tritan) color vision deficiencies in about 2 minutes. Anonymous, in-browser, no email required.",
  canonical: "/tool/color-blind-test",
  keywords: [
    "color blind test",
    "color vision test",
    "ishihara test",
    "online color blindness test",
    "red green color blind",
    "deuteranopia test",
    "protanopia test",
    "tritanopia test",
    "free color blindness screening",
  ],
});

const softwareSchema = buildSoftwareSchema(
  "Color Blind Test",
  "Free online Ishihara-style color blind test. Screens for red-green and blue-yellow color vision deficiencies.",
  "HealthApplication",
);

const medicalSchema = buildMedicalWebpageSchema(
  "Color Blind Test — Ishihara-Style Online Color Vision Screen",
  "Color Vision Deficiency",
  "H53.5",
);

const faqSchema = buildFaqSchema(FAQ_ITEMS);

export default async function ColorBlindTestPage() {
  const landing = await getToolLanding("color-blind-test").catch(() => null);
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={medicalSchema} />
      <JsonLd data={faqSchema} />
      <Quiz afterContent={landing ? <ToolLandingContent {...landing} /> : null} />
    </>
  );
}
