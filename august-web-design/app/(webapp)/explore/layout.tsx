import type { Metadata } from "next";
import { DM_Sans, Crimson_Pro } from "next/font/google";
import "./explore.css";
import { ExploreShell } from "./shell";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.meetaugust.ai"),
  title: "Explore - Health Library",
  description: "Explore health articles, conditions, medications, and more.",
  openGraph: {
    title: "Explore - Health Library",
    description: "Explore health articles, conditions, medications, and more.",
    url: "https://www.meetaugust.ai/explore",
    type: "website",
    siteName: "August Health",
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        html, body { background: #f5f1e8 !important; }
      `}</style>
      <ExploreShell className={`${dmSans.variable} ${crimsonPro.variable}`}>
        {children}
      </ExploreShell>
    </>
  );
}
