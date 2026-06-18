import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "August AI | Benchmark Performance",
  description:
    "Performance metrics that demonstrate August's commitment to accurate, reliable health information.",
};

export default function BenchmarksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
