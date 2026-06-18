import Quiz from "@/app/components/tool/ocd-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "OCD Test. Free Online OCD Self-Screen (OCI-4 / OCI-CV-5)",
  description:
    "Free OCD self-screen built on the OCI-4 (adults) and OCI-CV-5 (youth) — the ultra-brief screening tools used by the International OCD Foundation. Answer 4–5 short questions and see whether further diagnostic assessment is recommended in under 2 minutes.",
  canonical: "/tool/ocd-test",
  keywords: [
    "OCD test",
    "OCD quiz",
    "OCI-4",
    "OCI-CV-5",
    "obsessive compulsive disorder test",
    "free OCD screening",
    "do i have OCD",
    "IOCDF screener",
    "OCD self-assessment",
  ],
});

export default async function OcdTestPage() {
  const landing = await getToolLanding("ocd-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
