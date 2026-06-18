"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ColorBlindPlate } from "@/app/data/tools/color-blind-test-questions";

interface IshiharaPlateProps {
  plate: ColorBlindPlate;
  size?: number;
}

const SVG_SIZE = 320;
const RADIUS = SVG_SIZE / 2;
const DOT_MIN = 4;
const DOT_MAX = 10;
const DOT_COUNT = 380;

// Tiny mulberry32 PRNG for deterministic dot layout per plate id.
function makeRng(seed: number) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Dot {
  cx: number;
  cy: number;
  r: number;
  inside: boolean;
  colorIdx: number;
}

/**
 * Sample whether a point (x, y) in SVG space falls inside the digit glyph.
 * Uses an offscreen canvas where the digit is drawn in white on black.
 */
function buildDigitMask(text: string): ((x: number, y: number) => boolean) | null {
  if (typeof document === "undefined") return null;
  if (!text) return () => false;
  const canvas = document.createElement("canvas");
  canvas.width = SVG_SIZE;
  canvas.height = SVG_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, SVG_SIZE, SVG_SIZE);
  // Pick a font size that fits the circle for 1–3 digit text.
  const fontSize = text.length > 1 ? Math.floor(SVG_SIZE * 0.5) : Math.floor(SVG_SIZE * 0.6);
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${fontSize}px "Arial Black", "Inter", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, SVG_SIZE / 2, SVG_SIZE / 2 + 4);
  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, SVG_SIZE, SVG_SIZE);
  } catch {
    return null;
  }
  const data = imageData.data;
  return (x: number, y: number) => {
    const ix = Math.max(0, Math.min(SVG_SIZE - 1, Math.round(x)));
    const iy = Math.max(0, Math.min(SVG_SIZE - 1, Math.round(y)));
    const idx = (iy * SVG_SIZE + ix) * 4;
    return data[idx] > 128;
  };
}

function generateDots(
  plate: ColorBlindPlate,
  mask: ((x: number, y: number) => boolean) | null,
): Dot[] {
  const rng = makeRng(plate.id * 9301 + 49297);
  const dots: Dot[] = [];
  let attempts = 0;
  const maxAttempts = DOT_COUNT * 20;

  while (dots.length < DOT_COUNT && attempts < maxAttempts) {
    attempts += 1;
    const angle = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * (RADIUS - DOT_MAX - 2);
    const cx = RADIUS + r * Math.cos(angle);
    const cy = RADIUS + r * Math.sin(angle);
    const dotR = DOT_MIN + rng() * (DOT_MAX - DOT_MIN);

    // Reject if it overlaps too much with existing dots.
    let overlaps = false;
    for (let i = dots.length - 1; i >= Math.max(0, dots.length - 60); i--) {
      const d = dots[i];
      const dx = d.cx - cx;
      const dy = d.cy - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < d.r + dotR - 0.5) {
        overlaps = true;
        break;
      }
    }
    if (overlaps) continue;

    const inside = mask ? mask(cx, cy) : false;
    const palette = inside ? plate.figureColors : plate.backgroundColors;
    const colorIdx = Math.floor(rng() * palette.length);
    dots.push({ cx, cy, r: dotR, inside, colorIdx });
  }

  return dots;
}

export default function IshiharaPlate({ plate, size = SVG_SIZE }: IshiharaPlateProps) {
  // Render only after mount to avoid SSR/CSR hydration mismatch (canvas needed).
  const [mounted, setMounted] = useState(false);
  const lastIdRef = useRef<number | null>(null);
  useEffect(() => {
    setMounted(true);
  }, []);

  const dots = useMemo<Dot[] | null>(() => {
    if (!mounted) return null;
    const mask = buildDigitMask(plate.displayedNumber || plate.alternativeNumber || "");
    lastIdRef.current = plate.id;
    return generateDots(plate, mask);
  }, [mounted, plate]);

  return (
    <div className="cbt-plate-wrapper" style={{ maxWidth: size }}>
      {dots ? (
        <svg
          className="cbt-plate-svg"
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          role="img"
          aria-label={`Color blind test plate ${plate.id}`}
        >
          <defs>
            <clipPath id={`cbt-circle-${plate.id}`}>
              <circle cx={RADIUS} cy={RADIUS} r={RADIUS} />
            </clipPath>
          </defs>
          <g clipPath={`url(#cbt-circle-${plate.id})`}>
            <rect width={SVG_SIZE} height={SVG_SIZE} fill="#f4ecd8" />
            {dots.map((d, i) => {
              const palette = d.inside ? plate.figureColors : plate.backgroundColors;
              return (
                <circle
                  key={i}
                  cx={d.cx}
                  cy={d.cy}
                  r={d.r}
                  fill={palette[d.colorIdx % palette.length]}
                />
              );
            })}
          </g>
        </svg>
      ) : (
        <div className="cbt-plate-fallback">Loading plate…</div>
      )}
    </div>
  );
}
