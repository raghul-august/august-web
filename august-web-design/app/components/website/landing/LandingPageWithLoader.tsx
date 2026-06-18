"use client";
import { useEffect, useState } from "react";
import Loader from "./Loader";

const DISPLAY_MS = 1000;
const FADE_MS = 300;

/**
 * Branding loader handles the initial entry experience without wrapping the
 * full landing tree in a client component.
 */
export default function LandingPageWithLoader() {
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const startedAt = Date.now();

    const hideTimer = globalThis.setTimeout(() => {
      setVisible(false);
    }, DISPLAY_MS);

    const removeTimer = globalThis.setTimeout(() => {
      setMounted(false);
    }, DISPLAY_MS + FADE_MS);

    const finishIfElapsed = () => {
      if (Date.now() - startedAt < DISPLAY_MS) return;
      setVisible(false);
      setMounted(false);
    };

    window.addEventListener("pageshow", finishIfElapsed);
    document.addEventListener("visibilitychange", finishIfElapsed);

    return () => {
      globalThis.clearTimeout(hideTimer);
      globalThis.clearTimeout(removeTimer);
      window.removeEventListener("pageshow", finishIfElapsed);
      document.removeEventListener("visibilitychange", finishIfElapsed);
    };
  }, []);

  if (!mounted) return null;

  return <Loader visible={visible} />;
}
