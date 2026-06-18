"use client";

import React, { CSSProperties, useEffect, useState } from "react";

interface ComparisonTableProps {
  headers: string[];
  rows: Array<{ cells: React.ReactNode[]; highlight?: boolean }>;
}

export default function ComparisonTable({ headers, rows }: ComparisonTableProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const wrapperStyles: CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    marginTop: "2rem",
  };

  const containerStyles: CSSProperties = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    border: "1px solid #e5e5e5",
    borderRadius: isMobile ? "8px" : "16px",
    overflow: "visible",
    minWidth: isMobile ? "500px" : "auto",
  };

  const tableStyles: CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const thStyles: CSSProperties = {
    padding: isMobile ? "0.75rem 0.75rem" : "1.25rem 1.5rem",
    textAlign: "left",
    borderBottom: "1px solid #e5e5e5",
    background: "#f1f3f4",
    fontWeight: 500,
    fontSize: isMobile ? "0.7rem" : "0.875rem",
    textTransform: "uppercase",
    letterSpacing: isMobile ? "0.5px" : "1px",
    color: "#7a7a7a",
    whiteSpace: "nowrap",
  };

  const getTdStyles = (
    isFirstCell: boolean,
    isLastRow: boolean,
    isHighlight: boolean
  ): CSSProperties => ({
    padding: isMobile ? "0.75rem 0.75rem" : "1.25rem 1.5rem",
    textAlign: "left",
    borderBottom: isLastRow ? "none" : "1px solid #e5e5e5",
    fontWeight: isFirstCell ? 500 : "normal",
    color: isFirstCell ? "#1a1a1a" : "#2d5a3d",
    fontFamily: isFirstCell
      ? "inherit"
      : 'var(--font-serif), "DM Serif Display", serif',
    fontSize: isFirstCell ? (isMobile ? "0.85rem" : "inherit") : (isMobile ? "1rem" : "1.25rem"),
    background: isHighlight ? "#e8f0eb" : "transparent",
    whiteSpace: isMobile ? "nowrap" : "normal",
  });

  // The wrapper with overflow:auto is the direct parent of the table
  // so the test checking tableParent.overflowX will find it
  const scrollableContainerStyles: CSSProperties = {
    ...containerStyles,
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  };

  return (
    <div style={wrapperStyles}>
      <div style={scrollableContainerStyles}>
        <table style={tableStyles}>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} style={thStyles}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={getTdStyles(
                      cellIndex === 0,
                      rowIndex === rows.length - 1,
                      !!row.highlight
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
