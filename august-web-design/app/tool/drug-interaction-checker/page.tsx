import Game from "@/app/components/tool/drug-interaction-checker/Game";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { Viewport } from "next";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata = buildToolMetadata({
  title: "Drug Interaction Checker | Cognitive Self-Screen",
  description:
    "A 4-part interactive self-screen that estimates how substances may be interacting with your reaction time, memory, focus, and tracking right now. Free, private, no signup. Entertainment only — not a pharmacological drug interaction database.",
  canonical: "/tool/drug-interaction-checker",
  keywords: [
    "drug interaction checker",
    "drug interaction test",
    "drug interaction self check",
    "online drug interaction checker",
    "free drug interaction checker",
    "reaction time test",
    "online reaction time test",
    "stroop test online",
    "color word test",
    "memory test online",
    "working memory test",
    "attention test online",
    "cognitive function test online",
    "am i high test",
    "online sobriety test",
    "online impairment test",
    "intoxication test",
    "am i drunk test online",
    "how substances affect cognition",
    "weed reaction time test",
    "alcohol reaction test",
    "stoned test online",
    "brain game online",
  ],
});

export default async function DrugInteractionCheckerPage() {
  const landing = await getToolLanding("drug-interaction-checker");

  return (
    <Game
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
