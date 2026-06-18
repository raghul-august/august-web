import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { TOOLS, TOOL_CATEGORIES, type ToolCategoryId } from "@/lib/tools";

export const runtime = "nodejs";

const SANS =
  'system-ui, -apple-system, "SF Pro Text", "SF Pro Display", "Segoe UI", sans-serif';

type Theme = {
  bg: string;
  primary: string;
  primaryDeep: string;
  accent: string;
  titleColor: string;
  subtitleColor: string;
  glowWarm: string;
  glowCool: string;
  eyebrow: string;
};

const THEMES: Record<ToolCategoryId, Theme> = {
  "glp1-weight-management": {
    bg: "#eef5f8",
    primary: "#2a7ba0",
    primaryDeep: "#1a5778",
    accent: "#4a9bc0",
    titleColor: "#0e3346",
    subtitleColor: "#3a5a6e",
    glowWarm: "rgba(180, 220, 240, 0.55)",
    glowCool: "rgba(42, 123, 160, 0.20)",
    eyebrow: "GLP-1 & WEIGHT",
  },
  "body-fitness": {
    bg: "#fdf2ec",
    primary: "#d4622b",
    primaryDeep: "#a04818",
    accent: "#e88a5f",
    titleColor: "#4a1f0a",
    subtitleColor: "#6a4030",
    glowWarm: "rgba(252, 222, 196, 0.6)",
    glowCool: "rgba(212, 98, 43, 0.18)",
    eyebrow: "BODY METRICS",
  },
  "healthcare-cost": {
    bg: "#faf2e3",
    primary: "#b8651a",
    primaryDeep: "#854710",
    accent: "#d4862c",
    titleColor: "#3a210a",
    subtitleColor: "#5a4020",
    glowWarm: "rgba(248, 222, 178, 0.55)",
    glowCool: "rgba(184, 101, 26, 0.18)",
    eyebrow: "HEALTHCARE COSTS",
  },
  "medication-tools": {
    bg: "#f3edf8",
    primary: "#6b3a8a",
    primaryDeep: "#4a2660",
    accent: "#8a52aa",
    titleColor: "#2a1040",
    subtitleColor: "#4a3060",
    glowWarm: "rgba(225, 205, 240, 0.55)",
    glowCool: "rgba(107, 58, 138, 0.20)",
    eyebrow: "MEDICATION TOOLS",
  },
  "womens-health": {
    bg: "#fbeeef",
    primary: "#b94a6a",
    primaryDeep: "#8a3050",
    accent: "#d96a8a",
    titleColor: "#4a1226",
    subtitleColor: "#6a3a4a",
    glowWarm: "rgba(248, 215, 220, 0.6)",
    glowCool: "rgba(185, 74, 106, 0.20)",
    eyebrow: "WOMEN'S HEALTH",
  },
  "mental-health": {
    bg: "#f0eaf8",
    primary: "#5a3a8a",
    primaryDeep: "#3a2060",
    accent: "#7a5aaa",
    titleColor: "#1a0e40",
    subtitleColor: "#3a2a5a",
    glowWarm: "rgba(220, 200, 240, 0.55)",
    glowCool: "rgba(90, 58, 138, 0.22)",
    eyebrow: "MENTAL HEALTH",
  },
  "sleep-wellness": {
    bg: "#ebebf5",
    primary: "#3a3a8a",
    primaryDeep: "#202060",
    accent: "#5a5aaa",
    titleColor: "#0e0e40",
    subtitleColor: "#2a2a5a",
    glowWarm: "rgba(205, 205, 235, 0.55)",
    glowCool: "rgba(58, 58, 138, 0.24)",
    eyebrow: "SLEEP & WELLNESS",
  },
  personality: {
    bg: "#f5efe1",
    primary: "#a06820",
    primaryDeep: "#754a14",
    accent: "#b88a4a",
    titleColor: "#3a2810",
    subtitleColor: "#5a4630",
    glowWarm: "rgba(238, 220, 188, 0.55)",
    glowCool: "rgba(160, 104, 32, 0.18)",
    eyebrow: "PERSONALITY",
  },
  "symptom-check": {
    bg: "#eaf3f8",
    primary: "#2a6b8a",
    primaryDeep: "#1a4a60",
    accent: "#4a8aaa",
    titleColor: "#0e2840",
    subtitleColor: "#2a4a60",
    glowWarm: "rgba(200, 225, 240, 0.6)",
    glowCool: "rgba(42, 107, 138, 0.20)",
    eyebrow: "SYMPTOMS & HEALTH",
  },
  relationships: {
    bg: "#fbf0f4",
    primary: "#a04a7a",
    primaryDeep: "#75305a",
    accent: "#c06aa0",
    titleColor: "#3a1228",
    subtitleColor: "#5a304a",
    glowWarm: "rgba(248, 218, 230, 0.6)",
    glowCool: "rgba(160, 74, 122, 0.18)",
    eyebrow: "RELATIONSHIPS",
  },
  substances: {
    bg: "#f3ede5",
    primary: "#7a5524",
    primaryDeep: "#503818",
    accent: "#a07a4a",
    titleColor: "#2a1a08",
    subtitleColor: "#4a3a26",
    glowWarm: "rgba(238, 222, 200, 0.55)",
    glowCool: "rgba(122, 85, 36, 0.18)",
    eyebrow: "SUBSTANCES & RECOVERY",
  },
  cognitive: {
    bg: "#ecf2f7",
    primary: "#3a6a8a",
    primaryDeep: "#1a4060",
    accent: "#5a8aaa",
    titleColor: "#0e2840",
    subtitleColor: "#2a4a60",
    glowWarm: "rgba(205, 225, 240, 0.55)",
    glowCool: "rgba(58, 106, 138, 0.20)",
    eyebrow: "COGNITIVE & SENSORY",
  },
  nutrition: {
    bg: "#f0f4e6",
    primary: "#5a8a2a",
    primaryDeep: "#3a601a",
    accent: "#82b04a",
    titleColor: "#1a3008",
    subtitleColor: "#3a4a26",
    glowWarm: "rgba(218, 232, 195, 0.6)",
    glowCool: "rgba(90, 138, 42, 0.20)",
    eyebrow: "NUTRITION & HYDRATION",
  },
};

