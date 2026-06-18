"use client";

import React, { useEffect, useState } from "react";

interface HeroProps {
  tag: string;
  title: string;
  description: string;
}

const Hero: React.FC<HeroProps> = ({ tag, title, description }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 480);
      setIsTablet(window.innerWidth > 480 && window.innerWidth <= 768);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const heroStyles: React.CSSProperties = {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: isMobile ? "1.5rem 1rem" : isTablet ? "2rem 1.5rem" : "2rem",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
    boxSizing: "border-box",
    width: "100%",
  };

  const heroContentStyles: React.CSSProperties = {
    maxWidth: isMobile ? "100%" : "900px",
    width: "100%",
    textAlign: "center",
    zIndex: 1,
    padding: isMobile ? "0 0.5rem" : "0",
    boxSizing: "border-box",
  };

  const heroTagStyles: React.CSSProperties = {
    display: "inline-block",
    padding: isMobile ? "0.4rem 1rem" : "0.5rem 1.5rem",
    background: "#e8f0eb",
    border: "1px solid rgba(45, 90, 61, 0.2)",
    borderRadius: "50px",
    fontSize: isMobile ? "0.75rem" : "0.875rem",
    fontWeight: 500,
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "#2d5a3d",
    marginBottom: isMobile ? "1.5rem" : "2rem",
  };

  const heroTitleStyles: React.CSSProperties = {
    fontFamily: "var(--font-serif), 'DM Serif Display', serif",
    fontSize: isMobile ? "2rem" : isTablet ? "2.5rem" : "4.5rem",
    fontWeight: 400,
    lineHeight: 1.1,
    marginBottom: isMobile ? "1rem" : "1.5rem",
    color: "#1a1a1a",
    wordWrap: "break-word",
    overflowWrap: "break-word",
  };

  const heroDescriptionStyles: React.CSSProperties = {
    fontSize: isMobile ? "1rem" : "1.25rem",
    color: "#4a4a4a",
    maxWidth: isMobile ? "100%" : "700px",
    margin: isMobile ? "0 auto 2rem" : "0 auto 3rem",
    fontWeight: 300,
    whiteSpace: "pre-line",
    lineHeight: 1.6,
    padding: isMobile ? "0 0.25rem" : "0",
  };

  const scrollIndicatorStyles: React.CSSProperties = {
    position: "absolute",
    bottom: isMobile ? "1.5rem" : "3rem",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
  };

  const scrollIndicatorTextStyles: React.CSSProperties = {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "2px",
    color: "#7a7a7a",
  };

  const scrollIndicatorArrowStyles: React.CSSProperties = {
    fontSize: "1.5rem",
    color: "#2d5a3d",
  };

  return (
    <section className="hero" style={heroStyles}>
      <div className="hero-content" style={heroContentStyles}>
        <span className="hero-tag" style={heroTagStyles}>{tag}</span>
        <h1 className="hero-title" style={heroTitleStyles}>{title}</h1>
        <p className="hero-description" style={heroDescriptionStyles}>{description}</p>
      </div>
      <div className="scroll-indicator" style={scrollIndicatorStyles}>
        <span style={scrollIndicatorTextStyles}>Explore</span>
        <span style={scrollIndicatorArrowStyles}>↓</span>
      </div>
    </section>
  );
};

export default Hero;
