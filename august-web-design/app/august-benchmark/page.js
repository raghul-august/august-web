import ClientAugustBenchmarkPage from "./page.client";

export const metadata = {
  title: "August AI Achieves 94.8% on USMLE - Highest Score Among AI Health Assistants",
  description:
    "August AI, India's health AI from Bangalore-based Beyond, scores 94.8% on USMLE, outperforming GPT-4 (87.8%) and Google MedPaLM 2 (86.5%). Learn about the breakthrough benchmark results.",
  openGraph: {
    type: "article",
    url: "https://www.meetaugust.ai/august-benchmark",
    title: "August AI Achieves 94.8% on USMLE - Highest Score Among AI Health Assistants",
    description:
      "India's August AI scores 94.8% on USMLE, beating GPT-4 and MedPaLM 2. Discover how this Bangalore-based health AI is revolutionizing healthcare access.",
    images: [
      {
        url: "https://assets.getbeyondhealth.com/health-lib/benchmarks/old-benchmark.png",
        width: 1200,
        height: 630,
        alt: "August AI USMLE 2023 benchmark results showing 94.8% score compared to other AI models",
      },
    ],
    siteName: "August AI",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@MeetAugustAI",
    creator: "@MeetAugustAI",
    title: "August AI Achieves 94.8% on USMLE - Highest Score Among AI Health Assistants",
    description:
      "India's August AI scores 94.8% on USMLE, beating GPT-4 and MedPaLM 2. Discover how this Bangalore-based health AI is revolutionizing healthcare.",
    images: [
      "https://assets.getbeyondhealth.com/health-lib/benchmarks/old-benchmark.png",
    ],
  },
  other: {
    "article:published_time": "2023-09-24T00:00:00Z",
    "article:author": "August AI Team",
    "article:section": "Healthcare Technology",
    "article:tag": ["AI Healthcare", "Health AI", "USMLE", "Healthcare Innovation"],
  },
};

export default function AugustBenchmarkPage() {
  return <ClientAugustBenchmarkPage />;
}
