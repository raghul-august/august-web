import React from "react";

type GlowProps = {
  color: string; // e.g. "rgba(32, 110, 85, 0.08)"
  width?: string; // default "600px"
  height?: string; // default "400px"
  top?: string; // default "-60px"
  left?: string | null; // null = omit property; undefined = default "50%"
  translateX?: string; // default "-50%" — set "" to skip transform
};

type Props = {
  width: number;
  height: number;
  background?: string;
  fontFamily?: string;
  flexDirection?: "column" | "row";
  alignItems?: string;
  justifyContent?: string;
  overflow?: string;
  glow?: GlowProps;
  /** Render simple "meetaugust.ai" text footer. Default false. */
  branding?: boolean;
  brandingStyle?: React.CSSProperties; // overrides for the footer span
  children: React.ReactNode;
};

export default function ToolOGCard({
  width,
  height,
  background,
  fontFamily,
  flexDirection,
  alignItems,
  justifyContent,
  overflow,
  glow,
  branding = false,
  brandingStyle,
  children,
}: Props) {
  const outerStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    display: "flex",
    position: "relative",
    ...(flexDirection ? { flexDirection } : {}),
    ...(alignItems ? { alignItems } : {}),
    ...(justifyContent ? { justifyContent } : {}),
    ...(background ? { background } : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(overflow ? { overflow } : {}),
  };

  const glowStyle: React.CSSProperties | null = glow
    ? {
        position: "absolute",
        top: glow.top ?? "-60px",
        // null = omit; undefined = use default "50%"
        ...(glow.left !== null ? { left: glow.left ?? "50%" } : {}),
        width: glow.width ?? "600px",
        height: glow.height ?? "400px",
        background: `radial-gradient(ellipse at center, ${glow.color} 0%, transparent 70%)`,
        display: "flex",
        ...(glow.translateX !== "" ? { transform: `translateX(${glow.translateX ?? "-50%"})` } : {}),
      }
    : null;

  const defaultBrandingStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "40px",
    fontSize: "18px",
    opacity: 0.5,
    fontWeight: 500,
    display: "flex",
    ...brandingStyle,
  };

  return (
    <div style={outerStyle}>
      {glowStyle && <div style={glowStyle} />}
      {children}
      {branding && (
        <div style={defaultBrandingStyle}>meetaugust.ai</div>
      )}
    </div>
  );
}
