"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type RadarDatum = {
  label: string;
  august: number;
  competitor: number;
};

/**
 * Radar chart — shows August vs a competitor across N categories.
 * Scale is 88-100 to emphasize the differences at the top.
 */
export default function RadarChart({
  data,
  competitorLabel = "GPT-5",
  min = 88,
  max = 100,
}: {
  data: RadarDatum[];
  competitorLabel?: string;
  min?: number;
  max?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const size = 420;
  const center = size / 2;
  const radius = 150;
  const n = data.length;
  const range = max - min;

  // Build points for a polygon given values
  const buildPoints = (values: number[]) =>
    values
      .map((v, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const r = ((v - min) / range) * radius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        return `${x},${y}`;
      })
      .join(" ");

  const augustPoints = buildPoints(data.map((d) => d.august));
  const competitorPoints = buildPoints(data.map((d) => d.competitor));

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  // Axis spokes
  const spokes = Array.from({ length: n }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x2: center + Math.cos(angle) * radius,
      y2: center + Math.sin(angle) * radius,
    };
  });

  // Label positions (outside the radar)
  const labels = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const labelR = radius + 26;
    return {
      text: d.label,
      x: center + Math.cos(angle) * labelR,
      y: center + Math.sin(angle) * labelR,
    };
  });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const augustShape = svg.querySelector(".radar-august");
    const competitorShape = svg.querySelector(".radar-competitor");
    const spokeEls = svg.querySelectorAll(".radar-spoke");
    const ringEls = svg.querySelectorAll(".radar-ring");
    const labelEls = svg.querySelectorAll(".radar-label");

    gsap.set([augustShape, competitorShape], {
      transformOrigin: `${center}px ${center}px`,
      scale: 0,
      opacity: 0,
    });
    gsap.set([spokeEls, ringEls, labelEls], { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: svg,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    tl.to(ringEls, {
      opacity: 1,
      duration: 0.4,
      stagger: 0.08,
      ease: "power2.out",
    })
      .to(
        spokeEls,
        { opacity: 1, duration: 0.3, stagger: 0.04, ease: "power2.out" },
        "-=0.3"
      )
      .to(
        labelEls,
        { opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" },
        "-=0.2"
      )
      .to(
        competitorShape,
        { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.2"
      )
      .to(
        augustShape,
        { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" },
        "-=0.5"
      );
  }, [data, center]);

  return (
    <div className="mt-10 flex flex-col items-center">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[420px] overflow-visible"
      >
        {/* Grid rings */}
        {rings.map((r, i) => (
          <circle
            key={i}
            className="radar-ring"
            cx={center}
            cy={center}
            r={radius * r}
            fill="none"
            stroke="rgba(28, 25, 23, 0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Spokes */}
        {spokes.map((s, i) => (
          <line
            key={i}
            className="radar-spoke"
            x1={center}
            y1={center}
            x2={s.x2}
            y2={s.y2}
            stroke="rgba(28, 25, 23, 0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Competitor shape */}
        <polygon
          className="radar-competitor"
          points={competitorPoints}
          fill="rgba(28, 25, 23, 0.08)"
          stroke="rgba(28, 25, 23, 0.25)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* August shape */}
        <polygon
          className="radar-august"
          points={augustPoints}
          fill="rgba(32, 110, 85, 0.18)"
          stroke="#206E55"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* August dots at vertices */}
        {data.map((d, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const r = ((d.august - min) / range) * radius;
          const x = center + Math.cos(angle) * r;
          const y = center + Math.sin(angle) * r;
          return (
            <circle
              key={i}
              className="radar-august"
              cx={x}
              cy={y}
              r="4"
              fill="#206E55"
              stroke="#FAF9F5"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {labels.map((l, i) => (
          <text
            key={i}
            className="radar-label"
            x={l.x}
            y={l.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              fill: "rgba(28, 25, 23, 0.6)",
              letterSpacing: "0.02em",
            }}
          >
            {l.text}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6">
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
