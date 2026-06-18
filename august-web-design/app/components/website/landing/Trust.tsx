"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollRevealText from "./ScrollRevealText";
import { LockKey, ShieldCheck, Article, SealCheck } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: <LockKey size={24} weight="duotone" color="#5B4B8A" />,
    title: "Security",
    description:
      "We use military grade encryption to keep your data secure.",
    badge: "HIPAA",
    iconBg: "rgba(240,238,248,0.6)",
    iconBorder: "rgba(91,75,138,0.08)",
    badgeColor: "#5B4B8A",
    badgeBg: "rgba(91,75,138,0.06)",
    badgeBorder: "rgba(91,75,138,0.1)",
  },
  {
    icon: <ShieldCheck size={24} weight="duotone" color="#206E55" />,
    title: "Privacy",
    description:
      "Your data remains yours. We never sell your data.",
    badge: "GDPR",
    iconBg: "rgba(232,245,233,0.6)",
    iconBorder: "rgba(32,110,85,0.08)",
    badgeColor: "#206E55",
    badgeBg: "rgba(32,110,85,0.06)",
    badgeBorder: "rgba(32,110,85,0.1)",
  },
  {
    icon: <Article size={24} weight="duotone" color="#6B5B3E" />,
    title: "Control",
    description:
      "Incognito chats, delete chat history, or your account. Anytime.",
    badge: "Ownership",
    iconBg: "rgba(255,244,235,0.6)",
    iconBorder: "rgba(107,91,62,0.08)",
    badgeColor: "#6B5B3E",
    badgeBg: "rgba(107,91,62,0.06)",
    badgeBorder: "rgba(107,91,62,0.1)",
  },
];

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

export default function Trust() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLDivElement>(".trust-card");
    cards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: i * 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, []);

  return (
    <section className="bg-cream py-12 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-20">
        <div className="text-center">
          <ScrollRevealText
            as="h2"
            className="mx-auto max-w-xl text-text-primary"
            style={{
              fontSize: "clamp(28px, 4vw, 38px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
            }}
            highlight={{ words: ["health", "data"], color: "#206E55", italic: false }}
          >
            Your health data deserves better than fine&nbsp;print
          </ScrollRevealText>
          <p
            className="mx-auto mt-2 max-w-lg text-text-secondary"
            style={{ fontSize: "clamp(15px, 2vw, 17px)", fontWeight: 300, lineHeight: 1.6 }}
          >
            We never sell your information. Your data is encrypted, private, and completely under your&nbsp;control.
          </p>
        </div>

        <div ref={cardsRef} className="mt-8 md:mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="trust-card flex flex-col items-center text-center p-8 md:p-10"
              style={{ ...glassCard, opacity: 0 }}
            >
              {/* Icon */}
              <div
                className="mb-5 flex items-center justify-center rounded-2xl"
                style={{
                  width: "52px",
                  height: "52px",
                  background: f.iconBg,
                  border: `1px solid ${f.iconBorder}`,
                }}
              >
                {f.icon}
              </div>

              {/* Title */}
              <h3
                className="text-text-primary"
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                {f.title}
              </h3>

              {/* Description */}
              <p
                className="mt-3 text-text-secondary"
                style={{
                  fontSize: "14px",
                  fontWeight: 300,
                  lineHeight: 1.7,
                }}
              >
                {f.description}
              </p>

              {/* Badge */}
              <div
                className="mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{
                  background: f.badgeBg,
                  border: `1px solid ${f.badgeBorder}`,
                }}
              >
                <SealCheck size={14} weight="duotone" color={f.badgeColor} />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    color: f.badgeColor,
                  }}
                >
                  {f.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
