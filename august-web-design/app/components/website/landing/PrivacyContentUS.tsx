"use client";

import { useEffect, useState, useRef } from "react";

/* ────────────────────────────────────────────────────────────
   Hero — same interactive ripple grid as benchmarks
─────────────────────────────────────────────────────────────── */
function PrivacyHero() {
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
        if (ripples.length > 20) ripples.shift();
      }
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

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

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.5;
        r.life *= 0.985;
        if (r.life < 0.01 || r.radius > r.maxRadius * 1.5) {
          ripples.splice(i, 1);
        }
      }

      const hasRipples = ripples.length > 0;
      const step = hasRipples ? 4 : 0;

      ctx.strokeStyle = "rgba(168, 213, 186, 0.06)";
      ctx.lineWidth = 0.5;

      for (let y = 0; y < height; y += MINOR) {
        if (y % MAJOR === 0) continue;
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

      ctx.strokeStyle = "rgba(168, 213, 186, 0.12)";
      ctx.lineWidth = 0.5;

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
        marginTop: "0",
        marginBottom: "0",
        borderRadius: "24px",
        background: "linear-gradient(165deg, #17453a 0%, #1d5c4a 25%, #206E55 50%, #2a8a6c 75%, #34a07e 100%)",
      }}
    >
      {/* Interactive ripple grid */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 65% 55% at 50% 45%, transparent 0%, rgba(23, 69, 58, 0.6) 80%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 40% 40% at 50% 45%, rgba(32, 110, 85, 0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-[1200px] px-6 text-center md:px-10 lg:px-20">
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "rgba(168, 213, 186, 0.7)",
          }}
        >
          Legal · United States
        </span>
        <h1
          className="mx-auto max-w-3xl"
          style={{
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#FAF9F5",
            marginTop: "12px",
          }}
        >
          Privacy Policy
        </h1>
        <p
          className="mx-auto mt-2 max-w-2xl"
          style={{
            fontSize: "clamp(15px, 1.8vw, 18px)",
            fontWeight: 300,
            lineHeight: 1.7,
            color: "rgba(250, 249, 245, 0.6)",
          }}
        >
          How August Labs Inc. collects, uses, and protects your personal&nbsp;information.
        </p>
      </div>
    </section>
  );
}

const TOC = [
  { id: "who-we-are", label: "1. Who We Are" },
  { id: "clinical-partners", label: "2. Clinical Partners" },
  { id: "information-we-collect", label: "3. Information We Collect" },
  { id: "how-we-use", label: "4. How We Use Information" },
  { id: "ai-improvement", label: "5. AI & Product Improvement" },
  { id: "how-we-share", label: "6. How We Share Information" },
  { id: "hipaa", label: "7. HIPAA & PHI" },
  { id: "your-rights", label: "8. Your Privacy Rights" },
  { id: "retention", label: "9. Retention & Deletion" },
  { id: "consumer-health-data", label: "10. Consumer Health Data" },
  { id: "children", label: "11. Children & Minors" },
  { id: "security", label: "12. Data Security" },
  { id: "breach", label: "13. Breach Notification" },
  { id: "international", label: "14. International Processing" },
  { id: "changes", label: "15. Changes to This Policy" },
  { id: "contact", label: "16. Contact Us" },
];