const FALLBACK_THEME: Theme = {
  bg: "#f5f1eb",
  primary: "#4d8b77",
  primaryDeep: "#206e55",
  accent: "#6aa491",
  titleColor: "#1a1a1a",
  subtitleColor: "#5a554a",
  glowWarm: "rgba(232, 200, 156, 0.5)",
  glowCool: "rgba(32, 110, 85, 0.18)",
  eyebrow: "AUGUST",
};

function CategoryIcon({ category }: { category: ToolCategoryId | "fallback" }) {
  const stroke = "rgba(255,255,255,0.96)";
  const sw = 1.8;
  const common = {
    width: 110,
    height: 110,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (category) {
    case "glp1-weight-management":
      return (
        <svg {...common}>
          <path d="m18 2 4 4" />
          <path d="m17 7 3-3" />
          <path d="M19 9 8.7 19.3a1 1 0 0 1-1.4 0L2.7 14.7a1 1 0 0 1 0-1.4L13 3" />
          <path d="m9 11 4 4" />
          <path d="m5 19-3 3" />
          <path d="m14 4 6 6" />
        </svg>
      );
    case "body-fitness":
      return (
        <svg {...common}>
          <path d="M6.5 6.5 17.5 17.5" />
          <path d="m21 21-1-1" />
          <path d="m3 3 1 1" />
          <path d="m18 22 4-4" />
          <path d="m2 6 4-4" />
          <path d="m3 10 7-7" />
          <path d="m14 21 7-7" />
        </svg>
      );
    case "healthcare-cost":
      return (
        <svg {...common}>
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "medication-tools":
      return (
        <svg {...common}>
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      );
    case "womens-health":
      return (
        <svg {...common}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
        </svg>
      );
    case "mental-health":
      return (
        <svg {...common}>
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
          <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        </svg>
      );
    case "sleep-wellness":
      return (
        <svg {...common}>
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      );
    case "personality":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
    case "symptom-check":
      return (
        <svg {...common}>
          <path d="M11 2v2" />
          <path d="M5 2v2" />
          <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
          <path d="M8 15a6 6 0 0 0 12 0v-3" />
          <circle cx="20" cy="10" r="2" />
        </svg>
      );
    case "relationships":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "substances":
      return (
        <svg {...common}>
          <path d="M5 22h14" />
          <path d="M5 2h14" />
          <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
          <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
        </svg>
      );
    case "cognitive":
      return (
        <svg {...common}>
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          <path d="M20 3v4" />
          <path d="M22 5h-4" />
          <path d="M4 17v2" />
          <path d="M5 18H3" />
        </svg>
      );
    case "nutrition":
      return (
        <svg {...common}>
          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
          <path d="M10 2c1 .5 2 2 2 5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
  }
}

function labelFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  const tool = TOOLS.find((t) => t.id === id);

  const label = tool?.label ?? labelFromSlug(id || "August Tool");
  const description =
    tool?.description ??
    "A free, private health tool from August. Get a clear answer in minutes.";
  const primary = tool?.categories[0];
  const theme = (primary && THEMES[primary]) || FALLBACK_THEME;
  const categoryLabel =
    (primary && TOOL_CATEGORIES.find((c) => c.id === primary)?.label) ||
    "Health Tool";
  const eyebrow = theme.eyebrow || categoryLabel.toUpperCase();

  const image = new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: theme.bg,
          position: "relative",
          display: "flex",
          fontFamily: SANS,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -180,
            width: 680,
            height: 680,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.glowWarm} 0%, transparent 65%)`,
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -200,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.glowCool} 0%, transparent 65%)`,
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 110,
            top: 175,
            width: 280,
            height: 280,
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -22,
              left: -22,
              width: 324,
              height: 324,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.glowCool} 0%, transparent 70%)`,
              display: "flex",
            }}
          />
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: `linear-gradient(140deg, ${theme.primary} 0%, ${theme.primaryDeep} 100%)`,
              boxShadow: `0 30px 70px ${theme.glowCool}`,
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <CategoryIcon category={primary ?? "fallback"} />
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                width: 256,
                height: 256,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.10)",
                display: "flex",
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 70,
            top: 105,
            bottom: 70,
            width: 580,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 2,
                  background: theme.primary,
                  display: "flex",
                }}
              />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: theme.primary,
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                {eyebrow}
              </div>
            </div>

            <div
              style={{
                fontSize: label.length > 26 ? 50 : 60,
                fontWeight: 800,
                color: theme.titleColor,
                letterSpacing: "-0.035em",
                lineHeight: 1.04,
                marginBottom: 22,
                display: "flex",
                maxWidth: 540,
              }}
            >
              {label}
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: theme.subtitleColor,
                lineHeight: 1.45,
                maxWidth: 540,
                display: "flex",
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.primaryDeep})`,
                boxShadow: `0 6px 16px ${theme.glowCool}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                color: "#fff",
                fontWeight: 800,
              }}
            >
              a
            </div>
            <div
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: theme.titleColor,
                letterSpacing: "-0.01em",
                display: "flex",
              }}
            >
              august
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 400,
                color: "rgba(0, 0, 0, 0.38)",
                marginLeft: 10,
                display: "flex",
              }}
            >
              meetaugust.ai
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );

  image.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return image;
}