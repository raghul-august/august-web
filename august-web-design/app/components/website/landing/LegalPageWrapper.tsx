"use client";

import { useSearchParams } from "next/navigation";
import LandingNav from "./LandingNav";
import LandingFooter from "./LandingFooter";
import FinalCta from "./FinalCta";
import RegionSwitcher from "./RegionSwitcher";
import { LandingLayout } from "./LandingLayout";

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

export default function LegalPageWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isWebview = searchParams.get("source") === "webview";

  const handleBack = () => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({ type: "NAVIGATION", action: "BACK" })
    );
  };

  if (isWebview) {
    return (
      <LandingLayout>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <div className="px-4 pt-[env(safe-area-inset-top)] pb-1">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded-full mt-2 cursor-pointer"
            style={{ background: "rgba(0,0,0,0.06)", border: "none" }}
            aria-label="Go back"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1L1 6l5 5" fill="none" stroke="#141515" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {children}
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <LandingNav />
      <div
        className="pt-[110px] md:pt-[130px] bg-cream"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
          }}
          className="px-4 sm:px-6 xl:px-0"
        >
          <RegionSwitcher />
        </div>
        <div style={{ width: "100%" }}>
          {children}
        </div>
      </div>
      <FinalCta />
      <LandingFooter />
    </LandingLayout>
  );
}
