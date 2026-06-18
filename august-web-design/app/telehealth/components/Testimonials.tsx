"use client";

/* Reviews — desktop grid / mobile swipe carousel. */

import { useEffect, useRef, useState } from "react";
import { StarIcon } from "@phosphor-icons/react/ssr";

import SectionHead from "./SectionHead";

const QUOTES = [
  { name: "Patricia", text: "The whole process was incredibly easy. I didn't sit in a waiting room or rearrange my day. The physician actually listened, and my prescription was sent the same day." },
  { name: "Angela", text: "A very insightful, thorough evaluation. I felt like August gave me more attention and listened better than any doctor I've seen in the past five years." },
  { name: "Patrick", text: "Best online doctor experience I've had. A few questions, then I was talking with a real doctor. Prescriptions sent to my local pharmacy within the hour." },
  { name: "Jodella", text: "$39, no joke, did exactly what other companies charge $129 for. A friendly doctor who called in my medicine in minutes." },
  { name: "Molly", text: "Five stars. Very helpful. The AI confirmed I'd only strained a muscle, so I didn't even need the doctor today." },
  { name: "Sam", text: "It's 4:39am and I was worried about my health. I'm so glad I had this to help me think it through calmly." },
];

function TestiCard({ q }: { q: { name: string; text: string } }) {
  return (
    <div
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: "var(--radius-xl)",
        padding: "clamp(28px,4vw,36px)",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)",
        transition: "transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)";
      }}
    >
      <svg width="36" height="28" viewBox="0 0 36 28" fill="none" style={{ marginBottom: 12, flexShrink: 0 }} aria-hidden>
        <path
          d="M0 28V17.5C0 12.833 1.167 9.083 3.5 6.25C5.833 3.417 9.167 1.5 13.5 0.5L15 3.5C12.667 4.333 10.833 5.583 9.5 7.25C8.167 8.917 7.5 10.833 7.5 13H14V28H0ZM22 28V17.5C22 12.833 23.167 9.083 25.5 6.25C27.833 3.417 31.167 1.5 35.5 0.5L37 3.5C34.667 4.333 32.833 5.583 31.5 7.25C30.167 8.917 29.5 10.833 29.5 13H36V28H22Z"
          fill="rgba(0,0,0,0.08)"
        />
      </svg>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--text-primary)", margin: "0 0 24px", flex: 1 }}>{q.text}</p>
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{q.name}</span>
        <div style={{ display: "flex", gap: 2, color: "var(--brand-primary)" }}>
          {[0, 1, 2, 3, 4].map((s) => (
            <StarIcon key={s} weight="fill" style={{ fontSize: "0.75rem" }} aria-hidden />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;
    const container = scrollRef.current;
    const onScroll = () => {
      const children = Array.from(container.children).filter((c) => c.tagName !== "STYLE") as HTMLElement[];
      const center = container.scrollLeft + container.offsetWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      children.forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIdx(closest);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  return (
    <section style={{ background: "var(--aug-white)", padding: "var(--section-pad) 0" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div data-anim="fade-up">
          <SectionHead
            center
            eyebrow="From happy users"
            title="Clarity, when it matters most"
            sub="Real stories from people who turned to August for answers, and got them."
          />
        </div>
        {isMobile ? (
          <>
            <div
              ref={scrollRef}
              className="aug-testi-swipe"
              style={{
                display: "flex",
                gap: 14,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                paddingBottom: 8,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style>{`.aug-testi-swipe::-webkit-scrollbar { display: none; }`}</style>
              {QUOTES.map((q) => (
                <div key={q.name} style={{ flex: "0 0 85%", scrollSnapAlign: "center", display: "flex" }}>
                  <TestiCard q={q} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
              {QUOTES.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === activeIdx ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === activeIdx ? "var(--brand-primary)" : "rgba(0,0,0,0.12)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div
            className="aug-testi-grid"
            data-stagger
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(16px,2.5vw,20px)" }}
          >
            {QUOTES.map((q) => (
              <TestiCard key={q.name} q={q} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
