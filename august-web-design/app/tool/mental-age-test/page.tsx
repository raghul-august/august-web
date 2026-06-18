import Quiz from "@/app/components/tool/mental-age-test/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Mental Age Test. Free 15-Question Quiz — What's Your Mental Age?",
  description:
    "A short, free mental age test. Answer 15 quick lifestyle questions about your habits, music, sleep, and outlook to see the age your mind feels like — independent of your birthday.",
  canonical: "/tool/mental-age-test",
  keywords: [
    "mental age test",
    "what is my mental age",
    "free mental age quiz",
    "mental age calculator",
    "how old is my mind",
    "personality age test",
    "mental age quiz",
  ],
});

export default async function MentalAgeTestPage() {
  const landing = await getToolLanding("mental-age-test");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
