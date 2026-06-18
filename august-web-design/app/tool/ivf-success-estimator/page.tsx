import IVFCalculator from "@/app/components/tool/ivf-success-estimator/IVFCalculator";
import JsonLd from "@/app/components/tool/shared/JsonLd";
import ToolLandingContent from "@/app/components/tool/shared/ToolLandingContent";
import { getToolLanding } from "@/app/lib/data/tool-landing";
import { buildToolMetadata } from "@/app/utils/tools/tool-metadata";

export const metadata = buildToolMetadata({
  title: "IVF Success Estimator. CDC-Based IVF Success Calculator.",
  description:
    "Estimate your chance of a live birth with IVF using the CDC's multivariate model. Enter age, height, weight, prior pregnancies, prior IVF cycles, infertility diagnosis, and whether you plan to use your own or donor eggs.",
  canonical: "/tool/ivf-success-estimator",
  keywords: [
    "IVF success calculator",
    "IVF success rate",
    "CDC IVF estimator",
    "in vitro fertilization probability",
    "live birth rate calculator",
    "fertility calculator",
    "donor eggs success rate",
    "IVF chance of success",
  ],
});

export default async function IVFSuccessEstimatorPage() {
  const landing = await getToolLanding("ivf-success-estimator");
  return (
    <>
      <IVFCalculator
        afterContent={landing && <ToolLandingContent {...landing} />}
      />
    </>
  );
}
