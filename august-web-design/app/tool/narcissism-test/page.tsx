import Quiz from "@/app/components/tool/narcissism-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";


export const metadata = buildToolMetadata({
  title: "Narcissism Test. Free 20-Question NPI/NARQ/B-PNI Self-Screen",
  description:
    "Free narcissism self-test with 20 items drawn from the NPI, NARQ, and B-PNI inventories. See where your responses fall on a 5-tier narcissism spectrum in about 3 minutes.",
  canonical: "/tool/narcissism-test",
  keywords: [
    "narcissism test",
    "am i a narcissist",
    "narcissistic personality inventory",
    "NPI test",
    "NARQ test",
    "covert narcissism test",
    "free narcissism quiz",
    "narcissism self-assessment",
  ],
});
export default async function NarcissismTestPage() {
  const landing = await getToolLanding("narcissism-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
