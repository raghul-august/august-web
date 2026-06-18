"use client";

import React, { useState, useEffect } from "react";

type ViewMode = "overview" | "deep-dive";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  const [hoveredButton, setHoveredButton] = useState<ViewMode | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const containerStyles: React.CSSProperties = {
    position: "sticky",
    top: isMobile ? 56 : 64,
    zIndex: 100,
    background: "#ffffff",
    padding: isMobile ? "0.75rem 1rem" : "1rem 0rem 0.55rem",
    display: "flex",
    justifyContent: "center",
    borderBottom: "1px solid #e5e5e5",
    width: "100%",
    boxSizing: "border-box",
  };

  const toggleStyles: React.CSSProperties = {
    display: "inline-flex",
    background: "#f1f3f4",
    borderRadius: 8,
    padding: 4,
    gap: 4,
  };

  const getButtonStyle = (mode: ViewMode): React.CSSProperties => {
    const isActive = viewMode === mode;
    const isHovered = hoveredButton === mode;

    const baseStyles: React.CSSProperties = {
      padding: isMobile ? "0.5rem 1rem" : "0.75rem 1.5rem",
      background: "transparent",
      border: "none",
      borderRadius: 6,
      fontFamily: "inherit",
      fontSize: isMobile ? "0.85rem" : "0.9rem",
      fontWeight: 500,
      color: "#4a4a4a",
      cursor: "pointer",
      transition: "all 0.2s ease",
      minHeight: "44px",
    };

    const hoverStyles: React.CSSProperties = {
      color: "#1a1a1a",
    };

    const activeStyles: React.CSSProperties = {
      background: "#ffffff",
      color: "#2d5a3d",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    };

    return {
      ...baseStyles,
      ...(isHovered && !isActive ? hoverStyles : {}),
      ...(isActive ? activeStyles : {}),
    };
  };

  return (
    <div style={containerStyles} className="benchmarks-view-toggle-container">
      <div style={toggleStyles} className="benchmarks-view-toggle">
        <button
          style={getButtonStyle("overview")}
          onClick={() => onViewChange("overview")}
          onMouseEnter={() => setHoveredButton("overview")}
          onMouseLeave={() => setHoveredButton(null)}
        >
          Overview
        </button>
        <button
          style={getButtonStyle("deep-dive")}
          onClick={() => onViewChange("deep-dive")}
          onMouseEnter={() => setHoveredButton("deep-dive")}
          onMouseLeave={() => setHoveredButton(null)}
        >
          Deep Dive
        </button>
      </div>
    </div>
  );
}
