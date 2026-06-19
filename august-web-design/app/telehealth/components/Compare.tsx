"use client";

/* "Healthcare that finally works for you" — 3-slide carousel.
   Each slide: heading + sub + CTA on left, product mockup on right.
   Left/right arrows on sides, dot indicators at bottom. */

import { useState, useEffect, useRef } from "react";
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
      padding: "clamp(20px, 3vw, 32px)",
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
        width: "88%",
        maxWidth: 320,
        position: "relative",
        zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}

// Reveals `total` blocks one at a time on a continuous loop: build up beat by
// beat → hold while fully shown → clear → rebuild. Keeps the mockup lively.
// Honors reduced-motion by showing everything statically.
function useStepReveal(total: number, gap = 480, hold = 2600, start = 250) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(total);
      return;
    }
    let n = 0;
    let timer = window.setTimeout(function tick() {
      n = n >= total ? 0 : n + 1; // reveal next block, or reset to blank after the hold
      setShown(n);
      const wait = n === total ? hold : n === 0 ? start : gap;
      timer = window.setTimeout(tick, wait);
    }, start);
    return () => window.clearTimeout(timer);
  }, [total, gap, hold, start]);
  return shown;
}

function MockupChat() {
  // A single looping timer drives a "conversation builds up" sequence:
  // 0 = blank → 1 = user msg → 2 = typing dots → 3 = reply → 4 = chips → loop.
  // Each visible element is conditionally rendered, so it animates in on mount
  // and never reserves empty space (no gaps). A fixed-height column keeps the
  // card from reflowing as messages are added.
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(4);
      return;
    }
    const order = [1, 2, 3, 4, 5, 0];              // step values, in sequence (chips appear one by one)
    const hold = [1200, 1500, 1400, 500, 2800, 500]; // 0.5s between the two reply messages
    let i = 0;
    let timer = window.setTimeout(function tick() {
      setStep(order[i]);
      const wait = hold[i];
      i = (i + 1) % order.length;
      timer = window.setTimeout(tick, wait);
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <MockupShell>
      <div className="aug-chatbody" style={{ display: "flex", flexDirection: "column", gap: 14, justifyContent: "flex-start" }}>
        {/* 1 — User message */}
        {step >= 1 && (
          <div className="aug-msg-in" style={{
            background: "var(--brand-primary)",
            color: "#fff",
            borderRadius: "16px 16px 4px 16px",
            padding: "10px 14px",
            fontSize: 13, fontWeight: 500, lineHeight: 1.45,
            marginLeft: "auto", maxWidth: "88%", width: "fit-content",
          }}>
            I&apos;ve had a sore throat for 3 days and a mild fever.
          </div>
        )}

        {/* 2 — Typing indicator (only while August is "typing") */}
        {step === 2 && (
          <div className="aug-msg-in" aria-hidden style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "16px 16px 16px 4px",
            padding: "12px 16px", width: "fit-content",
          }}>
            <span className="aug-chat-dot" />
            <span className="aug-chat-dot" />
            <span className="aug-chat-dot" />
          </div>
        )}

        {/* 3 — August reply */}
        {step >= 3 && (
          <div className="aug-msg-in" style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "16px 16px 16px 4px",
            padding: "12px 14px",
            fontSize: 13, lineHeight: 1.55, color: "var(--text-primary)",
          }}>
            <div style={{ marginBottom: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/august-logo.svg" alt="August" width={40} height={12} style={{ display: "block", objectFit: "contain" }} />
            </div>
            I&apos;ll ask a few questions. How high has your fever been, and do you have difficulty swallowing?
          </div>
        )}

        {/* 4 — Quick-reply chips */}
        {step >= 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            {["Mild, around 100.4°F", "Yes, it hurts"].map((t, idx) =>
              step >= 4 + idx ? (
                <span key={t} className="aug-msg-in" style={{
                  background: "var(--brand-primary)",
                  color: "#fff",
                  borderRadius: "16px 16px 4px 16px",
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.45,
                  maxWidth: "88%",
                  width: "fit-content",
                }}>
                  {t}
                </span>
              ) : null,
            )}
          </div>
        )}
      </div>
    </MockupShell>
  );
}

function MockupDoctor() {
  const shown = useStepReveal(2);
  return (
    <MockupShell>
      <div className="aug-docbody" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        {/* Recommendation */}
        {shown >= 1 && (
          <div className="aug-msg-in" style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            marginBottom: 18, fontSize: 13, lineHeight: 1.55, color: "var(--text-primary)",
          }}>
            <Sparkle size={18} weight="regular" style={{ color: "var(--brand-primary)", flexShrink: 0, marginTop: 1 }} />
            <span>Based on your symptoms, I recommend connecting you with a doctor.</span>
          </div>
        )}

        {/* Doctor card */}
        {shown >= 2 && (
          <div className="aug-msg-in" style={{
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
        )}
      </div>
    </MockupShell>
  );
}

