"use client";

import React, { useState, useEffect } from "react";

interface NavItem {
  id: string;
  label: string;
}

interface SideNavProps {
  items: NavItem[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function SideNav({
  items,
  activeSection,
  onNavigate,
}: SideNavProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Hide sidebar on mobile only
  if (isMobile) {
    return null;
  }

  const sideNavStyles: React.CSSProperties = {
    position: "sticky",
    top: 140,
    height: "fit-content",
    maxHeight: "calc(100vh - 140px)",
    width: isTablet ? 200 : 320,
    minWidth: isTablet ? 200 : 320,
    flexShrink: 0,
    background: "#ffffff",
    borderRight: "none",
    padding: isTablet ? "2rem 1rem" : "3rem 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    overflowY: "auto",
    textAlign: "center",
    boxSizing: "border-box",
  };

  const navLogoStyles: React.CSSProperties = {
    fontFamily: 'var(--font-serif), "DM Serif Display", serif',
    fontSize: isTablet ? "1.25rem" : "1.5rem",
    marginBottom: isTablet ? "2rem" : "3rem",
    color: "#2d5a3d",
  };

  const getNavItemStyle = (id: string): React.CSSProperties => {
    const isActive = activeSection === id;
    const isHovered = hoveredItem === id;

    const baseStyles: React.CSSProperties = {
      display: "block",
      padding: isTablet ? "0.5rem 0" : "0.75rem 0",
      background: "transparent",
      border: "none",
      color: "#4a4a4a",
      textDecoration: "none",
      fontWeight: 400,
      fontSize: isTablet ? "0.85rem" : "0.95rem",
      transition: "color 0.3s ease",
      cursor: "pointer",
      textAlign: "center",
    };

    const hoverStyles: React.CSSProperties = {
      color: "#1a1a1a",
    };

    const activeStyles: React.CSSProperties = {
      color: "#2d5a3d",
      fontWeight: 500,
    };

    return {
      ...baseStyles,
      ...(isHovered && !isActive ? hoverStyles : {}),
      ...(isActive ? activeStyles : {}),
    };
  };

  return (
    <nav style={sideNavStyles} className="benchmarks-side-nav">
      <div style={navLogoStyles}>Benchmarks</div>
      {items.map((item) => (
        <button
          key={item.id}
          style={getNavItemStyle(item.id)}
          onClick={() => onNavigate(item.id)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
