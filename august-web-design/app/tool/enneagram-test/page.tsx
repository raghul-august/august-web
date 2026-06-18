import Quiz from "@/app/components/tool/enneagram-test/Quiz";
import JsonLd from "@/app/components/tool/shared/JsonLd";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import {
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/app/utils/tools/tool-schema-helpers";
import { FAQ_ITEMS } from "@/app/data/tools/enneagram-test-landing";

export const metadata = buildToolMetadata({
  title: "Enneagram Test. Free 36-Question Personality Type Quiz",
  description:
    "A free, anonymous 36-question Enneagram test. Find out which of the nine Enneagram types fits you best, see your wing, and view your full ranking across all nine types in about five minutes.",
  canonical: "/tool/enneagram-test",
  keywords: [
    "Enneagram test",
    "Enneagram quiz",
    "free Enneagram test",
    "Enneagram personality test",
    "Enneagram type",
    "what is my Enneagram type",
    "Enneagram wing",
    "9 Enneagram types",
  ],
});

const softwareSchema = buildSoftwareSchema(
  "Enneagram Test — Free 36-Question Personality Type Quiz",
  "A free Enneagram personality test that maps your responses to one of nine core types, identifies your wing, and shows your full ranking across all nine types.",
);
const faqSchema = buildFaqSchema(FAQ_ITEMS);

export default async function EnneagramTestPage() {
  const landing = await getToolLanding("enneagram-test");
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
