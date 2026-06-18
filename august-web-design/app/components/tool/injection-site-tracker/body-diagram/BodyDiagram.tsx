"use client";

import { useCallback, useState } from "react";
import type { InjectionSite } from "@/app/data/tools/injection-site-tracker-config";
import {
  FRONT_BODY_OUTLINE, BACK_BODY_OUTLINE,
  FRONT_ZONES, BACK_ZONES,
  type BodyZoneDef,
} from "./body-zone-paths";
import "./body-diagram.css";

interface BodyDiagramProps {
  selectedSites: InjectionSite[];
  onToggleSite: (site: InjectionSite) => void;
}

const FRONT_VIEWBOX = "60 150 610 1250";
const BACK_VIEWBOX = "780 150 610 1250";

const SVG_DEFS = (
  <defs>
    <linearGradient id="bd-bodyFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F0EDE6" />
      <stop offset="40%" stopColor="#EAE6DD" />
      <stop offset="100%" stopColor="#E2DDD3" />
    </linearGradient>
    <filter id="bd-bodyShadow" x="-5%" y="-2%" width="110%" height="106%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#B8B3A8" floodOpacity="0.25" />
    </filter>
    <linearGradient id="bd-zoneDefault" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#DDD9CF" />
      <stop offset="100%" stopColor="#D1CDC2" />
    </linearGradient>
    <linearGradient id="bd-zoneHover" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="var(--brand-subtle)" />
      <stop offset="100%" stopColor="var(--brand-primary-hover)" stopOpacity="0.5" />
    </linearGradient>
    <linearGradient id="bd-zoneSelected" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="var(--brand-primary-hover)" />
      <stop offset="50%" stopColor="var(--brand-primary)" />
      <stop offset="100%" stopColor="var(--brand-primary-pressed)" />
    </linearGradient>
    <filter id="bd-zoneGlow" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
      <feColorMatrix in="blur" type="matrix"
        values="0 0 0 0 0.125  0 0 0 0 0.431  0 0 0 0 0.333  0 0 0 0.35 0" result="glow" />
      <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="bd-labelShadow">
      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.2" />
    </filter>
  </defs>
);

function ZoneGroup({ zone, isSelected, onToggle }: {
  zone: BodyZoneDef;
  isSelected: boolean;
  onToggle: (site: InjectionSite) => void;
}) {
  const [justSelected, setJustSelected] = useState(false);

  const handleClick = useCallback(() => {
    onToggle(zone.id);
    if (!isSelected) {
      setJustSelected(true);
      setTimeout(() => setJustSelected(false), 500);
    }
  }, [zone.id, isSelected, onToggle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const cls = [
    "bd-zone",
    isSelected && "bd-zone--selected",
    justSelected && "bd-zone--pulse",
  ].filter(Boolean).join(" ");

  const { x, y } = zone.labelAnchor;
  const labelW = zone.label.length * 17 + 30;

  return (
    <g
      className={cls}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${zone.label} injection site${isSelected ? ", selected" : ""}`}
      aria-pressed={isSelected}
    >
      {zone.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
      <rect
        className="bd-zone-label-bg"
        x={x - labelW / 2}
        y={y - 29}
        width={labelW}
        height={58}
        rx={12}
        ry={12}
      />
      <text className="bd-zone-label-text" x={x} y={y}>
        {zone.label}
      </text>
    </g>
  );
}

export default function BodyDiagram({ selectedSites, onToggleSite }: BodyDiagramProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const zones = view === "front" ? FRONT_ZONES : BACK_ZONES;
  const outline = view === "front" ? FRONT_BODY_OUTLINE : BACK_BODY_OUTLINE;
  const viewBox = view === "front" ? FRONT_VIEWBOX : BACK_VIEWBOX;

  return (
    <div className="bd-wrapper">
      <div className="bd-view-toggle">
        <button
          className={view === "front" ? "bd-toggle-btn bd-toggle-btn--active" : "bd-toggle-btn"}
          onClick={() => setView("front")}
        >
          Front
        </button>
        <button
          className={view === "back" ? "bd-toggle-btn bd-toggle-btn--active" : "bd-toggle-btn"}
          onClick={() => setView("back")}
        >
          Back
        </button>
      </div>

      <div className="bd-svg-container">
        <svg viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
          {SVG_DEFS}
          <path className="bd-outline" d={outline} />
          {zones.map((zone) => (
            <ZoneGroup
              key={zone.id}
              zone={zone}
              isSelected={selectedSites.includes(zone.id)}
              onToggle={onToggleSite}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
