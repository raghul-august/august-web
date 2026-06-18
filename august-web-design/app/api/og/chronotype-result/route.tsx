import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { OGCard } from "../_lib/OGCard";
import { INK, FILL_MID, HIGHLIGHT, BG_DARK } from "../_lib/og-theme";

export const runtime = "nodejs";

type ChronoType = "lion" | "bear" | "wolf" | "dolphin";

const chronotypeData: Record<ChronoType, {
  name: string;
  tagline: string;
  population: string;
  schedule: { wake: string; peak: string; exercise: string; bedtime: string };
}> = {
  lion: {
    name: "The Early Lion",
    tagline: "Natural early riser with morning peak energy.",
    population: "15-20% of population",
    schedule: { wake: "5:30-6 AM", peak: "8 AM-12 PM", exercise: "5:00 PM", bedtime: "9:30-10 PM" },
  },
  bear: {
    name: "The Steady Bear",
    tagline: "Follows the solar cycle naturally.",
    population: "50-55% of population",
    schedule: { wake: "7:00 AM", peak: "10 AM-2 PM", exercise: "7:30 AM", bedtime: "11:00 PM" },
  },
  wolf: {
    name: "The Night Wolf",
    tagline: "Creative peak in the evening and night.",
    population: "15-20% of population",
    schedule: { wake: "7:30-9 AM", peak: "5 PM-12 AM", exercise: "6:00 PM", bedtime: "12-1 AM" },
  },
  dolphin: {
    name: "The Light Dolphin",
    tagline: "Light sleeper with a detail-oriented mind.",
    population: "10% of population",
    schedule: { wake: "6:30 AM", peak: "10 AM-12 PM", exercise: "7:30 AM", bedtime: "11:30 PM" },
  },
};

const typePosition: Record<ChronoType, number> = { lion: 0.18, bear: 0.45, wolf: 0.82, dolphin: 0.55 };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeParam = (searchParams.get("type")?.toLowerCase() || "bear") as ChronoType;
  const type: ChronoType = (["lion", "bear", "wolf", "dolphin"].includes(typeParam) ? typeParam : "bear") as ChronoType;
  const data = chronotypeData[type];
  const pos = typePosition[type];
  const sunX = 60 + pos * 380;
  const sunY = 100 - Math.sin(pos * Math.PI) * 60;
  const isNightType = type === "wolf";

  const RAY_INNER = 22;
  const RAY_OUTER = 32;
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 2 * Math.PI;
    return {
      x1: sunX + Math.cos(angle) * RAY_INNER,
      y1: sunY + Math.sin(angle) * RAY_INNER,
      x2: sunX + Math.cos(angle) * RAY_OUTER,
      y2: sunY + Math.sin(angle) * RAY_OUTER,
    };
  });

  const scheduleRows: Array<[string, string]> = [
    ["Wake", data.schedule.wake],
    ["Peak", data.schedule.peak],
    ["Exercise", data.schedule.exercise],
    ["Bedtime", data.schedule.bedtime],
  ];

  const image = new ImageResponse(
    (
      <OGCard
        eyebrow="YOUR CHRONOTYPE"
        title={[data.name]}
        subtitle={[data.tagline]}
        titleSize={68}
        titleLetterSpacing="-0.035em"
      >
        <div style={{ display: "flex", flexDirection: "column", width: 480, gap: 14 }}>
          <div style={{ display: "flex", alignSelf: "flex-start", padding: "8px 18px", borderRadius: 100, background: "rgba(255, 255, 255, 0.10)", border: "1px solid rgba(255, 255, 255, 0.18)" }}>
            <div style={{ display: "flex", fontSize: 12, fontWeight: 800, color: "rgba(255, 255, 255, 0.85)", letterSpacing: "0.20em" }}>{data.population.toUpperCase()}</div>
          </div>

          <div style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%" }}>
            <svg width="480" height="140" viewBox="0 0 500 140" style={{ display: "flex" }}>
              <line x1="20" y1="120" x2="480" y2="120" stroke={FILL_MID} strokeWidth="3" strokeDasharray="6 8" opacity="0.5" />
              <path d="M 60 120 Q 250 -10 440 120" fill="none" stroke={FILL_MID} strokeWidth="4" strokeLinecap="round" opacity="0.55" />

              {!isNightType && rays.map((r, i) => (
                <line key={i} x1={r.x1.toFixed(2)} y1={r.y1.toFixed(2)} x2={r.x2.toFixed(2)} y2={r.y2.toFixed(2)} stroke={HIGHLIGHT} strokeWidth="3" strokeLinecap="round" />
              ))}

              <circle cx={sunX} cy={sunY} r="18" fill={HIGHLIGHT} stroke={INK} strokeWidth="4" />

              {isNightType && (
                <circle cx={sunX + 8} cy={sunY - 3} r="14" fill={BG_DARK} />
              )}

              {!isNightType && <circle cx={sunX} cy={sunY} r="6" fill={INK} />}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 32px", marginTop: 2 }}>
              {["AM", "NOON", "PM"].map((label) => (
                <div key={label} style={{ display: "flex", fontSize: 11, fontWeight: 800, color: "rgba(255, 255, 255, 0.55)", letterSpacing: "0.22em" }}>{label}</div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.16)", borderRadius: 14, padding: "16px 20px", gap: 10 }}>
            <div style={{ display: "flex", fontSize: 11, fontWeight: 800, color: "rgba(255, 255, 255, 0.55)", letterSpacing: "0.22em" }}>OPTIMAL SCHEDULE</div>
            {scheduleRows.map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ display: "flex", fontSize: 15, fontWeight: 500, color: "rgba(255, 255, 255, 0.7)" }}>{label}</div>
                <div style={{ display: "flex", fontSize: 16, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </OGCard>
    ),
    { width: 1200, height: 630 }
  );
  image.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return image;
}

