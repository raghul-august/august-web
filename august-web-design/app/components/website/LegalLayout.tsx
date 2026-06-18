"use client";

import { useSearchParams } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

interface LegalLayoutProps {
  children: React.ReactNode;
}

export function LegalLayout({ children }: LegalLayoutProps) {
  const searchParams = useSearchParams();
  const isWebview = searchParams.get("source") === "webview";

  const handleBack = () => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({ type: "NAVIGATION", action: "BACK" })
    );
  };

  return (
    <>
      {isWebview && (
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      )}
      {!isWebview && <Navbar />}
      <div className="bg-white">
        {isWebview && (
          <div className="px-4 pt-[env(safe-area-inset-top)] pb-1">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-9 h-9 rounded-full mt-2 cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.06)', border: 'none' }}
              aria-label="Go back"
            >
              <svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 1L1 6l5 5" fill="none" stroke="#141515" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
        <div className={`max-w-[800px] mx-auto px-4 ${isWebview ? "pt-1 pb-8" : "pt-32 pb-24 sm:pb-32"} legal-mdx-container`}>
          {children}
        </div>
      </div>
      {!isWebview && <Footer />}
    </>
  );
}
