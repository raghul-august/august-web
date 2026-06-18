import Quiz from "@/app/components/tool/ace-test/Quiz";
import JsonLd from "@/app/components/tool/shared/JsonLd";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import {
  buildFaqSchema,
  buildMedicalWebpageSchema,
} from "@/app/utils/tools/tool-schema-helpers";
import { FAQ_ITEMS } from "@/app/data/tools/ace-test-landing";

export const metadata = buildToolMetadata({
  title: "ACE Test. Free Adverse Childhood Experiences Quiz (CDC/Kaiser)",
  description:
    "The original 10-item Adverse Childhood Experiences (ACE) questionnaire from the CDC-Kaiser study. Answer 10 yes/no items and see your score with what it does, and doesn't, mean.",
  canonical: "/tool/ace-test",
  keywords: [
    "ACE test",
    "ACE quiz",
    "adverse childhood experiences",
    "ACE score",
    "Felitti ACE questionnaire",
    "CDC ACE study",
    "childhood trauma score",
  ],
});

const medicalSchema = buildMedicalWebpageSchema(
  "ACE Test — Adverse Childhood Experiences Questionnaire",
  "Adverse Childhood Experiences",
  "Z62.812",
);
const faqSchema = buildFaqSchema(FAQ_ITEMS);

export default async function AceTestPage() {
  const landing = await getToolLanding("ace-test");
  return (
    <>
      <JsonLd data={medicalSchema} />
      <JsonLd data={faqSchema} />
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
