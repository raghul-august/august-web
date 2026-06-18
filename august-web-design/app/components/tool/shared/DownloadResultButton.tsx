"use client";

import type { CSSProperties } from "react";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";

interface DownloadResultButtonProps {
  onClick: () => void | Promise<void>;
  label?: string;
  className?: string;
  style?: CSSProperties;
  iconSize?: number;
}

export default function DownloadResultButton({
  onClick,
  label = "Save as pdf",
  className = "tool-btn tool-btn--primary mb-0",
  style,
  iconSize = 18,
}: DownloadResultButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label="Download report"
      style={{ display: "inline-flex", alignItems: "center", gap: 6, ...style }}
    >
      <DownloadSimpleIcon size={iconSize} />
      <span>{label}</span>
    </button>
  );
}
