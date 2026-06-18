"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqAccordionProps {
  faqs: { q: string; a: string }[];
  heading?: string;
}

export default function FaqAccordion({
  faqs,
  heading = "Questions you might have",
}: FaqAccordionProps) {
  if (faqs.length === 0) return null;
  return (
    <div style={{ margin: "clamp(48px, 8vw, 80px) 0" }}>
      <div style={{ textAlign: "center" }}>
        <h2
          id="faq"
          style={{
            margin: 0,
            color: "var(--text-primary, #141515)",
            fontSize: "clamp(28px, 4vw, 38px)",
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            maxWidth: 520,
            marginInline: "auto",
          }}
        >
          {heading}
        </h2>
      </div>

      <div
        style={{
          marginTop: "clamp(32px, 6vw, 56px)",
          borderTop: "1px solid var(--border-subtle, #E5E2DA)",
        }}
      >
        {faqs.map((faq, i) => (
          <FaqItem key={i} q={faq.q} a={faq.a} />
        ))}
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle, #E5E2DA)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "inherit",
          transition: "opacity 200ms ease-out",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <span
          style={{
            color: "var(--text-primary, #141515)",
            paddingRight: 16,
            fontSize: "clamp(15px, 1.5vw, 17px)",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {q}
        </span>
        <span
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "9999px",
            background: "var(--brand-subtle, #E8F2ED)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease-out",
          }}
        >
          <ChevronDown size={16} color="var(--brand-primary, #206E55)" strokeWidth={2.5} />
        </span>
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transition:
            "grid-template-rows 200ms ease-out, opacity 200ms ease-out",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <p
            style={{
              color: "var(--text-secondary, #5A554A)",
              margin: 0,
              paddingBottom: 24,
              fontSize: "clamp(14px, 1.4vw, 16px)",
              fontWeight: 400,
              lineHeight: 1.7,
              maxWidth: 640,
            }}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}
