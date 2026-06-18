"use client";

/* "Healthcare that finally works for you" — 3-slide carousel.
   Each slide: heading + sub + CTA on left, product mockup on right.
   Left/right arrows on sides, dot indicators at bottom. */

import { useState, useCallback } from "react";
import { ArrowRightIcon, PillIcon, SyringeIcon, Sparkle } from "@phosphor-icons/react/ssr";

import { CONSULT_PRICE_LABEL } from "@/lib/config";
import { CHAT_HREF } from "../constants";
import SectionHead from "./SectionHead";
import Button from "./Button";

/* ── Mockup illustrations (right pane of each slide) ── */

/* ── Shared right-pane: soft gradient + single frosted card ── */
function MockupShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "linear-gradient(160deg, #c2ddd0 0%, #d4e8df 30%, #bdd8cc 55%, #d0e5da 80%, #e4f1ea 100%)",
      borderRadius: "var(--radius-xl)",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Single subtle glow for depth — nothing more */}
      <div style={{ position: "absolute", top: "15%", right: "10%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.25)", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.25)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.4)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        padding: 24,
        width: "82%",
        maxWidth: 300,
        position: "relative",
        zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}

function MockupChat() {
  return (
    <MockupShell>
      {/* User bubble */}
      <div style={{
        background: "var(--brand-primary)",
        color: "#fff",
        borderRadius: "16px 16px 4px 16px",
        padding: "10px 14px",
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.45,
        marginBottom: 14,
        marginLeft: "auto",
        maxWidth: "88%",
        width: "fit-content",
      }}>
        I&apos;ve had a sore throat for 3 days and a mild fever.
      </div>

      {/* August reply */}
      <div style={{
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "16px 16px 16px 4px",
        padding: "12px 14px",
        fontSize: 13,
        lineHeight: 1.55,
        color: "var(--text-primary)",
        marginBottom: 14,
      }}>
        <div style={{ marginBottom: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/august-logo.svg" alt="August" width={40} height={12} style={{ display: "block", objectFit: "contain" }} />
        </div>
        I&apos;ll ask a few questions. How high has your fever been, and do you have difficulty swallowing?
      </div>

      {/* Quick-reply chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Mild, around 100.4°F", "Yes, it hurts"].map((t) => (
          <span key={t} style={{
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: 20,
            padding: "6px 14px",
            fontSize: 12,
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}>
            {t}
          </span>
        ))}
      </div>
    </MockupShell>
  );
}

function MockupDoctor() {
  return (
    <MockupShell>
      {/* Recommendation */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        marginBottom: 18, fontSize: 13, lineHeight: 1.55, color: "var(--text-primary)",
      }}>
        <Sparkle size={18} weight="regular" style={{ color: "var(--brand-primary)", flexShrink: 0, marginTop: 1 }} />
        <span>Based on your symptoms, I recommend connecting you with a doctor.</span>
      </div>

      {/* Doctor card */}
      <div style={{
        background: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.45)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/telehealth/doctor-sarah.png" alt="" style={{
          width: 52, height: 52, borderRadius: "50%", objectFit: "cover", objectPosition: "center 20%",
          border: "2px solid rgba(255,255,255,0.4)",
        }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Dr. Sarah Mitchell</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>Board-certified physician</div>
        </div>
        <div style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 10,
          padding: "8px 20px", fontSize: 12, fontWeight: 500, marginTop: 4,
          color: "var(--text-secondary)",
        }}>
          Starting from {CONSULT_PRICE_LABEL}
        </div>
      </div>
    </MockupShell>
  );
}

