import Quiz from "@/app/components/tool/iq-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "IQ Test. Free Online IQ Quiz (20 Questions, Wechsler Scale)",
  description:
    "Free, untimed online IQ test — 20 original questions across verbal, numerical, pattern, logical, and spatial reasoning. Get an IQ estimate on the standard Wechsler scale (mean 100, SD 15) with a percentile and band, in about five minutes.",
  canonical: "/tool/iq-test",
  keywords: [
    "IQ test",
    "free IQ test",
    "online IQ quiz",
    "IQ score",
    "IQ test 20 questions",
    "Wechsler IQ scale",
    "verbal reasoning",
    "spatial reasoning",
    "pattern recognition",
    "logical deduction",
  ],
});

export default async function IqTestPage() {
  const landing = await getToolLanding("iq-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
