"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollRevealText from "./ScrollRevealText";

gsap.registerPlugin(ScrollTrigger);

/* ── Shared card header: pill + headline + one-liner ── */
function CardHeader({
  pill,
  headline,
  body,
  dark = false,
  pillColor,
}: {
  pill: string;
  headline: React.ReactNode;
  body: string;
  dark?: boolean;
  pillColor?: string;
}) {
  return (
    <div style={{ padding: "28px 24px 0" }}>
      {pillColor ? (
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: pillColor,
          }}
        >
          {pill}
        </span>
      ) : (
        <span
          style={{
            display: "inline-block",
            fontSize: "10px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            padding: "5px 12px",
            borderRadius: "100px",
            background: dark ? "rgba(255, 255, 255, 0.15)" : "rgba(32, 110, 85, 0.06)",
            backdropFilter: dark ? "blur(12px)" : "none",
            WebkitBackdropFilter: dark ? "blur(12px)" : "none",
            color: dark ? "rgba(255, 255, 255, 0.8)" : "#206E55",
          }}
        >
          {pill}
        </span>
      )}
      <h3
        className="card-headline"
        style={{
          fontSize: "clamp(20px, 3vw, 24px)",
          fontWeight: 500,
          color: dark ? "#FAF9F5" : "#1C1917",
          letterSpacing: "-0.02em",
          marginTop: "12px",
          lineHeight: 1.25,
        }}
      >
        {headline}
      </h3>
      <p
        style={{
          fontSize: "15px",
          lineHeight: 1.5,
          color: dark ? "rgba(250, 249, 245, 0.75)" : "rgba(28, 25, 23, 0.45)",
          marginTop: "8px",
          fontWeight: 400,
        }}
      >
        {body}
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Card 1 — Memory (Remembers You)
   Creative: ethereal blue photo with floating glass pills
─────────────────────────────────────────────────────────────── */
function MemoryCard() {
  return (
    <div
      style={{
        borderRadius: "16px",
        position: "relative",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Image
        src="/images/memory-card.webp"
        alt="August remembers your symptoms, allergies, questions, and medications"
        className="md:hidden"
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          display: "block",
        }}
        width={640}
        height={800}
        sizes="100vw"
      />
      <Image
        src="/images/memory-card-desktop.webp"
        alt="August remembers your symptoms, allergies, questions, and medications"
        className="hidden md:block"
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
        }}
        width={800}
        height={1000}
        sizes="(max-width: 1200px) 50vw, 400px"
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <CardHeader
          dark
          pillColor="#8bbad4"
          pill="Remembers You"
          headline="It knows your history"
          body=""
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Card 2 — Plain Language (Clarity)
   Creative: lab results chart + plain-language explanation
─────────────────────────────────────────────────────────────── */
function ClarityCard() {
  return (
    <div
      style={{
        borderRadius: "16px",
        position: "relative",
        height: "100%",
        overflow: "hidden",
        background: "#FAF9F5",
        border: "1px solid rgba(28, 25, 23, 0.06)",
      }}
    >
      <Image
        src="/images/plain-language-card.webp"
        alt="Lab results explained in plain language, thyroid slightly low, blood sugar borderline"
        className="md:hidden"
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          display: "block",
        }}
        width={640}
        height={800}
        sizes="100vw"
      />
      <Image
        src="/images/plain-language-card-desktop.webp"
        alt="Lab results explained in plain language, thyroid slightly low, blood sugar borderline"
        className="hidden md:block"
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
        }}
        width={800}
        height={1000}
        sizes="(max-width: 1200px) 33vw, 300px"
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <CardHeader
          pillColor="#9b8ec4"
          pill="Plain Language"
          headline={<>Clarity,<br />not confusion.</>}
          body=""
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Card 3 — Proactive Care
   Creative: warm photo with proactive message bubble
