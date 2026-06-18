'use client';

import { useState } from 'react';

/*
 * Dev-only tweaking panel for the liquid-glass Rx badge on the DoseSpot
 * retrieval step. The settings here drive the procedural displacement map
 * + the badge's CSS dimensions. Lifting to the flow level means the panel
 * is visible on every step, even though it only paints anything on the
 * DoseSpot screen.
 *
 * Defaults below are the values dialed into the Ozempic vial composition.
 */

export const LENS_DEFAULTS = {
  scale: 83,
  bezel: 4,
  radius: 8,
  blurStd: 18.5,
  width: 183,
  height: 68,
  borderRadius: 34,
} as const;

export type LensSettings = {
  scale: number;
  bezel: number;
  radius: number;
  blurStd: number;
  width: number;
  height: number;
  borderRadius: number;
};

export type LensSettingsBundle = LensSettings & {
  setScale: (v: number) => void;
  setBezel: (v: number) => void;
  setRadius: (v: number) => void;
  setBlurStd: (v: number) => void;
  setWidth: (v: number) => void;
  setHeight: (v: number) => void;
  setBorderRadius: (v: number) => void;
};

export function useLensSettings(): LensSettingsBundle {
  const [scale, setScale] = useState<number>(LENS_DEFAULTS.scale);
  const [bezel, setBezel] = useState<number>(LENS_DEFAULTS.bezel);
  const [radius, setRadius] = useState<number>(LENS_DEFAULTS.radius);
  const [blurStd, setBlurStd] = useState<number>(LENS_DEFAULTS.blurStd);
  const [width, setWidth] = useState<number>(LENS_DEFAULTS.width);
  const [height, setHeight] = useState<number>(LENS_DEFAULTS.height);
  const [borderRadius, setBorderRadius] = useState<number>(LENS_DEFAULTS.borderRadius);

  return {
    scale,
    setScale,
    bezel,
    setBezel,
    radius,
    setRadius,
    blurStd,
    setBlurStd,
    width,
    setWidth,
    height,
    setHeight,
    borderRadius,
    setBorderRadius,
  };
}

export function LensControls(lens: LensSettingsBundle) {
  const [open, setOpen] = useState(true);
  const minSide = Math.min(lens.width, lens.height);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 100,
        width: open ? 280 : 'auto',
        background: 'rgba(20, 24, 28, 0.94)',
        color: '#f5f5f5',
        borderRadius: 12,
        padding: open ? 14 : '8px 12px',
        border: '1px solid #2a2e33',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        boxShadow: '0 18px 48px rgba(0, 0, 0, 0.45)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: open ? 12 : 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            opacity: 0.7,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Lens controls
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Collapse' : 'Expand'}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: '0 4px',
          }}
        >
          {open ? '−' : '+'}
        </button>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <LabSlider label="scale" min={0} max={200} value={lens.scale} onChange={lens.setScale} />
          <LabSlider label="bezel" min={1} max={Math.max(2, minSide / 2)} value={lens.bezel} onChange={lens.setBezel} />
          <LabSlider label="lens radius" min={0} max={Math.max(2, minSide / 2)} value={lens.radius} onChange={lens.setRadius} />
          <LabSlider label="blur stdDev" min={0} max={40} value={lens.blurStd} onChange={lens.setBlurStd} step={0.5} />
          <LabSlider label="width" min={120} max={420} value={lens.width} onChange={lens.setWidth} />
          <LabSlider label="height" min={60} max={280} value={lens.height} onChange={lens.setHeight} />
          <LabSlider
            label="border-radius"
            min={0}
            max={Math.max(2, minSide / 2)}
            value={lens.borderRadius}
            onChange={lens.setBorderRadius}
          />
        </div>
      )}
    </div>
  );
}

function LabSlider({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label style={{ display: 'block', fontSize: 11, opacity: 0.92 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.85 }}>
          {label}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums', opacity: 0.7 }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(value, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </label>
  );
}
