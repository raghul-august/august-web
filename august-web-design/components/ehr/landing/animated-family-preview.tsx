'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, ChevronDown, Check } from 'lucide-react';

// ── Persona data ────────────────────────────────────────────────

type BiomarkerCard = {
  kind: 'biomarker';
  label: string;
  sub: string;
  unit: string;
  range: [number, number];
  trend: number[];
  insight: string;
};

type MedicationCard = {
  kind: 'medication';
  label: string;
  dose: string;
  sub: string;
  verdict: 'working' | 'discuss' | 'mixed';
  verdictLabel: string;
  target: { name: string; goal: string };
  before: string;
  after: string;
  delta: string;
  insight: string;
};

type ReminderCard = {
  kind: 'reminder';
  label: string;
  sub: string;
  headRight: string;
  timeline: Array<{ kind: 'done' | 'due' | 'now'; label: string; sub: string }>;
  insight: string;
};

type Persona = {
  id: 'you' | 'mom' | 'dad';
  name: string;
  relation: string;
  initials: string;
  color: string;
  card: BiomarkerCard | MedicationCard | ReminderCard;
};

const PERSONAS: Persona[] = [
  {
    id: 'you',
    name: 'You',
    relation: 'Self',
    initials: 'YO',
    color: '#206E55',
    card: {
      kind: 'biomarker',
      label: 'Vitamin D',
      sub: '25-hydroxy · ref 30–80 ng/mL',
      unit: 'ng/mL',
      range: [30, 80],
      trend: [22, 25, 28, 31, 34, 38],
      insight:
        'Up <em>73% over 6 months</em>, back in range. Trajectory flattens in winter; bump to <em>2,000 IU</em> through January.',
    },
  },
  {
    id: 'mom',
    name: 'Mom',
    relation: 'Mother',
    initials: 'MO',
    color: '#C44D6A',
    card: {
      kind: 'medication',
      label: 'Lisinopril',
      dose: '10 mg',
      sub: 'For blood pressure · 6 months on med',
      verdict: 'working',
      verdictLabel: 'Working',
      target: { name: 'Blood pressure', goal: 'under 130/80' },
      before: '142/88',
      after: '124/78',
      delta: '↓ 18/10 over 6 months · now in target range',
      insight:
        'BP normalised from <em>142/88</em> to <em>124/78</em> on Lisinopril. August will flag if it drifts at the next panel. <em>Continue as prescribed</em> for now.',
    },
  },
  {
    id: 'dad',
    name: 'Dad',
    relation: 'Father',
    initials: 'DA',
    color: '#3B74C4',
    card: {
      kind: 'reminder',
      label: 'Annual physical',
      sub: 'Yearly check-up · with Dr Patel',
      headRight: 'Due in 5 weeks',
      timeline: [
        { kind: 'done', label: 'Apr 2024', sub: 'last visit' },
        { kind: 'now', label: 'Today', sub: '11 mo on' },
        { kind: 'due', label: 'May 2025', sub: 'due' },
      ],
      insight:
        'Last year&rsquo;s labs flagged borderline <em>LDL</em>. August can pre-fill three questions worth revisiting at this visit.',
    },
  },
];

// ── Biomarker chart ────────────────────────────────────────────

