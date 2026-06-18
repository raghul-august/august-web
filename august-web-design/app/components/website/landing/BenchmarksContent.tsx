"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Brain,
  GraduationCap,
  Books,
  ChartBar,
  ChatsCircle,
  FileText,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
} from "@phosphor-icons/react";
import ScrollRevealText from "./ScrollRevealText";
import BarChart from "./benchmarks/BarChart";
import MultiBarChart from "./benchmarks/MultiBarChart";
import LiquidImage from "./benchmarks/LiquidImage";

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────
   Shared tokens
─────────────────────────────────────────────────────────────── */
const glassCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.6)",
  borderRadius: "20px",
  boxShadow: [
    "inset 1px 1px 3px rgba(255,255,255,0.5)",
    "0 1px 20px rgba(159,147,125,0.08)",
    "0 12px 32px rgba(73,66,54,0.05)",
  ].join(", "),
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontWeight: 500,
  color: "rgba(28, 25, 23, 0.4)",
};

/* ────────────────────────────────────────────────────────────
   Tab navigation
─────────────────────────────────────────────────────────────── */
const TABS = [
  { id: "medical-knowledge", label: "Medical Knowledge", icon: Brain },
  { id: "usmle", label: "USMLE Performance", icon: GraduationCap },
  { id: "medqa", label: "MedQA Benchmark", icon: Books },
  { id: "mmlu", label: "MMLU Clinical", icon: ChartBar },
  { id: "conversational", label: "Conversational Diagnostics", icon: ChatsCircle },
  { id: "documents", label: "Document Processing", icon: FileText },
  { id: "safety", label: "Safety & Escalation", icon: ShieldCheck },
];

function BenchmarkSidebar() {
  const [activeTab, setActiveTab] = useState<string>("medical-knowledge");
  // Lock the active state for a short time after a click so the scroll
  // animation doesn't override it mid-scroll
  const lockUntilRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      // If we're locked (just clicked), don't update from scroll
      if (Date.now() < lockUntilRef.current) return;

      // If user is near the bottom, force-select the last tab
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200;
      if (nearBottom) {
        setActiveTab(TABS[TABS.length - 1].id);
        return;
      }

      // The active section is the last one whose anchor has crossed the
      // threshold (just below the nav bar)
      const offset = 200;
      let current = TABS[0].id;
      for (const tab of TABS) {
        const el = document.getElementById(tab.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) current = tab.id;
        }
      }
      setActiveTab(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id: string) => {
    setActiveTab(id);
    // Lock for 1.8s — slightly longer than Lenis's 1.5s scroll duration
    lockUntilRef.current = Date.now() + 1800;
  };

  return (
    <aside
      className="hidden lg:block self-start sticky"
      style={{ width: "240px", top: "120px", marginTop: "7rem" }}
    >
      <div>
        <div
          className="mb-6 pl-5"
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontWeight: 500,
            color: "rgba(28, 25, 23, 0.4)",
          }}
        >
          Contents
        </div>
        <nav
          className="flex flex-col"
          style={{ borderLeft: "1px solid rgba(28, 25, 23, 0.08)" }}
        >
          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.id;
            const number = String(i + 1).padStart(2, "0");
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={() => handleClick(tab.id)}
                className="group relative flex items-baseline gap-3 py-2.5 pl-5 transition-all duration-300"
              >
                {/* Active indicator line */}
                <span
                  className="absolute left-0 top-0 bottom-0 transition-all duration-300"
                  style={{
                    width: "2px",
                    background: "#206E55",
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "scaleY(1)" : "scaleY(0.4)",
                    transformOrigin: "center",
                  }}
                />
                <span
                  className="tabular-nums transition-colors duration-300"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    color: isActive ? "#206E55" : "rgba(28, 25, 23, 0.35)",
                    minWidth: "22px",
                  }}
                >
                  {number}
                </span>
                <span
                  className="transition-colors duration-300"
                  style={{
                    fontSize: "15px",
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "#1C1917" : "rgba(28, 25, 23, 0.55)",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.4,
                  }}
                >
                  {tab.label}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────────────────────
   Hero
