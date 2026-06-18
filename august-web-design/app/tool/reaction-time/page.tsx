import Quiz from "@/app/components/tool/reaction-time/Quiz";
import JsonLd from "@/app/components/tool/shared/JsonLd";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { FAQS } from "@/app/data/tools/reaction-time-config";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import {
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/app/utils/tools/tool-schema-helpers";

export const metadata = buildToolMetadata({
  title: "Reaction Time Test. Free Online Visual Reflex Test",
  description:
    "Free reaction time test — 5 quick trials measure how fast you click when the screen turns green. See your average reaction time in milliseconds, your fastest single trial, and where you land against the population mean.",
  canonical: "/tool/reaction-time",
  keywords: [
    "reaction time test",
    "reflex test",
    "human benchmark reaction time",
    "visual reaction time",
    "how fast are my reflexes",
    "online reflex test",
    "reaction speed test",
  ],
});

const softwareSchema = buildSoftwareSchema(
  "Reaction Time Test",
  "Free online visual reaction time test. Five trials measure how fast you click after the screen turns green.",
);

const faqSchema = buildFaqSchema(FAQS);

export default async function ReactionTimePage() {
  const landing = await getToolLanding("reaction-time");
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
