"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  as = "button",
  style = {},
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  as?: "button" | "a";
  style?: CSSProperties;
  [key: string]: unknown;
}) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const sizes: Record<Size, CSSProperties> = {
    sm: { minHeight: 44, padding: "11px 22px", fontSize: 14 },
    md: { minHeight: 56, padding: "14px 26px", fontSize: 16 },
  };

  const palette = (
    {
      primary: {
        base: {
          background: "var(--brand-primary)",
          color: "#fff",
          border: "1px solid transparent",
          boxShadow: "var(--shadow-sm)",
        },
        hover: { background: "var(--brand-primary-hover)", boxShadow: "var(--shadow-md)" },
        active: { background: "var(--brand-primary-pressed)" },
      },
      secondary: {
        base: {
          background: "var(--surface-elevated)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        },
        hover: { background: "var(--surface-subtle)", borderColor: "var(--border-strong)" },
        active: {},
      },
      outline: {
        base: {
          background: "transparent",
          color: "var(--brand-primary)",
          border: "1px solid var(--brand-primary)",
        },
        hover: { background: "var(--brand-subtle)" },
        active: {},
      },
      ghost: {
        base: {
          background: "transparent",
          color: "var(--text-secondary)",
          border: "1px solid transparent",
        },
        hover: { background: "var(--surface-subtle)", color: "var(--text-primary)" },
        active: {},
      },
    } as const
  )[variant] as { base: CSSProperties; hover: CSSProperties; active: CSSProperties };

  const lift = variant === "secondary" || variant === "outline" || variant === "primary";

  const composed: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "var(--font-sans)",
    fontWeight: 500,
    lineHeight: 1.25,
    borderRadius: "var(--radius-pill)",
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    transition: "all 0.16s var(--ease-standard)",
    width: fullWidth ? "100%" : "auto",
    opacity: disabled ? 0.5 : 1,
    transform:
      !disabled && hover && lift ? (active ? "translateY(0)" : "translateY(-1px)") : "translateY(0)",
    ...sizes[size],
    ...palette.base,
    ...(!disabled && hover ? palette.hover : {}),
    ...(!disabled && active ? palette.active : {}),
    ...style,
  };

  const Tag = as as "button" | "a";

  return (
    <Tag
      style={composed}
      disabled={as === "button" ? disabled : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      {...rest}
    >
      {iconLeft && (
        <span style={{ fontSize: "1.1em", display: "inline-flex" }} aria-hidden>
          {iconLeft}
        </span>
      )}
      {children}
      {iconRight && (
        <span style={{ fontSize: "1.1em", display: "inline-flex" }} aria-hidden>
          {iconRight}
        </span>
      )}
    </Tag>
  );
}
