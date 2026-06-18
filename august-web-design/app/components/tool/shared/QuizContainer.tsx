"use client";

import React from "react";
import { colors } from "../../../utils/tools/tool-colors";

interface QuizContainerProps {
  children: React.ReactNode;
  showFooter?: boolean;
  footerText?: string;
  bgColor?: string;
  showBlobs?: boolean;
}

const blobStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  blob1: {
    position: "absolute",
    borderRadius: "50%",
    width: "600px",
    height: "600px",
    background: `radial-gradient(circle, ${colors.green100} 0%, transparent 70%)`,
    top: "-20%",
    left: "-10%",
    filter: "blur(60px)",
    opacity: 0.6,
  },
  blob2: {
    position: "absolute",
    borderRadius: "50%",
    width: "500px",
    height: "500px",
    background: `radial-gradient(circle, ${colors.green200} 0%, transparent 70%)`,
    bottom: "-10%",
    right: "-10%",
    filter: "blur(50px)",
    opacity: 0.5,
  },
  blob3: {
    position: "absolute",
    borderRadius: "50%",
    width: "400px",
    height: "400px",
    background: `radial-gradient(circle, ${colors.green100} 0%, transparent 70%)`,
    top: "30%",
    right: "20%",
    filter: "blur(40px)",
    opacity: 0.4,
  },
};

export default function QuizContainer({
  children,
  showFooter = false,
  footerText = "This is not a diagnostic tool. Please consult a healthcare professional for proper evaluation.",
  bgColor = colors.bg,
  showBlobs = false,
}: QuizContainerProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: bgColor,
      }}
    >
      {showBlobs && (
        <div style={blobStyles.wrapper}>
          <div style={blobStyles.blob1} />
          <div style={blobStyles.blob2} />
          <div style={blobStyles.blob3} />
        </div>
      )}

      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}

        {/* {showFooter && (
          <footer style={{ padding: "24px", textAlign: "center" }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--tool-accent)",
                margin: 0,
              }}
            >
              {footerText}
            </p>
          </footer>
        )} */}
      </div>
    </div>
  );
}
