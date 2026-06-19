"use client";

/* Reviews — 3 photo-background cards with left/right arrow navigation. */

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { StarIcon, ArrowRightIcon } from "@phosphor-icons/react/ssr";

import SectionHead from "./SectionHead";

const QUOTES = [
  { name: "Patricia", photo: "/images/telehealth/testi-1.png", pos: "center 20%", text: "The whole process was incredibly easy. I didn\u2019t sit in a waiting room or rearrange my day. The physician actually listened, and my prescription was sent the same day." },
  { name: "Patrick", photo: "/images/telehealth/testi-2.png", pos: "center 25%", text: "Best online doctor experience I\u2019ve had. A few questions, then I was talking with a real doctor. Prescriptions sent to my local pharmacy within the hour." },
  { name: "Angela", photo: "/images/telehealth/testi-4.png", pos: "center 60%", text: "A very insightful, thorough evaluation. I felt like August gave me more attention and listened better than any doctor I\u2019ve seen in the past five years." },
  { name: "Jodella", photo: "/images/telehealth/testi-6.png", pos: "center 15%", text: "$39, no joke, did exactly what other companies charge $129 for. A friendly doctor who called in my medicine in minutes." },
  { name: "Molly", photo: "/images/telehealth/testi-3.png", pos: "center 25%", text: "Five stars. Very helpful. The AI confirmed I\u2019d only strained a muscle, so I didn\u2019t even need the doctor today." },
  { name: "Sam", photo: "/images/telehealth/testi-5.png", pos: "center 30%", text: "It\u2019s 4:39am and I was worried about my health. I\u2019m so glad I had this to help me think it through calmly." },
];

function TestiCard({ q }: { q: (typeof QUOTES)[number] }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "var(--radius-2xl)",
        overflow: "hidden",
        aspectRatio: "3 / 4",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        cursor: "default",
        transition: "transform 0.3s cubic-bezier(.16,1,.3,1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Portrait photo */}
      <Image
        src={q.photo}
        alt=""
        fill
        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
        style={{ objectFit: "cover", objectPosition: q.pos }}
      />
      {/* Dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.05) 65%, transparent 80%)",
        }}
      />
      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "clamp(20px,3vw,32px)" }}>
        <p
          style={{
            fontSize: "clamp(15px,1.4vw,17px)",
            lineHeight: 1.55,
            color: "#fff",
            margin: "0 0 16px",
            fontWeight: 400,
          }}
        >
          &ldquo;{q.text}&rdquo;
        </p>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{q.name}</span>
        <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
          {[0, 1, 2, 3, 4].map((s) => (
            <StarIcon key={s} weight="fill" style={{ fontSize: "0.7rem", color: "#facc15" }} aria-hidden />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavArrow({ direction, onClick, disabled }: { direction: "left" | "right"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Previous" : "Next"}
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

export default function Testimonials() {
  const [offset, setOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const gap = 20;
  const maxOffset = QUOTES.length - visibleCount;

  const prev = useCallback(() => setOffset((o) => Math.max(0, o - 1)), []);
  const next = useCallback(() => setOffset((o) => Math.min(QUOTES.length - 1, o + 1)), []);

  // Touch swipe
  const touchStart = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  }, [next, prev]);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const containerW = trackRef.current.parentElement?.offsetWidth ?? 0;
      const isMobile = containerW <= 500;
      const count = isMobile ? 1 : 3;
      setVisibleCount(count);
      setCardWidth((containerW - gap * (count - 1)) / count);
      setOffset((o) => Math.min(o, QUOTES.length - count));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const translateX = -(offset * (cardWidth + gap));

  return (
    <section style={{ background: "var(--surface-elevated)", padding: "var(--section-pad) 0" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div data-anim="fade-up">
          <SectionHead
            center
            eyebrow="From happy users"
            title="Clarity, when it matters most"
            sub="Real stories from people who turned to August for answers, and got them."
          />
        </div>

        <div style={{ position: "relative" }}>
          {/* Desktop arrows */}
          <div className="aug-testi-arrows" style={{ position: "absolute", left: -56, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
            <NavArrow direction="left" onClick={prev} disabled={offset === 0} />
          </div>
          <div className="aug-testi-arrows" style={{ position: "absolute", right: -56, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
            <NavArrow direction="right" onClick={next} disabled={offset === maxOffset} />
          </div>

          {/* Sliding track */}
          <div style={{ overflow: "hidden", borderRadius: "var(--radius-2xl)" }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div
              ref={trackRef}
              style={{
                display: "flex",
                gap: gap,
                transform: `translateX(${translateX}px)`,
                transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                willChange: "transform",
              }}
            >
              {QUOTES.map((q) => (
                <div key={q.name} style={{ flex: `0 0 ${cardWidth}px`, minWidth: 0 }}>
                  <TestiCard q={q} />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {Array.from({ length: maxOffset + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setOffset(i)}
              aria-label={`View ${i + 1}`}
              style={{
                width: i === offset ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === offset ? "var(--brand-primary)" : "rgba(0,0,0,0.12)",
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
