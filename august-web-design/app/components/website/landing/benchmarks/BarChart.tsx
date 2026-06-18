"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Same 5-color ramp used across all benchmark charts
const COLORS = ["#206E55", "#8BA896", "#B8C7B8", "#D4D6CF", "#E8E6DD"];

export type BarDatum = {
  label: string;
  value: number; // 0-100
  displayValue?: string; // e.g. "87%" or "82"
  highlight?: boolean;
};

type Props = {
  data: BarDatum[];
  maxValue?: number;
  suffix?: string;
  axisMin?: number;
};

/**
 * Horizontal bar chart — clean, refined, animated.
 * August bars highlight in brand green, others in a muted tone.
 */
export default function BarChart({
  data,
  maxValue = 100,
  suffix = "%",
  axisMin = 0,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const bars = chart.querySelectorAll<HTMLDivElement>(".bar-fill");
    const values = chart.querySelectorAll<HTMLSpanElement>(".bar-value");

    bars.forEach((bar, i) => {
      const targetWidth = bar.dataset.width || "0%";
      gsap.fromTo(
        bar,
        { width: "0%" },
        {
          width: targetWidth,
          duration: 1.1,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chart,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    values.forEach((val, i) => {
      gsap.fromTo(
        val,
        { opacity: 0, x: -8 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          delay: i * 0.1 + 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: chart,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, [data]);

  const range = maxValue - axisMin;

  return (
    <div
      ref={chartRef}
      className="mt-10 flex w-full flex-col gap-5 sm:gap-6"
      style={{
        background: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        borderRadius: "20px",
        padding: "clamp(24px, 4vw, 40px)",
        boxShadow: "0 1px 20px rgba(159, 147, 125, 0.06)",
      }}
    >
      {data.map((d, i) => {
        const pct = ((d.value - axisMin) / range) * 100;
        const isHighlight = d.highlight;
        const color = isHighlight ? COLORS[0] : COLORS[Math.min(i, COLORS.length - 1)];
        return (
          <div key={i} className="text-left">
            {/* Mobile: label on its own line; Desktop: inline with bar */}
            <div className="sm:grid sm:grid-cols-[160px,1fr,auto] sm:items-center sm:gap-4">
              <span
                className="block mb-1.5 sm:mb-0"
                style={{
                  fontSize: "13px",
                  fontWeight: isHighlight ? 600 : 400,
                  color: isHighlight ? "#1C1917" : "rgba(28, 25, 23, 0.55)",
                  letterSpacing: "-0.01em",
                }}
              >
                {d.label}
              </span>
              <div
                className="relative h-3 sm:h-4 overflow-hidden"
                style={{ background: "rgba(28, 25, 23, 0.04)" }}
              >
                <div
                  className="bar-fill absolute left-0 top-0 h-full"
                  data-width={`${pct}%`}
                  style={{
                    width: "0%",
                    background: color,
                    boxShadow: isHighlight
                      ? "0 1px 3px rgba(32, 110, 85, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                      : "none",
                  }}
                />
              </div>
              <span
                className="bar-value tabular-nums text-right shrink-0 hidden sm:block"
                style={{
                  opacity: 0,
                  fontSize: isHighlight ? "15px" : "13px",
                  fontWeight: isHighlight ? 600 : 500,
                  color: isHighlight ? "#206E55" : "rgba(28, 25, 23, 0.55)",
                  letterSpacing: "-0.01em",
                  minWidth: "44px",
                }}
              >
                {d.displayValue ?? `${d.value}${suffix}`}
              </span>
            </div>
            {/* Mobile: value below bar, aligned right */}
            <div className="sm:hidden flex justify-between items-baseline mt-1">
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 400,
                  color: "rgba(28, 25, 23, 0.35)",
                }}
              />
              <span
                className="bar-value tabular-nums"
                style={{
                  opacity: 0,
                  fontSize: isHighlight ? "14px" : "12px",
                  fontWeight: isHighlight ? 600 : 500,
                  color: isHighlight ? "#206E55" : "rgba(28, 25, 23, 0.5)",
                  letterSpacing: "-0.01em",
                }}
              >
                {d.displayValue ?? `${d.value}${suffix}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
