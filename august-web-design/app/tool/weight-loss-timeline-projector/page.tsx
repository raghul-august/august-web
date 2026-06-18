import TimelineProjector from "@/app/components/tool/weight-loss-timeline-projector/TimelineProjector";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "Weight Loss Timeline Projector | GLP-1 Goal Calculator",
  description:
    "Estimate how many weeks until you reach your goal weight on tirzepatide, semaglutide, or retatrutide — based on published clinical-trial curves.",
  canonical: "/tool/weight-loss-timeline-projector",
});

export default async function Page() {
  const landing = await getToolLanding("weight-loss-timeline-projector");

  return (
    <TimelineProjector
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
