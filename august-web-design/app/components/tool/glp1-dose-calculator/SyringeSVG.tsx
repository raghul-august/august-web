import React from "react";

export interface SyringeSVGProps {
  barrelMl: 0.3 | 0.5 | 1.0;
  units: number;
  state?: "ok" | "over";
  className?: string;
  animate?: boolean;
  connector?: boolean;
}

const C = {
  ink: "var(--text-primary)",
  inkSoft: "rgba(28,25,23,0.55)",
  inkHair: "rgba(28,25,23,0.15)",
  surface: "var(--surface-elevated)",
  accent: "var(--brand-primary)",
  accentDark: "var(--brand-primary-pressed)",
  accentLight: "var(--brand-subtle)",
  error: "var(--danger)",
  plungerBody: "#f3efe6",
  plungerEdge: "rgba(28,25,23,0.22)",
  plungerThumb: "#e8e2d4",
  flange: "#faf7ef",
} as const;

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const tr = (props: string) => ({ transition: `${props} 500ms ${EASE}` }) as React.CSSProperties;
const FONT = '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const MAJORS = [0, 25, 50, 75, 100];
const MINORS = Array.from({ length: 21 }, (_, i) => i * 5).filter((u) => !MAJORS.includes(u));

// Geometry: viewBox 0 0 840 160
const BX = 110, BW = 640, BY = 48, BH = 66;
const BB = BY + BH, BM = BY + BH / 2;
const xAt = (u: number) => BX + BW - (u / 100) * BW;

export default function SyringeSVG({ barrelMl, units, state = "ok", className, animate = false, connector = false }: SyringeSVGProps) {
  const fillU = Math.max(0, Math.min(100, units));
  const markerU = Math.max(0, Math.min(120, units));
  const fillW = (fillU / 100) * BW;
  const fillX = BX + BW - fillW;
  const markerX = BX + BW - (Math.min(markerU, 100) / 100) * BW;

  const over = state === "over" || units > 100;
  const accent = over ? C.error : C.accent;
  const accentDk = over ? "var(--danger-700)" : C.accentDark;

  const label = `U-100 insulin syringe showing ${units} units on a ${barrelMl} mL barrel${over ? " - exceeds syringe capacity" : ""}`;
  const gId = React.useId();
  const sId = `${gId}-s`, fId = `${gId}-f`, pId = `${gId}-p`;

  return (
    <svg role="img" aria-label={label} viewBox="0 0 840 160" preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: "block", width: "100%", height: "auto" }}>
      <title>{label}</title>
      <desc>Schematic of a U-100 insulin syringe barrel with tick marks from 0 to 100 units; fill level indicates dose.</desc>

      <defs>
        <filter id={sId} x="-5%" y="-20%" width="110%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(28,25,23,0.06)" />
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(28,25,23,0.05)" />
        </filter>
        <linearGradient id={fId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.38" />
          <stop offset="55%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accentDk} stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={pId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.flange} />
          <stop offset="100%" stopColor={C.plungerBody} />
        </linearGradient>
      </defs>

      {/* Plunger: thumb pad + rod + highlight */}
      <rect x={2} y={BY + 4} width={14} height={BH - 8} rx={3} fill={C.plungerThumb} stroke={C.plungerEdge} strokeWidth={1} />
      <rect x={16} y={BY + 22} width={84} height={BH - 44} fill={`url(#${pId})`} stroke={C.plungerEdge} strokeWidth={1} />
      <line x1={16} y1={BM - 4} x2={100} y2={BM - 4} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />

      {/* Flange */}
      <rect x={96} y={BY - 8} width={16} height={BH + 16} rx={2} fill={`url(#${pId})`} stroke={C.plungerEdge} strokeWidth={1} />

      {/* Barrel */}
      <g filter={`url(#${sId})`}>
        <rect x={BX} y={BY} width={BW} height={BH} rx={4} fill={C.surface} stroke={C.inkSoft} strokeWidth={1.25} />
      </g>

      {/* Liquid fill */}
      <rect x={fillX} y={BY + 1.25} width={fillW} height={BH - 2.5} rx={3}
        fill={`url(#${fId})`} opacity={fillW > 0 ? 1 : 0}
        style={animate ? tr("x, width, opacity") : undefined} />
      {fillW > 0 && (
        <line x1={fillX} y1={BY + 2} x2={fillX} y2={BB - 2} stroke={accentDk} strokeWidth={1} opacity={0.5}
          style={animate ? tr("x1, x2") : undefined} />
      )}

      {/* Barrel highlight */}
      <line x1={BX + 6} y1={BY + 4} x2={BX + BW - 6} y2={BY + 4} stroke="rgba(255,255,255,0.9)" strokeWidth={1} />

      {/* Ticks */}
      {MINORS.map((u) => (
        <line key={`m${u}`} x1={xAt(u)} y1={BY + 1.25} x2={xAt(u)} y2={BY + 8} stroke={C.inkHair} strokeWidth={0.75} />
      ))}
      {MAJORS.map((u) => (
        <g key={`M${u}`}>
          <line x1={xAt(u)} y1={BB} x2={xAt(u)} y2={BB + 10} stroke={C.inkSoft} strokeWidth={1.25} />
          <text x={xAt(u)} y={BB + 30} fontSize={20} fontWeight={500} fill={C.inkSoft} fontFamily={FONT} textAnchor="middle">{u}</text>
        </g>
      ))}

      {/* Needle: hub + taper + shaft */}
      <rect x={BX + BW} y={BY + 6} width={18} height={BH - 12} rx={2} fill={`url(#${pId})`} stroke={C.plungerEdge} strokeWidth={1} />
      <polygon points={`${BX + BW + 18},${BM - 3} ${BX + BW + 58},${BM - 1.5} ${BX + BW + 58},${BM + 1.5} ${BX + BW + 18},${BM + 3}`}
        fill="#c9c9c9" stroke={C.plungerEdge} strokeWidth={0.75} />
      <line x1={BX + BW + 58} y1={BM} x2={BX + BW + 92} y2={BM} stroke={C.inkSoft} strokeWidth={1.75} strokeLinecap="round" />

      {/* Dose marker */}
      {connector && fillU > 0 && (
        <line x1={markerX} y1={BY - 18} x2={markerX} y2={BY - 4} stroke={accent} strokeWidth={1.25}
          strokeDasharray="2 3" opacity={0.7} style={animate ? tr("all") : undefined} />
      )}
      <polygon points={`${markerX - 7},${BY - 22} ${markerX + 7},${BY - 22} ${markerX},${BY - 8}`}
        fill={accent} style={animate ? tr("all, fill") : undefined} />

      {/* Over-capacity */}
      {units > 100 && (
        <g>
          <title>Exceeds syringe capacity</title>
          <line x1={BX + 14} y1={BY - 15} x2={markerX} y2={BY - 15} stroke={C.error} strokeWidth={1.5} strokeDasharray="4 3" />
          <circle cx={BX + 6} cy={BY - 15} r={9} fill={C.error} />
          <text x={BX + 6} y={BY - 10} fontSize={14} fontWeight={500} fill="var(--text-inverse)" fontFamily={FONT} textAnchor="middle" dominantBaseline="middle">!</text>
        </g>
      )}
    </svg>
  );
}
