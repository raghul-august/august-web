import Quiz from "@/app/components/tool/self-esteem-test/Quiz";
import JsonLd from "@/app/components/tool/shared/JsonLd";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { FAQS } from "@/app/data/tools/self-esteem-test-config";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import {
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/app/utils/tools/tool-schema-helpers";

export const metadata = buildToolMetadata({
  title: "Self-Esteem Test. Free 20-Question Rosenberg / Neff Self-Screen",
  description:
    "Free self-esteem self-test with 20 items adapted from the Rosenberg, Coopersmith, Robson, and Neff self-compassion scales. See where your self-regard sits on a 5-tier banding in about 3 minutes.",
  canonical: "/tool/self-esteem-test",
  keywords: [
    "self esteem test",
    "self-esteem quiz",
    "rosenberg self esteem scale",
    "self-compassion test",
    "do i have low self-esteem",
    "free self-esteem assessment",
    "healthy self-esteem",
  ],
});

const softwareSchema = buildSoftwareSchema(
  "Self-Esteem Test",
  "Free 20-question self-esteem self-screen adapted from the Rosenberg Self-Esteem Scale, Coopersmith Self-Esteem Inventory, Robson Self-Concept Questionnaire, and Neff Self-Compassion Scale.",
);

const faqSchema = buildFaqSchema(FAQS);

export default async function SelfEsteemTestPage() {
  const landing = await getToolLanding("self-esteem-test");
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
