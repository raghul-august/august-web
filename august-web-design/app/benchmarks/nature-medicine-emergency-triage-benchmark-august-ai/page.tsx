import type { Metadata } from "next";
import NatureMedicineBenchmarkClient from "./page.client";

export const metadata: Metadata = {
  title:
    "August AI Correctly Triaged Every Emergency in internal evaluation of Nature Medicine Benchmarks",
  description:
    "A Nature Medicine study found that leading AI health tools under-triaged 52% of emergencies. We evaluated August against the same benchmark. August correctly triaged every one. Here's what we found and why it matters.",
  openGraph: {
    type: "article",
    title:
      "A Nature Medicine Study Found AI Misses Half of Medical Emergencies. We Ran the Same Test.",
    description:
      "August correctly triaged every emergency case when evaluated against the peer-reviewed benchmark that exposed critical safety gaps in consumer health AI.",
    images: [
      {
        url: "https://assets.getbeyondhealth.com/health-lib/safety-benchmark.png",
      },
    ],
    url: "https://www.meetaugust.ai/benchmarks/nature-medicine-emergency-triage-benchmark-august-ai",
    siteName: "August AI",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "A Nature Medicine Study Found AI Misses Half of Medical Emergencies. We Ran the Same Test.",
    description:
      "August correctly triaged every emergency case against the Nature Medicine benchmark. 64 out of 64 emergencies identified.",
    images: [
      "https://assets.getbeyondhealth.com/health-lib/safety-benchmark.png",
    ],
  },
  other: {
    "article:published_time": "2026-03-01T00:00:00Z",
    "article:author": "Anuruddh Mishra",
    "article:section": "Safety & Research",
    "article:tag": "AI Safety, Medical Triage, Nature Medicine",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "A Nature Medicine Study Found AI Misses Half of Medical Emergencies. We Ran the Same Test.",
  description:
    "August correctly triaged every emergency case when evaluated against the peer-reviewed benchmark that exposed critical safety gaps in consumer health AI.",
  image:
    "https://assets.getbeyondhealth.com/health-lib/safety-benchmark.png",
  datePublished: "2026-03-01",
  dateModified: "2026-03-03",
  author: {
    "@type": "Person",
    name: "Anuruddh Mishra",
    jobTitle: "Founder & CEO",
    affiliation: {
      "@type": "Organization",
      name: "August AI",
      url: "https://meetaugust.ai",
    },
  },
  publisher: {
    "@type": "Organization",
    name: "August AI",
    url: "https://meetaugust.ai",
    logo: {
      "@type": "ImageObject",
      url: "https://meetaugust.ai/logo.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id":
      "https://www.meetaugust.ai/benchmarks/nature-medicine-emergency-triage-benchmark-august-ai",
  },
  articleSection: "Safety & Research",
  keywords: [
    "AI safety",
    "medical triage",
    "Nature Medicine",
    "health AI",
    "emergency triage",
    "ChatGPT Health",
    "August AI",
    "benchmark",
  ],
  wordCount: 1500,
};

export default function NatureMedicineBenchmarkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NatureMedicineBenchmarkClient />
    </>
  );
}
