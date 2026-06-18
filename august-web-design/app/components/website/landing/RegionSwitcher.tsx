"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";

const REGIONS = [
  { code: "in", label: "India", suffix: "" },
  { code: "us", label: "United States", suffix: "/us" },
] as const;

type RegionCode = (typeof REGIONS)[number]["code"];

function getBase(pathname: string): "/terms" | "/privacy" | null {
  if (pathname.startsWith("/terms")) return "/terms";
  if (pathname.startsWith("/privacy")) return "/privacy";
  return null;
}

function getCurrentRegion(pathname: string): RegionCode {
  return pathname.endsWith("/us") ? "us" : "in";
}

export default function RegionSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const base = getBase(pathname);
  const current = getCurrentRegion(pathname);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!base) return null;

  const handleSelect = (code: RegionCode) => {
    setOpen(false);
    if (code === current) return;
    const region = REGIONS.find((r) => r.code === code)!;
    router.push(`${base}${region.suffix}`);
  };

  const currentRegion = REGIONS.find((r) => r.code === current)!;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Region: ${currentRegion.label}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid rgba(28, 25, 23, 0.12)",
          background: "white",
          color: "rgba(28, 25, 23, 0.85)",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        <span>{currentRegion.label}</span>
        <CaretDown size={12} weight="bold" style={{ opacity: 0.6 }} />
      </button>
      {open && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            margin: 0,
            padding: "4px",
            listStyle: "none",
            background: "white",
            border: "1px solid rgba(28, 25, 23, 0.12)",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            minWidth: "160px",
            zIndex: 60,
          }}
        >
          {REGIONS.map((r) => {
            const selected = r.code === current;
            return (
              <li key={r.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(r.code)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: selected ? "rgba(32, 110, 85, 0.08)" : "transparent",
                    color: selected ? "#206E55" : "rgba(28, 25, 23, 0.85)",
                    fontSize: "14px",
                    fontWeight: selected ? 600 : 500,
                    cursor: "pointer",
                  }}
                >
                  {r.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