─────────────────────────────────────────────────────────────── */
function ProactiveCareCard() {
  return (
    <div
      style={{
        borderRadius: "16px",
        position: "relative",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Image
        src="/images/proactive-care-card.webp"
        alt="August proactively connects your symptoms, fatigue linked to TSH levels"
        className="md:hidden"
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          display: "block",
        }}
        width={640}
        height={800}
        sizes="100vw"
      />
      <Image
        src="/images/proactive-care-card-desktop.webp"
        alt="August proactively connects your symptoms, fatigue linked to TSH levels"
        className="hidden md:block"
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
        }}
        width={800}
        height={1000}
        sizes="(max-width: 1200px) 33vw, 300px"
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <CardHeader
          dark
          pillColor="#d4a574"
          pill="Proactive Care"
          headline={<>Check-ins<br />that matter.</>}
          body=""
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Card 4 — Always Here (bottom-right, spans 2 cols)
─────────────────────────────────────────────────────────────── */
function AlwaysHereCard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const peaks = isMobile
    ? [
        { x: 80, y: 25, label: "Chest Tight" },
        { x: 250, y: 35, label: "Dizzy Again" },
        { x: 420, y: 20, label: "Mom\u2019s BP" },
      ]
    : [
        { x: 90, y: 25, label: "Chest Tight" },
        { x: 220, y: 40, label: "Dizzy Again" },
        { x: 340, y: 20, label: "Mom\u2019s BP" },
        { x: 450, y: 28, label: "Rash Spread" },
      ];

  const pulsePath = isMobile
    ? "M 20,100 L 55,100 Q 65,100 72,60 Q 80,25 88,60 Q 95,100 110,100 L 220,100 Q 232,100 240,65 Q 250,35 260,65 Q 268,100 280,100 L 390,100 Q 402,100 410,55 Q 420,20 430,55 Q 438,100 450,100 L 480,100"
    : "M 20,100 L 70,100 Q 80,100 85,60 Q 90,25 95,60 Q 100,100 110,100 L 200,100 Q 210,100 215,65 Q 220,40 225,65 Q 230,100 240,100 L 320,100 Q 330,100 335,55 Q 340,20 345,55 Q 350,100 360,100 L 430,100 Q 440,100 445,58 Q 450,28 455,58 Q 460,100 470,100 L 480,100";

  const hours = isMobile
    ? [
        { x: 20, label: "12am" },
        { x: 80, label: "3am" },
        { x: 155, label: "6am" },
        { x: 250, label: "12pm" },
        { x: 345, label: "6pm" },
        { x: 420, label: "9pm" },
        { x: 480, label: "12am" },
      ]
    : [
        { x: 20, label: "12am" },
        { x: 90, label: "3am" },
        { x: 155, label: "6am" },
        { x: 250, label: "12pm" },
        { x: 345, label: "6pm" },
        { x: 415, label: "9pm" },
        { x: 480, label: "12am" },
      ];

  const moonEnd = isMobile ? 446 : 446;

  return (
    <div
      style={{
        borderRadius: "16px",
        background: "#FAF9F5",
        border: "1px solid rgba(28, 25, 23, 0.06)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <CardHeader
        pillColor="#c47e8e"
        pill="Always Here"
        headline={<>Real answers at 3am,<br />not just a search bar.</>}
        body=""
      />

      {/* Pulse timeline visualization */}
      <div style={{ marginTop: "32px", position: "relative", padding: "0 20px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>

        {/* SVG pulse line with dots */}
        <div style={{ position: "relative", width: "100%" }}>
          <svg
            viewBox="0 0 500 140"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "auto", overflow: "visible", display: "block" }}
          >
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CACECD" stopOpacity="1" />
                <stop offset="100%" stopColor="#CACECD" stopOpacity="1" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="glowDot">
                <stop offset="0%" stopColor="#7cc49e" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#7cc49e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#7cc49e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Baseline */}
            <line x1="20" y1="100" x2="480" y2="100" stroke="#CACECD" strokeWidth="1" />

            {/* Moon icon — near midnight */}
            <image href="/images/moon-icon.webp" x={isMobile ? 26 : 40} y={isMobile ? 73 : 78} width={isMobile ? 28 : 20} height={isMobile ? 28 : 20} opacity="0.35" />

            {/* Sun icon — near noon */}
            <image href="/images/sun-icon.webp" x="236" y={isMobile ? 73 : 78} width={isMobile ? 28 : 20} height={isMobile ? 28 : 20} opacity="0.35" />

            {/* Moon icon — near night end */}
            <image href="/images/moon-icon.webp" x={isMobile ? moonEnd : 468} y={isMobile ? 73 : 78} width={isMobile ? 28 : 20} height={isMobile ? 28 : 20} opacity="0.35" />

            {/* Pulse path */}
            <path
              d={pulsePath}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Glow line (same path, blurred) */}
            <path
              d={pulsePath}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.15"
              filter="url(#glow)"
            />

            {/* Dots at peaks with labels */}
            {peaks.map((dot, i) => (
              <g key={i}>
                <circle cx={dot.x} cy={dot.y} r={isMobile ? 12 : 8} fill="url(#glowDot)" />
                <text
                  x={dot.x}
                  y={dot.y - (isMobile ? 18 : 14)}
                  textAnchor="middle"
                  fontSize={isMobile ? 18 : 13}
                  fill="#7cc49e"
                  fontWeight="500"
                  fontStyle="normal"
                >
                  {dot.label}
                </text>
              </g>
            ))}

            {/* Hour labels */}
            {hours.map((h, i) => (
              <text
                key={i}
                x={h.x}
                y="128"
                textAnchor="middle"
                fontSize={isMobile ? 16 : 12}
                fill="#CACECD"
                fontWeight="500"
              >
                {h.label}
              </text>
            ))}
          </svg>
        </div>

      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main — Bento grid
─────────────────────────────────────────────────────────────── */
export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll<HTMLElement>("[data-bento]");

    // Cascading waterfall — each card rises from a different height
    const yOffsets = [80, 60, 100, 50];

    // Set initial state
    cards.forEach((card, i) => {
      gsap.set(card, { opacity: 0, y: yOffsets[i] ?? 60, scale: 0.97 });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });

    cards.forEach((card, i) => {
      tl.to(
        card,
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" },
        i * 0.15 // stagger position in timeline
      );
    });
  }, []);

  return (
    <section className="bg-cream py-12 md:py-20 lg:py-24">
      <div ref={sectionRef} className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-12">
        {/* Section header */}
        <div className="text-center mb-8 md:mb-20">
          <ScrollRevealText
            as="h2"
            className="mx-auto max-w-2xl text-text-primary"
            style={{
              fontSize: "clamp(28px, 4vw, 38px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              textWrap: "balance" as React.CSSProperties["textWrap"],
            }}
            highlight={{ range: [2, 3], color: "#206E55", italic: false }}
          >
            Healthcare designed around you, not the other way around
          </ScrollRevealText>
          <p
            className="mx-auto mt-2 max-w-lg text-text-secondary"
            style={{ fontSize: "clamp(15px, 2vw, 17px)", fontWeight: 300, lineHeight: 1.6 }}
          >
            Every feature built to make health feel simple, personal, and always within&nbsp;reach.
          </p>
        </div>

        {/* Bento grid — vertical stack on mobile, bento on desktop */}
        <div
          className="bento-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "16px",
          }}
        >
          <style jsx>{`
            .bento-card {
              aspect-ratio: 4 / 4.5;
              width: 100%;
            }
            @media (min-width: 768px) {
              .bento-grid {
                grid-template-columns: 48% 1fr 1fr !important;
                grid-template-rows: 340px 340px !important;
              }
              .bento-card {
                aspect-ratio: unset !important;
                height: auto !important;
              }
            }
          `}</style>

          {/* Card 1 — Memory (spans 2 rows on desktop) */}
          <div data-bento className="bento-card md:row-span-2">
            <MemoryCard />
          </div>

          {/* Card 2 — Clarity */}
          <div data-bento className="bento-card">
            <ClarityCard />
          </div>

          {/* Card 3 — Proactive Care */}
          <div data-bento className="bento-card">
            <ProactiveCareCard />
          </div>

          {/* Card 4 — Always Here (spans 2 cols on desktop) */}
          <div data-bento className="md:col-span-2">
            <AlwaysHereCard />
          </div>
        </div>

      </div>
    </section>
  );
}
