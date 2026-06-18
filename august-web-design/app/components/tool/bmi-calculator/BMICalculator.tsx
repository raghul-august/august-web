"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import {
  clamp,
  convertUnits,
  feetInchesToCm,
  fmtDecimal,
  lbsToKg,
  parseNumOrNull,
} from "@/app/utils/tools/health-math";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { BadgeTone } from "@/app/utils/tools/tool-colors";
import {
  AGE_MAX,
  AGE_MIN,
  BMI_CATEGORIES,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
  bmiBucket,
  computeBMI,
  type BMIFormState,
  type BMIResult,
  type BMIResultOk,
  type Sex,
  type UnitSystem,
} from "@/app/utils/tools/bmi-compute";

/* ── Constants ────────────────────────────────────────────────────────── */

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const SEX_OPTIONS = [
  { value: "unspecified", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

const DEFAULT_BMI_STATE: BMIFormState = {
  unitSystem: "imperial",
  heightCmRaw: "",
  heightFeetRaw: "",
  heightInchesRaw: "",
  weightKgRaw: "",
  weightLbRaw: "",
  ageRaw: "",
  sex: "unspecified",
};

const SAMPLE_RESULT: BMIResultOk = {
  kind: "ok",
  bmi: 22.5,
  category: BMI_CATEGORIES.find((c) => c.id === "normal")!,
  bmiPrime: 0.9,
  ponderalIndex: 12.9,
  healthyMinKg: 53.5,
  healthyMaxKg: 72,
  heightCm: 170,
  weightKg: 65,
};

const SCALE_MIN = 14;
const SCALE_MAX = 42;

interface ScaleSegment {
  label: string;
  short: string;
  min: number;
  max: number;
  color: string;
}

const SEGMENTS: readonly ScaleSegment[] = [
  { label: "Underweight", short: "Underweight", min: 14, max: 18.5, color: "var(--info)" },
  { label: "Healthy", short: "Healthy", min: 18.5, max: 25, color: "var(--success)" },
  { label: "Overweight", short: "Overweight", min: 25, max: 30, color: "var(--warning)" },
  { label: "Obese Class I", short: "Obese I", min: 30, max: 35, color: "orange" },
  { label: "Obese Class II–III", short: "Obese II+", min: 35, max: 42, color: "var(--danger)" },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

function toneVar(tone: BadgeTone): { bg: string; fg: string; border: string } {
  switch (tone) {
    case "success":
      return { bg: "var(--success-50)", fg: "var(--success-700)", border: "var(--success)" };
    case "warning":
      return { bg: "var(--warning-50)", fg: "var(--warning-700)", border: "var(--warning)" };
    case "danger":
      return { bg: "var(--danger-50)", fg: "var(--danger-700)", border: "var(--danger)" };
    case "info":
      return { bg: "var(--info-50)", fg: "var(--info-700)", border: "var(--info)" };
    case "brand":
      return { bg: "var(--brand-subtle)", fg: "var(--brand-primary-pressed)", border: "var(--brand-primary)" };
    default:
      return { bg: "var(--surface-subtle)", fg: "var(--text-primary)", border: "var(--border)" };
  }
}

function pctOf(value: number): number {
  const clamped = clamp(value, SCALE_MIN, SCALE_MAX);
  return ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

/* ── BMIScaleBar ─────────────────────────────────────────────────────── */

function BMIScaleBar({ bmi, categoryLabel }: { bmi: number; categoryLabel: string }) {
  const markerTop = pctOf(bmi);

  return (
    <div
      className="bmi-scale-vertical"
      role="img"
      aria-label={`Your BMI is ${fmtDecimal(bmi, 1)} kg/m squared, in the ${categoryLabel} range`}
    >
      <span className="bmi-section-label">Where you land</span>
      <div className="bmi-scale-vertical-row">
        <div className="bmi-scale-vbar" aria-hidden="true">
          {SEGMENTS.map((seg) => {
            const top = pctOf(seg.min);
            const bottom = pctOf(seg.max);
            return (
              <div
                key={seg.label}
                className="bmi-scale-vsegment"
                style={{ top: `${top}%`, height: `${bottom - top}%`, background: seg.color }}
                title={`${seg.label} (${seg.min}–${seg.max})`}
              />
            );
          })}
          <div className="bmi-scale-vmarker" style={{ top: `${markerTop}%`, left: "-10px" }}>
            <span className="bmi-scale-vmarker-pin" />
            <span className="bmi-scale-vmarker-label">{fmtDecimal(bmi, 1)}</span>
          </div>
        </div>

        <div className="bmi-scale-vlegend" aria-hidden="true">
          {SEGMENTS.map((seg) => (
            <div key={seg.label} className="bmi-scale-legend-item">
              <span className="bmi-scale-legend-swatch" style={{ background: seg.color }} />
              <span className="bmi-scale-legend-text">
                {seg.short}{" "}
                <span className="bmi-scale-legend-range">
                  {seg.min}
                  {seg.max < SCALE_MAX ? `–${seg.max}` : "+"}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── BMIResultPanel ──────────────────────────────────────────────────── */

function BMIResultPanel({ result }: { result: BMIResult; unitSystem: UnitSystem }) {
  const isPreview = result.kind !== "ok";
  const display: BMIResultOk = result.kind === "ok" ? result : SAMPLE_RESULT;
  const badge = toneVar(display.category.tone);

  return (
    <div className="tool-result-stack bmi-result-stack" data-preview={isPreview ? "true" : undefined}>
      <div className="bmi-result-row">
        <div className="bmi-result-card tool-result-primary bmi-result-primary">
          <span className="bmi-section-label">Your BMI</span>
          <div className="tool-value-row">
            <span className="tool-value bmi-value">{fmtDecimal(display.bmi, 1)}</span>
            <span className="tool-value-unit">kg/m&sup2;</span>
          </div>
          <span
            className="bmi-category-badge"
            style={{
              background: badge.bg,
              color: badge.fg,
              border: `1px solid ${badge.border}`,
            }}
          >
            {display.category.label}
          </span>
          <p className="tool-result-desc">{display.category.description}</p>
        </div>

        <BMIScaleBar bmi={display.bmi} categoryLabel={display.category.label} />
      </div>
    </div>
  );
}

/* ── BMIForm ─────────────────────────────────────────────────────────── */

function BMIForm({ state, onChange }: { state: BMIFormState; onChange: (next: BMIFormState) => void }) {
  const update = useCallback(
    (patch: Partial<BMIFormState>) => onChange({ ...state, ...patch }),
    [state, onChange],
  );

  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      track("bmi_calculator_unit_change", { from: state.unitSystem, to: next });

      const converted = convertUnits(state, next);
      onChange({ ...state, unitSystem: next, ...converted });
    },
    [state, onChange],
  );

  const isMetric = state.unitSystem === "metric";

  const heightCm = isMetric
    ? parseNumOrNull(state.heightCmRaw)
    : (() => {
        const f = parseNumOrNull(state.heightFeetRaw);
        const i = parseNumOrNull(state.heightInchesRaw) ?? 0;
        return f != null ? feetInchesToCm(f, i) : null;
      })();
  const weightKg = isMetric
    ? parseNumOrNull(state.weightKgRaw)
    : (() => {
        const l = parseNumOrNull(state.weightLbRaw);
        return l != null ? lbsToKg(l) : null;
      })();
  const age = parseNumOrNull(state.ageRaw);

  const heightError =
    heightCm != null && (heightCm < HEIGHT_CM_MIN || heightCm > HEIGHT_CM_MAX)
      ? "Please check the accuracy of the height entered."
      : null;
  const weightError =
    weightKg != null && (weightKg < WEIGHT_KG_MIN || weightKg > WEIGHT_KG_MAX)
      ? "Please check the accuracy of the weight entered."
      : null;
  const ageNotice =
    age != null && age < AGE_MIN
      ? "This calculator is for adults 20 and older. For children and teens ages 2–19, use the CDC Child and Teen BMI Calculator."
      : age != null && age > AGE_MAX
      ? "Please enter an age below 121."
      : null;

  return (
    <div className="bmi-form-root">
      <div className="bmi-unit-row">
        <span className="bmi-section-label">Units</span>
        <SegmentedControl
          options={UNIT_OPTIONS}
          value={state.unitSystem}
          onChange={onUnitChange}
          ariaLabel="Unit system"
          className="tool-chip-group tool-chip-group--connected"
          buttonClassName="tool-chip"
          activeClassName="tool-chip--active"
        />
      </div>

      <div className="tool-form-grid" style={{ gridTemplateColumns: "1fr" }}>
        {isMetric ? (
          <>
            <div className="tool-form-group">
              <label htmlFor="bmi-height-cm" className="tool-form-label">Height (cm)</label>
              <input
                id="bmi-height-cm"
                type="text"
                inputMode="decimal"
                className="tool-input"
                placeholder="e.g. 175"
                value={state.heightCmRaw}
                aria-invalid={heightError != null}
                onChange={(e) => update({ heightCmRaw: e.target.value })}
              />
            </div>
            <div className="tool-form-group">
              <label htmlFor="bmi-weight-kg" className="tool-form-label">Weight (kg)</label>
              <input
                id="bmi-weight-kg"
                type="text"
                inputMode="decimal"
                className="tool-input"
                placeholder="e.g. 70"
                value={state.weightKgRaw}
                aria-invalid={weightError != null}
                onChange={(e) => update({ weightKgRaw: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <div className="tool-form-group">
              <label className="tool-form-label">Height</label>
              <div className="tool-ft-in-row">
                <div className="tool-ft-in-item">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="tool-input"
                    placeholder="ft"
                    aria-label="Feet"
                    value={state.heightFeetRaw}
                    aria-invalid={heightError != null}
                    onChange={(e) => update({ heightFeetRaw: e.target.value })}
                  />
                  <span className="tool-ft-in-suffix">ft</span>
                </div>
                <div className="tool-ft-in-item">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="tool-input"
                    placeholder="in"
                    aria-label="Inches"
                    value={state.heightInchesRaw}
                    aria-invalid={heightError != null}
                    onChange={(e) => update({ heightInchesRaw: e.target.value })}
                  />
                  <span className="tool-ft-in-suffix">in</span>
                </div>
              </div>
            </div>
            <div className="tool-form-group">
              <label htmlFor="bmi-weight-lb" className="tool-form-label">Weight (lb)</label>
              <input
                id="bmi-weight-lb"
                type="text"
                inputMode="decimal"
                className="tool-input"
                placeholder="e.g. 160"
                value={state.weightLbRaw}
                aria-invalid={weightError != null}
                onChange={(e) => update({ weightLbRaw: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="tool-form-group">
          <label htmlFor="bmi-age" className="tool-form-label">Age (optional)</label>
          <input
            id="bmi-age"
            type="text"
            inputMode="numeric"
            className="tool-input"
            placeholder="20 – 120"
            value={state.ageRaw}
            aria-invalid={ageNotice != null}
            onChange={(e) => update({ ageRaw: e.target.value })}
          />
        </div>

        <div className="tool-form-group">
          <label className="tool-form-label">Sex (optional)</label>
          <SegmentedControl
            options={SEX_OPTIONS}
            value={state.sex}
            onChange={(v) => update({ sex: v as Sex })}
            ariaLabel="Sex"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>
      </div>

      {(heightError || weightError || ageNotice) && (
        <div className="tool-error-stack">
          {heightError && <p className="tool-error">{heightError}</p>}
          {weightError && <p className="tool-error">{weightError}</p>}
          {ageNotice && <p className="tool-error">{ageNotice}</p>}
        </div>
      )}
    </div>
  );
}

/* ── BMICalculator (default export) ──────────────────────────────────── */

interface Props {
  afterContent?: React.ReactNode;
}

export default function BMICalculator({ afterContent }: Props) {
  const [state, setState] = useState<BMIFormState>(DEFAULT_BMI_STATE);
  const result = useMemo(() => computeBMI(state), [state]);

  const { markStarted, markCompleted, resetCompleted } =
    useCalculatorAnalytics("bmi-calculator");

  const handleRestart = useCallback(() => {
    setState(DEFAULT_BMI_STATE);
    resetCompleted();
  }, [resetCompleted]);

  const handleTalkToAugust = useCallback(() => {
    // track("tool_cta_clicked", {
    //   tool: "bmi-calculator",
    //   cta_type: "talk_to_august",
    //   bmi_bucket: result.kind === "ok" ? bmiBucket(result.bmi) : null,
    //   category: result.kind === "ok" ? result.category.id : null,
    // });
    trackToolEvent("bmi-calculator", "cta_clicked", {
      cta_type: "talk_to_august",
      bmi_bucket: result.kind === "ok" ? bmiBucket(result.bmi) : null,
      category: result.kind === "ok" ? result.category.id : null,
    });
    const message =
      result.kind === "ok"
        ? `Hi, I just used the BMI calculator and my BMI is ${fmtDecimal(result.bmi, 1)} (${result.category.label}). I'd like to talk about what this means.`
        : "Hi, I just used the BMI calculator and want to discuss my results.";
    openAugustChat(message);
  }, [result]);

  useEffect(() => {
    if (result.kind !== "ok") return;
    const sig = `${bmiBucket(result.bmi)}|${result.category.id}`;
    markCompleted(sig, {
      bmi_bucket: bmiBucket(result.bmi),
      category: result.category.id,
      unit_system: state.unitSystem,
    });
  }, [result, state.unitSystem, markCompleted]);

  const handleChange = useCallback(
    (next: BMIFormState) => {
      setState(next);
      markStarted();
    },
    [markStarted],
  );

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">BMI</span> Calculator
          </>
        ),
        tagline:
          "Calculate your Body Mass Index for free, with healthy weight range, BMI Prime, and Ponderal Index. Adults 20 and older.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper tool-calc-wrapper--compact">
            <div className="tool-card bmi-calculator-card">
              <BMIForm state={state} onChange={handleChange} />
              <BMIResultPanel result={result} unitSystem={state.unitSystem} />
            </div>
            <p className="tool-calc-disclaimer">
              BMI is a screening measure, not a diagnosis. Results are educational and do not replace a clinician&rsquo;s assessment.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
