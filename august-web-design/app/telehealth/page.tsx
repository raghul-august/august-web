import { headers } from "next/headers";

import LandingNav from "@/app/components/website/landing/LandingNav";
import LandingFooter from "@/app/components/website/landing/LandingFooter";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

import Hero from "./components/Hero";
import TrustPanel from "./components/TrustPanel";
import Treatments from "./components/Treatments";
import HumanDoctors from "./components/HumanDoctors";
import Questions from "./components/Questions";
import Compare from "./components/Compare";
import Capabilities from "./components/Capabilities";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import CTABand from "./components/CTABand";
import ScrollAnimations from "./components/ScrollAnimations";
import TelehealthAnalytics from "./components/TelehealthAnalytics";

import "@/app/landing.css";
import "./telehealth.css";

const META_DESCRIPTION = `Start with August for free, anytime. See a board-certified doctor for as low as ${CONSULT_PRICE_LABEL}. Weight loss, sexual health, chronic care, prescriptions and more — no insurance, no waiting room.`;
const SOCIAL_DESCRIPTION = `Chat free with August any time, see a licensed doctor for ${CONSULT_PRICE_LABEL}, and start treatment programs. Real medical care, the moment you need it.`;

export const metadata = {
  title: "August · The medical intelligence that's always on",
  description: META_DESCRIPTION,
  alternates: {
    canonical: "https://www.meetaugust.ai/telehealth",
  },
  openGraph: {
    type: "website",
    url: "https://www.meetaugust.ai/telehealth",
    title: "August · The medical intelligence that's always on",
    description: SOCIAL_DESCRIPTION,
    siteName: "August",
  },
  twitter: {
    card: "summary_large_image",
    title: "August · The medical intelligence that's always on",
    description: SOCIAL_DESCRIPTION,
  },
};

export default async function TelehealthPage() {
  const country = (await headers()).get("cf-ipcountry") || undefined;

  return (
    <div className="landing-scope">
      <LandingNav initialCountry={country} />
      <div className="telehealth-scope">
        <main>
          <Hero />
          <TrustPanel />
          <Treatments />
          <HumanDoctors />
          <Questions />
          <Compare />
          <Capabilities />
          <Pricing />
          <Testimonials />
          <CTABand />
        </main>
      </div>
      <LandingFooter initialCountry={country} />
      <ScrollAnimations />
      <TelehealthAnalytics />
    </div>
  );
}
