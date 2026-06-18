"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LandingSmoothScroll = dynamic(
  () => import("@/app/components/website/landing/LandingSmoothScroll"),
  { ssr: false },
);

export default function SmoothScrollRunner() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (!cancelled) setReady(true);
    };

    const events = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
    const opts: AddEventListenerOptions = { once: true, passive: true };
    events.forEach((e) => window.addEventListener(e, start, opts));

    const hasRIC = typeof requestIdleCallback === "function";
    const handle: number = hasRIC
      ? requestIdleCallback(start, { timeout: 3000 })
      : window.setTimeout(start, 2000);

    return () => {
      cancelled = true;
      events.forEach((e) => window.removeEventListener(e, start, opts));
      if (hasRIC) cancelIdleCallback(handle);
      else clearTimeout(handle);
    };
  }, []);

  if (!ready) return null;
  return <LandingSmoothScroll />;
}
