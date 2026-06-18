import dynamic from "next/dynamic";
import { Suspense } from "react";
import { headers, cookies } from "next/headers";

import { LandingLayout } from "@/app/components/website/landing/LandingLayout";
import LandingNav from "@/app/components/website/landing/LandingNav";
import LandingPageWithLoader from "@/app/components/website/landing/LandingPageWithLoader";
import LandingParallaxStack from "@/app/components/website/landing/LandingParallaxStack";
import LandingHero from "@/app/components/website/landing/LandingHero";
const UseCases = dynamic(() => import("@/app/components/website/landing/UseCases"));
const Faq = dynamic(() => import("@/app/components/website/landing/Faq"));
const SocialProof = dynamic(() => import("@/app/components/website/landing/SocialProof"));
const UsTestimonials = dynamic(() => import("@/app/components/website/landing/UsTestimonials"));
const Experience = dynamic(() => import("@/app/components/website/landing/Experience"));
const Trust = dynamic(() => import("@/app/components/website/landing/Trust"));
const FinalCta = dynamic(() => import("@/app/components/website/landing/FinalCta"));
const LandingFooter = dynamic(() => import("@/app/components/website/landing/LandingFooter"));
const FloatingElements = dynamic(() => import("@/app/components/website/landing/FloatingElements"));
const UsmleProof = dynamic(() => import("@/app/components/website/landing/UsmleProof"));
import CampaignLogger from "@/app/components/website/landing/CampaignLogger";
import { AnimatedAIChatHero } from "./components/website/landing/AnimatedChatHero";

export const metadata = {
  title: {
    default: "August - Your Health Companion",
    template: "%s | August",
  },
  description:
    "The #1 Health AI. 100% score on the US Medical Licensing Exam. Free, private, and actually reliable.Understand lab reports, symptoms, medications, and insurance - without the confusion.",
  metadataBase: new URL("https://www.meetaugust.ai"),
  openGraph: {
    title: "August - Your Health Companion",
    description:
      "The #1 Health AI. 100% score on the US Medical Licensing Exam. Free, private, and actually reliable.Understand lab reports, symptoms, medications, and insurance - without the confusion.",
    url: "https://www.meetaugust.ai",
    siteName: "August",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "August AI Social Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "August - Your Health Companion",
    description:
      "The #1 Health AI. 100% score on the US Medical Licensing Exam. Free, private, and actually reliable.Understand lab reports, symptoms, medications, and insurance - without the confusion.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://www.meetaugust.ai/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does August replace a doctor?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. August does not replace a doctor. August is an AI tool created with help from doctors and provides general medical guidance and education. You should always consult a qualified doctor for medical decisions."
      }
    },
    {
      "@type": "Question",
      "name": "Is August free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, using August is completely free of charge."
      }
    },
    {
      "@type": "Question",
      "name": "Is health insurance required to use August?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, you do not need health insurance to access August. It is available to everyone regardless of insurance coverage."
      }
    },
    {
      "@type": "Question",
      "name": "How does August work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "August leverages AI to analyze your health questions by cross-referencing trusted medical sources and data. It provides general guidance on symptoms, treatment options, and preventive care."
      }
    },
    {
      "@type": "Question",
      "name": "Can August diagnose my condition?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. August does not provide a formal diagnosis. It helps you understand your symptoms and offers guidance on whether you should seek further evaluation from a healthcare provider."
      }
    },
    {
      "@type": "Question",
      "name": "Is my data safe with August?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. August takes privacy seriously and is designed with strong data security measures. It is HIPAA and GDPR compliant to help protect your personal health information."
      }
    },
    {
      "@type": "Question",
      "name": "Who can use August?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Anyone seeking general health information can use August. Whether you are preparing for a medical appointment, managing a chronic condition, or exploring a health topic, August can help. Its guidance does not replace personalized medical consultation."
      }
    },
    {
      "@type": "Question",
      "name": "What kind of questions can I ask August?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can ask about symptoms, medications, treatment options, preventive care, lifestyle guidance, and more. August supports many common health-related questions, from routine checkups to seasonal concerns."
      }
    },
    {
      "@type": "Question",
      "name": "Can August help with emergency situations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. August is not designed for emergency use. If you are experiencing a medical emergency, call 911 or go to the nearest emergency department immediately."
      }
    },
    {
      "@type": "Question",
      "name": "Will August share my data with third parties?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. August does not share your data with third parties without your explicit consent. Your information remains private and secure."
      }
    },
    {
      "@type": "Question",
      "name": "Which languages can August understand and reply in?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "August supports more than 30 languages, allowing users to ask questions and receive guidance in their preferred language."
      }
    }
  ]
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <LandingLayout>
      <Suspense fallback={null}>
        <CountryAwareContent searchParamsPromise={searchParams} />
      </Suspense>
    </LandingLayout>
  );
}

async function CountryAwareContent({
  searchParamsPromise,
}: {
  searchParamsPromise: SearchParams;
}) {
  const [resolvedSearchParams, headerList, cookieStore] = await Promise.all([
    searchParamsPromise,
    headers(),
    cookies(),
  ]);

  // 1️⃣ URL param takes highest priority
  // 2️⃣ Fallback to Cloudflare country header
  // 3️⃣ Fallback to Cloudflare country cookie
  const country = (resolvedSearchParams.country as string) ||
                  headerList.get("cf-ipcountry") ||
                  cookieStore.get("cf_country")?.value ||
                  "Global";

  const isIndia = country === "IN";
  const isUS = country === "US";

  return (
    <>
      <div className="landing-content-root">
        <LandingPageWithLoader />
        <CampaignLogger />
        <LandingNav initialCountry={country} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <main>
          <LandingParallaxStack>
            {isIndia ? <LandingHero /> : <AnimatedAIChatHero />}
            <UsmleProof />
            {/* US/Global: text+photo testimonials; India: video testimonials */}
            {isIndia ? <SocialProof /> : <UsTestimonials />}
            <Experience />
            <UseCases />
            <Trust />
            <Faq country={country} />
            <FinalCta />
          </LandingParallaxStack>
        </main>
        <LandingFooter initialCountry={country} />
        <FloatingElements country={country} />
      </div>
    </>
  );
}
