import Quiz from "@/app/components/tool/psychopathy-test/Quiz";
import JsonLd from "@/app/components/tool/shared/JsonLd";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { FAQS } from "@/app/data/tools/psychopathy-test-config";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import {
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/app/utils/tools/tool-schema-helpers";

export const metadata = buildToolMetadata({
  title: "Psychopathy Test. Free 20-Question PCL-R / PPI Self-Screen",
  description:
    "Free psychopathy self-test with 20 items adapted from the Hare PCL-R, Psychopathic Personality Inventory, and Levenson Self-Report Psychopathy Scale. See where your responses fall on a 5-tier banding in about 3 minutes.",
  canonical: "/tool/psychopathy-test",
  keywords: [
    "psychopathy test",
    "am i a psychopath",
    "pcl-r self test",
    "levenson psychopathy scale",
    "psychopathic personality inventory",
    "free psychopathy quiz",
    "psychopathy self-assessment",
  ],
});

const softwareSchema = buildSoftwareSchema(
  "Psychopathy Test",
  "Free 20-question psychopathy self-screen adapted from the Hare Psychopathy Checklist–Revised, Psychopathic Personality Inventory, and Levenson Self-Report Psychopathy Scale.",
);

const faqSchema = buildFaqSchema(FAQS);

export default async function PsychopathyTestPage() {
  const landing = await getToolLanding("psychopathy-test");
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
