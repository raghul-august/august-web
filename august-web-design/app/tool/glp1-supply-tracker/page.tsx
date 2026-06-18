import GLP1SupplyTrackerClient from "@/app/components/tool/glp1-supply-tracker/GLP1SupplyTrackerClient";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "GLP-1 Supply Tracker: Compare Telehealth Providers by Price & Rating",
  description:
    "Compare GLP-1 telehealth providers side-by-side. Filter by state, medication (semaglutide or tirzepatide), and price. Free, private, no sign-up required.",
  canonical: "/tool/glp1-supply-tracker",
});

export default async function GLP1SupplyTrackerPage() {
  const landing = await getToolLanding("glp1-supply-tracker");

  return (
    <GLP1SupplyTrackerClient
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
