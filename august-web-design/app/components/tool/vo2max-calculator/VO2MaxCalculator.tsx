"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { track, trackToolEvent } from "@/app/utils/analytics";
import {
  clamp,
  fmtDecimal,
  fmtInt,
  kgToLbs,
  lbsToKg,
  parseNumOrNull,
} from "@/app/utils/tools/health-math";
import {
  AGE_MAX,
  AGE_MIN,
  computeVO2Max,
  fmtPace,
  fmtRaceTime,
  normRangeFor,
  RACE_DISTANCE_LABELS,
  SCALE_MAX,
  SCALE_MIN,
  vo2Bucket,
  type Method,
  type RaceDistance,
  type Sex,
  type UnitSystem,
  type VO2MaxFormState,
  type VO2MaxResult,
  type VO2MaxResultOk,
} from "@/app/utils/tools/vo2max-compute";
import {
  METHOD_LABELS,
  SEX_OPTIONS,
  UNIT_OPTIONS,
} from "@/app/data/tools/vo2max-calculator-config";
import { ToolAuthGate } from "@/components/auth";
import { useDownloadResult } from "@/app/components/tool/shared/hooks/useDownloadResult";
import DownloadResultButton from "@/app/components/tool/shared/DownloadResultButton";

const DEFAULT_STATE: VO2MaxFormState = {
  method: "race-time",
  sex: "male",
  ageRaw: "",
  unitSystem: "imperial",
  weightKgRaw: "",
  weightLbRaw: "",
  raceDistance: "5k",
  raceHrsRaw: "",
  raceMinsRaw: "",
  raceSecsRaw: "",
  cooperDistanceRaw: "",
  mile15MinsRaw: "",
  mile15SecsRaw: "",
  rockportMinsRaw: "",
  rockportSecsRaw: "",
  rockportHrRaw: "",
  restingHrRaw: "",
};

const SAMPLE_RESULT: VO2MaxResultOk = {
  kind: "ok",
  vo2max: 43.4,
  vo2maxRounded: 43.4,
  method: "race-time",
  age: 30,
  sex: "male",
  band: { id: "26-35", label: "26–35" },
  category: {
    id: "above-average",
    label: "Above average",
    description:
      "Above-average aerobic capacity for your age and sex. A solid base for most activities.",
    tone: "success",
  },
  mets: 43.4 / 3.5,
};

const RACE_DISTANCE_OPTIONS: { value: RaceDistance; label: string }[] = (
  Object.keys(RACE_DISTANCE_LABELS) as RaceDistance[]
).map((v) => ({ value: v, label: RACE_DISTANCE_LABELS[v] }));