function BiomarkerChart({ card, color }: { card: BiomarkerCard; color: string }) {
  const W = 100;
  const H = 100;
  const pad = { l: 4, r: 4, t: 8, b: 8 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const values = card.trend;
  const [lowR, highR] = card.range;
  const trendMin = Math.min(...values);
  const trendMax = Math.max(...values);
  const span = Math.max(trendMax - trendMin, Math.abs(trendMax || 1) * 0.05);
  const padY = span * 0.22;
  let yMin = trendMin - padY;
  let yMax = trendMax + padY;
  const bothInside = lowR >= yMin && lowR <= yMax && highR >= yMin && highR <= yMax;
  if (!bothInside) {
    const mid = (trendMin + trendMax) / 2;
    const nearest = Math.abs(lowR - mid) < Math.abs(highR - mid) ? lowR : highR;
    if (nearest < yMin) yMin = nearest - padY * 0.4;
    if (nearest > yMax) yMax = nearest + padY * 0.4;
  }
  const yPos = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const bandTopV = Math.min(highR, yMax);
  const bandBotV = Math.max(lowR, yMin);
  const bandTopY = yPos(bandTopV);
  const bandBotY = yPos(bandBotV);
  const bandH = Math.max(0, bandBotY - bandTopY);
  const hasBand = bandH > 0.5;

  const points = values.map((v, i) => [pad.l + (i / (values.length - 1)) * plotW, yPos(v)] as const);
  const lineD = points
    .map((p, i) => {
      if (i === 0) return `M ${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
      const prev = points[i - 1];
      const cp1x = prev[0] + (p[0] - prev[0]) * 0.42;
      const cp2x = p[0] - (p[0] - prev[0]) * 0.42;
      return `C ${cp1x.toFixed(2)} ${prev[1].toFixed(2)} ${cp2x.toFixed(2)} ${p[1].toFixed(2)} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
    })
    .join(' ');
  const areaD = `${lineD} L ${points[points.length - 1][0].toFixed(2)} ${(pad.t + plotH).toFixed(2)} L ${points[0][0].toFixed(2)} ${(pad.t + plotH).toFixed(2)} Z`;
  const first = points[0];
  const last = points[points.length - 1];
  const latest = values[values.length - 1];
  const flag = latest > highR ? 'high' : latest < lowR ? 'low' : null;
  const dotColor = flag === 'high' ? '#C44040' : flag === 'low' ? '#3B74C4' : '#206E55';
  const showLowEdge = lowR > yMin && lowR < yMax;
  const showHighEdge = highR > yMin && highR < yMax;
  const labelKey = card.label.replace(/\W+/g, '');
  const gradId = `trendFill-${labelKey}`;

  // Out-of-range zones — rendered as soft reddish background rectangles
  // below the low edge and above the high edge. The line itself stays
  // solid; the journey from red zone → green band tells the improvement
  // story without colouring the data line.
  const lowZoneTopY = showLowEdge ? yPos(lowR) : null;
  const lowZoneHeight = lowZoneTopY != null ? (pad.t + plotH) - lowZoneTopY : 0;
  const highZoneBottomY = showHighEdge ? yPos(highR) : null;
  const highZoneHeight = highZoneBottomY != null ? highZoneBottomY - pad.t : 0;

  // SVG stretches to the container with preserveAspectRatio="none" so the
  // path looks right at any width — but circles get squashed into ovals
  // by the same stretch. Dots are rendered as HTML overlays so they stay
  // round, positioned by percentage of the chart box.
  const firstLeft = `${first[0]}%`;
  const firstTop = `${first[1]}%`;
  const lastLeft = `${last[0]}%`;
  const lastTop = `${last[1]}%`;

  return (
    <div className="relative w-full h-[92px] rounded-[10px] overflow-hidden"
         style={{ background: 'linear-gradient(180deg, rgba(250,251,250,0), rgba(246,250,248,.7))' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 w-full h-full block">
        <defs>
          <linearGradient id="rangeBandGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#F2F8F5" />
            <stop offset="28%" stopColor="#D7ECE2" />
            <stop offset="72%" stopColor="#D7ECE2" />
            <stop offset="100%" stopColor="#F2F8F5" />
          </linearGradient>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="outOfRangeGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#FFF7F6" />
            <stop offset="50%" stopColor="#F9DDDC" />
            <stop offset="100%" stopColor="#FFF7F6" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={pad.l} x2={W - pad.r} y1={pad.t + plotH * f} y2={pad.t + plotH * f}
                stroke="rgba(107,115,112,.11)" strokeWidth={1} fill="none" />
        ))}
        {/* Out-of-range zones — soft reddish wash behind the line where
            values are below low / above high. Painted before the band so
            the band sits on top cleanly. */}
        {lowZoneTopY != null && lowZoneHeight > 1 && (
          <rect x={pad.l} y={lowZoneTopY} width={plotW} height={lowZoneHeight}
                rx={8} fill="url(#outOfRangeGradient)" opacity={0.85} />
        )}
        {highZoneBottomY != null && highZoneHeight > 1 && (
          <rect x={pad.l} y={pad.t} width={plotW} height={highZoneHeight}
                rx={8} fill="url(#outOfRangeGradient)" opacity={0.85} />
        )}
        {hasBand && (
          <rect x={pad.l} y={bandTopY} width={plotW} height={bandH}
                rx={8} fill="url(#rangeBandGradient)" opacity={0.78} />
        )}
        {showLowEdge && (
          <line x1={pad.l} x2={W - pad.r} y1={yPos(lowR)} y2={yPos(lowR)}
                stroke="rgba(32,110,85,.24)" strokeWidth={1.1} fill="none" />
        )}
        {showHighEdge && (
          <line x1={pad.l} x2={W - pad.r} y1={yPos(highR)} y2={yPos(highR)}
                stroke="rgba(32,110,85,.24)" strokeWidth={1.1} fill="none" />
        )}
        <path d={areaD} fill={`url(#${gradId})`} opacity={0.45} />
        <path d={lineD} fill="none" stroke={color} strokeWidth={3.2}
              strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* Start dot — hollow ring in the persona's color. The line is
          solid; the red/green improvement story comes from the zone
          rectangles in the background, not the dot. */}
      <span
        className="absolute w-[8px] h-[8px] rounded-full bg-white border-[1.6px] pointer-events-none"
        style={{ left: firstLeft, top: firstTop, transform: 'translate(-50%, -50%)', borderColor: color }}
      />
      {/* End dot halo — soft white ring under the live value. */}
      <span
        className="absolute w-[16px] h-[16px] rounded-full bg-white border border-[rgba(26,30,28,0.18)] pointer-events-none"
        style={{ left: lastLeft, top: lastTop, transform: 'translate(-50%, -50%)' }}
      />
      {/* End dot — filled, colored by flag. */}
      <span
        className="absolute w-[11px] h-[11px] rounded-full border-2 border-white pointer-events-none"
        style={{ left: lastLeft, top: lastTop, transform: 'translate(-50%, -50%)', background: dotColor }}
      />
    </div>
  );
}

