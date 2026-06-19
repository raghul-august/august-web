"use client";

/* "What August does" capability grid with example-prompt pills.
   Each card opens the anonymous chat. */

import { useState } from "react";
import {
  FileTextIcon,
  PillIcon,
  QuestionIcon,
  MagnifyingGlassIcon,
  NotepadIcon,
  StethoscopeIcon,
  ChatCircleDotsIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

import { chatHrefWithMessage } from "../constants";
import SectionHead from "./SectionHead";

type Tone = "brand" | "blue" | "plum" | "tan" | "neutral";

const CARDS: { Icon: Icon; tone: Tone; title: string; desc: string; prompt: string }[] = [
  { Icon: FileTextIcon, tone: "brand", title: "Lab Report Interpretation", desc: "Upload your results and get them in plain English: what's normal, what's not, and what to ask.", prompt: "Can you help me identify any red flags in my latest blood work?" },
  { Icon: PillIcon, tone: "blue", title: "Medication Explanation", desc: "Understand what you take and why, including interactions and side effects.", prompt: "Why was I prescribed this, and what are the side effects?" },
  { Icon: QuestionIcon, tone: "plum", title: "Health Q&A", desc: "Talk through anything, any hour. August reasons like a clinician and knows when to escalate.", prompt: "I've felt off for a week. Where should I start?" },
  { Icon: MagnifyingGlassIcon, tone: "tan", title: "Second Opinions", desc: "We're not here to replace your doctor. We're here as a calm, evidence-based second look.", prompt: "My doctor recommended surgery. Is that the only option?" },
  { Icon: NotepadIcon, tone: "neutral", title: "Prepare for a Visit", desc: "Walk in ready. Generate the right questions and a clean summary of your history.", prompt: "Summarize my health history for my doctor." },
  { Icon: StethoscopeIcon, tone: "brand", title: "Telehealth", desc: "Prescription refills, finding a specialist, or ordering a lab test. August helps you move.", prompt: "I want to talk to a doctor now." },
];

const ACCENT: Record<Tone, { c: string; bg: string }> = {
  brand: { c: "var(--aug-accent-brand)", bg: "var(--aug-accent-brand-bg)" },
  blue: { c: "var(--aug-accent-blue)", bg: "var(--aug-accent-blue-bg)" },
  tan: { c: "var(--aug-accent-tan)", bg: "var(--aug-accent-tan-bg)" },
  plum: { c: "var(--aug-accent-plum)", bg: "var(--aug-accent-plum-bg)" },
  neutral: { c: "var(--aug-accent-neutral)", bg: "var(--aug-accent-neutral-bg)" },
};

function PromptPill({ children }: { children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginTop: "auto",
        background: hover ? "var(--surface-subtle)" : "var(--surface-page)",
        border: `1px solid ${hover ? "var(--border)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-md)",
        padding: "11px 14px",
        fontSize: 13.5,
        color: "var(--text-primary)",
        transition: "background 150ms ease, border-color 150ms ease, transform 150ms ease",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <ChatCircleDotsIcon style={{ color: "var(--text-tertiary)", flex: "none" }} aria-hidden />
      <span style={{ flex: 1 }}>{children}</span>
      <ArrowUpRightIcon style={{ color: "var(--text-tertiary)", flex: "none" }} aria-hidden />
    </span>
  );
}

export default function Capabilities() {
  return (
    <section style={{ background: "var(--surface-elevated)", padding: "var(--section-pad) 0" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div data-anim="rise">
          <SectionHead
            center
            eyebrow="What August does"
            title="Care that doesn't end at the consult"
            sub="Not a one-time consult. Check a symptom, understand a diagnosis, refill a prescription, or get a second opinion. August handles your full care, 24/7."
          />
        </div>
        <div
          className="aug-cap-grid"
          data-stagger
          style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "clamp(20px,3vw,28px)" }}
        >
          {CARDS.map(({ Icon, tone, title, desc, prompt }) => {
            const a = ACCENT[tone];
            return (
              <a
                key={title}
                href={chatHrefWithMessage(prompt)}
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "var(--radius-xl)",
                  padding: "clamp(28px,4vw,40px)",
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)",
                  transition: "transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s ease",
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
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    background: a.bg,
                    color: a.c,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.15rem",
                    marginBottom: 18,
                  }}
                >
                  <Icon aria-hidden />
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 6px" }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)", margin: "0 0 24px" }}>{desc}</p>
                <PromptPill>{prompt}</PromptPill>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
