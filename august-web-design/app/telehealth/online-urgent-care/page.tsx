import { headers } from "next/headers";
import dynamic from "next/dynamic";

import LandingNav from "@/app/components/website/landing/LandingNav";
import LandingFooter from "@/app/components/website/landing/LandingFooter";
import ScrollToTop from "@/app/components/website/landing/ScrollToTop";

import SmoothScrollRunner from "./SmoothScrollRunner";

import Hero from "./components/Hero";

import "@/app/landing.css";
import "./urgent-care.css";

const WhyAugust = dynamic(() => import("./components/WhyAugust"));
const Conditions = dynamic(() => import("./components/Conditions"));
const CoverageChecker = dynamic(() => import("./components/CoverageChecker"));
const HowItWorks = dynamic(() => import("./components/HowItWorks"));
const Pricing = dynamic(() => import("./components/Pricing"));
const TrustBadges = dynamic(() => import("./components/TrustBadges"));
const Testimonials = dynamic(() => import("./components/Testimonials"));
const Safety = dynamic(() => import("./components/Safety"));
const Faq = dynamic(() => import("./components/Faq"));
const Services = dynamic(() => import("./components/Services"));
const FinalCta = dynamic(() => import("./components/FinalCta"));
const StickyCta = dynamic(() => import("./components/StickyCta"));
const UrgentCareEffects = dynamic(() => import("./components/UrgentCareEffects"));
const UrgentCareAnalytics = dynamic(
  () => import("./components/UrgentCareAnalytics"),
);
const TurnstileLoader = dynamic(() =>
  import("@/components/turnstile-loader").then((m) => m.TurnstileLoader),
);

export const metadata = {
  title: "Online Urgent Care 24/7 | $39 Doctor Visit | August",
  description:
    "Online urgent care from board-certified doctors. Get a prescription in minutes. $39 visits, 24/7, all 50 states. Free August symptom review.",
  alternates: {
    canonical: "https://www.meetaugust.ai/telehealth/online-urgent-care",
  },
  openGraph: {
    type: "website",
    url: "https://www.meetaugust.ai/telehealth/online-urgent-care",
    title: "Online Urgent Care 24/7 | $39 Doctor Visit | August",
    description:
      "Online urgent care from board-certified doctors. Get a prescription in minutes. $39 visits, 24/7, all 50 states. Free August symptom review.",
    siteName: "August",
    images: [
      {
        url: "https://assets.getbeyondhealth.com/og/online-urgent-care.png",
        width: 1200,
        height: 630,
        alt: "August · Online Urgent Care",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Urgent Care 24/7 | $39 Doctor Visit | August",
    description:
      "Online urgent care from board-certified doctors. Get a prescription in minutes. $39 visits, 24/7, all 50 states. Free August symptom review.",
    images: ["https://assets.getbeyondhealth.com/og/online-urgent-care.png"],
  },
};

export default async function OnlineUrgentCarePage() {
  const country = (await headers()).get("cf-ipcountry") || undefined;

  return (
    <div className="landing-scope">
      <ScrollToTop />
      <SmoothScrollRunner />
      <TurnstileLoader />

      <LandingNav initialCountry={country} />

      <div className="uc-scope">
        <main>
          <Hero />
          <WhyAugust />
          <Conditions />
          <CoverageChecker />
          <HowItWorks />
          <Pricing />
          <TrustBadges />
          <Testimonials />
          <Safety />
          <Faq />
          <Services />
        </main>
        <FinalCta />
        <StickyCta />
      </div>

      <LandingFooter initialCountry={country} />
      {/* Mobile-only spacer so the fixed sticky CTA never overlaps the footer copyright. */}
      <div className="uc-sticky-spacer" aria-hidden />
      <UrgentCareEffects />
      <UrgentCareAnalytics />
    </div>
  );
}
