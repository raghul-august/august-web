import type { ReactNode } from "react";
import { BG, BG_DARK, SANS } from "./og-theme";

export type OGCardProps = {
  eyebrow: string;
  title: string[];
  subtitle: string[];
  titleSize?: number;
  titleLetterSpacing?: string;
  subtitleSize?: number;
  subtitleMaxWidth?: number;
  children: ReactNode;
};

export function OGCard({
  eyebrow,
  title,
  subtitle,
  titleSize = 72,
  titleLetterSpacing = "-0.04em",
  subtitleSize = 23,
  subtitleMaxWidth = 520,
  children,
}: OGCardProps) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        background: `linear-gradient(135deg, ${BG} 0%, ${BG_DARK} 100%)`,
        position: "relative",
        display: "flex",
        fontFamily: SANS,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -150,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(180, 215, 190, 0.18) 0%, transparent 65%)",
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "70px 60px 55px 80px",
          width: 640,
          height: 630,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "13px 28px",
            borderRadius: 100,
            background: "rgba(255, 255, 255, 0.18)",
            border: "1.5px solid rgba(255, 255, 255, 0.45)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "0.22em",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: titleSize,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: titleLetterSpacing,
              lineHeight: 1.02,
              marginBottom: 26,
            }}
          >
            {title.map((line, i) => (
              <span key={i} style={{ display: "flex" }}>{line}</span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: subtitleSize,
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.78)",
              lineHeight: 1.45,
              maxWidth: subtitleMaxWidth,
            }}
          >
            {subtitle.map((line, i) => (
              <span key={i} style={{ display: "flex" }}>{line}</span>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.55)",
            letterSpacing: "0.02em",
          }}
        >
          Powered by meetaugust.ai
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 30,
          top: 0,
          width: 560,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}