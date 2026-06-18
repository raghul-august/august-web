import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { computeDose } from "@/app/utils/tools/glp1-dose-compute";
import { OGCard } from "../_lib/OGCard";
import { INK, FILL_LIGHT, FILL_MID, HIGHLIGHT } from "../_lib/og-theme";

export const runtime = "nodejs";

type Med = "semaglutide" | "tirzepatide";

function parseNum(value: string | null, fallback: number): number {
  if (value == null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function medLabel(med: Med): string {
  return med === "tirzepatide" ? "Tirzepatide" : "Semaglutide";
}

const numFmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const medParam = searchParams.get("med");
  const med: Med = medParam === "tirzepatide" ? "tirzepatide" : "semaglutide";
  const dose = parseNum(searchParams.get("dose"), 2.4);
  const conc = parseNum(searchParams.get("conc"), 2.5);
  const { unitsU100 } = computeDose({ medication: med, concentration: conc, dose, barrelMl: 1.0 });
  const computedUnits = Number.isFinite(unitsU100) ? unitsU100 : 0;
  const units = parseNum(searchParams.get("units"), computedUnits);
  const fillFraction = Math.max(0, Math.min(1, units / 100));

  const image = new ImageResponse(
    (
      <OGCard
        eyebrow="GLP-1 DOSE"
        title={[`${numFmt.format(units)} units`]}
        titleSize={88}
        subtitle={[
          `${medLabel(med)} . ${numFmt.format(dose)} mg @ ${numFmt.format(conc)} mg/mL`,
          "On a U-100 insulin syringe.",
        ]}
      >
        <div style={{ position: "relative", width: 500, height: 500, display: "flex" }}>
          <svg width="500" height="500" viewBox="0 0 500 500" style={{ display: "flex" }}>
            <ellipse cx="250" cy="430" rx="180" ry="14" fill="rgba(0,0,0,0.22)" />
            <g transform="translate(20 200)">
              <line x1="430" y1="60" x2="488" y2="60" stroke={INK} strokeWidth="6" strokeLinecap="round" />
              <rect x="412" y="48" width="22" height="24" rx="2" fill={INK} />
              <rect x="80" y="30" width="330" height="60" rx="4" fill={FILL_LIGHT} stroke={INK} strokeWidth="4" />
              <rect x="84" y="34" width={Math.max(8, fillFraction * 322)} height="52" rx="2" fill={FILL_MID} />
              {Array.from({ length: 11 }, (_, i) => 80 + (i * 33)).map((x, i) => (
                <line key={i} x1={x} y1="30" x2={x} y2={i % 5 === 0 ? "16" : "22"} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
              ))}
              <rect x="60" y="14" width="22" height="92" rx="3" fill={INK} />
              <rect x="0" y="52" width="62" height="16" fill={INK} />
              <rect x="-14" y="34" width="14" height="52" rx="3" fill={INK} />
            </g>
            <path d="M 250 175 L 240 200 L 260 200 Z" fill={HIGHLIGHT} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          </svg>

          <div style={{ position: "absolute", left: 160, top: 105, width: 180, height: 70, borderRadius: 12, background: HIGHLIGHT, border: `4px solid ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <div style={{ display: "flex", fontSize: 13, fontWeight: 800, color: INK, letterSpacing: "0.20em" }}>DRAW TO</div>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 800, color: INK, letterSpacing: "-0.02em" }}>{numFmt.format(units)} units</div>
          </div>
        </div>
      </OGCard>
    ),
    { width: 1200, height: 630 }
  );
  image.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return image;
}