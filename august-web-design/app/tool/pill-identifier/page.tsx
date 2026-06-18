import PillIdentifier from "@/app/components/tool/pill-identifier/PillIdentifier";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "Pill Identifier. Free Online Imprint, Color & Shape Search",
  description:
    "Match a tablet or capsule to the medication it likely is by entering its imprint code, color, and shape. Free educational reference built from the FDA pill-imprint taxonomy. Not a substitute for a pharmacist.",
  canonical: "/tool/pill-identifier",
  keywords: [
    "pill identifier",
    "imprint lookup",
    "what is this pill",
    "pill identification tool",
    "pill identifier by imprint",
    "pill identifier by color",
    "pill identifier by shape",
    "free pill identifier",
    "FDA imprint search",
  ],
});

export default async function PillIdentifierPage() {
  const landing = await getToolLanding("pill-identifier");
  return (
    <>
      <PillIdentifier
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
