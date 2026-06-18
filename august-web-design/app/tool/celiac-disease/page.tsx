import Quiz from "@/app/components/tool/celiac-disease/Quiz";
import JsonLd from "@/app/components/tool/shared/JsonLd";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import {
  buildFaqSchema,
  buildMedicalWebpageSchema,
} from "@/app/utils/tools/tool-schema-helpers";
import { FAQ_ITEMS } from "@/app/data/tools/celiac-disease-landing";

export const metadata = buildToolMetadata({
  title: "Celiac Disease Symptom Test. Free 21-Item Self-Assessment",
  description:
    "Take a 21-item celiac symptom checklist covering digestive, neurological, skin, reproductive, and genetic risk factors. See whether celiac testing is worth raising with your doctor.",
  canonical: "/tool/celiac-disease",
  keywords: [
    "celiac disease test",
    "celiac symptoms quiz",
    "do I have celiac",
    "gluten sensitivity test",
    "celiac risk assessment",
    "wheat allergy or celiac",
  ],
});

const medicalSchema = buildMedicalWebpageSchema(
  "Celiac Disease Symptom Test",
  "Celiac disease",
  "K90.0",
);
const faqSchema = buildFaqSchema(FAQ_ITEMS);

export default async function CeliacDiseasePage() {
  const landing = await getToolLanding("celiac-disease");
  return (
    <>
      <JsonLd data={medicalSchema} />
      <JsonLd data={faqSchema} />
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
