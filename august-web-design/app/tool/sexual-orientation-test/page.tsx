import Quiz from "@/app/components/tool/sexual-orientation-test/Quiz";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata = buildToolMetadata({
  title: "Sexual Orientation Test | Spectrum-Based Self-Reflection",
  description:
    "A free, private sexual orientation test. Answer 12 short questions and see your spectrum across four dimensions — same-gender attraction, different-gender attraction, multi-gender openness, and the asexual spectrum. Inspired by the Storms EROS and Klein Sexual Orientation Grid.",
  canonical: "/tool/sexual-orientation-test",
  keywords: [
    // Primary canonical (high volume + perfect intent match)
    "sexual orientation test",
    "sexual orientation quiz",
    "sexuality test",
    "sexuality quiz",
    // Top-volume "am i gay/lesbian/bi/straight" cluster
    "gay test",
    "gay quiz",
    "am i gay",
    "am i gay quiz",
    "am i gay test",
    "am i bisexual",
    "am i bisexual quiz",
    "am i lesbian",
    "am i lesbian quiz",
    "am i bi",
    "am i straight quiz",
    // Asexual / pansexual / demisexual long-tail
    "asexual test",
    "asexual quiz",
    "am i asexual quiz",
    "am i pansexual quiz",
    "demisexual test",
    "bisexual test",
    "lesbian test",
    "lesbian quiz",
    // "what is my sexuality" question forms
    "what is my sexuality",
    "what is my sexuality quiz",
    "what sexuality am i",
    "how gay am i test",
    "are you gay quiz",
    "are you gay test",
    // LGBTQ + identity siblings
    "lgbtq test",
    "lgbtq quiz",
    "lgbtq self assessment",
    "gender identity test",
    "gender identity quiz",
    // Methodology / framework references (low volume, builds topical authority)
    "kinsey scale test",
    "klein sexual orientation grid",
  ],
});

export default async function SexualOrientationTestPage() {
  const landing = await getToolLanding("sexual-orientation-test");

  return (
    <Quiz
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
