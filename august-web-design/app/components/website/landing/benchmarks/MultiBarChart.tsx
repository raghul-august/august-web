"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Consistent 5-color ramp from August (brand green) → muted gray
const COLORS = [
  "#206E55",
  "#8BA896",
  "#B8C7B8",
  "#D4D6CF",
  "#E8E6DD",
];

export type MultiBarGroup = {
  label: string;
  values: number[];
};

type Props = {
  series: string[];
  groups: MultiBarGroup[];
  min?: number;
  max?: number;
  suffix?: string;
  showValues?: boolean;
};

/**
 * Responsive grouped bar chart.
 * Desktop: vertical bars side-by-side.
 * Mobile (<640px): horizontal bars stacked per group — much more readable.
 */
export default function MultiBarChart({
  series,
  groups,
  min = 0,
  max = 100,
  suffix = "%",
  showValues = true,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const range = max - min;
  const MAX_HEIGHT = 300;

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Vertical bars (desktop)
    const bars = chart.querySelectorAll<HTMLDivElement>(".mbar");
    bars.forEach((bar, i) => {
      const target = bar.dataset.height || "0";
      gsap.fromTo(
        bar,
        { height: 0 },
        {
          height: target,
          duration: 0.9,
          delay: i * 0.04,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chart,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    const values = chart.querySelectorAll<HTMLDivElement>(".mbar-value");
    values.forEach((val, i) => {
      gsap.fromTo(
        val,
        { opacity: 0, y: 4 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: i * 0.04 + 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: chart,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Horizontal bars (mobile)
    const hBars = chart.querySelectorAll<HTMLDivElement>(".mbar-h");
    hBars.forEach((bar, i) => {
      const target = bar.dataset.width || "0%";
      gsap.fromTo(
        bar,
        { width: "0%" },
        {
          width: target,
          duration: 0.9,
          delay: i * 0.04,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chart,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    const hValues = chart.querySelectorAll<HTMLDivElement>(".mbar-h-value");
    hValues.forEach((val, i) => {
      gsap.fromTo(
        val,
        { opacity: 0, x: -4 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          delay: i * 0.04 + 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: chart,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, [groups, series]);

  return (
    <div
      ref={chartRef}
      className="mt-10 w-full min-w-0 overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        borderRadius: "20px",
        padding: "clamp(20px, 3vw, 32px)",
        boxShadow: "0 1px 20px rgba(159, 147, 125, 0.06)",
      }}
    >
      {/* Legend */}
      <div className="mb-8 flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2">
        {series.map((s, i) => {
          const isAugust = i === 0;
          return (
            <div key={s} className="flex items-center gap-2">
              <span
                className="block shrink-0 rounded-full"
                style={{
                  width: "10px",
                  height: "10px",
                  background: COLORS[i],
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: isAugust ? 600 : 400,
                  color: isAugust ? "#1C1917" : "rgba(28, 25, 23, 0.6)",
                  letterSpacing: "-0.01em",
                }}
              >
                {s}
              </span>
            </div>
          );
        })}
      </div>

      {/* ─── Desktop: vertical grouped bars ─── */}
      <div className="hidden sm:block">
        <div
          className="flex items-end w-full"
          style={{
            gap: "clamp(12px, 2.5vw, 40px)",
            height: `${MAX_HEIGHT + 80}px`,
            borderBottom: "1px solid rgba(28, 25, 23, 0.1)",
          }}
        >
          {groups.map((group, gi) => (
            <div
              key={gi}
              className="flex flex-col items-center min-w-0 h-full"
              style={{ flex: "1 1 0" }}
            >
              <div
                className="flex items-end justify-center mt-auto"
                style={{
                  gap: "clamp(3px, 0.5vw, 8px)",
                  width: "100%",
                }}
              >
                {group.values.map((val, si) => {
                  const h = ((val - min) / range) * MAX_HEIGHT;
                  const isAugust = si === 0;
                  return (
                    <div
                      key={si}
                      className="flex flex-col items-center min-w-0"
                      style={{ flex: "1 1 0", maxWidth: "36px" }}
                    >
                      {showValues && (
                        <div
                          className="mbar-value tabular-nums"
                          style={{
                            opacity: 0,
                            fontSize: isAugust ? "12px" : "10px",
                            fontWeight: isAugust ? 600 : 500,
                            color: isAugust
                              ? "#206E55"
                              : "rgba(28, 25, 23, 0.5)",
                            marginBottom: "6px",
                            letterSpacing: "-0.02em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {val}
                          {suffix}
                        </div>
                      )}
                      <div
                        className="mbar w-full"
                        data-height={`${h}px`}
                        style={{
                          height: 0,
                          background: COLORS[si],
                          borderRadius: 0,
                          boxShadow: isAugust
                            ? "0 2px 12px rgba(32, 110, 85, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                            : "none",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Group labels — below the baseline */}
        <div
          className="flex w-full"
          style={{
            gap: "clamp(12px, 2.5vw, 40px)",
            paddingTop: "12px",
          }}
        >
          {groups.map((group, gi) => (
            <div
              key={gi}
              className="text-center min-w-0"
              style={{
                flex: "1 1 0",
                fontSize: "clamp(11px, 1.1vw, 13px)",
                fontWeight: 500,
                color: "#1C1917",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              {group.label}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Mobile: horizontal bars per group ─── */}
      <div className="sm:hidden flex flex-col gap-8">
        {groups.map((group, gi) => (
          <div key={gi}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#1C1917",
                letterSpacing: "-0.01em",
                marginBottom: "10px",
              }}
            >
              {group.label}
            </div>
            <div className="flex flex-col gap-2.5">
              {group.values.map((val, si) => {
                const pct = ((val - min) / range) * 100;
                const isAugust = si === 0;
                return (
                  <div
                    key={si}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="relative h-3 overflow-hidden"
                      style={{
                        flex: "1 1 0",
                        background: "rgba(28, 25, 23, 0.04)",
                      }}
                    >
                      <div
                        className="mbar-h absolute left-0 top-0 h-full"
                        data-width={`${pct}%`}
                        style={{
                          width: "0%",
                          background: COLORS[si],
                          boxShadow: isAugust
                            ? "0 1px 3px rgba(32, 110, 85, 0.25)"
                            : "none",
                        }}
                      />
                    </div>
                    <span
                      className="mbar-h-value tabular-nums shrink-0"
                      style={{
                        opacity: 0,
                        fontSize: isAugust ? "13px" : "11px",
                        fontWeight: isAugust ? 600 : 500,
                        color: isAugust
                          ? "#206E55"
                          : "rgba(28, 25, 23, 0.5)",
                        letterSpacing: "-0.01em",
                        minWidth: "40px",
                        textAlign: "right",
                      }}
                    >
                      {val}{suffix}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
