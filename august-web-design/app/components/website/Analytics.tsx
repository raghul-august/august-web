"use client";

import { GoogleAnalytics } from "@next/third-parties/google";

export function Analytics({ gaId }: { gaId: string }) {
  return <GoogleAnalytics gaId={gaId} />;
}
