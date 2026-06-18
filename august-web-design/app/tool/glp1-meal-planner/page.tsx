import MealPlanner from "@/app/components/tool/glp1-meal-planner/MealPlanner";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";

export const metadata = buildToolMetadata({
  title: "GLP-1 Meal Planner | High-Protein Plans for Your Journey",
  description:
    "Get a personalized high-protein meal plan tailored to your GLP-1 journey. Calculates protein targets based on weight, activity, and medication phase.",
  canonical: "/tool/glp1-meal-planner",
});

export default async function MealPlannerPage() {
  const landing = await getToolLanding("glp1-meal-planner");

  return (
    <MealPlanner
      afterContent={landing && <ToolLandingContent {...landing} />}
    />
  );
}
