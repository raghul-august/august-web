import Quiz from "@/app/components/tool/attachment-style/Quiz";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Attachment Style Test. Free 30-Question Two-Axis Quiz",
  description:
    "A free, anonymous attachment-style test built on the two-axis (anxiety × avoidance) model. Answer 30 short statements and find out where you sit on each axis — and which of the four styles (Secure, Anxious, Avoidant, or Fearful-Avoidant) fits you best, in about five minutes.",
  canonical: "/tool/attachment-style",
  keywords: [
    "attachment style test",
    "attachment style quiz",
    "anxious attachment",
    "avoidant attachment",
    "fearful avoidant",
    "secure attachment",
    "two-axis attachment",
    "free attachment quiz",
    "what is my attachment style",
  ],
});

export default async function AttachmentStylePage() {
  const landing = await getToolLanding("attachment-style");
  return (
    <>
      <Quiz afterContent={landing && <ToolLandingContent {...landing} />} />
    </>
  );
}