─────────────────────────────────────────────────────────────── */
function BenchmarksHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    let width = 0;
    let height = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let rafId: number;

    /* Ripple pool — each cursor move spawns a ripple that expands + fades */
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      strength: number;
      life: number;
    }
    const ripples: Ripple[] = [];
    let lastSpawn = 0;

    const resize = () => {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      /* Spawn ripple every ~60px of movement */
      const now = Date.now();
      if (now - lastSpawn > 50) {
        ripples.push({
          x: mouseX,
          y: mouseY,
          radius: 0,
          maxRadius: 180,
          strength: 12,
          life: 1,
        });
        lastSpawn = now;
        /* Cap pool size */
        if (ripples.length > 20) ripples.shift();
      }
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    /* Compute displacement at a point from all active ripples */
    const getDisplacement = (
      px: number,
      py: number
    ): [number, number] => {
      let dx = 0;
      let dy = 0;
      for (const r of ripples) {
        const distX = px - r.x;
        const distY = py - r.y;
        const dist = Math.sqrt(distX * distX + distY * distY);
        /* Ring-shaped influence: strongest at the ripple edge */
        const ringDist = Math.abs(dist - r.radius);
        const ringWidth = 60;
        if (ringDist < ringWidth) {
          const factor =
            r.strength *
            r.life *
            Math.cos((ringDist / ringWidth) * (Math.PI / 2));
          const angle = Math.atan2(distY, distX);
          dx += Math.cos(angle) * factor;
          dy += Math.sin(angle) * factor;
        }
      }
      return [dx, dy];
    };

    const MAJOR = 80;
    const MINOR = 20;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      /* Update ripples */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.5;
        r.life *= 0.985;
        if (r.life < 0.01 || r.radius > r.maxRadius * 1.5) {
          ripples.splice(i, 1);
        }
      }

      const hasRipples = ripples.length > 0;
      const step = hasRipples ? 4 : 0; // Segment resolution for curves

      /* ── Minor grid lines ── */
      ctx.strokeStyle = "rgba(168, 213, 186, 0.06)";
      ctx.lineWidth = 0.5;

      /* Horizontal minor */
      for (let y = 0; y < height; y += MINOR) {
        if (y % MAJOR === 0) continue; // skip majors
        ctx.beginPath();
        if (hasRipples) {
          for (let x = 0; x <= width; x += step) {
            const [, dy] = getDisplacement(x, y);
            if (x === 0) ctx.moveTo(x, y + dy);
            else ctx.lineTo(x, y + dy);
          }
        } else {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      /* Vertical minor */
      for (let x = 0; x < width; x += MINOR) {
        if (x % MAJOR === 0) continue;
        ctx.beginPath();
        if (hasRipples) {
          for (let y = 0; y <= height; y += step) {
            const [dx] = getDisplacement(x, y);
            if (y === 0) ctx.moveTo(x + dx, y);
            else ctx.lineTo(x + dx, y);
          }
        } else {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        ctx.stroke();
      }

      /* ── Major grid lines ── */
      ctx.strokeStyle = "rgba(168, 213, 186, 0.12)";
      ctx.lineWidth = 0.5;

      /* Horizontal major */
      for (let y = 0; y < height; y += MAJOR) {
        ctx.beginPath();
        if (hasRipples) {
          for (let x = 0; x <= width; x += step) {
            const [, dy] = getDisplacement(x, y);
            if (x === 0) ctx.moveTo(x, y + dy);
            else ctx.lineTo(x, y + dy);
          }
        } else {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      /* Vertical major */
      for (let x = 0; x < width; x += MAJOR) {
        ctx.beginPath();
        if (hasRipples) {
          for (let y = 0; y <= height; y += step) {
            const [dx] = getDisplacement(x, y);
            if (y === 0) ctx.moveTo(x + dx, y);
            else ctx.lineTo(x + dx, y);
          }
        } else {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    };

    resize();
    rafId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-dark
      className="relative flex items-center justify-center overflow-hidden mx-4 sm:mx-6 xl:mx-auto"
      style={{
        minHeight: "0",
        height: "auto",
        paddingTop: "60px",
        paddingBottom: "60px",
        maxWidth: "1200px",
        marginTop: "140px",
        marginBottom: "0",
        borderRadius: "24px",
        background: "linear-gradient(165deg, #17453a 0%, #1d5c4a 25%, #206E55 50%, #2a8a6c 75%, #34a07e 100%)",
      }}
    >
      {/* Interactive ripple grid — light lines on dark */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />

        {/* Radial fade — grid dissolves toward edges into the dark bg */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 45%, transparent 0%, rgba(23, 69, 58, 0.6) 80%)",
          }}
        />

        {/* Subtle center glow — warm sage */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 40% 40% at 50% 45%, rgba(32, 110, 85, 0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-[1200px] px-6 text-center md:px-10 lg:px-20">
        <span
          className="eyebrow"
          style={{ color: "rgba(168, 213, 186, 0.7)" }}
        >
          Benchmark Performance
        </span>
        <ScrollRevealText
          as="h1"
          className="mx-auto max-w-3xl"
          style={{
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#FAF9F5",
          }}
        >
          Clinical Validation Through Rigorous Benchmarking
        </ScrollRevealText>
        <p
          className="mx-auto mt-2 max-w-2xl"
          style={{
            fontSize: "clamp(15px, 1.8vw, 18px)",
            fontWeight: 300,
            lineHeight: 1.7,
            color: "rgba(250, 249, 245, 0.6)",
          }}
        >
          August is evaluated against the same standardized tests used to train and license doctors. These aren&apos;t arbitrary metrics, they&apos;re the same assessments that determine whether someone is qualified to practice medicine.
          <br /><br />
          When you ask August about your health, you deserve to know the answers are backed by the same rigor that qualifies your doctor.
          <br /><br />
          Explore
          ↓
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Section wrapper — chapter style with number + eyebrow
─────────────────────────────────────────────────────────────── */
function BenchmarkSection({
  id,
  number,
  eyebrow,
  heading,
  children,
  background = "transparent",
}: {
  id: string;
  number: string;
  eyebrow: string;
  heading: React.ReactNode;
  children: React.ReactNode;
  background?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const els = section.querySelectorAll<HTMLElement>("[data-fade]");
    gsap.fromTo(
      els,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 lg:py-28"
      style={{ background }}
    >
      <div className="text-center lg:text-left">
        {/* Anchor target sits at the chapter label so smooth scroll lands here */}
        <div
          id={id}
          className="mb-6 md:mb-8 flex items-center justify-center lg:justify-start"
          data-fade
          style={{ opacity: 0, scrollMarginTop: "100px" }}
        >
          <div className="flex items-center gap-4">
            <span style={sectionLabelStyle}>{number}</span>
            <span
              className="hidden sm:block"
              style={{
                width: "32px",
                height: "1px",
                background: "rgba(28,25,23,0.15)",
              }}
            />
            <span style={{ ...sectionLabelStyle, color: "#206E55" }}>
              {eyebrow}
            </span>
          </div>
        </div>
        <div data-fade style={{ opacity: 0 }}>
          <h2
            className="text-text-primary max-w-3xl mx-auto lg:mx-0"
            style={{
              fontSize: "clamp(26px, 3.5vw, 36px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {heading}
          </h2>
        </div>
        <div data-fade style={{ opacity: 0 }}>
          {children}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Big stat block
─────────────────────────────────────────────────────────────── */
function SectionDescription({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-2 max-w-2xl text-text-secondary mx-auto lg:mx-0"
      style={{
        fontSize: "clamp(15px, 1.7vw, 18px)",
        fontWeight: 300,
        lineHeight: 1.75,
      }}
    >
      {children}
    </p>
  );
}

/* ────────────────────────────────────────────────────────────
   Comparison table — clean, August row highlighted
─────────────────────────────────────────────────────────────── */
type Row = {
  system: string;
  score: string;
  gap: string;
  highlight?: boolean;
};

function ComparisonTable({
  title,
  rows,
}: {
  title?: string;
  rows: Row[];
}) {
  return (
    <div className="mt-12">
      {title && (
        <div
          className="mb-4"
          style={{
            ...sectionLabelStyle,
            color: "rgba(28, 25, 23, 0.55)",
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          ...glassCard,
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-[1fr,auto,auto] md:grid-cols-[2fr,1fr,1fr] gap-4 px-5 md:px-8 py-4"
          style={{
            background: "rgba(28, 25, 23, 0.025)",
            borderBottom: "1px solid rgba(28, 25, 23, 0.05)",
          }}
        >
          <span style={sectionLabelStyle}>System</span>
          <span style={{ ...sectionLabelStyle, textAlign: "right" }}>Score</span>
          <span style={{ ...sectionLabelStyle, textAlign: "right" }}>
            <span className="hidden md:inline">August Advantage</span>
            <span className="md:hidden">Δ</span>
          </span>
        </div>
        {rows.map((row, i) => {
          const isAugust = row.highlight;
          return (
            <div
              key={i}
              className="grid grid-cols-[1fr,auto,auto] md:grid-cols-[2fr,1fr,1fr] gap-4 px-5 md:px-8 py-5 items-center transition-colors"
              style={{
                background: isAugust ? "rgba(32, 110, 85, 0.06)" : "transparent",
                borderBottom:
                  i < rows.length - 1
                    ? "1px solid rgba(28, 25, 23, 0.04)"
                    : "none",
              }}
            >
              <div className="flex items-center gap-3">
                {isAugust && (
                  <CheckCircle size={16} weight="fill" color="#206E55" />
                )}
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: isAugust ? 600 : 400,
                    color: isAugust ? "#206E55" : "#1C1917",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {row.system}
                </span>
              </div>
              <span
                className="text-right tabular-nums"
                style={{
                  fontSize: isAugust ? "20px" : "16px",
                  fontWeight: isAugust ? 600 : 400,
                  color: isAugust ? "#206E55" : "rgba(28, 25, 23, 0.7)",
                  letterSpacing: "-0.01em",
                }}
              >
                {row.score}
              </span>
              <span
                className="text-right tabular-nums"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: isAugust ? "#206E55" : "rgba(28, 25, 23, 0.4)",
                  letterSpacing: "-0.01em",
                }}
              >
                {row.gap}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Badge cards — for stat highlights
─────────────────────────────────────────────────────────────── */
type Badge = {
  label: string;
  metric: string;
  value: string;
  caption: string;
  color?: string;
};

function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <div className="mt-12 grid gap-5 md:grid-cols-2">
      {badges.map((b, i) => {
        const color = b.color || "#206E55";
        return (
          <div
            key={i}
            className="p-7 md:p-8"
            style={{
              ...glassCard,
              borderRadius: "20px",
            }}
          >
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{
                background: `${color}10`,
                border: `1px solid ${color}20`,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: color,
                }}
              >
                {b.label}
              </span>
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <div
                style={{
                  fontSize: "44px",
                  fontWeight: 300,
                  color: color,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {b.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "rgba(28, 25, 23, 0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {b.metric}
              </div>
            </div>
            <p
              className="mt-3 text-text-secondary"
              style={{
                fontSize: "14px",
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              {b.caption}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MMLU specialty table
─────────────────────────────────────────────────────────────── */
type SpecialtyRow = {
  category: string;
  august: string;
  competitor: string;
  result: string;
  why: string;
  isWin?: boolean;
  isPerfect?: boolean;
};

const MMLU_DATA: SpecialtyRow[] = [
  {
    category: "College Medicine",
    august: "95.1%",
    competitor: "91.9%",
    result: "+3.2 pp",
    why: "Treatment decisions",
    isWin: true,
  },
  {
    category: "Clinical Knowledge",
    august: "96.4%",
    competitor: "95.1%",
    result: "+1.4 pp",
    why: "Diagnostic reasoning",
    isWin: true,
  },
  {
    category: "Anatomy",
    august: "93.6%",
    competitor: "92.6%",
    result: "+1.0 pp",
    why: "Understanding symptoms",
    isWin: true,
  },
  {
    category: "Professional Medicine",
    august: "98.1%",
    competitor: "97.8%",
    result: "+0.3 pp",
    why: "Clinical practice",
    isWin: true,
  },
  {
    category: "College Biology",
    august: "99.3%",
    competitor: "99.3%",
    result: "TIE",
    why: "Foundational knowledge",
  },
  {
    category: "Medical Genetics",
    august: "100%",
    competitor: "100%",
    result: "PERFECT",
    why: "Hereditary risk",
    isPerfect: true,
  },
];

function MMLUTable() {
  return (
    <div className="mt-12">
      <div
        className="mb-4"
        style={{
          ...sectionLabelStyle,
          color: "rgba(28, 25, 23, 0.55)",
        }}
      >
        Specialty Breakdown — August vs GPT-5
      </div>
      <div
        style={{
          ...glassCard,
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr,2fr] gap-4 px-8 py-4"
          style={{
            background: "rgba(28, 25, 23, 0.025)",
            borderBottom: "1px solid rgba(28, 25, 23, 0.05)",
          }}
        >
          <span style={sectionLabelStyle}>Category</span>
          <span style={{ ...sectionLabelStyle, textAlign: "right" }}>August</span>
          <span style={{ ...sectionLabelStyle, textAlign: "right" }}>GPT-5</span>
          <span style={{ ...sectionLabelStyle, textAlign: "right" }}>Result</span>
          <span style={sectionLabelStyle}>Why It Matters</span>
        </div>
        {MMLU_DATA.map((row, i) => {
          const resultColor = row.isPerfect
            ? "#5B4B8A"
            : row.isWin
            ? "#206E55"
            : "rgba(28, 25, 23, 0.45)";
          return (
            <div
              key={i}
              className="grid md:grid-cols-[2fr,1fr,1fr,1fr,2fr] gap-2 md:gap-4 px-5 md:px-8 py-5"
              style={{
                borderBottom:
                  i < MMLU_DATA.length - 1
                    ? "1px solid rgba(28, 25, 23, 0.04)"
                    : "none",
              }}
            >
              {/* Mobile: stack everything */}
              <div className="md:contents">
                <div
                  className="flex items-center gap-3"
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "#1C1917",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {row.category}
                </div>
                <div className="flex md:hidden items-center gap-3 mt-2 mb-1">
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#206E55",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {row.august}
                  </span>
                  <span style={{ color: "rgba(28,25,23,0.3)" }}>vs</span>
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: "16px",
                      color: "rgba(28,25,23,0.5)",
                    }}
                  >
                    {row.competitor}
                  </span>
                  <span
                    className="ml-auto tabular-nums"
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: resultColor,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {row.result}
                  </span>
                </div>
                <span
                  className="hidden md:block text-right tabular-nums"
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#206E55",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {row.august}
                </span>
                <span
                  className="hidden md:block text-right tabular-nums"
                  style={{
                    fontSize: "16px",
                    color: "rgba(28, 25, 23, 0.5)",
                  }}
                >
                  {row.competitor}
                </span>
                <span
                  className="hidden md:block text-right tabular-nums"
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: resultColor,
                    letterSpacing: "0.04em",
                  }}
                >
                  {row.result}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 300,
                    color: "rgba(28, 25, 23, 0.55)",
                    lineHeight: 1.5,
                  }}
                >
                  {row.why}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Confusion matrix for safety section
─────────────────────────────────────────────────────────────── */
function ConfusionMatrix() {
  const cells = [
    {
      label: "True Positives",
      value: "41",
      desc: "Emergencies correctly identified",
      color: "#206E55",
      bg: "rgba(32, 110, 85, 0.06)",
    },
    {
      label: "False Positives",
      value: "0",
      desc: "False alarms",
      color: "#206E55",
      bg: "rgba(32, 110, 85, 0.06)",
    },
    {
      label: "False Negatives",
      value: "0",
      desc: "Missed emergencies",
      color: "#206E55",
      bg: "rgba(32, 110, 85, 0.06)",
    },
    {
      label: "True Negatives",
      value: "97",
      desc: "Non-emergencies correctly handled",
      color: "#206E55",
      bg: "rgba(32, 110, 85, 0.06)",
    },
  ];

  return (
    <div className="mt-12">
      <div
        className="mb-4 flex items-center justify-between"
        style={{
          ...sectionLabelStyle,
          color: "rgba(28, 25, 23, 0.55)",
        }}
      >
        <span>Test Results</span>
        <span>N = 138</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cells.map((cell, i) => (
          <div
            key={i}
            className="p-6 md:p-7"
            style={{
              ...glassCard,
              borderRadius: "20px",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(28, 25, 23, 0.45)",
                }}
              >
                {cell.label}
              </span>
              <CheckCircle size={18} weight="fill" color={cell.color} />
            </div>
            <div
              className="mt-4 tabular-nums"
              style={{
                fontSize: "56px",
                fontWeight: 300,
                color: cell.color,
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {cell.value}
            </div>
            <p
              className="mt-3 text-text-secondary"
              style={{ fontSize: "14px", fontWeight: 300, lineHeight: 1.5 }}
            >
              {cell.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Final CTA card
─────────────────────────────────────────────────────────────── */
function TalkToAugustCTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-[1100px] px-6 md:px-10 lg:px-12">
            <div
              className="relative overflow-hidden rounded-[28px] md:rounded-[32px] text-center"
              style={{ 
                minHeight: "420px",
                background: "#2a2724" // Slightly warmer fallback
              }}
            >
              {/* Liquid image background */}
              <div className="absolute inset-0 w-full h-full"> 
                <LiquidImage
                  src="/images/dreamy-bokeh.png"
                  alt="August Health background"
                  strength={0.08}
                  speed={0.14}
                  borderRadius={0}
                />
              </div>

            {/* Dark overlay — lightened significantly for vibrancy */}
            <div
              className="absolute inset-0 z-[1]"
              style={{ background: "rgba(0, 0, 0, 0.25)" }}
            />

          {/* Content overlay */}
          <div className="relative z-10 flex items-center justify-center p-10 md:p-16" style={{ minHeight: "420px" }}>
            <div>
              <span
                style={{
                  ...sectionLabelStyle,
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                Talk to August
              </span>
              <h2
                className="mx-auto mt-2 max-w-2xl text-white"
                style={{
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                Need medical answers right now?
              </h2>
              <p
                className="mx-auto mt-4 max-w-md"
                style={{
                  color: "rgba(255, 255, 255, 0.75)",
                  fontSize: "clamp(15px, 1.8vw, 18px)",
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                For instant 24/7 medical guidance, reach out to August.
              </p>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://app.meetaugust.ai/join/wa?utm=landing_page_cta"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-green-primary transition-transform duration-300 hover:scale-[1.03]"
                  style={{ fontSize: "16px", fontWeight: 600 }}
                >
                  Talk to August
                  <ArrowRight size={14} weight="bold" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Page composition
─────────────────────────────────────────────────────────────── */
export default function BenchmarksContent() {
  return (
    <div className="bg-cream">
      <BenchmarksHero />

      {/* Spacing + divider between hero and content */}
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-12 mt-16 md:mt-20">
        <div
          style={{
            height: "1px",
            background: "rgba(28, 25, 23, 0.08)",
          }}
        />
      </div>

      {/* 2-column layout: sticky sidebar + scrollable content */}
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-12">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-16 relative">
          <BenchmarkSidebar />
          <div
            className="min-w-0 relative lg:pl-12"
            style={{
              borderLeft: undefined,
            }}
          >
            {/* Vertical divider line on the left of content (desktop only) */}
            <div
              className="hidden lg:block absolute top-0 bottom-0"
              style={{
                left: "0",
                width: "1px",
                background: "rgba(28, 25, 23, 0.08)",
              }}
            />

      {/* 01 — Medical Knowledge */}
      <BenchmarkSection
        id="medical-knowledge"
        number="01"
        eyebrow="Medical Knowledge"
        heading={<>Medical Knowledge</>}
      >
        <SectionDescription>
          August delivers clinical responses validated against the same rigorous standards used in physician training and medical licensure, ensuring professional-grade accuracy in healthcare information delivery.
          <br /><br />
          August achieves 97% accuracy on MedQA, 12,000+ authentic medical licensing questions, outperforming general-purpose models through specialized clinical architecture.
        </SectionDescription>
        <div className="mt-8 mb-4 text-xs font-medium text-text-muted opacity-60">
          Medical Knowledge benchmark comparing August vs GPT-5, Claude 4.5 Sonnet, Gemini 2.5 Pro, and GPT-4o on MedQA and USMLE
        </div>
        <MultiBarChart
          min={85}
          max={100}
          series={["August", "GPT-5", "Claude 4.5 Sonnet", "Gemini 2.5 Pro", "GPT-4o"]}
          groups={[
            { label: "MedQA", values: [97, 95.8, 94.7, 93.2, 88.1] },
            { label: "USMLE", values: [100, 97.0, 97.2, 90.1, 92.3] },
          ]}
        />
      </BenchmarkSection>

      {/* 02 — USMLE */}
      <BenchmarkSection
        id="usmle"
        number="02"
        eyebrow="USMLE Performance"
        heading={<>USMLE Performance</>}
        background="linear-gradient(180deg, transparent 0%, rgba(232, 245, 233, 0.3) 50%, transparent 100%)"
      >
        <SectionDescription>
          The United States Medical Licensing Examination is the test every doctor must pass before they can practice medicine in United States. It&apos;s the gold standard for medical knowledge.
          <br /><br />
          August achieves 100% accuracy on the USMLE, compared to 60% first-attempt pass rates for human medical graduates, demonstrating the same qualification on diagnosis, treatment, and medical decision-making that separates qualified doctors from everyone else.
        </SectionDescription>
        <div className="mt-8 mb-4 text-xs font-medium text-text-muted opacity-60">
          USMLE benchmark showing August at 100%, compared to GPT-5, Claude 4.5 Sonnet, Gemini 2.5 Pro, GPT-4o, and August (2023)
        </div>
        <BarChart
          axisMin={85}
          maxValue={100}
          data={[
            { label: "August", value: 100, displayValue: "100%", highlight: true },
            { label: "Claude 4.5 Sonnet", value: 97.2, displayValue: "97.2%" },
            { label: "GPT-5", value: 97.0, displayValue: "97.0%" },
            { label: "GPT-4o", value: 92.3, displayValue: "92.3%" },
            { label: "Gemini 2.5 Pro", value: 90.1, displayValue: "90.1%" },
          ]}
        />
      </BenchmarkSection>

      {/* 03 — MedQA */}
      <BenchmarkSection
        id="medqa"
        number="03"
        eyebrow="MedQA Benchmark"
        heading={<>MedQA Benchmark</>}
      >
        <SectionDescription>
          A collection of 12,000+ real medical board exam questions from the US, China, and Taiwan, covering everything from rare diseases to common conditions, diagnostic reasoning to treatment plans.
          <br /><br />
          August outperforms GPT-5 by +1.5 pp and Gemini by +4.2 pp because August has been tested on thousands of real-world medical scenarios. August doesn&apos;t guess, and it has been validated against the same questions doctors use to get licensed.
        </SectionDescription>
        <div className="mt-8 mb-4 text-xs font-medium text-text-muted opacity-60">
          MedQA benchmark showing August leading with 97.36% accuracy
        </div>
        <BarChart
          axisMin={85}
          maxValue={100}
          data={[
            { label: "August", value: 97.4, displayValue: "97.4%", highlight: true },
            { label: "GPT-5", value: 95.8, displayValue: "95.8%" },
            { label: "Claude 4.5 Sonnet", value: 94.7, displayValue: "94.7%" },
            { label: "Gemini 2.5 Pro", value: 93.2, displayValue: "93.2%" },
            { label: "GPT-4o", value: 88.1, displayValue: "88.1%" },
          ]}
        />
      </BenchmarkSection>

      {/* 04 — MMLU */}
      <BenchmarkSection
        id="mmlu"
        number="04"
        eyebrow="MMLU Clinical"
        heading={<>MMLU Clinical Benchmarks</>}
        background="linear-gradient(180deg, transparent 0%, rgba(232, 245, 233, 0.3) 50%, transparent 100%)"
      >
        <SectionDescription>
          A comprehensive test across six medical specialties: anatomy, genetics, clinical knowledge, professional medicine, college biology, and college medicine.
          <br /><br />
          August maintains 94% accuracy across all clinical categories because your health questions don&apos;t fit into neat boxes. So whether your question is about your thyroid, your genes, or your child&apos;s development, you get the same level of reliability.
        </SectionDescription>
        <div className="mt-8 mb-4 text-xs font-medium text-text-muted opacity-60">
          MMLU Clinical benchmark breakdown across Anatomy, Clinical Knowledge, College Biology, College Medicine, Medical Genetics, and Professional Medicine
        </div>
        <MultiBarChart
          min={85}
          max={100}
          series={["August", "GPT-5", "Claude 4.5 Sonnet", "Gemini 2.5 Pro", "GPT-4o"]}
          showValues={false}
          groups={[
            { label: "College Medicine", values: [95.1, 91.9, 92.5, 89.6, 87.8] },
            { label: "Clinical Knowledge", values: [96.4, 95.1, 94.3, 92.8, 90.4] },
            { label: "Anatomy", values: [93.6, 92.6, 92.1, 90.4, 88.9] },
            { label: "Professional Medicine", values: [98.1, 97.8, 96.9, 95.5, 93.7] },
            { label: "College Biology", values: [99.3, 99.3, 98.8, 97.6, 96.2] },
            { label: "Medical Genetics", values: [100, 100, 99.4, 98.1, 96.8] },
          ]}
        />
      </BenchmarkSection>

      {/* 05 — Conversational */}
      <BenchmarkSection
        id="conversational"
        number="05"
        eyebrow="Conversational Diagnostics"
        heading={<>Conversational Diagnostics</>}
      >
        <SectionDescription>
          Most benchmarks test whether an AI can select the right answer from a list, rather than converse with a patient, ask the right questions, and reach a diagnosis the way a doctor does. We developed an in-house methodology to evaluate this across 400 clinical vignettes spanning 14 medical specialties—a peer-reviewed framework that simulates real clinical conversations.
          <br /><br />
          August achieves 87% diagnostic accuracy in multi-turn clinical conversations, +21 pp over GPT-5, and 97% triage accuracy, ensuring patients are routed to the right level of care. Evaluated using our proprietary in-house methodology, this isn&apos;t a multiple-choice test—this is diagnosis through conversation.
        </SectionDescription>
        <div className="mt-8 mb-4 text-xs font-medium text-text-muted opacity-60">
          Conversational Diagnostics benchmark showing August at 87% diagnostic accuracy and 97% triage accuracy across 400 clinical vignettes
        </div>
        <MultiBarChart
          min={50}
          max={100}
          series={["August", "GPT-5", "Claude 4.5 Sonnet", "Gemini 2.5 Pro", "GPT-4o"]}
          groups={[
            { label: "Diagnostic Accuracy", values: [87, 66, 75, 69, 55.3] },
            { label: "Triage Accuracy", values: [97, 88.3, 92.5, 88.8, 91.3] },
          ]}
        />

        <p
          className="mt-10 mx-auto max-w-3xl text-text-muted"
          style={{ fontSize: "13px", fontWeight: 300, lineHeight: 1.7 }}
        >
          Unlike static multiple-choice benchmarks, this evaluation uses our proprietary in-house methodology featuring multi-turn conversations where the AI must gather information through questions, just like a real clinical encounter. August reaches the correct diagnosis in 47% fewer questions than
          competitors (16 vs 29 on average), demonstrating both accuracy and
          efficiency. This in-house methodology has been peer-reviewed and published at{" "}
          <a
            href="https://arxiv.org/abs/2412.12538"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-primary underline-offset-4 hover:underline"
            style={{ fontWeight: 500 }}
          >
            arXiv:2412.12538
          </a>
          .
        </p>
      </BenchmarkSection>

      {/* 06 — Documents */}
      <BenchmarkSection
        id="documents"
        number="06"
        eyebrow="Document Processing"
        heading={<>Document Processing</>}
        background="linear-gradient(180deg, transparent 0%, rgba(232, 245, 233, 0.3) 50%, transparent 100%)"
      >
        <SectionDescription>
          Processing and interpreting clinical documentation including laboratory reports, prescriptions, and discharge summaries, with demonstrated capability is essential in both printed and handwritten medical documents. Evaluated using our in-house benchmark methodology.
          <br /><br />
          Using our in-house benchmark methodology, August achieves 82% accuracy on handwritten prescriptions versus 49% for competitors, and 99% accuracy on laboratory reports. August translates medical jargon into plain language and helps you understand what your doctor is recommending.
        </SectionDescription>
        <div className="mt-8 mb-4 text-xs font-medium text-text-muted opacity-60">
          Document Processing benchmark comparing Lab Report and Handwritten Prescription accuracy across models
        </div>
        <MultiBarChart
          min={0}
          max={100}
          series={["August", "GPT-5", "Claude 4.5 Sonnet", "Gemini 2.5 Pro", "GPT-4o"]}
          groups={[
            { label: "Lab Reports", values: [99.4, 93, 99, 98, 72] },
            { label: "Handwritten Rx", values: [82, 58, 45, 60.8, 38] },
          ]}
        />
      </BenchmarkSection>

      {/* 07 — Safety */}
      <BenchmarkSection
        id="safety"
        number="07"
        eyebrow="Safety & Escalation"
        heading={<>Safety By Design</>}
      >
        <SectionDescription>
          The ability to correctly identify when symptoms need immediate medical attention versus when they can wait for a regular appointment. Measured using our proprietary in-house emergency escalation benchmark.
          <br /><br />
          Using our proprietary in-house emergency escalation benchmark, August achieves 100% recall and 100% precision in emergency identification, while other LLMs average 28% precision. Meaning 7 out of 10 times they tell you it&apos;s an emergency, it&apos;s not. August gets it right 10 out of 10 times.
        </SectionDescription>
        <div className="mt-8 mb-4 text-xs font-medium text-text-muted opacity-60">
          Emergency Escalation Precision benchmark showing August at 100% compared to other models averaging 28%
        </div>
        <BarChart
          axisMin={0}
          maxValue={100}
          data={[
            { label: "August", value: 100, displayValue: "100%", highlight: true },
            { label: "Claude 4 Opus", value: 30, displayValue: "30%" },
            { label: "Claude 4 Sonnet", value: 30, displayValue: "30%" },
            { label: "GPT-4.1", value: 28, displayValue: "28%" },
            { label: "o3", value: 28, displayValue: "28%" },
          ]}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="p-7 md:p-8" style={{ ...glassCard, borderRadius: "20px" }}>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{
                background: "rgba(32, 110, 85, 0.06)",
                border: "1px solid rgba(32, 110, 85, 0.15)",
              }}
            >
              <ShieldCheck size={13} weight="fill" color="#206E55" />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#206E55",
                }}
              >
                SAFETY
              </span>
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <div
                style={{
                  fontSize: "44px",
                  fontWeight: 300,
                  color: "#206E55",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                100%
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "rgba(28, 25, 23, 0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Recall
              </div>
            </div>
            <p
              className="mt-3 text-text-secondary"
              style={{ fontSize: "14px", fontWeight: 300, lineHeight: 1.6 }}
            >
              Every true emergency flagged. None missed.
            </p>
          </div>
          <div className="p-7 md:p-8" style={{ ...glassCard, borderRadius: "20px" }}>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{
                background: "rgba(32, 110, 85, 0.06)",
                border: "1px solid rgba(32, 110, 85, 0.15)",
              }}
            >
              <CheckCircle size={13} weight="fill" color="#206E55" />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#206E55",
                }}
              >
                ZERO FALSE POSITIVES
              </span>
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <div
                style={{
                  fontSize: "44px",
                  fontWeight: 300,
                  color: "#206E55",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                100%
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "rgba(28, 25, 23, 0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Precision
              </div>
            </div>
            <p
              className="mt-3 text-text-secondary"
              style={{ fontSize: "14px", fontWeight: 300, lineHeight: 1.6 }}
            >
              Eliminates inappropriate emergency escalations (competitors: ~28%)
            </p>
          </div>
        </div>
        <ConfusionMatrix />
      </BenchmarkSection>
          </div>
        </div>
      </div>

      {/* CTA */}
      <TalkToAugustCTA />
    </div>
  );
}
