"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type GroupedBarGroup = {
  label: string;
  august: number;
  competitor: number;
  augustDisplay?: string;
  competitorDisplay?: string;
};

/**
 * Grouped vertical bar chart — August vs a competitor across multiple groups.
 */
export default function GroupedBarChart({
  groups,
  competitorLabel = "GPT-5",
  maxValue = 100,
  minValue = 0,
  suffix = "%",
}: {
  groups: GroupedBarGroup[];
  competitorLabel?: string;
  maxValue?: number;
  minValue?: number;
  suffix?: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const range = maxValue - minValue;
  const MAX_HEIGHT = 220;

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const bars = chart.querySelectorAll<HTMLDivElement>(".grouped-bar");
    const values = chart.querySelectorAll<HTMLDivElement>(".grouped-bar-value");

    bars.forEach((bar, i) => {
      const target = bar.dataset.height || "0";
      gsap.fromTo(
        bar,
        { height: 0 },
        {
          height: target,
          duration: 1,
          delay: i * 0.08,
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
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: i * 0.08 + 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: chart,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, [groups]);

  return (
    <div className="mt-10 flex flex-col items-center">
      <div
        ref={chartRef}
        className="flex w-full max-w-2xl items-end justify-center"
        style={{ gap: "clamp(40px, 8vw, 100px)", minHeight: `${MAX_HEIGHT + 60}px` }}
      >
        {groups.map((group, i) => {
          const augustHeight = ((group.august - minValue) / range) * MAX_HEIGHT;
          const competitorHeight =
            ((group.competitor - minValue) / range) * MAX_HEIGHT;

          return (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ flex: "0 1 auto" }}
            >
              <div className="flex items-end gap-3">
                {/* August bar */}
                <div className="flex flex-col items-center">
                  <div
                    className="grouped-bar-value tabular-nums"
                    style={{
                      opacity: 0,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#206E55",
                      marginBottom: "8px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {group.augustDisplay ?? `${group.august}${suffix}`}
                  </div>
                  <div
                    className="grouped-bar"
                    data-height={`${augustHeight}px`}
                    style={{
                      width: "44px",
                      height: 0,
                      background: "#206E55",
                      borderRadius: "8px 8px 2px 2px",
                      boxShadow:
                        "0 4px 20px rgba(32, 110, 85, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                    }}
                  />
                </div>
                {/* Competitor bar */}
                <div className="flex flex-col items-center">
                  <div
                    className="grouped-bar-value tabular-nums"
                    style={{
                      opacity: 0,
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "rgba(28, 25, 23, 0.45)",
                      marginBottom: "8px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {group.competitorDisplay ?? `${group.competitor}${suffix}`}
                  </div>
                  <div
                    className="grouped-bar"
                    data-height={`${competitorHeight}px`}
                    style={{
                      width: "44px",
                      height: 0,
                      background: "rgba(28, 25, 23, 0.14)",
                      borderRadius: "8px 8px 2px 2px",
                    }}
                  />
                </div>
              </div>
              {/* Group label */}
              <div
                className="mt-4 text-center"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1C1917",
                  letterSpacing: "-0.01em",
                }}
              >
                {group.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{ background: "#206E55" }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#1C1917",
              letterSpacing: "-0.01em",
            }}
          >
            August
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{ background: "rgba(28, 25, 23, 0.25)" }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "rgba(28, 25, 23, 0.55)",
              letterSpacing: "-0.01em",
            }}
          >
            {competitorLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
