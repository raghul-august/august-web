"use client";

/* Hero — headline + Composer with a rotating example prompt + trust badges.
   Submitting the composer (CTA click or Enter) opens the anonymous chat. */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { chatHrefWithMessage } from "../constants";
import { trackTelehealthStart } from "../analytics";
import Composer from "./Composer";

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
      id="meet-august"
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
          position: "relative",
          zIndex: 1,
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
          #1 Medical AI platform · Trusted by 8M users
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
          Hi, <span className="aug-hero-glare">I’m August</span>
        </h1>
        <h3
          className="aug-hero-sub"
          style={{
            fontSize: "clamp(22px,3.2vw,30px)",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            color: "var(--text-primary)",
            margin: "0 0 18px",
          }}
        >
          Secure. Private. Built by doctors.
        </h3>
        <p
          className="aug-hero-sub"
          style={{
            fontSize: "clamp(15px,1.7vw,17px)",
            fontWeight: 400,
            lineHeight: 1.55,
            color: "var(--text-secondary)",
            maxWidth: "62ch",
            margin: "0 auto 28px",
          }}
        >
          Get expert answers 24/7 with personalized management plans in seconds.
          <br />
          When you need treatment, get an instant consultation with licensed
          doctors for prescriptions and more.
        </p>

        {/* Composer with rotating example prompt */}
        <div className="aug-hero-composer" style={{ maxWidth: 620, margin: "0 auto" }}>
          <Composer placeholder="I’m always here for you, ready when you are." cta="Start Chat" secureNote="" onSend={go} />
        </div>
      </div>
    </section>
  );
}
