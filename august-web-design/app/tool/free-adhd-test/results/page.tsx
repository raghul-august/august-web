import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  searchParams: Promise<{ score?: string; d?: string }>;
}

function getVibeLabel(score: number) {
  if (score <= 9) return "Low-key";
  if (score <= 13) return "Maybe something";
  if (score <= 17) return "Notable vibes";
  return "Significant signs";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const score = parseInt(resolvedSearchParams.score || "0", 10);
  const clampedScore = Math.max(0, Math.min(24, score));
  const vibeLabel = getVibeLabel(clampedScore);

  const title = `I scored ${clampedScore}/24 on the ADHD Quiz - ${vibeLabel}`;
  const description = `I just took an ADHD screening quiz and scored ${clampedScore}/24. Take the quiz yourself to understand your attention patterns!`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.meetaugust.ai";
  const ogImageUrl = `${baseUrl}/api/og/adhd-result?score=${clampedScore}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 600,
          height: 780,
          alt: `ADHD Quiz Result: ${clampedScore}/24 - ${vibeLabel}`,
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
  const score = parseInt(resolvedSearchParams.score || "0", 10);
  const clampedScore = Math.max(0, Math.min(24, score));
  const vibeLabel = getVibeLabel(clampedScore);

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
          ADHD Quiz Results
        </h1>
        <p
          className="text-[3rem] font-medium tabular-nums my-6"
          style={{ color: "var(--brand-primary)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
        >
          {clampedScore}/24
        </p>
        <p
          className="inline-block px-5 py-2 rounded-full text-[14px] font-medium mb-6"
          style={{ background: "var(--brand-subtle)", color: "var(--brand-primary)" }}
        >
          {vibeLabel}
        </p>
        <p
          className="text-[15px] leading-[1.6] mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          Want to take the quiz yourself? It only takes about 8 minutes.
        </p>
        <Link
          href="/tool/free-adhd-test"
          className="inline-block px-8 py-3.5 rounded-full text-[15px] font-medium no-underline transition-transform hover:scale-[1.02]"
          style={{ background: "var(--brand-primary)", color: "var(--text-inverse)" }}
        >
          Take the quiz
        </Link>
      </div>
    </div>
  );
}
