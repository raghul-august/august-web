import Quiz from "@/app/components/tool/glp1-coverage-check/Quiz";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "GLP-1 Insurance Coverage Check | Free Estimator | August AI",
  description:
    "Check if your insurance covers GLP-1 medications like Ozempic, Wegovy, and Zepbound. Free 28-question assessment to estimate your coverage likelihood.",
  canonical: "/tool/glp1-coverage-check",
});

export default async function Home() {
  const landing = await getToolLanding("glp1-coverage-check");

  return (
    <Quiz
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