function MockupPrescription() {
  const shown = useStepReveal(3);
  return (
    <MockupShell>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", minHeight: 270 }}>
      {/* Recommendation */}
      {shown >= 1 && (
      <div className="aug-msg-in" style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        marginBottom: 16, fontSize: 13, lineHeight: 1.55, color: "var(--text-primary)",
      }}>
        <Sparkle size={18} weight="regular" style={{ color: "var(--brand-primary)", flexShrink: 0, marginTop: 1 }} />
        <span>Based on your history, I recommend the following medications</span>
      </div>
      )}

      {/* Prescription list */}
      {shown >= 2 && (
      <div className="aug-msg-in" style={{
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
      )}

      {/* Doctor stamp */}
      {shown >= 3 && (
      <div className="aug-msg-in" style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
      )}
      </div>
    </MockupShell>
  );
}

const SLIDES = [
  {
    h: "Chat with August about your symptoms",
    p: "Tell August how you\u2019re feeling in plain words. It listens, asks the right questions, and helps make sense of your symptoms.",
    Mockup: MockupChat,
  },
  {
    h: "See a licensed doctor, if you need one",
    p: `We match you with a clinician licensed in your state. Starting from ${CONSULT_PRICE_LABEL}, no membership, no surprise bills.`,
    Mockup: MockupDoctor,
  },
  {
    h: "Prescriptions without the waiting room",
    p: "Your prescription goes straight to your pharmacy, along with a clear care plan you can keep and revisit anytime.",
    Mockup: MockupPrescription,
  },
];

const PEEK = 26;        // px each card peeks above the next
const ANCHOR_AT = 0.78; // progress at which the last card is fully stacked (rest = hold)

export default function Compare() {
  const stackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const stack = stackRef.current;
    const pin = pinRef.current;
    if (!stack || !pin) return;
    const N = SLIDES.length;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    let raf = 0;
    const apply = () => {
      raf = 0;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const vh = window.innerHeight;
      const totalScroll = stack.offsetHeight - pin.offsetHeight;
      const top = stack.getBoundingClientRect().top;
      const p = totalScroll > 0 ? Math.min(Math.max(-top / totalScroll, 0), 1) : 0;

      cardEls.current.forEach((c, i) => {
        if (!c) return;
        if (reduce) {
          // Static stacked layout — no scroll animation under reduced-motion.
          c.style.transform = "none";
          return;
        }
        if (i === 0) {
          c.style.transform = "translateY(-50%)";
          return;
        }
        const arrive = (i / (N - 1)) * ANCHOR_AT;
        const start = Math.max(0, arrive - 0.36);
        let y: number; // px offset added to the centred (-50%) base
        if (p <= start) y = vh; // waiting off-screen below
        else if (p >= arrive) y = i * PEEK; // stacked
        else y = vh + (i * PEEK - vh) * ease((p - start) / (arrive - start));
        c.style.transform = `translateY(calc(-50% + ${y.toFixed(1)}px))`;
      });
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section style={{ background: "var(--surface-elevated)", padding: "var(--section-pad) 0 clamp(110px,15vh,200px)" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div data-anim="fade-up">
          <SectionHead
            center
            eyebrow="Real care, not just answers"
            title="Healthcare that finally works for you"
            sub="From first question to care plan to prescription, in minutes."
          />
        </div>
      </div>

      {/* Scroll-driven stacking deck: a pinned frame fills the viewport while the
          cards slide up and stack; the last card anchors with the others peeking. */}
      <div className="aug-stack" ref={stackRef}>
        <div className="aug-stack-pin" ref={pinRef}>
          <div className="aug-stack-frame">
            {SLIDES.map((slide, i) => (
              <div
                key={i}
                ref={(el) => { cardEls.current[i] = el; }}
                className="aug-stack-card aug-compare-slide"
                style={{ zIndex: i + 1, transform: i === 0 ? "translateY(-50%)" : "translateY(calc(-50% + 1200px))" }}
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
                    margin: "0 0 24px",
                    maxWidth: "42ch",
                  }}>
                    {slide.p}
                  </p>
                  <div>
                    <Button as="a" href={CHAT_HREF} variant="primary" iconRight={<ArrowRightIcon aria-hidden />}>
                      Get started
                    </Button>
                  </div>
                </div>

                {/* Right: mockup */}
                <div style={{ padding: "clamp(20px,3vw,32px)", overflow: "hidden" }}>
                  <slide.Mockup />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