function MockupPrescription() {
  return (
    <MockupShell>
      {/* Recommendation */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        marginBottom: 16, fontSize: 13, lineHeight: 1.55, color: "var(--text-primary)",
      }}>
        <Sparkle size={18} weight="regular" style={{ color: "var(--brand-primary)", flexShrink: 0, marginTop: 1 }} />
        <span>Based on your history, I recommend the following medications</span>
      </div>

      {/* Prescription list */}
      <div style={{
        background: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.45)",
        borderRadius: 16,
        padding: "18px 20px",
        marginBottom: 18,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Prescription</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-primary)" }}>
            <PillIcon size={16} weight="duotone" style={{ color: "var(--brand-primary)", flexShrink: 0 }} /> Amoxicillin 500mg
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-primary)" }}>
            <SyringeIcon size={16} weight="duotone" style={{ color: "var(--brand-primary)", flexShrink: 0 }} /> Cortisone 40mg
          </div>
        </div>
      </div>

      {/* Doctor stamp */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/telehealth/doctor-sarah.png" alt="" style={{
          width: 36, height: 36, borderRadius: "50%", objectFit: "cover", objectPosition: "center 20%",
          border: "2px solid rgba(255,255,255,0.4)", flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Dr. Sarah Mitchell</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Approved your prescription</div>
        </div>
      </div>
    </MockupShell>
  );
}

const SLIDES = [
  {
    h: "Chat with August about your symptoms",
    p: "Tell August how you\u2019re feeling in plain words. It listens, asks a few gentle questions, and helps make sense of your symptoms. Free, anytime.",
    Mockup: MockupChat,
  },
  {
    h: "See a licensed doctor, if you need one",
    p: `If a doctor would help, we match you with a clinician licensed in your state. Starting from ${CONSULT_PRICE_LABEL}, no membership, no surprise bills.`,
    Mockup: MockupDoctor,
  },
  {
    h: "Prescriptions without the waiting room",
    p: "When appropriate, your prescription goes straight to your pharmacy, along with a clear care plan you can keep and revisit.",
    Mockup: MockupPrescription,
  },
];

function NavArrow({ direction, onClick, disabled }: { direction: "left" | "right"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Previous slide" : "Next slide"}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
    >
      <ArrowRightIcon
        size={16}
        weight="bold"
        style={{
          color: "var(--text-primary)",
          transform: direction === "left" ? "rotate(180deg)" : "none",
        }}
      />
    </button>
  );
}

export default function Compare() {
  const [active, setActive] = useState(0);
  const slide = SLIDES[active];

  const prev = useCallback(() => setActive((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setActive((i) => Math.min(SLIDES.length - 1, i + 1)), []);

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

        {/* Slide with arrows */}
        <div style={{ position: "relative" }}>
          {/* Left arrow */}
          <div className="aug-compare-arrows" style={{ position: "absolute", left: -56, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
            <NavArrow direction="left" onClick={prev} disabled={active === 0} />
          </div>

          {/* Right arrow */}
          <div className="aug-compare-arrows" style={{ position: "absolute", right: -56, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
            <NavArrow direction="right" onClick={next} disabled={active === SLIDES.length - 1} />
          </div>

          {/* Slide card */}
          <div
            className="aug-compare-slide"
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-2xl)",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              height: 480,
              boxShadow: "0 4px 24px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)",
            }}
          >
            {/* Left: text */}
            <div style={{
              padding: "clamp(36px,5vw,56px) clamp(28px,4vw,48px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}>
              <h3 style={{
                fontSize: "clamp(24px,3.2vw,32px)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: "0 0 16px",
              }}>
                {slide.h}
              </h3>
              <p style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                margin: "0 0 32px",
                maxWidth: "42ch",
              }}>
                {slide.p}
              </p>
              <div>
                <Button
                  as="a"
                  href={CHAT_HREF}
                  variant="primary"
                  iconRight={<ArrowRightIcon aria-hidden />}
                >
                  Get started
                </Button>
              </div>
            </div>

            {/* Right: mockup */}
            <div style={{ padding: "clamp(20px,3vw,32px)", overflow: "hidden" }}>
              <slide.Mockup />
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === active ? "var(--brand-primary)" : "rgba(0,0,0,0.12)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
