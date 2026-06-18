import type { Metadata } from "next";
import { DM_Sans, Crimson_Pro } from "next/font/google";
import { ChatAppProviders } from "@/app/components/chat-app-providers";
import "@/app/chat-app.css";
import "./cost-estimator.css";
import { CostEstimatorShell } from "./shell";

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
  title: "Cost Saver - How Much Is That Costing You?",
  description: "Find out the real cost of anything. For entertainment only.",
  openGraph: {
    title: "Cost Saver - How Much Is That Costing You?",
    description: "Find out the real cost of anything.",
    url: "https://www.meetaugust.ai/tool/cost-estimator",
    type: "website",
    siteName: "Cost Saver",
    images: [{ url: "https://assets.getbeyondhealth.com/og/cost-estimator.png", width: 1200, height: 630, alt: "Cost Saver" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cost Saver - How Much Is That Costing You?",
    description: "Find out the real cost of anything.",
    images: ["https://assets.getbeyondhealth.com/og/cost-estimator.png"],
  },
};

export default function CostEstimatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatAppProviders>
      <>
        <link rel="preload" href="/cost-estimator-bg.png" as="image" fetchPriority="high" />
        <script dangerouslySetInnerHTML={{ __html: `
          if (window.location.hostname === "medicalcostestimator.com" || window.location.hostname === "bankruptcyavoider.com") {
            var s = document.createElement("style");
            s.textContent = ".ce-layout aside, .ce-layout > .lg\\\\:hidden, .ce-layout header .lg\\\\:hidden { display: none !important; }";
            document.head.appendChild(s);
          }
        ` }} />
        <style>{`
          html, body { background: #f5f1e8 !important; }
          .ce-layout header { background: transparent !important; border-bottom: none !important; position: relative; z-index: 20; }
        `}</style>
        <CostEstimatorShell className={`${dmSans.variable} ${crimsonPro.variable}`}>
          {children}
        </CostEstimatorShell>
      </>
    </ChatAppProviders>
  );
}
