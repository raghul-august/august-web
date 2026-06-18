"use client";

/* Transparent pricing — Free vs paid Doctor Visit (price from CONSULT_PRICE_LABEL).
   Both CTAs open chat. */

import { CheckIcon } from "@phosphor-icons/react/ssr";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

import { CHAT_HREF } from "../constants";
import SectionHead from "./SectionHead";

function PriceTier({
  label,
  desc,
  price,
  unit,
  cta,
  features,
  featured,
  startingFrom,
}: {
  label: string;
  desc: string;
  price: string;
  unit?: string;
  cta: string;
  features: string[];
  featured?: boolean;
  startingFrom?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface-elevated)",
        border: `1px solid ${featured ? "var(--brand-primary)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "clamp(28px,4vw,40px)",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 200ms ease",
      }}
      onMouseEnter={(e) => {
        if (!featured) e.currentTarget.style.borderColor = "var(--border)";
      }}
      onMouseLeave={(e) => {
        if (!featured) e.currentTarget.style.borderColor = "var(--border-subtle)";
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.01em" }}>
        {label}
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5, minHeight: 40, margin: "0 0 20px" }}>{desc}</p>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: startingFrom ? "var(--text-tertiary)" : "transparent",
          marginBottom: 6,
          display: "block",
        }}
      >
        Starting from
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
        <span
          style={{
            fontSize: "clamp(36px,5vw,44px)",
            fontWeight: 500,
            color: "var(--text-primary)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {price}
        </span>
        {unit && <span style={{ color: "var(--text-tertiary)", fontSize: 13, fontWeight: 400 }}>{unit}</span>}
      </div>
      <a
        href={CHAT_HREF}
        style={{
          display: "block",
          textAlign: "center",
          padding: "16px 24px",
          minHeight: 56,
          borderRadius: "var(--radius-md)",
          fontFamily: "'Inter Display', var(--font-sans)",
          fontSize: 15,
          fontWeight: 500,
          textDecoration: "none",
          transition: "all 160ms ease",
          cursor: "pointer",
          marginBottom: 24,
          background: featured ? "var(--brand-primary)" : "transparent",
          border: featured ? "1px solid var(--brand-primary)" : "1.5px solid var(--border)",
          color: featured ? "#fff" : "var(--text-primary)",
        }}
        onMouseEnter={(e) => {
          if (featured) {
            e.currentTarget.style.background = "var(--brand-primary-hover)";
          } else {
            e.currentTarget.style.borderColor = "var(--text-primary)";
          }
        }}
        onMouseLeave={(e) => {
          if (featured) {
            e.currentTarget.style.background = "var(--brand-primary)";
          } else {
            e.currentTarget.style.borderColor = "var(--border)";
          }
        }}
      >
        {cta}
      </a>
      <ul
        style={{
          borderTop: "1px solid var(--border-subtle)",
          listStyle: "none",
          margin: 0,
          padding: "24px 0 0",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
        }}
      >
        {features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "var(--text-secondary)", fontSize: 13 }}>
            <CheckIcon style={{ color: "var(--brand-primary)", fontSize: "1rem", flex: "none", marginTop: 1 }} aria-hidden />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  return (
    <section style={{ background: "var(--surface-page)", padding: "var(--section-pad) 0" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div data-anim="fade-up">
          <SectionHead
            center
            eyebrow="Pricing"
            title="Transparent, honest pricing"
            sub="No dark patterns or hidden charges. The new, honest healthcare is here."
          />
        </div>
        <div
          className="aug-pricing"
          data-stagger
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(16px,2.5vw,20px)", maxWidth: 720, margin: "0 auto" }}
        >
          <PriceTier
            label="Free"
            desc="Perfect for checking symptoms and getting health guidance."
            price="$0"
            cta="Start for free"
            features={[
              "AI-powered symptom assessment",
              "Personalized health guidance",
              "Available 24/7, no account needed",
              "No ads, no data selling",
            ]}
          />
          <PriceTier
            featured
            label="Doctor Visit"
            desc="See a licensed doctor when August thinks you need one."
            price={CONSULT_PRICE_LABEL}
            unit="/ visit"
            startingFrom
            cta="Get started"
            features={[
              "24/7 visits with licensed doctors",
              "Prescriptions sent to your pharmacy when appropriate",
              "A clear, written care plan you can keep",
              "No membership, no subscription, no hidden fees",
            ]}
          />
        </div>
        <p
          style={{
            marginTop: 24,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-tertiary)",
            lineHeight: 1.5,
            textAlign: "center",
            maxWidth: 720,
            marginInline: "auto",
          }}
        >
          A visit doesn't guarantee a prescription. Whether medication is right for you is always the
          clinician's professional judgment. Controlled substances can't be prescribed through a virtual
          visit.
        </p>
      </div>
    </section>
  );
}
