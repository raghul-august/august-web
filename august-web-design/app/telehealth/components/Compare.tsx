"use client";

/* "Healthcare that finally works for you" — 3-step how-it-works.
   Step cards and the CTA all open the anonymous chat. */

import { MapPinIcon, ArrowRightIcon } from "@phosphor-icons/react/ssr";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

import { CHAT_HREF } from "../constants";
import SectionHead from "./SectionHead";
import Button from "./Button";

const STEPS = [
  {
    n: 1,
    h: "Chat with August about your symptoms",
    p: "Tell August how you're feeling in plain words. It listens, asks a few gentle questions, and helps make sense of your symptoms. Free, anytime.",
  },
  {
    n: 2,
    h: "Start a virtual visit with a licensed doctor, if eligible",
    p: `If a doctor would help, we match you with a clinician licensed in your state. Starting from ${CONSULT_PRICE_LABEL}, no membership, no surprise bills.`,
  },
  {
    n: 3,
    h: "Get your prescription sent to your nearest pharmacy",
    p: "When appropriate, your prescription goes straight to your pharmacy, along with a clear care plan you can keep and revisit.",
  },
];

export default function Compare() {
  return (
    <section style={{ background: "var(--surface-page)", padding: "var(--section-pad) 0" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div data-anim="fade-up">
          <SectionHead
            center
            eyebrow="Care, not just answers"
            title="Healthcare that finally works for you"
            sub="Healthcare has never felt this responsive, informed, and easy."
          />
        </div>

        <div
          className="aug-steps"
          data-stagger
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}
        >
          {STEPS.map((s) => (
            <a
              key={s.n}
              href={CHAT_HREF}
              className="aug-step-card"
              style={{
                position: "relative",
                textAlign: "center",
                textDecoration: "none",
                background: "var(--surface-elevated)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid rgba(0,0,0,0.06)",
                padding: "32px 24px",
                margin: "0 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)",
                transition: "transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.05)";
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)";
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--brand-primary)",
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                {s.n}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 10px" }}>{s.h}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, maxWidth: "28ch", margin: 0 }}>
                {s.p}
              </p>
            </a>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            marginTop: "clamp(32px,4vw,44px)",
          }}
        >
          <Button
            as="a"
            href={CHAT_HREF}
            variant="primary"
            iconRight={<ArrowRightIcon aria-hidden />}
            style={{ minWidth: 320 }}
          >
            Get started
          </Button>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            <MapPinIcon style={{ color: "var(--brand-primary)" }} aria-hidden /> Available in 50 states + DC
          </span>
        </div>
      </div>
    </section>
  );
}
