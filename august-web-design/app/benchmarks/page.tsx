import LandingNav from "@/app/components/website/landing/LandingNav";
import LandingFooter from "@/app/components/website/landing/LandingFooter";
import FinalCta from "@/app/components/website/landing/FinalCta";
import BenchmarksContent from "@/app/components/website/landing/BenchmarksContent";
import { LandingLayout } from "@/app/components/website/landing/LandingLayout";

export const metadata = {
  title: "Benchmarks - August Health",
  description:
    "August is evaluated against the same standardized tests used to license doctors. 100% USMLE, 97% MedQA, 87% conversational diagnostic accuracy.",
};

export default function BenchmarksPage() {
  return (
    <LandingLayout>
      <LandingNav />
      <main>
        <BenchmarksContent />
        <FinalCta />
      </main>
      <LandingFooter />
    </LandingLayout>
  );
}