interface StepProps {
  state: VO2MaxFormState;
  update: (patch: Partial<VO2MaxFormState>) => void;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function pctOf(value: number): number {
  return ((clamp(value, SCALE_MIN, SCALE_MAX) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

function categoryToneClass(tone: VO2MaxResultOk["category"]["tone"]): string {
  return `vo2-band-pill vo2-band-pill--${tone}`;
}

/* ── Method-specific input groups ─────────────────────────────────────── */

function RaceTimeInputs({ state, update }: StepProps) {
  return (
    <div className="tool-calc-form-grid">
      <div className="tool-form-group tool-calc-form-span-2">
        <label htmlFor="vo2-race-distance" className="tool-form-label">Race distance</label>
        <select
          id="vo2-race-distance"
          className="tool-input"
          value={state.raceDistance}
          onChange={(e) => update({ raceDistance: e.target.value as RaceDistance })}
        >
          {RACE_DISTANCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="tool-form-group tool-calc-form-span-2">
        <label className="tool-form-label">Race time</label>
        <div className="tool-calc-combo-input">
          <div className="tool-calc-combo-segment">
            <input
              type="text"
              inputMode="numeric"
              className="tool-calc-combo-input__field"
              placeholder="0"
              aria-label="Hours"
              value={state.raceHrsRaw}
              onChange={(e) => update({ raceHrsRaw: e.target.value })}
            />
            <span className="tool-calc-combo-input__suffix">hr</span>
          </div>
          <span className="tool-calc-combo-input__divider" aria-hidden="true" />
          <div className="tool-calc-combo-segment">
            <input
              type="text"
              inputMode="numeric"
              className="tool-calc-combo-input__field"
              placeholder="22"
              aria-label="Minutes"
              value={state.raceMinsRaw}
              onChange={(e) => update({ raceMinsRaw: e.target.value })}
            />
            <span className="tool-calc-combo-input__suffix">min</span>
          </div>
          <span className="tool-calc-combo-input__divider" aria-hidden="true" />
          <div className="tool-calc-combo-segment">
            <input
              type="text"
              inputMode="numeric"
              className="tool-calc-combo-input__field"
              placeholder="30"
              aria-label="Seconds"
              value={state.raceSecsRaw}
              onChange={(e) => update({ raceSecsRaw: e.target.value })}
            />
            <span className="tool-calc-combo-input__suffix">sec</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CooperInputs({ state, update }: StepProps) {
  const isMetric = state.unitSystem === "metric";
  return (
    <div className="tool-calc-form-grid">
      <div className="tool-form-group tool-calc-form-span-2">
        <label htmlFor="vo2-cooper-distance" className="tool-form-label">
          Distance covered in 12 minutes ({isMetric ? "metres" : "miles"})
        </label>
        <input
          id="vo2-cooper-distance"
          type="text"
          inputMode="decimal"
          className="tool-input"
          placeholder={isMetric ? "e.g. 2400" : "e.g. 1.5"}
          value={state.cooperDistanceRaw}
          onChange={(e) => update({ cooperDistanceRaw: e.target.value })}
        />
      </div>
    </div>
  );
}

function Mile15Inputs({ state, update }: StepProps) {
  return (
    <div className="tool-calc-form-grid">
      <div className="tool-form-group tool-calc-form-span-2">
        <label className="tool-form-label">1.5-mile run time</label>
        <div className="tool-calc-combo-input">
          <div className="tool-calc-combo-segment">
            <input
              type="text"
              inputMode="numeric"
              className="tool-calc-combo-input__field"
              placeholder="12"
              aria-label="Minutes"
              value={state.mile15MinsRaw}
              onChange={(e) => update({ mile15MinsRaw: e.target.value })}
            />
            <span className="tool-calc-combo-input__suffix">min</span>
          </div>
          <span className="tool-calc-combo-input__divider" aria-hidden="true" />
          <div className="tool-calc-combo-segment">
            <input
              type="text"
              inputMode="numeric"
              className="tool-calc-combo-input__field"
              placeholder="00"
              aria-label="Seconds"
              value={state.mile15SecsRaw}
              onChange={(e) => update({ mile15SecsRaw: e.target.value })}
            />
            <span className="tool-calc-combo-input__suffix">sec</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RockportInputs({ state, update }: StepProps) {
  return (
    <div className="tool-calc-form-grid">
      <div className="tool-form-group">
        <label className="tool-form-label">Walk time (1 mile)</label>
        <div className="tool-calc-combo-input">
          <div className="tool-calc-combo-segment">
            <input
              type="text"
              inputMode="numeric"
              className="tool-calc-combo-input__field"
              placeholder="14"
              aria-label="Minutes"
              value={state.rockportMinsRaw}
              onChange={(e) => update({ rockportMinsRaw: e.target.value })}
            />
            <span className="tool-calc-combo-input__suffix">min</span>
          </div>
          <span className="tool-calc-combo-input__divider" aria-hidden="true" />
          <div className="tool-calc-combo-segment">
            <input
              type="text"
              inputMode="numeric"
              className="tool-calc-combo-input__field"
              placeholder="00"
              aria-label="Seconds"
              value={state.rockportSecsRaw}
              onChange={(e) => update({ rockportSecsRaw: e.target.value })}
            />
            <span className="tool-calc-combo-input__suffix">sec</span>
          </div>
        </div>
      </div>
      <div className="tool-form-group">
        <label htmlFor="vo2-rockport-hr" className="tool-form-label">Heart rate at finish (bpm)</label>
        <input
          id="vo2-rockport-hr"
          type="text"
          inputMode="numeric"
          className="tool-input"
          placeholder="e.g. 130"
          value={state.rockportHrRaw}
          onChange={(e) => update({ rockportHrRaw: e.target.value })}
        />
      </div>
    </div>
  );
}

function RestingHrInputs({ state, update }: StepProps) {
  return (
    <div className="tool-calc-form-grid">
      <div className="tool-form-group tool-calc-form-span-2">
        <label htmlFor="vo2-resting-hr" className="tool-form-label">Resting heart rate (bpm)</label>
        <input
          id="vo2-resting-hr"
          type="text"
          inputMode="numeric"
          className="tool-input"
          placeholder="e.g. 60"
          value={state.restingHrRaw}
          onChange={(e) => update({ restingHrRaw: e.target.value })}
        />
      </div>
    </div>
  );
}

/* ── Common identity row (age, sex, units, weight) ───────────────────── */

function CommonInputs({ state, update, needsWeight }: StepProps & { needsWeight: boolean }) {
  const isMetric = state.unitSystem === "metric";
  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      track("vo2max_calculator_unit_change", { from: state.unitSystem, to: next });

      const patch: Partial<VO2MaxFormState> = { unitSystem: next };
      if (next === "metric") {
        const lb = parseNumOrNull(state.weightLbRaw);
        if (lb != null) patch.weightKgRaw = fmtDecimal(lbsToKg(lb), 1);
        const milesRaw = parseNumOrNull(state.cooperDistanceRaw);
        if (milesRaw != null) patch.cooperDistanceRaw = fmtDecimal(milesRaw * 1609.34, 0);
      } else {
        const kg = parseNumOrNull(state.weightKgRaw);
        if (kg != null) patch.weightLbRaw = fmtDecimal(kgToLbs(kg), 1);
        const mRaw = parseNumOrNull(state.cooperDistanceRaw);
        if (mRaw != null) patch.cooperDistanceRaw = fmtDecimal(mRaw / 1609.34, 2);
      }
      update(patch);
    },
    [state, update],
  );

  return (
    <div className="tool-calc-form-grid">
      {/* <div className="tool-form-group">
        <label className="tool-form-label">Units</label>
        <SegmentedControl
          options={UNIT_OPTIONS}
          value={state.unitSystem}
          onChange={onUnitChange}
          ariaLabel="Unit system"
          className="tool-chip-group tool-chip-group--connected"
          buttonClassName="tool-chip"
          activeClassName="tool-chip--active"
        />
      </div> */}

      <div className="tool-form-group">
        <label className="tool-form-label ">Sex</label>
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

      <div className="tool-form-group">
        <label htmlFor="vo2-age" className="tool-form-label">Age</label>
        <input
          id="vo2-age"
          type="text"
          inputMode="numeric"
          className="tool-input"
          placeholder={`${AGE_MIN}–${AGE_MAX}`}
          value={state.ageRaw}
          onChange={(e) => update({ ageRaw: e.target.value })}
        />
      </div>

      {needsWeight && (
        <div className="tool-form-group">
          <label
            htmlFor={isMetric ? "vo2-weight-kg" : "vo2-weight-lb"}
            className="tool-form-label"
          >
            Weight ({isMetric ? "kg" : "lb"})
          </label>
          <input
            id={isMetric ? "vo2-weight-kg" : "vo2-weight-lb"}
            type="text"
            inputMode="decimal"
            className="tool-input"
            placeholder={isMetric ? "e.g. 70" : "e.g. 160"}
            value={isMetric ? state.weightKgRaw : state.weightLbRaw}
            onChange={(e) =>
              update(isMetric ? { weightKgRaw: e.target.value } : { weightLbRaw: e.target.value })
            }
          />
        </div>
      )}
    </div>
  );
}

/* ── Result panel ─────────────────────────────────────────────────────── */

function VO2MaxScaleBar({
  vo2,
  age,
  sex,
  bandLabel,
}: { vo2: number; age: number; sex: Sex; bandLabel: string }) {
  const norm = normRangeFor(age, sex);
  const markerPct = pctOf(vo2);
  const normMinPct = pctOf(norm.min);
  const normMaxPct = pctOf(norm.max);
  return (
    <div className="vo2-scale" role="img" aria-label={`Your VO2 max is ${fmtDecimal(vo2, 1)} ml/kg/min`}>
      <div className="vo2-scale-track">
        <div
          className="vo2-scale-norm-band"
          style={{ left: `${normMinPct}%`, width: `${normMaxPct - normMinPct}%` }}
          title={`Typical range for your age + sex: ${norm.min}–${norm.max}`}
        />
        <div className="vo2-scale-marker" style={{ left: `${markerPct}%` }}>
          <span className="vo2-scale-marker-pin" />
          <span className="vo2-scale-marker-label">{fmtDecimal(vo2, 1)}</span>
        </div>
      </div>
      <div className="vo2-scale-axis" aria-hidden="true">
        <span>{SCALE_MIN}</span>
        <span>{Math.round((SCALE_MIN + SCALE_MAX) / 2)}</span>
        <span>{SCALE_MAX}</span>
      </div>
      <p className="vo2-scale-legend">
        Dashed band shows the poor → excellent range for {sex === "male" ? "men" : "women"} aged {bandLabel}{" "}
        ({norm.min}–{norm.max} ml/kg/min).
      </p>
    </div>
  );
}

function VO2ResultPanel({
  result,
  onRestart,
  onTalkToAugust,
}: {
  result: VO2MaxResult;
  onRestart: () => void;
  onTalkToAugust: () => void;
}) {
  const isPreview = result.kind !== "ok";
  const display: VO2MaxResultOk = result.kind === "ok" ? result : SAMPLE_RESULT;
  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "vo2max-calculator",
    filename: `vo2max-result-${fmtDecimal(display.vo2maxRounded, 1)}`,
    heading: "VO2 Max Fitness Estimate",
    subtitle: `Fitness Report • VO2 Max ${fmtDecimal(display.vo2maxRounded, 1)} mL/kg/min`,
    toolName: "VO2 Max Calculator",
    maxPageHeight : 1350
  });

  return (
    <div ref={resultRef} className="tool-calc-result-stack" data-preview={isPreview ? "true" : undefined}>
      {!isPreview && (
        <div className="flex justify-end" data-skip-screenshot="true">
          <DownloadResultButton onClick={handleDownload} className="tool-btn tool-btn--primary" />
        </div>
      )}
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Your VO2 max</span>
        <div className="tool-calc-value-row">
          <span className="tool-calc-value">{fmtDecimal(display.vo2maxRounded, 1)}</span>
          <span className="tool-calc-value-unit">ml/kg/min</span>
        </div>
        <span className={categoryToneClass(display.category.tone)}>
          {display.category.label} for {display.sex === "male" ? "men" : "women"} {display.band.label}
        </span>
        <p className="tool-calc-result-desc">{display.category.description}</p>

        <div className="tool-calc-meta-row">
          <span>Peak METs</span>
          <strong>{fmtDecimal(display.mets, 1)}</strong>
        </div>
        {display.hrMax != null && (
          <div className="tool-calc-meta-row">
            <span>Estimated max heart rate</span>
            <strong>{fmtInt(display.hrMax)} bpm</strong>
          </div>
        )}
      </div>

      <div className="vo2-scale-card">
        <span className="tool-calc-section-label">Where you land</span>
        <VO2MaxScaleBar
          vo2={display.vo2max}
          age={display.age}
          sex={display.sex}
          bandLabel={display.band.label}
        />
      </div>

      {display.pace && (
        <div className="tool-calc-table-card">
          <span className="tool-calc-section-label">Your race pace</span>
          <div className="vo2-pace-row">
            <div className="vo2-pace-cell">
              <span className="vo2-pace-value">{fmtPace(display.pace.perKmSec)}</span>
              <span className="vo2-pace-unit">min/km</span>
            </div>
            <div className="vo2-pace-cell">
              <span className="vo2-pace-value">{fmtPace(display.pace.perMiSec)}</span>
              <span className="vo2-pace-unit">min/mile</span>
            </div>
          </div>
        </div>
      )}

      {display.equivalent && display.equivalent.length > 0 && (
        <div className="tool-calc-table-card">
          <span className="tool-calc-section-label">Equivalent race times</span>
          <p className="tool-calc-table-caption">
            Times another runner with your VDOT could be expected to hit at fresh, well-paced effort.
          </p>
          <div className="tool-calc-table" role="table">
            {display.equivalent.map((row) => (
              <div key={row.distance} role="row" className="tool-calc-table-row">
                <div className="tool-calc-table-cell-label">
                  <span className="tool-calc-table-label">{row.label}</span>
                </div>
                <div className="tool-calc-table-cell-value">
                  <strong>{fmtRaceTime(row.timeSec)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

       <div className="flex flex-col sm:flex-row items-center gap-4 justify-center" data-skip-screenshot="true">
       <button
        type="button"
        className="tool-btn tool-btn--primary mb-0"
        onClick={onTalkToAugust}
      >
        Talk to august
      </button>
      <button
        type="button"
        className="tool-btn tool-btn--ghost mb-0"
        onClick={onRestart}
      >
        Start over
      </button>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

interface Props {
  afterContent?: React.ReactNode;
}

export default function VO2MaxCalculator({ afterContent }: Props) {
  const [state, setState] = useState<VO2MaxFormState>(DEFAULT_STATE);
  const [hasCalculated, setHasCalculated] = useState(false);
  const result = useMemo<VO2MaxResult>(() => computeVO2Max(state), [state]);

  const { markStarted, markCompleted, resetCompleted } = useCalculatorAnalytics("vo2max-calculator");
  const completedTimerRef = useRef<number | null>(null);

  const update = useCallback((patch: Partial<VO2MaxFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    markStarted();
  }, [markStarted]);

  const handleCalculate = useCallback(() => {
    setHasCalculated(true);
  }, []);

  const handleRestart = useCallback(() => {
    setState(DEFAULT_STATE);
    setHasCalculated(false);
    resetCompleted();
    track("vo2max_calculator_restart");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [resetCompleted]);

  const handleTalkToAugust = useCallback(() => {
    // track("tool_cta_clicked", { tool: "vo2max-calculator", target: "chat" });
    trackToolEvent("vo2max-calculator", "cta_clicked", { target: "chat" });
    window.location.href =
      "/chat?msg=I just calculated my VO2 max and want to discuss what to do next";
  }, []);

  const onMethodChange = useCallback(
    (raw: string) => {
      const next = raw as Method;
      if (next === state.method) return;
      track("vo2max_calculator_method_change", { from: state.method, to: next });
      update({ method: next });
    },
    [state.method, update],
  );

  useEffect(() => {
    if (result.kind !== "ok") return;
    const sig = `${result.method}|${vo2Bucket(result.vo2max)}|${result.category.id}|${result.band.id}|${result.sex}`;
    if (completedTimerRef.current != null) window.clearTimeout(completedTimerRef.current);
    completedTimerRef.current = window.setTimeout(() => {
      markCompleted(sig, {
        method: result.method,
        vo2_bucket: vo2Bucket(result.vo2max),
        category: result.category.id,
        band: result.band.id,
        sex: result.sex,
      });
    }, 400);
    return () => {
      if (completedTimerRef.current != null) window.clearTimeout(completedTimerRef.current);
    };
  }, [result, markCompleted]);

  const needsWeight = state.method === "mile15" || state.method === "rockport";

  const methodHelper = METHOD_LABELS.find((m) => m.value === state.method)?.helper ?? "";

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">VO2 Max</span> Calculator
          </>
        ),
        tagline:
          "Estimate your VO2 max from a race time, a 12-minute run, a 1.5-mile run, a 1-mile walk, or your resting heart rate then see where you land against published norms for your age and sex.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card vo2-calculator-card">
              <div className="vo2-form-col">
                <div className="tool-calc-step-body">
                  <div className="tool-calc-step-header">
                    <h2 className="tool-step-title">Pick a test</h2>
                    <p className="tool-step-subtitle">{methodHelper}</p>
                  </div>

                  <div className="tool-form-group">
                    <label htmlFor="vo2-method" className="tool-form-label">Method</label>
                    <select
                      id="vo2-method"
                      className="tool-input"
                      value={state.method}
                      onChange={(e) => onMethodChange(e.target.value)}
                      aria-label="VO2 max estimation method"
                    >
                      {METHOD_LABELS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <CommonInputs state={state} update={update} needsWeight={needsWeight} />

                  {state.method === "race-time" && <RaceTimeInputs state={state} update={update} />}
                  {state.method === "cooper" && <CooperInputs state={state} update={update} />}
                  {state.method === "mile15" && <Mile15Inputs state={state} update={update} />}
                  {state.method === "rockport" && <RockportInputs state={state} update={update} />}
                  {state.method === "resting-hr" && <RestingHrInputs state={state} update={update} />}
                </div>

                {!hasCalculated && (
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      className="tool-btn tool-btn--primary mb-0"
                      onClick={handleCalculate}
                    >
                      Calculate
                    </button>
                  </div>
                )}
              </div>

              {hasCalculated && (
                <div className="vo2-result-col">
                  <VO2ResultPanel
                    result={result}
                    onRestart={handleRestart}
                    onTalkToAugust={handleTalkToAugust}
                  />
                </div>
              )}
            </div>
            <ToolAuthGate active={hasCalculated && result.kind === "ok"} />
            <p className="tool-calc-disclaimer">
              Submaximal-test estimates are accurate to within ±10–15% of a lab measurement. Not a substitute for a graded exercise test.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