function SideNav({ activeId }: { activeId: string }) {
  return (
    <nav className="hidden lg:block" aria-label="Table of contents">
      <div className="sticky top-32" style={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(28, 25, 23, 0.4)",
            marginBottom: "16px",
          }}
        >
          On this page
        </p>
        <ul className="flex flex-col gap-1">
          {TOC.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block transition-all duration-200"
                style={{
                  fontSize: "13px",
                  fontWeight: activeId === item.id ? 500 : 400,
                  color:
                    activeId === item.id
                      ? "#206E55"
                      : "rgba(28, 25, 23, 0.45)",
                  padding: "6px 0 6px 16px",
                  borderLeft:
                    activeId === item.id
                      ? "2px solid #206E55"
                      : "2px solid transparent",
                  lineHeight: 1.4,
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ scrollMarginTop: "120px" }}>
      <h2
        style={{
          fontSize: "clamp(22px, 3vw, 28px)",
          fontWeight: 400,
          color: "#1C1917",
          letterSpacing: "-0.02em",
          lineHeight: 1.3,
          marginBottom: "20px",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(28, 25, 23, 0.08)",
        }}
      >
        {title}
      </h2>
      <div className="privacy-body">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "28px" }}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 500,
          color: "#1C1917",
          letterSpacing: "-0.01em",
          lineHeight: 1.4,
          marginBottom: "12px",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p
      style={{
        fontSize: "15px",
        fontWeight: 400,
        lineHeight: 1.7,
        color: "rgba(28, 25, 23, 0.7)",
        marginTop: "12px",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul
      style={{
        marginTop: "12px",
        paddingLeft: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {children}
    </ul>
  );
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        fontSize: "15px",
        fontWeight: 400,
        lineHeight: 1.7,
        color: "rgba(28, 25, 23, 0.7)",
        listStyleType: "disc",
      }}
    >
      {children}
    </li>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ fontWeight: 500, color: "#1C1917" }}>{children}</strong>;
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: "16px",
        padding: "20px 24px",
        borderRadius: "12px",
        background: "rgba(32, 110, 85, 0.04)",
        border: "1px solid rgba(32, 110, 85, 0.08)",
      }}
    >
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Pledge — green/teal "Our Privacy Commitments" box
─────────────────────────────────────────────────────────────── */
function Pledge() {
  const items = [
    "We do not sell your health information.",
    "We do not use your health information for third-party targeted advertising.",
    "We do not allow third-party AI providers to use your identifiable health information to train their own general-purpose models without your consent.",
    "We may use information, including de-identified, aggregated, pseudonymized, derived, or synthetic data, to improve, evaluate, develop, train, and fine-tune August's services and AI systems as described in this Policy.",
    "Clinical services are provided by independent clinicians or clinical partners. August provides technology, coordination, and support services.",
  ];

  return (
    <div
      style={{
        marginBottom: "8px",
        padding: "28px 32px",
        borderRadius: "16px",
        background: "rgba(32, 110, 85, 0.05)",
        border: "1px solid rgba(32, 110, 85, 0.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#206E55",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <svg width="11" height="11" viewBox="0 0 20 20" fill="#FAF9F5">
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <p
          style={{
            fontSize: "16px",
            fontWeight: 500,
            color: "#206E55",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Our Privacy Commitments
        </p>
      </div>
      <p
        style={{
          fontSize: "15px",
          fontWeight: 400,
          lineHeight: 1.7,
          color: "rgba(28, 25, 23, 0.75)",
          margin: "0 0 16px 0",
        }}
      >
        We use data to operate, improve, and develop August, including our AI systems, while placing
        clear limits on sale, advertising, and third-party model training.
      </p>
      <ul style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: 0 }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: 1.65,
              color: "rgba(28, 25, 23, 0.7)",
              listStyle: "none",
            }}
          >
            <span style={{ color: "#206E55", fontWeight: 600, flexShrink: 0, marginTop: "1px" }}>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Callout — tinted note box (teal | amber | red)
─────────────────────────────────────────────────────────────── */
function Callout({
  tone,
  label,
  children,
}: {
  tone: "teal" | "amber" | "red";
  label: string;
  children: React.ReactNode;
}) {
  const palette = {
    teal: {
      bg: "rgba(32, 110, 85, 0.05)",
      border: "rgba(32, 110, 85, 0.18)",
      labelColor: "#206E55",
    },
    amber: {
      bg: "rgba(180, 83, 9, 0.06)",
      border: "rgba(180, 83, 9, 0.2)",
      labelColor: "#B45309",
    },
    red: {
      bg: "rgba(220, 38, 38, 0.05)",
      border: "rgba(220, 38, 38, 0.2)",
      labelColor: "#B91C1C",
    },
  }[tone];

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "18px 22px",
        borderRadius: "12px",
        background: palette.bg,
        border: `1px solid ${palette.border}`,
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: palette.labelColor,
          margin: "0 0 8px 0",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: palette.labelColor,
          }}
        />
        {label}
      </p>
      <p
        style={{
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: 1.7,
          color: "rgba(28, 25, 23, 0.75)",
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   RetentionTable — styled HTML table for §9
─────────────────────────────────────────────────────────────── */
function RetentionTable() {
  const rows: [string, string][] = [
    [
      "Account and profile information",
      "Retained while your account is active and for a reasonable period after closure, unless longer retention is required or permitted by law.",
    ],
    [
      "Health conversations and user-provided content",
      "Retained as needed to provide continuity, personalization, safety, support, quality assurance, product improvement, legal compliance, and dispute resolution.",
    ],
    [
      "Telehealth and clinical records",
      "Retained by the applicable clinical partner, and by August where applicable, as required by medical-record, HIPAA, contractual, and other legal obligations.",
    ],
    [
      "Payment, tax, and transaction records",
      "Retained as required for accounting, tax, audit, payment, chargeback, and compliance purposes.",
    ],
    [
      "Security, diagnostic, and usage logs",
      "Retained for security, debugging, analytics, fraud prevention, service reliability, and operational purposes, generally for a limited period unless needed longer.",
    ],
    [
      "De-identified, aggregated, derived, or synthetic data",
      "May be retained indefinitely and used for lawful purposes, including analytics, research, product development, AI training, and model improvement.",
    ],
  ];

  return (
    <div
      style={{
        marginTop: "20px",
        borderRadius: "12px",
        border: "1px solid rgba(28, 25, 23, 0.1)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr>
              <th
                style={{
                  background: "rgba(32, 110, 85, 0.04)",
                  color: "rgba(28, 25, 23, 0.55)",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "12px 16px",
                  textAlign: "left",
                  borderBottom: "1px solid rgba(28, 25, 23, 0.1)",
                  width: "38%",
                }}
              >
                Data Category
              </th>
              <th
                style={{
                  background: "rgba(32, 110, 85, 0.04)",
                  color: "rgba(28, 25, 23, 0.55)",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "12px 16px",
                  textAlign: "left",
                  borderBottom: "1px solid rgba(28, 25, 23, 0.1)",
                }}
              >
                General Retention Approach
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([cat, desc], i) => (
              <tr key={i}>
                <td
                  style={{
                    padding: "14px 16px",
                    color: "#1C1917",
                    fontWeight: 500,
                    borderBottom: i === rows.length - 1 ? "none" : "1px solid rgba(28, 25, 23, 0.06)",
                    verticalAlign: "top",
                    lineHeight: 1.6,
                  }}
                >
                  {cat}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    color: "rgba(28, 25, 23, 0.7)",
                    borderBottom: i === rows.length - 1 ? "none" : "1px solid rgba(28, 25, 23, 0.06)",
                    verticalAlign: "top",
                    lineHeight: 1.65,
                  }}
                >
                  {desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main content
─────────────────────────────────────────────────────────────── */
export default function PrivacyContentUS() {
  const [activeId, setActiveId] = useState("who-we-are");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    TOC.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-cream" style={{ paddingBottom: "80px" }}>
      <PrivacyHero />

      {/* Spacing between hero and content */}
      <div style={{ height: "48px" }} className="md:hidden" />
      <div style={{ height: "64px" }} className="hidden md:block" />

      {/* Content grid: sidebar + main */}
      <div
        ref={contentRef}
        className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-20"
      >
        <div className="lg:grid lg:gap-16" style={{ gridTemplateColumns: "220px 1fr" }}>
          <SideNav activeId={activeId} />

          <div className="flex flex-col gap-14 max-w-[720px]">
            {/* ── Effective date + Pledge ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <P style={{ fontSize: "14px", color: "rgba(28, 25, 23, 0.5)", marginTop: 0 }}>
                Last Modified: May 29, 2026
              </P>
              <Pledge />
            </div>

            {/* ── 1. Who We Are ── */}
            <Section id="who-we-are" title="1. Who We Are and Scope of This Policy">
              <P>
                <Strong>August Labs Inc.</Strong> is a Delaware corporation that provides AI-enabled
                health information, navigation, support, intake, and care-coordination technology
                through August&apos;s websites, mobile applications, chat products, and related
                services (the &ldquo;Services&rdquo;).
              </P>
              <P>
                This Privacy Policy explains how August Labs Inc. collects, uses, discloses, retains,
                and protects personal information when you use the Services. It applies to US
                residents using August&apos;s consumer-facing services.
              </P>
              <P>
                This Policy should be read together with our{" "}
                <a href="/terms" style={{ color: "#206E55", fontWeight: 500 }}>
                  Terms &amp; Conditions
                </a>
                , any telehealth informed consent presented to you, any applicable Notice of Privacy
                Practices provided by a clinical partner, and any separate Consumer Health Data
                Privacy Notice we make available.
              </P>
              <P>
                <Strong>Contact:</Strong> You can reach us about privacy questions or requests at{" "}
                <a href="mailto:privacy@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  privacy@meetaugust.ai
                </a>{" "}
                or at August Labs Inc., 131 Continental Drive, Suite 301, Newark, DE 19713-4323.
              </P>
            </Section>

            {/* ── 2. Clinical Partners ── */}
            <Section id="clinical-partners" title="2. Clinical Partners and Telehealth Services">
              <P>
                August is not, by itself, a telehealth provider, medical practice, pharmacy, or
                health plan. Some clinical services available through August may be provided by
                independent licensed clinicians, medical groups, or clinical partners, including MD
                Integrations or another partner identified to you before the service is provided.
              </P>
              <P>
                When you request a telehealth or clinical service, the treating clinician or clinical
                partner is responsible for clinical decisions, including diagnosis, treatment,
                prescribing, follow-up, and medical-record obligations. August provides technology,
                intake, coordination, administrative support, AI-assisted summarization, and related
                services that help facilitate your interaction with the clinical partner.
              </P>
              <P>
                If a clinical partner provides a Notice of Privacy Practices, that notice governs the
                partner&apos;s use and disclosure of protected health information for treatment,
                payment, and healthcare operations. If there is a conflict between this Policy and an
                applicable Notice of Privacy Practices for protected health information, the Notice
                of Privacy Practices controls for that protected health information.
              </P>
              <Callout tone="teal" label="Clinical Independence">
                Independent clinicians and clinical partners exercise their own medical judgment.
                August does not control or direct a clinician&apos;s diagnosis, treatment,
                prescribing, or other clinical decision-making.
              </Callout>
            </Section>

            {/* ── 3. Information We Collect ── */}
            <Section id="information-we-collect" title="3. Information We Collect">
              <SubSection title="Information You Provide">
                <UL>
                  <LI><Strong>Account information:</Strong> name, email address, phone number, date of birth, state of residence, login credentials, account preferences, and other registration details.</LI>
                  <LI><Strong>Health conversations and content:</Strong> symptoms, conditions, diagnoses, medications, allergies, labs, vitals, lifestyle information, care questions, goals, photos, documents, messages, and other information you enter into August.</LI>
                  <LI><Strong>Telehealth intake information:</Strong> chief complaint, symptom history, medication and allergy information, medical history, consent acknowledgments, preferred pharmacy, and other information needed to facilitate a clinical service.</LI>
                  <LI><Strong>Insurance, payment, and cost information:</Strong> insurance plan details, member ID, explanation-of-benefits documents, medical bills, cost documents, payment status, and transaction metadata. Payment card details may be processed by our payment processors and may not be stored directly by August.</LI>
                  <LI><Strong>Support and feedback:</Strong> support requests, survey responses, ratings, product feedback, bug reports, and communications with us.</LI>
                </UL>
              </SubSection>

              <SubSection title="Information from Clinical Partners and Third Parties">
                <UL>
                  <LI><Strong>Clinical partners:</Strong> information related to a telehealth request, clinical encounter, prescription, referral, care plan, or follow-up, where provided by or through a clinical partner.</LI>
                  <LI><Strong>Pharmacy and prescription infrastructure:</Strong> prescription-routing, pharmacy-selection, medication, or prescription-status information where available and relevant to the service you requested.</LI>
                  <LI><Strong>User-authorized sources:</Strong> medical records, EHR exports, wearable data, lab reports, pharmacy information, identity verification results, or other information you authorize us to receive.</LI>
                  <LI><Strong>Service providers and partners:</Strong> fraud-prevention signals, analytics, attribution, communications, identity verification, payment, or operational information needed to provide and secure the Services.</LI>
                </UL>
              </SubSection>

              <SubSection title="Information Collected Automatically">
                <UL>
                  <LI>Device identifiers, IP address, browser type, operating system, app version, approximate location inferred from IP address, language, and time zone.</LI>
                  <LI>Usage information, including pages viewed, features used, session duration, referral source, clicks, errors, crash logs, diagnostic logs, and security events.</LI>
                  <LI>Cookies, pixels, local storage, SDKs, and similar technologies used for authentication, security, analytics, performance, preferences, and service operations.</LI>
                  <LI><Strong>Bot-mitigation:</Strong> Cloudflare Turnstile verifies human visitors on signup, login, and contact forms. It sets short-lived security cookies (cf_clearance, _cf_bm) and receives IP address, HTTP headers, and browser/device characteristics; it does not receive account content or health information. See the <a href="https://www.cloudflare.com/turnstile-privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "#206E55", fontWeight: 500 }}>Cloudflare Turnstile privacy notice.</a></LI>                
                </UL>
              </SubSection>
            </Section>

            {/* ── 4. How We Use Information ── */}
            <Section id="how-we-use" title="4. How We Use Information">
              <P>We use personal information for the following purposes:</P>
              <UL>
                <LI><Strong>Provide and personalize the Services:</Strong> answer health questions, generate summaries, maintain context, personalize responses, support care navigation, review bills or cost documents, and provide other requested features.</LI>
                <LI><Strong>Facilitate clinical services:</Strong> collect intake information, share relevant information with the applicable clinical partner or treating clinician, support scheduling or follow-up, and help route prescriptions or pharmacy information where applicable.</LI>
                <LI><Strong>Operate and secure the Services:</Strong> authenticate users, prevent fraud and abuse, troubleshoot bugs, monitor performance, protect against security incidents, and maintain service reliability.</LI>
                <LI><Strong>Communicate with you:</Strong> send account messages, service updates, reminders, support responses, administrative notices, and other communications related to the Services.</LI>
                <LI><Strong>Improve, evaluate, develop, train, and fine-tune August:</Strong> analyze usage, measure quality, evaluate safety, improve clinical reasoning and summarization, develop new features, build synthetic and de-identified datasets, conduct quality assurance, and improve our AI systems as described in Section 5.</LI>
                <LI><Strong>Comply with law and enforce our rights:</Strong> respond to lawful requests, comply with legal obligations, enforce our Terms, resolve disputes, and protect the rights, safety, and property of August, users, clinicians, partners, or others.</LI>
              </UL>
              <Callout tone="red" label="Advertising and Sale Limits">
                We do not sell your health information. We do not use your health information for
                third-party targeted advertising or cross-context behavioral advertising.
              </Callout>
            </Section>

            {/* ── 5. AI and Product Improvement ── */}
            <Section id="ai-improvement" title="5. AI Processing and Product Improvement">
              <P>
                August is an AI-enabled service. We use information to operate, monitor, evaluate,
                improve, develop, train, and fine-tune our Services and AI systems, subject to this
                Policy and applicable law.
              </P>

              <SubSection title="How August Uses Data to Improve AI Systems">
                <UL>
                  <LI>Improve response quality, personalization, clinical reasoning, summarization, routing, retrieval, and safety systems.</LI>
                  <LI>Evaluate model performance, safety, hallucination risk, refusal behavior, escalation behavior, benchmark performance, and clinical consistency.</LI>
                  <LI>Develop and test prompts, classifiers, guardrails, triage logic, synthetic patient actors, simulated conversations, evaluation datasets, and other model-improvement workflows.</LI>
                  <LI>Review conversations, feedback, logs, and outcomes for quality assurance, debugging, safety monitoring, and product development.</LI>
                  <LI>Create and use de-identified, aggregated, pseudonymized, derived, or synthetic data for analytics, research, development, model training, model fine-tuning, and service improvement.</LI>
                </UL>
              </SubSection>

              <SubSection title="De-identified, Aggregated, Derived, and Synthetic Data">
                <P>
                  We may de-identify, aggregate, pseudonymize, transform, derive, or synthesize data
                  from information collected through the Services. We may use and disclose such data
                  for lawful purposes, including analytics, research, product development, safety
                  evaluation, AI model training, model fine-tuning, publications, and business
                  operations.
                </P>
                <P>
                  Where information is protected health information under HIPAA, we treat it as
                  de-identified only when it has been de-identified in a manner permitted by HIPAA or
                  applicable law. De-identified, aggregated, derived, and synthetic data may be
                  retained indefinitely unless applicable law requires otherwise.
                </P>
              </SubSection>

              <SubSection title="Third-Party AI Providers and Subprocessors">
                <P>
                  We may use third-party AI providers, cloud providers, analytics providers,
                  infrastructure providers, security vendors, and other service providers to process
                  information on our behalf. These providers may process information only to provide
                  services to August, subject to contractual restrictions.
                </P>
                <P>
                  <Strong>
                    We do not allow third-party AI providers to use your identifiable health
                    information to train their own general-purpose models without your consent.
                  </Strong>{" "}
                  This does not limit August&apos;s ability to use information, including
                  de-identified, aggregated, pseudonymized, derived, or synthetic data, to improve,
                  evaluate, develop, train, and fine-tune August&apos;s own Services and AI systems
                  as described in this Policy.
                </P>
              </SubSection>

              <SubSection title="Human Review">
                <P>
                  Authorized August personnel, contractors, reviewers, clinicians, or service
                  providers may review information where needed to provide support, improve the
                  Services, evaluate quality and safety, debug systems, investigate abuse, comply
                  with law, or operate the Services. We limit access based on role and business need.
                </P>
              </SubSection>
            </Section>

            {/* ── 6. How We Share Information ── */}
            <Section id="how-we-share" title="6. How We Share Information">
              <P>We share personal information as described below:</P>

              <SubSection title="Clinical and Telehealth-Related Sharing">
                <UL>
                  <LI><Strong>Clinical partners and treating clinicians:</Strong> We share intake, health, account, and related information with the applicable clinical partner or treating clinician to facilitate the clinical service you request.</LI>
                  <LI><Strong>Pharmacies and prescription networks:</Strong> If a treating clinician prescribes medication, information may be shared with prescription-routing networks, pharmacies, and related service providers to transmit or support the prescription.</LI>
                  <LI><Strong>Labs, referrals, or other care partners:</Strong> Where available and requested or authorized, information may be shared to support referrals, lab orders, follow-up, or other care coordination.</LI>
                </UL>
              </SubSection>

              <SubSection title="Operational Sharing">
                <UL>
                  <LI><Strong>Service providers:</Strong> cloud hosting, database infrastructure, AI processing, analytics, customer support, payment processing, identity verification, communications, security, fraud prevention, and product operations.</LI>
                  <LI><Strong>User-directed sharing:</Strong> people or organizations you ask us to share with, such as a caregiver, family member, clinician, health plan, employer, attorney, or other third party.</LI>
                  <LI><Strong>Business transfers:</Strong> in connection with a merger, acquisition, financing, reorganization, bankruptcy, sale of assets, or similar transaction, subject to appropriate confidentiality or privacy protections.</LI>
                  <LI><Strong>Legal, safety, and compliance:</Strong> where we believe disclosure is required or permitted by law, legal process, regulation, professional obligations, or is necessary to protect rights, safety, security, or prevent serious harm.</LI>
                  <LI><Strong>De-identified or aggregated data:</Strong> data that does not identify you may be shared for analytics, research, product development, benchmarking, publication, or other lawful purposes.</LI>
                </UL>
              </SubSection>

              <Callout tone="teal" label="Government and Law-Enforcement Requests">
                We do not voluntarily disclose health information to government or law-enforcement
                agencies except as described in this Policy, when required or permitted by law, or
                where necessary to prevent serious harm. Where appropriate and legally permitted, we
                may seek to narrow or challenge overbroad requests.
              </Callout>
            </Section>

            {/* ── 7. HIPAA ── */}
            <Section id="hipaa" title="7. HIPAA, Protected Health Information, and Clinical Records">
              <P>
                Not all information collected by August is protected health information under HIPAA.
                For example, information you provide directly to August outside of a covered
                healthcare relationship may be governed by this Privacy Policy and applicable
                consumer privacy or consumer health data laws rather than HIPAA.
              </P>
              <P>
                When August processes protected health information on behalf of a HIPAA-covered
                clinical partner, August may act as a business associate and will handle that
                protected health information in accordance with the applicable business associate
                agreement, HIPAA, and the clinical partner&apos;s Notice of Privacy Practices.
              </P>
              <P>
                For telehealth or clinical services, clinical records, diagnoses, prescriptions,
                treatment notes, and related information may be maintained by the treating clinician
                or clinical partner. You may have rights to access or amend those records through the
                applicable clinical partner or as otherwise required by law.
              </P>
              <Callout tone="amber" label="Practical Rule">
                If information is created or used for a clinical service provided by an independent
                clinician or clinical partner, the clinical partner&apos;s privacy practices and
                medical-record obligations may also apply.
              </Callout>
            </Section>

            {/* ── 8. Your Privacy Rights ── */}
            <Section id="your-rights" title="8. Your Privacy Rights and Choices">
              <P>
                Depending on where you live and the type of information involved, you may have rights
                to access, correct, delete, obtain a copy of, or restrict certain uses of your
                personal information. You may also have the right to appeal a denied request,
                designate an authorized agent, or withdraw consent where processing is based on
                consent.
              </P>

              <SubSection title="Rights Available to Many Users">
                <UL>
                  <LI><Strong>Access:</Strong> request a copy of personal information we maintain about you.</LI>
                  <LI><Strong>Correction:</Strong> ask us to correct inaccurate personal information.</LI>
                  <LI><Strong>Deletion:</Strong> ask us to delete personal information, subject to legal, clinical, security, fraud-prevention, backup, dispute-resolution, and operational exceptions.</LI>
                  <LI><Strong>Portability:</Strong> request a copy of certain information in a portable format where required by law.</LI>
                  <LI><Strong>Opt-out:</Strong> opt out of sale, sharing, targeted advertising, or certain profiling where those rights apply. August does not sell health information or use health information for third-party targeted advertising.</LI>
                  <LI><Strong>Limit or withdraw consent:</Strong> limit use of certain sensitive information or withdraw consent where applicable law gives you that right.</LI>
                </UL>
              </SubSection>

              <SubSection title="How to Exercise Your Rights">
                <UL>
                  <LI>In-app: Account Settings → Privacy → Manage My Data, where available.</LI>
                  <LI>
                    Email:{" "}
                    <a href="mailto:privacy@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                      privacy@meetaugust.ai
                    </a>
                    . Include your account email and the request type.
                  </LI>
                  <LI>We may need to verify your identity before completing a request.</LI>
                  <LI>We will not discriminate against you for exercising privacy rights required by applicable law.</LI>
                </UL>
              </SubSection>

              <SubSection title="California and Other State Privacy Rights">
                <P>
                  Residents of California and other states may have additional rights under state
                  privacy laws, including rights to know, access, correct, delete, port, opt out of
                  certain processing, limit certain uses of sensitive personal information, or appeal
                  a decision. We honor these rights where required by applicable law.
                </P>
                <P>
                  California residents may designate an authorized agent to submit requests on their
                  behalf. We may require proof of authorization and identity verification.
                </P>
              </SubSection>
            </Section>

            {/* ── 9. Retention ── */}
            <Section id="retention" title="9. Data Retention and Deletion">
              <P>
                We retain personal information for as long as reasonably necessary to provide the
                Services, maintain your account, improve and secure our systems, comply with legal
                and clinical obligations, resolve disputes, enforce agreements, and support
                legitimate business purposes.
              </P>
              <RetentionTable />
              <P>
                When you request deletion, we will delete or de-identify personal information as
                required by applicable law. We may retain information where needed for legal,
                clinical, security, fraud-prevention, backup, dispute-resolution, tax, accounting, or
                compliance purposes. Deletion requests do not require us to delete de-identified,
                aggregated, derived, or synthetic data that no longer identifies you.
              </P>
            </Section>

            {/* ── 10. Consumer Health Data ── */}
            <Section id="consumer-health-data" title="10. Consumer Health Data Notice">
              <P>
                Some state laws regulate &ldquo;consumer health data&rdquo; or similar categories of
                health-related personal information. Depending on where you live and how you use the
                Services, information we collect may include consumer health data such as symptoms,
                conditions, diagnoses, medications, allergies, lab values, vitals, reproductive or
                sexual health information, mental health information, substance-use information,
                gender-affirming care information, disability-related information, biometric or
                genetic information if provided, health-related inferences, and information about
                healthcare services you request.
              </P>
              <P>
                We collect and use consumer health data for the purposes described in this Policy,
                including providing the Services, facilitating clinical services you request,
                communicating with you, operating and securing the Services, complying with law, and
                improving, evaluating, developing, training, and fine-tuning August&apos;s services
                and AI systems.
              </P>
              <P>
                Where required by law, we will provide a separate Consumer Health Data Privacy
                Notice that describes consumer health data categories, purposes of collection,
                sources, disclosures, and applicable rights. If that notice applies to you and
                conflicts with this Policy, the more specific notice controls for consumer health
                data covered by that law.
              </P>
            </Section>

            {/* ── 11. Children ── */}
            <Section id="children" title="11. Children and Minors">
              <P>
                The Services are intended for users who are 18 years of age or older. We do not
                knowingly collect personal information from anyone under 18. If we learn that a
                person under 18 has provided personal information through the Services, we will take
                appropriate steps to delete the information or account, unless retention is required
                by law. If you believe a minor has provided us with information, contact{" "}
                <a href="mailto:privacy@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  privacy@meetaugust.ai
                </a>
                .
              </P>
            </Section>

            {/* ── 12. Security ── */}
            <Section id="security" title="12. Data Security">
              <P>
                We use administrative, technical, and organizational safeguards designed to protect
                personal information, including health-related information. These safeguards may
                include encryption in transit and at rest, access controls, authentication controls,
                bot-mitigation on pre-authentication surfaces, logging, monitoring, vendor review, confidentiality obligations, and security
                testing.
              </P>
              <P>
                No system is perfectly secure. You are responsible for maintaining the
                confidentiality of your login credentials and for using secure devices and networks
                when accessing the Services.
              </P>
            </Section>

            {/* ── 13. Breach ── */}
            <Section id="breach" title="13. Security Incidents and Breach Notification">
              <P>
                If we discover a security incident that requires notice under applicable law, we will
                notify affected users, regulators, clinical partners, service providers, and other
                parties as required by law. The timing, content, and recipients of notice may vary
                depending on the type of information involved, the applicable law, and the
                circumstances of the incident.
              </P>
              <P>
                We will provide public, substitute, or media notice only where required by applicable
                law.
              </P>
            </Section>

            {/* ── 14. International ── */}
            <Section id="international" title="14. International Processing">
              <P>
                August is based in the United States, and information may be processed in the United
                States and other countries where August, its affiliates, personnel, contractors,
                service providers, or partners operate. These countries may have privacy laws that
                differ from the laws where you live. We use contractual, technical, and
                organizational safeguards where required by applicable law.
              </P>
            </Section>

            {/* ── 15. Changes ── */}
            <Section id="changes" title="15. Changes to This Policy">
              <P>
                We may update this Policy from time to time. If we make material changes, we will
                provide notice through the Services, by email, or by another legally sufficient
                method. The updated Policy will be effective as of the date stated at the top of the
                Policy unless otherwise stated. Where required by law, we will obtain consent before
                applying material changes to certain existing data uses.
              </P>
            </Section>

            {/* ── 16. Contact ── */}
            <Section id="contact" title="16. Contact Us">
              <P>If you have any questions, please contact us:</P>
              <InfoCard>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Privacy Requests
                    </p>
                    <a href="mailto:privacy@meetaugust.ai" style={{ fontSize: "15px", color: "#206E55", fontWeight: 500 }}>
                      privacy@meetaugust.ai
                    </a>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Company
                    </p>
                    <p style={{ fontSize: "15px", color: "rgba(28,25,23,0.7)", lineHeight: 1.6 }}>
                      August Labs Inc.
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Mailing Address
                    </p>
                    <p style={{ fontSize: "15px", color: "rgba(28,25,23,0.7)", lineHeight: 1.6 }}>
                      131 Continental Drive, Suite 301<br />
                      Newark, DE 19713-4323
                    </p>
                  </div>
                </div>
              </InfoCard>
              <P>
                If you have concerns about our privacy practices, you may contact us at the email
                above. You may also have the right to contact your state Attorney General, state
                privacy regulator, the Federal Trade Commission, or another regulator depending on
                where you live and the type of information involved.
              </P>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}
