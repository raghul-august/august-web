import Quiz from "@/app/components/tool/loneliness-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Loneliness Test. Free 20-Question Loneliness Self-Screen",
  description:
    "A free, 20-question loneliness self-test inspired by the UCLA Loneliness Scale. See where you sit on a 5-tier loneliness spectrum in about 3 minutes, anonymously.",
  canonical: "/tool/loneliness-test",
  keywords: [
    "loneliness test",
    "am i lonely",
    "free loneliness quiz",
    "UCLA loneliness scale",
    "loneliness self-assessment",
    "social isolation test",
  ],
});

export default async function LonelinessTestPage() {
  const landing = await getToolLanding("loneliness-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
