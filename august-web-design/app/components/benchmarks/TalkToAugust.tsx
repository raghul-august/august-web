"use client";

import React from "react";
import Link from "next/link";

export default function TalkToAugust() {
  const containerStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    borderRadius: "1rem",
    background: "linear-gradient(135deg, #ffffff 0%, #f8faf8 100%)",
    padding: "2rem 1.5rem",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(45, 90, 61, 0.1)",
    border: "1px solid rgba(45, 90, 61, 0.1)",
    marginTop: "3rem",
    marginBottom: "2rem",
  };

  const labelStyles: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#2d5a3d",
  };

  const headingStyles: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#1a1a1a",
    margin: 0,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: "1rem",
    color: "#4a4a4a",
    maxWidth: "28rem",
    lineHeight: 1.6,
    margin: 0,
  };

  const buttonStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: "16rem",
    borderRadius: "0.75rem",
    background: "#2d5a3d",
    padding: "0.875rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "white",
    textDecoration: "none",
    transition: "background 0.2s ease, transform 0.2s ease",
    marginTop: "0.5rem",
  };

  return (
    <div style={containerStyles}>
      <p style={labelStyles}>Talk to August</p>
      <p style={headingStyles}>Need medical answers right now?</p>
      <p style={descriptionStyles}>
        For instant 24/7 medical guidance, reach out to August.
      </p>
      <Link
        href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=benchmark_bottom_cta"
        style={buttonStyles}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#3d7a52";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#2d5a3d";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Talk to August
      </Link>
    </div>
  );
}
