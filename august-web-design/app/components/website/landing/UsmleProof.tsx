"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BlurSection from "./BlurSection";
import ScrollRevealText from "./ScrollRevealText";

gsap.registerPlugin(ScrollTrigger);

const BAR_DATA = [
  { label: "August AI", value: 100, color: "#206E55", highlight: true },
  { label: "GPT-4", value: 86, color: "#A8D5BA", highlight: false },
  { label: "Med-PaLM 2", value: 85, color: "#A8D5BA", highlight: false },
  { label: "Avg. Physician", value: 60, color: "rgba(28,25,23,0.15)", highlight: false },
];

const MAX_BAR_HEIGHT = 280;

export default function UsmleProof() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const bars = chart.querySelectorAll<HTMLDivElement>(".vbar");

    bars.forEach((bar, i) => {
      const targetHeight = bar.dataset.height || "0";
      gsap.fromTo(
        bar,
        { height: 0 },
        {
          height: targetHeight,
          duration: 0.8,
          delay: i * 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: chart,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, []);

  return (
    <BlurSection className="bg-cream py-12 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 text-center md:px-10 lg:px-20">
        <ScrollRevealText
          as="h2"
          className="text-text-primary"
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
          highlight={{ words: ["medical"], color: "#206E55", italic: false }}
        >
          A perfect score on the medical&nbsp;exam
        </ScrollRevealText>
        <p
          className="mx-auto mt-2 max-w-2xl text-text-secondary"
          style={{
            fontSize: "clamp(15px, 1.8vw, 18px)",
            fontWeight: 300,
            lineHeight: 1.6,
          }}
        >
          August is the only Health AI to score 100% on the US medical licensing&nbsp;exam.
        </p>

        <div
          ref={chartRef}
          className="mx-auto mt-8 md:mt-16 flex items-end justify-between"
          style={{ gap: "clamp(16px, 3vw, 32px)", maxWidth: "600px" }}
        >
          {BAR_DATA.map((item, i) => {
            const barHeight = (item.value / 100) * MAX_BAR_HEIGHT;
            return (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{ flex: "1 1 0", maxWidth: "120px" }}
              >
                <span
                  style={{
                    fontSize: item.highlight ? "22px" : "15px",
                    fontWeight: item.highlight ? 600 : 400,
                    color: item.highlight ? "#206E55" : "rgba(28,25,23,0.5)",
                    marginBottom: "8px",
                  }}
                >
                  {item.value}%
                </span>

                <div
                  className="vbar"
                  data-height={`${barHeight}px`}
                  style={{
                    width: "100%",
                    height: 0,
                    background: item.color,
                    borderRadius: "12px 12px 4px 4px",
                    position: "relative",
                    ...(item.highlight
                      ? {
                          boxShadow:
                            "0 4px 20px rgba(32,110,85,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
                        }
                      : {}),
                  }}
                />

                <span
                  className="mt-3"
                  style={{
                    fontSize: "12px",
                    fontWeight: item.highlight ? 500 : 400,
                    color: item.highlight
                      ? "#1C1917"
                      : "rgba(28,25,23,0.45)",
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="mx-auto mt-6"
          style={{
            maxWidth: "600px",
            height: "1px",
            background: "rgba(28,25,23,0.08)",
          }}
        />

        <p
          className="mx-auto mt-6 max-w-2xl text-text-muted"
          style={{ fontSize: "14px", fontWeight: 300, lineHeight: 1.7 }}
        >
          The USMLE is the United States Medical Licensing Examination, three rigorous steps that evaluate clinical knowledge across every&nbsp;specialty.
        </p>
      </div>
    </BlurSection>
  );
}
