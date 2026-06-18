import { ImageResponse } from "next/og";
import ToolOGCard from "@/app/components/og/ToolOGCard";

export const runtime = "nodejs";

export async function GET() {
  const imageResponse = new ImageResponse(
    (
      <ToolOGCard
        width={1200}
        height={630}
        background="#f4f5f5"
        fontFamily="system-ui, -apple-system, sans-serif"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        glow={{
          color: "rgba(32, 110, 85, 0.08)",
          top: "-60px",
          left: null,
          width: "600px",
          height: "400px",
          translateX: "",
        }}
      >

        {/* Animal emojis row */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {["🦁", "🐻", "🐺", "🐬"].map((emoji) => (
            <div
              key={emoji}
              style={{
                width: "72px",
                height: "72px",
                background:
                  "linear-gradient(135deg, rgba(32, 110, 85, 0.15), rgba(233, 241, 238, 0.5))",
                border: "1px solid rgba(32, 110, 85, 0.2)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 800,
            color: "#1a1a1a",
            letterSpacing: "-0.03em",
            marginBottom: "12px",
            display: "flex",
          }}
        >
          Chronotype Quiz
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "20px",
            color: "rgba(0, 0, 0, 0.5)",
            marginBottom: "28px",
            display: "flex",
          }}
        >
          Discover your ideal sleep-wake rhythm
        </div>

        {/* Pill badges */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "36px",
          }}
        >
          {["8 Questions", "Based on rMEQ", "Free"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: "100px",
                background: "rgba(32, 110, 85, 0.1)",
                border: "1px solid rgba(32, 110, 85, 0.2)",
                fontSize: "14px",
                color: "#206e55",
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #4d8b77, #206e55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            a
          </div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "rgba(0, 0, 0, 0.35)",
              letterSpacing: "0.5px",
              display: "flex",
            }}
          >
            meetaugust.ai
          </div>
        </div>
      </ToolOGCard>
    ),
    {
      width: 1200,
      height: 630,
    }
  );

  imageResponse.headers.set(
    "Cache-Control",
    "public, max-age=31536000, immutable"
  );

  return imageResponse;
}
