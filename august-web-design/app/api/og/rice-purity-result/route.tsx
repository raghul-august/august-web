import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import ToolOGCard from "@/app/components/og/ToolOGCard";

export const runtime = "nodejs";

function getTierTitle(score: number) {
  if (score >= 90) return "Impossibly Pure";
  if (score >= 70) return "Pretty Open";
  if (score >= 50) return "Average Human";
  if (score >= 30) return "Secret Hoarder";
  return "Body Secrets Master";
}

function getTierEmoji(score: number) {
  if (score >= 90) return "😇";
  if (score >= 70) return "😌";
  if (score >= 50) return "🫣";
  if (score >= 30) return "🤫";
  return "🔮";
}

function getGradient(score: number) {
  if (score >= 70) return "linear-gradient(135deg, #e9f1ee 0%, #bad2ca 100%)";
  if (score >= 40) return "linear-gradient(135deg, #bad2ca 0%, #6a9e8d 100%)";
  return "linear-gradient(135deg, #6a9e8d 0%, #206e55 100%)";
}

function getTextColor(score: number) {
  if (score >= 40) return "#0d2e24";
  return "#ffffff";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scoreParam = searchParams.get("score");
  const score = scoreParam ? parseInt(scoreParam, 10) : 50;
  const clamped = Math.max(0, Math.min(100, score));

  const tier = getTierTitle(clamped);
  const emoji = getTierEmoji(clamped);
  const gradient = getGradient(clamped);
  const textColor = getTextColor(clamped);

  const imageResponse = new ImageResponse(
    (
      <ToolOGCard
        width={1200}
        height={630}
        background={gradient}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        {/* Top label */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "20px", color: textColor, opacity: 0.7, fontWeight: 500 }}>
            Rice Purity Test
          </span>
        </div>

        {/* Emoji */}
        <span style={{ fontSize: "80px", marginBottom: "16px" }}>{emoji}</span>

        {/* Score */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{ fontSize: "120px", fontWeight: 700, color: textColor, lineHeight: 1 }}>
            {clamped}
          </span>
          <span style={{ fontSize: "48px", fontWeight: 500, color: textColor, opacity: 0.7 }}>
            /100
          </span>
        </div>

        {/* Tier */}
        <span
          style={{
            fontSize: "32px",
            fontWeight: 600,
            color: textColor,
            marginTop: "16px",
          }}
        >
          {tier}
        </span>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "18px", color: textColor, opacity: 0.5, fontWeight: 500 }}>
            meetaugust.ai
          </span>
        </div>
      </ToolOGCard>
    ),
    {
      width: 1200,
      height: 630,
    }
  );

  imageResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return imageResponse;
}