// ── Card body renderers ────────────────────────────────────────

function BiomarkerBody({ persona }: { persona: Persona }) {
  const c = persona.card as BiomarkerCard;
  const latest = c.trend[c.trend.length - 1];
  const flag = latest < c.range[0] ? 'low' : latest > c.range[1] ? 'high' : null;
  return (
    <>
      <div className="flex items-baseline justify-between gap-2.5 mb-0.5">
        <span className="text-[15px] font-semibold">{c.label}</span>
        <span className="text-[22px] font-semibold tabular-nums text-[#1A1E1C]">
          {latest}
          <span className="text-[12px] font-medium text-[#6B7370] ml-0.5">{c.unit}</span>
          {flag && (
            <span className={`text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded ml-1.5 align-middle ${
              flag === 'low' ? 'bg-[#EEF4FF] text-[#3B74C4]' : 'bg-[#FEF1F1] text-[#C44040]'
            }`}>{flag}</span>
          )}
        </span>
      </div>
      <div className="text-[11px] text-[#8A9290] mb-3.5">{c.sub}</div>
      <BiomarkerChart card={c} color={persona.color} />
      <div className="flex justify-between text-[10px] text-[#8A9290] mt-1 mb-3.5 tabular-nums font-mono">
        <span>6 mo ago</span><span>today</span>
      </div>
    </>
  );
}

const VERDICT_STYLES: Record<MedicationCard['verdict'], { bg: string; text: string }> = {
  working: { bg: 'bg-[#E4F4EC]', text: 'text-[#206E55]' },
  discuss: { bg: 'bg-[#FFF6E5]', text: 'text-[#B8791A]' },
  mixed: { bg: 'bg-[#EEF4FF]', text: 'text-[#3B74C4]' },
};

