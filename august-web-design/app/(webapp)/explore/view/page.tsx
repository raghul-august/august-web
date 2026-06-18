"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink, Loader2, X } from "lucide-react";
import "./view.css";

function isAllowedAugustUrl(input: string) {
  try {
    const parsed = new URL(input);
    if (parsed.protocol !== "https:") return false;
    return (
      parsed.hostname === "meetaugust.ai" ||
      parsed.hostname.endsWith(".meetaugust.ai")
    );
  } catch {
    return false;
  }
}

function ViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url");

  const handleBack = () => {
    router.back();
  };

  if (!url || !isAllowedAugustUrl(url)) {
  return (
    <div className="view-page">
      <div className="view-error">
        <p>Only permitted links are allowed</p>
        <button onClick={handleBack} className="view-error__btn">
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    </div>
  );
}

const safeUrl = new URL(url).toString();

  return (
    <div className="view-page view-page--fullscreen">
      <iframe
        src={safeUrl}
        className="view-iframe"
        title="Article content"
        sandbox="allow-scripts allow-popups allow-forms"
      />
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense
      fallback={
        <div className="view-page">
          <div className="view-loading">
            <Loader2 size={32} className="animate-spin" />
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <ViewContent />
    </Suspense>
  );
}
