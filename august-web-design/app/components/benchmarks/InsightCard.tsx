"use client";

import React, { CSSProperties, useState, useEffect } from "react";
import Link from "next/link";

interface InsightCardProps {
  number: string;
  headline: string;
  detail: React.ReactNode;
  variant?: "default" | "wide";
  href?: string;
}

export default function InsightCard({
  number,
  headline,
  detail,
  variant = "default",
  href,
}: InsightCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isReadMoreHovered, setIsReadMoreHovered] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const isWide = variant === "wide";

  const cardStyles: CSSProperties = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    border: "1px solid #e5e5e5",
    borderRadius: isMobile ? "12px" : "16px",
    padding: isMobile
      ? "1.25rem 1rem"
      : isWide
        ? "1.5rem 2rem"
        : "2rem",
    textDecoration: "none",
    color: "inherit",
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    ...(isWide && !isMobile && {
      gridColumn: "1 / -1",
      display: "flex",
      alignItems: "center",
      gap: "2rem",
    }),
  };

  const numberStyles: CSSProperties = {
    fontFamily: 'var(--font-serif), "DM Serif Display", serif',
    fontSize: isMobile
      ? "2rem"
      : isWide
        ? "2.5rem"
        : "3.5rem",
    fontWeight: 700,
    color: "#2d5a3d",
    lineHeight: 1,
    marginBottom: isMobile ? "0.75rem" : (isWide ? 0 : "0.75rem"),
    whiteSpace: isWide && !isMobile ? "nowrap" : "normal",
    textAlign: "left",
  };

  const headlineStyles: CSSProperties = {
    fontSize: isMobile ? "1rem" : "1.1rem",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: isMobile ? "0.5rem" : (isWide ? "0.25rem" : "0.5rem"),
    textAlign: "left",
  };

  const detailStyles: CSSProperties = {
    fontSize: isMobile ? "0.9rem" : "0.95rem",
    color: "#4a4a4a",
    lineHeight: 1.6,
    textAlign: "left",
  };

  const readMoreStyles: CSSProperties = {
    color: "#2d5a3d",
    fontWeight: 600,
    fontSize: "0.85rem",
    marginTop: "0.5rem",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "0.25rem",
    textDecoration: "none",
  };

  const arrowStyles: CSSProperties = {
    display: "inline-block",
    transition: "transform 0.2s ease",
    transform: isReadMoreHovered ? "translateX(4px)" : "translateX(0)",
  };

  return (
    <div style={cardStyles}>
      <div style={numberStyles}>{number}</div>
      <div>
        <div style={headlineStyles}>{headline}</div>
        <div style={detailStyles}>{detail}</div>
        {href && (
          <Link
            href={href}
            style={readMoreStyles}
            onMouseEnter={() => setIsReadMoreHovered(true)}
            onMouseLeave={() => setIsReadMoreHovered(false)}
          >
            Read more <span style={arrowStyles}>&rarr;</span>
          </Link>
        )}
      </div>
    </div>
  );
}