function MedicationBody({ persona }: { persona: Persona }) {
  const c = persona.card as MedicationCard;
  const v = VERDICT_STYLES[c.verdict];
  return (
    <>
      <div className="flex items-baseline justify-between gap-2.5 mb-0.5">
        <span className="text-[15px] font-semibold">{c.label}</span>
        <span className="text-[22px] font-semibold tabular-nums text-[#1A1E1C]">{c.dose}</span>
      </div>
      <div className="text-[11px] text-[#8A9290] mb-3.5">{c.sub}</div>
      <div className="mb-3.5 rounded-xl border border-[#ECEEED] p-3.5"
           style={{ background: 'linear-gradient(180deg, #FBFCFC 0%, #F4F8F6 100%)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap ${v.bg} ${v.text}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {c.verdictLabel}
          </span>
          <span className="text-[11px] text-[#6B7370] font-medium">
            {c.target.name} · target <strong className="text-[#1A1E1C] font-semibold">{c.target.goal}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 mb-1">
          {/* Before — amber tint reads as "needed attention" without the
              alarm of red. The improvement story stays clear via the
              arrow + green Now box. */}
          <div className="flex-1 text-center bg-[#FFF6E5] border border-[#F0DDB0] rounded-[10px] py-2 px-1.5">
            <div className="text-[9px] font-bold text-[#B8791A]/80 tracking-[0.14em] uppercase mb-0.5">Before</div>
            <div className="text-[16px] font-bold tabular-nums text-[#B8791A]">{c.before}</div>
          </div>
          {/* Arrow — gradient amber → green to mirror the improvement. */}
          <span
            className="font-semibold text-lg leading-none bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #B8791A, #206E55)' }}
          >→</span>
          {/* Now — green tint, the "in range" landing point. */}
          <div className="flex-1 text-center bg-[#EAFAF2] border border-[#C7E6D5] rounded-[10px] py-2 px-1.5">
            <div className="text-[9px] font-bold text-[#206E55]/80 tracking-[0.14em] uppercase mb-0.5">Now</div>
            <div className="text-[16px] font-bold tabular-nums text-[#206E55]">{c.after}</div>
          </div>
        </div>
        <div className="text-center text-[11px] text-[#206E55] font-semibold mt-1.5">{c.delta}</div>
      </div>
    </>
  );
}

function ReminderBody({ persona }: { persona: Persona }) {
  const c = persona.card as ReminderCard;
  return (
    <>
      <div className="flex items-baseline justify-between gap-2.5 mb-0.5">
        <span className="text-[15px] font-semibold">{c.label}</span>
        <span className="text-[14px] font-semibold">
          <span className="text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded bg-[#FFF6E5] text-[#B8791A] align-middle whitespace-nowrap">
            {c.headRight}
          </span>
        </span>
      </div>
      <div className="text-[11px] text-[#8A9290] mb-3.5">{c.sub}</div>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center mb-3.5 px-1 pt-1.5">
        {c.timeline.map((m, i) => {
          const colorClass = m.kind === 'done' ? 'text-[#206E55]' : 'text-[#B8791A]';
          const haloStyle = m.kind === 'now'
            ? { boxShadow: '0 0 0 1px #B8791A, 0 0 0 6px rgba(184,121,26,.15)', background: '#B8791A' }
            : { boxShadow: '0 0 0 1px currentColor', background: 'currentColor' as string };
          const segClass = i < c.timeline.length - 1
            ? (m.kind === 'done' ? 'solid' : 'dashed')
            : null;
          return (
            <span key={i} className="contents">
              <span className={`flex flex-col items-center gap-1.5 min-w-0 ${colorClass}`}>
                <span className="w-2.5 h-2.5 rounded-full border-2 border-white" style={haloStyle} />
                <span className="text-center text-[10px] leading-tight font-semibold text-[#1A1E1C]">
                  {m.label}
                  <em className="block not-italic font-medium text-[9px] text-[#8A9290] uppercase tracking-[0.12em] mt-0.5">
                    {m.sub}
                  </em>
                </span>
              </span>
              {segClass === 'solid' && (
                <span className="h-[2px] mx-[-1px] -mt-3.5 rounded-[1px]"
                      style={{ background: 'linear-gradient(90deg, #206E55, #B8791A)' }} />
              )}
              {segClass === 'dashed' && (
                <span className="h-[2px] mx-[-1px] -mt-3.5 rounded-[1px]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #B8791A 50%, transparent 0)',
                        backgroundSize: '6px 2px',
                        backgroundRepeat: 'repeat-x',
                      }} />
              )}
            </span>
          );
        })}
      </div>
    </>
  );
}

function CardBody({ persona }: { persona: Persona }) {
  switch (persona.card.kind) {
    case 'biomarker': return <BiomarkerBody persona={persona} />;
    case 'medication': return <MedicationBody persona={persona} />;
    case 'reminder': return <ReminderBody persona={persona} />;
  }
}

// ── Main animated component ────────────────────────────────────

const AUTO_DWELL_MS = 5400;
const FIRST_FIRE_MS = 4200;

