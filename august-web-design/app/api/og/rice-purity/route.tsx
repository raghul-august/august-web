import { ImageResponse } from "next/og";
import ToolOGCard from "@/app/components/og/ToolOGCard";

export const runtime = "nodejs";

export async function GET() {
  const imageResponse = new ImageResponse(
    (
      <ToolOGCard
        width={1200}
        height={630}
        background="linear-gradient(135deg, #e9f1ee 0%, #bad2ca 100%)"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        branding={true}
        brandingStyle={{ color: "#0d2e24", opacity: 0.4 }}
      >
        <span
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#0d2e24",
            textAlign: "center",
          }}
        >
          Rice Purity Test
        </span>
        <span
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "#0d2e24",
            opacity: 0.6,
            marginTop: "16px",
          }}
        >
          But for your health
        </span>
      </ToolOGCard>
    ),
    { width: 1200, height: 630 }
  );

  imageResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return imageResponse;
}
