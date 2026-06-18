import ClientAugustBenchmark2026Page from "./page.client";

export const metadata = {
  title: "August AI Scores 100% on USMLE  - 2026 Health AI Benchmark",
  description:
    "August achieves 100% on the US Medical Licensing Exam, beating every major AI model. See the full benchmark results across USMLE, MedQA & MMLU medical tests.",
  openGraph: {
    title: "August AI Scores 100% on the USMLE  - 2026 Benchmark Results",
    description:
      "August achieves a perfect score on the US Medical Licensing Exam, outperforming GPT-5 and other leading AI models. Full benchmark breakdown inside.",
    type: "article",
    images: [
      {
        url: "https://assets.getbeyondhealth.com/health-lib/benchmarks/2026.png",
        width: 1588,
        height: 1076,
        alt: "August versus other leading models on the USMLE benchmark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "August AI Scores 100% on USMLE | Health AI Benchmark 2026",
    description:
      "The first health AI to achieve a perfect USMLE score. Here's how August compares to GPT-5, and other leading models.",
    images: ["https://assets.getbeyondhealth.com/health-lib/benchmarks/2026.png"],
  },
};

export default function AugustBenchmarkPage() {
  return <ClientAugustBenchmark2026Page />;
}