export function AnimatedFamilyPreview() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [renderIdx, setRenderIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pillPressed, setPillPressed] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Highlighted "next" option in the auto-cycle's brief dropdown peek.
  // Null when user is in control.
  const [autoNextIdx, setAutoNextIdx] = useState<number | null>(null);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const persona = PERSONAS[renderIdx];

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter(t => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  // Auto-cycle choreography: press → menu open → highlight → close → swap.
  useEffect(() => {
    if (userInteracted || hoverPaused) return;
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    schedule(() => {
      if (userInteracted || hoverPaused) return;
      const nextIdx = (currentIdx + 1) % PERSONAS.length;
      setPillPressed(true);
      schedule(() => setPillPressed(false), 140);
      schedule(() => {
        setAutoNextIdx(nextIdx);
        setMenuOpen(true);
      }, 200);
      schedule(() => {
        setMenuOpen(false);
        setAutoNextIdx(null);
      }, 820);
      schedule(() => {
        setRenderIdx(nextIdx);
        setCurrentIdx(nextIdx);
      }, 1040);
    }, currentIdx === 0 ? FIRST_FIRE_MS : AUTO_DWELL_MS);
    return clearTimeouts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, userInteracted, hoverPaused]);

  const markInteracted = useCallback(() => {
    if (userInteracted) return;
    setUserInteracted(true);
    clearTimeouts();
    setPillPressed(false);
    setAutoNextIdx(null);
  }, [userInteracted, clearTimeouts]);

  const handlePanelClick = useCallback(() => {
    markInteracted();
    setMenuOpen(false);
  }, [markInteracted]);

  const handlePillClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    markInteracted();
    setMenuOpen(open => !open);
  }, [markInteracted]);

  const handleOptionClick = useCallback((idx: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    markInteracted();
    setRenderIdx(idx);
    setCurrentIdx(idx);
    setMenuOpen(false);
  }, [markInteracted]);

  // Close menu on click outside the panel. React's synthetic
  // stopPropagation doesn't block native document listeners in React 17+,
  // so we have to check containment explicitly — otherwise this fires
  // for every in-panel click and re-closes the menu we just opened.
  useEffect(() => {
    if (!userInteracted) return;
    const onDocClick = (e: MouseEvent) => {
      if (panelRef.current && panelRef.current.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [userInteracted]);

  const showFooter = persona.id === 'you';
  const insightHtml = useMemo(() => ({ __html: persona.card.insight }), [persona.card.insight]);

  return (
    <div
      ref={panelRef}
      className="relative flex h-[430px] sm:h-[440px] lg:h-[450px] flex-col rounded-2xl border border-[#E4E8E6] bg-white p-5 shadow-sm"
      onClick={handlePanelClick}
      onMouseEnter={() => { if (!userInteracted) setHoverPaused(true); }}
      onMouseLeave={() => { if (!userInteracted) setHoverPaused(false); }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePillClick}
          className={`relative inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 border border-[#E4E8E6] bg-white rounded-full text-[12px] font-semibold transition-all hover:border-[#C8D8D1] hover:bg-[#FCFDFD] ${pillPressed ? 'scale-[0.97]' : ''}`}
        >
          <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 transition-colors"
                style={{ background: persona.color }}>
            {persona.initials}
          </span>
          <span>{persona.name}</span>
          <ChevronDown className={`h-3 w-3 text-[#8A9290] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#6B7370] px-2 py-1 rounded-full border border-[#E4E8E6]">
          Latest
        </span>
      </div>

      {/* Menu */}
      <div
        className={`absolute top-[56px] left-[22px] w-60 bg-white border border-[#E4E8E6] rounded-[14px] shadow-[0_16px_36px_rgba(24,28,26,0.12)] p-1.5 z-10 origin-top-left transition-all ${
          menuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-[0.96] -translate-y-1.5 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {PERSONAS.map((p, i) => {
          const isCurrent = p.id === persona.id;
          const isNext = autoNextIdx === i;
          return (
            <button
              key={p.id}
              type="button"
              onClick={handleOptionClick(i)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13px] font-medium transition-colors text-left ${
                isNext ? 'bg-[#F0F7F4]' : 'hover:bg-[#F3F5F4]'
              }`}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ background: p.color }}>{p.initials}</span>
              <span>{p.name}</span>
              <span className="ml-auto text-[10px] text-[#8A9290]">{p.relation}</span>
              {isCurrent && <Check className="h-3.5 w-3.5 text-[#206E55]" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      {/* Stage — single card per persona */}
      <div className="relative min-h-0 flex-1">
        <div key={persona.id} className="animate-in fade-in duration-500">
          <CardBody persona={persona} />
          <div className="rounded-xl bg-[#F0F7F4] border border-[#D6E5DD] p-3.5">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-3.5 w-3.5 text-[#206E55] mt-0.5 shrink-0" />
              <span
                className="text-[12.5px] leading-[1.5] text-[#1A1E1C] [&_em]:not-italic [&_em]:underline [&_em]:decoration-[rgba(32,110,85,0.4)] [&_em]:decoration-2 [&_em]:underline-offset-2"
                dangerouslySetInnerHTML={insightHtml}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mt-4 pt-3.5 border-t border-[#ECEEED] flex items-center justify-between ${showFooter ? '' : 'invisible'}`}
        aria-hidden={!showFooter}
      >
        <span className="text-[12px] text-[#6B7370]">+ 37 markers tracked</span>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#206E55]">
          <Sparkles className="h-3.5 w-3.5" />
          Ask August
        </span>
      </div>
    </div>
  );
}
