"use client";

/* Design-system Composer primitive, ported from the August UI kit.
   `onSend` fires on the CTA click and on Enter (without Shift). */

import { memo, useState, type CSSProperties } from "react";
import { LockSimpleIcon, ArrowRightIcon } from "@phosphor-icons/react/ssr";

import RotatingPlaceholder from "./RotatingPlaceholder";

function Composer({
  placeholder = "Describe your symptoms…",
  placeholders,
  cta = "Start a visit",
  secureNote = "Private & HIPAA-secure",
  onSend,
  style = {},
}: {
  placeholder?: string;
  // When provided, an isolated memoized overlay rotates through these — so the
  // animation re-renders only the placeholder, not this Composer or the Hero.
  placeholders?: string[];
  cta?: string;
  secureNote?: string;
  onSend?: (value: string) => void;
  style?: CSSProperties;
}) {
  const [focus, setFocus] = useState(false);
  const [hover, setHover] = useState(false);
  const [value, setValue] = useState("");

  const rotating = placeholders && placeholders.length > 0;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-elevated)",
        border: `1px solid ${focus ? "var(--brand-primary)" : "var(--border)"}`,
        borderRadius: "var(--radius-xl)",
        boxShadow: focus ? "var(--shadow-md)" : "var(--shadow-sm)",
        padding: "18px 20px",
        transition: "all 0.16s var(--ease-standard)",
        ...style,
      }}
    >
      {/* Matches native placeholder behaviour: visible (and rotating) until the
          user types, regardless of focus. */}
      {rotating && <RotatingPlaceholder texts={placeholders} hidden={value.length > 0} />}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={rotating ? "" : placeholder}
        aria-label={rotating ? placeholders[0] : placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend?.(value);
          }
        }}
        rows={3}
        style={{
          width: "100%",
          minHeight: "4.5em",
          resize: "none",
          border: "none",
          background: "transparent",
          outline: "none",
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          lineHeight: "24px",
          color: "var(--text-primary)",
          padding: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        {secureNote ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            <LockSimpleIcon style={{ color: "var(--brand-primary)", fontSize: "1rem" }} aria-hidden />
            {secureNote}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => onSend?.(value)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minHeight: 44,
            padding: "12px 22px",
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            fontWeight: 500,
            color: "#fff",
            background: hover ? "var(--brand-primary-hover)" : "var(--brand-primary)",
            border: "none",
            borderRadius: "var(--radius-pill)",
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
            transform: hover ? "translateY(-1px)" : "translateY(0)",
            transition: "all 0.16s var(--ease-standard)",
          }}
        >
          {cta}
          <ArrowRightIcon aria-hidden />
        </button>
      </div>
    </div>
  );
}

// Memoized so the Hero's render (or the placeholder rotation) never re-renders
// the Composer — it only re-renders on its own focus/value/hover state.
export default memo(Composer);
