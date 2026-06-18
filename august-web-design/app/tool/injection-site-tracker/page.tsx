import InjectionSiteTracker from "@/app/components/tool/injection-site-tracker/InjectionSiteTracker";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "GLP-1 Injection Site Tracker: Rotation Schedule for Ozempic, Mounjaro & More",
  description:
    "Build a personalized injection site rotation schedule. Prevent lipodystrophy with systematic site rotation for Ozempic, Mounjaro, Wegovy, and Zepbound. Free, private, no sign-up.",
  canonical: "/tool/injection-site-tracker",
});

export default async function InjectionSiteTrackerPage() {
  const landing = await getToolLanding("injection-site-tracker");

  return (
    <InjectionSiteTracker
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
