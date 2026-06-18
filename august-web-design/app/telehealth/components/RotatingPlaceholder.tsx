"use client";

/* Isolated, memoized placeholder for the Composer.
   The rotation interval lives HERE so each tick re-renders only this ~10-line
   leaf — never the Composer textarea or the Hero around it. Mirrors the
   AnimatedChatHero/AnimatedPlaceholder pattern from the urgent-care page.
   Rendered as an absolutely-positioned overlay (not the native `placeholder`
   attribute) so changing the text never forces the textarea's owner to render. */

import { memo, useEffect, useState } from "react";

const ROTATE_MS = 3200;

function RotatingPlaceholder({
  texts,
  hidden,
}: {
  texts: string[];
  hidden: boolean;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (hidden || texts.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % texts.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [hidden, texts.length]);

  if (hidden) return null;

  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: 18,
        left: 20,
        right: 20,
        pointerEvents: "none",
        // The Hero container is center-aligned; force left like the native
        // textarea placeholder it replaces.
        textAlign: "left",
        fontFamily: "var(--font-sans)",
        fontSize: 15,
        lineHeight: "24px",
        color: "var(--text-disabled)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {texts[idx]}
    </span>
  );
}

export default memo(RotatingPlaceholder);
