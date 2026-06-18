"use client";

import React, { CSSProperties, useState, useEffect } from "react";

interface StatCardProps {
  badge?: string;
  label: string;
  value?: string;
  context: React.ReactNode;
}

export default function StatCard({ badge, label, value, context }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const cardStyles: CSSProperties = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    border: `1px solid ${isHovered ? "#2d5a3d" : "#e5e5e5"}`,
    borderRadius: isMobile ? "12px" : "16px",
    padding: isMobile ? "1.25rem 1rem" : "2rem",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    boxShadow: isHovered ? "0 8px 24px rgba(45, 90, 61, 0.1)" : "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const badgeStyles: CSSProperties = {
    display: "inline-block",
    background: "#e8f0eb",
    color: "#2d5a3d",
    padding: isMobile ? "0.25rem 0.5rem" : "0.35rem 0.75rem",
    borderRadius: "50px",
    fontSize: isMobile ? "0.6rem" : "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: isMobile ? "0.5rem" : "0.75rem",
  };

  const labelStyles: CSSProperties = {
    fontSize: isMobile ? "0.75rem" : "0.875rem",
    color: "#7a7a7a",
    textTransform: "uppercase",
    letterSpacing: isMobile ? "0.5px" : "1px",
    marginBottom: isMobile ? "0.35rem" : "0.5rem",
  };

  const valueStyles: CSSProperties = {
    fontFamily: 'var(--font-serif), "DM Serif Display", serif',
    fontSize: isMobile ? "2rem" : "2.5rem",
    color: "#2d5a3d",
    lineHeight: 1,
    marginBottom: isMobile ? "0.35rem" : "0.5rem",
  };

  const contextStyles: CSSProperties = {
    fontSize: isMobile ? "0.85rem" : "0.95rem",
    color: "#4a4a4a",
    marginTop: isMobile ? "0.35rem" : "0.5rem",
    lineHeight: 1.5,
  };

  return (
    <div
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {badge && <div style={badgeStyles}>{badge}</div>}
      <div style={labelStyles}>{label}</div>
      {value && <div style={valueStyles}>{value}</div>}
      <div style={contextStyles}>{context}</div>
    </div>
  );
}
