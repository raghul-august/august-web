import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import ToolOGCard from "@/app/components/og/ToolOGCard";

export const runtime = "nodejs";

function getCardImage(score: number) {
  if (score <= 9) return "low_key_card.png";
  if (score <= 13) return "maybe_something_card.png";
  if (score <= 17) return "notable_vibes_card.png";
  return "good_vibes_card.png";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scoreParam = searchParams.get("score");
  const score = scoreParam ? parseInt(scoreParam, 10) : 0;
  const clampedScore = Math.max(0, Math.min(24, score));

  const cardFileName = getCardImage(clampedScore);

  // Read the image file and convert to base64
  const imagePath = join(process.cwd(), "public", "quiz", "cards", cardFileName);
  const imageBuffer = await readFile(imagePath);
  const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  const imageResponse = new ImageResponse(
    (
      <ToolOGCard width={600} height={780}>
        {/* Card Image - fills entire space */}
        <img
          src={base64Image}
          width={600}
          height={780}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        {/* Score Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            left: "0",
            width: "600px",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "96px",
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            {clampedScore}
          </span>
          <span
            style={{
              fontSize: "54px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            /24
          </span>
        </div>
      </ToolOGCard>
    ),
    {
      width: 600,
      height: 780,
    }
  );

  // Add aggressive caching headers - score-based images are immutable
  imageResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return imageResponse;
}
