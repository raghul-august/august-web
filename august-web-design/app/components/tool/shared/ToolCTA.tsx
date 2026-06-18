"use client";

import { ReactNode } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react";

interface ToolCTAProps {
  eyebrow?: string;
  headline: ReactNode;
  subheadline?: ReactNode;
  benefits?: readonly string[];
  ctaLabel: string;
  onCtaClick?: () => void;
  href?: string;
  /** Optional className to control outer section spacing (defaults to py-12 md:py-24). */
  sectionClassName?: string;
}

// Same 5-stop sage gradient as the /benchmarks hero (BenchmarksContent.tsx).
const BG_GRADIENT =
  "linear-gradient(165deg, #17453a 0%, #1d5c4a 25%, #206E55 50%, #2a8a6c 75%, #34a07e 100%)";

// Static SVG grid pattern — 80px major lines + 20px minor lines, sage-tinted to match benchmarks.
const GRID_SVG = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>
  <g stroke='rgb(168,213,186)' fill='none' stroke-width='0.5'>
    <path opacity='0.06' d='M0 20 H80 M0 40 H80 M0 60 H80 M20 0 V80 M40 0 V80 M60 0 V80'/>
    <path opacity='0.14' d='M0 0 H80 V80 H0 Z'/>
  </g>
</svg>`);
const GRID_BG = `url("data:image/svg+xml;utf8,${GRID_SVG}")`;

export default function ToolCTA({
  eyebrow,
  headline,
  subheadline,
  benefits,
  ctaLabel,
  onCtaClick,
  href,
  sectionClassName = "py-12 md:py-24",
}: ToolCTAProps) {
  const button = (
    <span
      className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 transition-transform duration-300 hover:scale-[1.03]"
      style={{ color: "#206E55", fontSize: 16, fontWeight: 500 }}
    >
      {ctaLabel}
      <ArrowRight size={14} weight="bold" />
    </span>
  );

  return (
    <section className={`${sectionClassName} relative z-[60]`}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div
          className="relative overflow-hidden rounded-2xl md:rounded-3xl text-center"
          style={{ background: BG_GRADIENT }}
        >
          {/* Static grid lines — tiles the same 80/20px lattice the benchmarks hero uses. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: GRID_BG,
              backgroundSize: "80px 80px",
            }}
          />

          {/* Radial fade — grid dissolves toward the edges into the dark sage. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 50% 45%, transparent 0%, rgba(23,69,58,0.6) 80%)",
            }}
          />

          {/* Subtle warm-sage center glow. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 40% 40% at 50% 45%, rgba(32,110,85,0.18) 0%, transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center px-5 py-10 md:p-16">
            <div className="w-full max-w-2xl">
              {eyebrow && (
                <span
                  className="block"
                  style={{
                    color: "rgba(168, 213, 186, 0.7)",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                  }}
                >
                  {eyebrow}
                </span>
              )}
              <h2
                className={eyebrow ? "mt-2" : ""}
                style={{
                  color: "#FAF9F5",
                  fontSize: "clamp(22px, 4vw, 38px)",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  textWrap: "balance",
                }}
              >
                {headline}
              </h2>
              {subheadline && (
                <p
                  className="mx-auto mt-3 max-w-xl"
                  style={{
                    color: "rgba(250,249,245,0.65)",
                    fontSize: "clamp(14px, 1.6vw, 16px)",
                    fontWeight: 300,
                    lineHeight: 1.6,
                  }}
                >
                  {subheadline}
                </p>
              )}
              {benefits && benefits.length > 0 && (
                <ul className="mx-auto mt-5 grid gap-2 text-left max-w-md">
                  {benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2.5"
                      style={{
                        color: "rgba(250,249,245,0.88)",
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: 1.5,
                      }}
                    >
                      <Check
                        size={16}
                        weight="bold"
                        className="mt-[3px] shrink-0"
                        style={{ color: "rgba(250,249,245,0.95)" }}
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-7 md:mt-8">
                {href ? (
                  <a href={href} aria-label={ctaLabel} onClick={onCtaClick}>
                    {button}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={onCtaClick}
                    aria-label={ctaLabel}
                    className="bg-transparent border-0 p-0 cursor-pointer"
                  >
                    {button}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
