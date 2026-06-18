import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  searchParams: Promise<{ score?: string }>;
}

function getTierTitle(score: number) {
  if (score >= 90) return "Impossibly Pure";
  if (score >= 70) return "Pretty Open";
  if (score >= 50) return "Average Human";
  if (score >= 30) return "Secret Hoarder";
  return "Body Secrets Master";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const score = Math.max(0, Math.min(100, parseInt(resolvedSearchParams.score || "50", 10)));
  const tierTitle = getTierTitle(score);

  const title = `I scored ${score}/100 on the Rice Purity Test - ${tierTitle}`;
  const description = `I just took the Rice Purity Test and scored ${score}/100. How many body secrets are you keeping? Take the test!`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.meetaugust.ai";
  const ogImageUrl = `${baseUrl}/api/og/rice-purity-result?score=${score}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Rice Purity Test Result: ${score}/100 - ${tierTitle}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ResultsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const score = Math.max(0, Math.min(100, parseInt(resolvedSearchParams.score || "50", 10)));
  const tierTitle = getTierTitle(score);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{
        background:
          "linear-gradient(135deg, var(--brand-subtle) 0%, var(--surface-page) 100%)",
        fontFamily:
          "'Inter Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <Link
        href="/"
        className="self-start inline-flex items-center gap-1.5 mb-6 text-[15px] font-medium no-underline transition-colors"
        style={{ color: "var(--brand-primary)" }}
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Back to Home
      </Link>
      <div
        className="w-full max-w-[420px] text-center rounded-[20px] p-10"
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <h1
          className="text-[1.5rem] font-medium mb-2"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
        >
          Rice Purity Test Results
        </h1>
        <p
          className="text-[3rem] font-medium tabular-nums my-6"
          style={{ color: "var(--brand-primary)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
        >
          {score}/100
        </p>
        <p
          className="inline-block px-5 py-2 rounded-full text-[14px] font-medium mb-6"
          style={{ background: "var(--brand-subtle)", color: "var(--brand-primary)" }}
        >
          {tierTitle}
        </p>
        <p
          className="text-[15px] leading-[1.6] mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          How many body secrets are you keeping? Take the test yourself.
        </p>
        <Link
          href="/tool/rice-purity-test"
          className="inline-block px-8 py-3.5 rounded-full text-[15px] font-medium no-underline transition-transform hover:scale-[1.02]"
          style={{ background: "var(--brand-primary)", color: "var(--text-inverse)" }}
        >
          Take the test
        </Link>
      </div>
    </div>
  );
}
