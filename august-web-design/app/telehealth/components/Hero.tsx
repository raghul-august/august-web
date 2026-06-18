"use client";

/* Hero — headline + Composer with a rotating example prompt + trust badges.
   Submitting the composer (CTA click or Enter) opens the anonymous chat. */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { chatHrefWithMessage } from "../constants";
import { trackTelehealthStart } from "../analytics";
import Composer from "./Composer";

const PROMPTS = [
  "What does my cholesterol panel actually mean?",
  "Is it safe to take melatonin every night?",
  "Could I be a candidate for GLP-1 weight loss?",
  "My doctor recommended surgery. What are my options?",
];

export default function Hero() {
  // No animation state lives here: the rotating placeholder owns its own ticker
  // inside a memoized leaf, so this Hero renders once. `go` is stable so the
  // memoized Composer never re-renders from a new handler identity.
  const router = useRouter();

  // The composer is the one CTA that isn't an <a>, so the page-level click
  // delegation can't catch it — fire the same cta_clicked + telehealth_start
  // here, then navigate client-side so the Meta beacon isn't cut off.
  const go = useCallback(
    (text: string) => {
      const href = chatHrefWithMessage(text);
      trackTelehealthStart(href, "Get started", "Meet August");
      window.setTimeout(() => router.push(href), 150);
    },
    [router],
  );

  return (
    <section
      style={{
        background: "var(--surface-page)",
        // Clear the site's fixed LandingNav (~96px) on both mobile and desktop.
        paddingTop: "clamp(124px,13vw,168px)",
        paddingBottom: "clamp(32px,5vw,64px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "0 var(--gutter)",
          textAlign: "center",
          wordBreak: "break-word",
        }}
      >
        <div
          className="aug-hero-eyebrow th-eyebrow"
          style={{
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-eyebrow)",
            color: "var(--text-brand)",
            fontSize: "var(--text-eyebrow)",
            fontWeight: 400,
            marginBottom: 16,
          }}
        >
          Meet August
        </div>
        <h1
          className="aug-hero-h1"
          style={{
            fontSize: "clamp(40px,6.2vw,60px)",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            margin: "0 0 14px",
          }}
        >
          Real medical care,
          <br />
          the moment <span style={{ color: "var(--text-brand)" }}>you need it</span>
        </h1>
        <p
          className="aug-hero-sub"
          style={{
            fontSize: "clamp(17px,2.45vw,22px)",
            fontWeight: 400,
            lineHeight: 1.5,
            color: "var(--text-secondary)",
            maxWidth: "72ch",
            margin: "0 auto 28px",
          }}
        >
          Start with August for free, anytime. See a board-certified
          <br />
          MD doctor when you need it.
        </p>

        {/* Composer with rotating example prompt */}
        <div className="aug-hero-composer" style={{ maxWidth: 620, margin: "0 auto" }}>
          <Composer placeholders={PROMPTS} cta="Get started" secureNote="" onSend={go} />
        </div>
      </div>
    </section>
  );
}
