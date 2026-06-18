"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { useStepForm } from "@/app/components/tool/shared/hooks/useStepForm";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { ToolAuthGate } from "@/components/auth";
import {
  cmToFeetInches,
  feetInchesToCm,
  fmtDecimal,
  fmtInt,
  fmtPercent,
  kgToLbs,
  lbsToKg,
  parseNumOrNull,
} from "@/app/utils/tools/health-math";
import {
  AGE_MAX,
  AGE_MIN,
  computeHeartAge,
  fmtYears,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  heartAgeBucket,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
  type BPCategory,
  type HeartAgeFormState,
  type HeartAgeResult,
  type HeartAgeResultOk,
  type Sex,
  type SmokingStatus,
  type UnitSystem,
} from "@/app/utils/tools/heart-age-compute";

const TOTAL_STEPS = 3;

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const SMOKING_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "former", label: "Former" },
  { value: "current", label: "Current" },
];

const BP_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "elevated", label: "Elevated" },
  { value: "high", label: "High" },
  { value: "unknown", label: "Don't know" },
];

const YES_NO_OPTIONS = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
];

const DEFAULT_STATE: HeartAgeFormState = {
  unitSystem: "imperial",
  sex: "male",
  ageRaw: "",
  heightCmRaw: "",
  heightFeetRaw: "",
  heightInchesRaw: "",
  weightKgRaw: "",
  weightLbRaw: "",
  smoking: "never",
  diabetes: false,
  bpCategory: "unknown",
  bpTreated: false,
  familyHistory: false,
};

function resolveHeightCm(state: HeartAgeFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.heightCmRaw);
  const feet = parseNumOrNull(state.heightFeetRaw);
  if (feet == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return feetInchesToCm(feet, inches);
}

function resolveWeightKg(state: HeartAgeFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.weightKgRaw);
  const lb = parseNumOrNull(state.weightLbRaw);
  return lb == null ? null : lbsToKg(lb);
}

interface StepProps {
  state: HeartAgeFormState;
  update: (patch: Partial<HeartAgeFormState>) => void;
}

function ProfileStep({ state, update }: StepProps) {
  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      track("heart_age_calculator_unit_change", { from: state.unitSystem, to: next });

      const patch: Partial<HeartAgeFormState> = { unitSystem: next };
      if (next === "metric") {
        const feet = parseNumOrNull(state.heightFeetRaw);
        const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
        if (feet != null) patch.heightCmRaw = fmtDecimal(feetInchesToCm(feet, inches), 0);
        const lb = parseNumOrNull(state.weightLbRaw);
        if (lb != null) patch.weightKgRaw = fmtDecimal(lbsToKg(lb), 1);
      } else {
        const cm = parseNumOrNull(state.heightCmRaw);
        if (cm != null) {
          const { feet, inches } = cmToFeetInches(cm);
          patch.heightFeetRaw = String(feet);
          patch.heightInchesRaw = String(inches);
        }
        const kg = parseNumOrNull(state.weightKgRaw);
        if (kg != null) patch.weightLbRaw = fmtDecimal(kgToLbs(kg), 1);
      }
      update(patch);
    },
    [state, update],
  );

  const isMetric = state.unitSystem === "metric";
  const heightCm = resolveHeightCm(state);
  const weightKg = resolveWeightKg(state);
  const ageNum = parseNumOrNull(state.ageRaw);

  const ageError =
    ageNum != null && (ageNum < AGE_MIN || ageNum > AGE_MAX)
      ? `This model is calibrated for ages ${AGE_MIN}–${AGE_MAX}.`
      : null;
  const heightError =
    heightCm != null && (heightCm < HEIGHT_CM_MIN || heightCm > HEIGHT_CM_MAX)
      ? "Please check the height entered."
      : null;
  const weightError =
    weightKg != null && (weightKg < WEIGHT_KG_MIN || weightKg > WEIGHT_KG_MAX)
      ? "Please check the weight entered."
      : null;

  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">Your details</h2>
        <p className="tool-step-subtitle">A few basics so we can estimate your heart age.</p>
      </div>

      <div className="tool-calc-form-grid">


        <div className="tool-form-group">
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
        </div>

        {/* Sex */}
        <div className="tool-form-group">
          <label className="tool-form-label">Sex</label>
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

        <div className="tool-calc-hwa-row tool-calc-form-span-2">
          {isMetric ? (
            <>
              <div className="tool-form-group">
                <label htmlFor="heart-age-height-cm" className="tool-form-label">Height (cm)</label>
                <input
                  id="heart-age-height-cm"
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
                <label htmlFor="heart-age-weight-kg" className="tool-form-label">Weight (kg)</label>
                <input
                  id="heart-age-weight-kg"
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
                <label className="tool-form-label" htmlFor="heart-age-height-feet">Height</label>
                <div className="tool-calc-combo-input" aria-invalid={heightError != null}>
                  <div className="tool-calc-combo-segment">
                    <input
                      id="heart-age-height-feet"
                      type="text"
                      inputMode="numeric"
                      className="tool-calc-combo-input__field"
                      placeholder="5"
                      aria-label="Feet"
                      value={state.heightFeetRaw}
                      onChange={(e) => update({ heightFeetRaw: e.target.value })}
                    />
                    <span className="tool-calc-combo-input__suffix">ft</span>
                  </div>
                  <span className="tool-calc-combo-input__divider" aria-hidden="true" />
                  <div className="tool-calc-combo-segment">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="tool-calc-combo-input__field"
                      placeholder="11"
                      aria-label="Inches"
                      value={state.heightInchesRaw}
                      onChange={(e) => update({ heightInchesRaw: e.target.value })}
                    />
                    <span className="tool-calc-combo-input__suffix">in</span>
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div className="tool-form-group">
                <label htmlFor="heart-age-weight-lb" className="tool-form-label">Weight (lb)</label>
                <input
                  id="heart-age-weight-lb"
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
          {/* Age */}
          <div className="tool-form-group">
            <label htmlFor="heart-age-age" className="tool-form-label">Age</label>
            <input
              id="heart-age-age"
              type="text"
              inputMode="numeric"
              className="tool-input"
              placeholder="e.g. 45"
              value={state.ageRaw}
              aria-invalid={ageError != null}
              onChange={(e) => update({ ageRaw: e.target.value })}
            />
          </div>

          
        </div>

      </div>

      {(ageError || heightError || weightError) && (
        <div className="tool-calc-error-stack">
          {ageError && <p className="tool-error">{ageError}</p>}
          {heightError && <p className="tool-error">{heightError}</p>}
          {weightError && <p className="tool-error">{weightError}</p>}
        </div>
      )}
    </div>
  );
}

function RiskFactorsStep({ state, update }: StepProps) {
  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">Health & lifestyle</h2>
        <p className="tool-step-subtitle">These are the risk factors the Framingham model uses.</p>
      </div>

      <div className="heart-age-risk-stack">

         <div className="heart-age-risk-row">
          <div className="heart-age-risk-row-label">
            <label htmlFor="heart-age-bp" className="heart-age-risk-title">Blood pressure</label>
          </div>
          <select
            id="heart-age-bp"
            className="tool-input"
            value={state.bpCategory}
            aria-label="Blood pressure category"
            onChange={(e) => {
              const v = e.target.value as BPCategory;
              track("heart_age_calculator_bp_change", { bp: v });
              update({ bpCategory: v });
            }}
          >
            {BP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

         <div className="heart-age-risk-row">
          <div className="heart-age-risk-row-label">
            <span className="heart-age-risk-title">Family history of early heart disease</span>
          </div>
          <SegmentedControl
            options={YES_NO_OPTIONS}
            value={state.familyHistory ? "yes" : "no"}
            onChange={(v) => update({ familyHistory: v === "yes" })}
            ariaLabel="Family history"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

       

        {state.bpCategory !== "normal" && state.bpCategory !== "unknown" && (
          <div className="heart-age-risk-row">
            <div className="heart-age-risk-row-label">
              <span className="heart-age-risk-title">Taking blood-pressure medication?</span>
              {/* <span className="heart-age-risk-helper">Treated and untreated BP carry slightly different weights.</span> */}
            </div>
            <SegmentedControl
              options={YES_NO_OPTIONS}
              value={state.bpTreated ? "yes" : "no"}
              onChange={(v) => update({ bpTreated: v === "yes" })}
              ariaLabel="Treated for high blood pressure"
              className="tool-chip-group tool-chip-group--connected"
              buttonClassName="tool-chip"
              activeClassName="tool-chip--active"
            />
          </div>
        )}

         <div className="heart-age-risk-row">
          <div className="heart-age-risk-row-label">
            <span className="heart-age-risk-title">Smoking</span>
          </div>
          <SegmentedControl
            options={SMOKING_OPTIONS}
            value={state.smoking}
            onChange={(v) => {
              track("heart_age_calculator_smoking_change", { smoking: v });
              update({ smoking: v as SmokingStatus });
            }}
            ariaLabel="Smoking status"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

       

        <div className="heart-age-risk-row">
          <div className="heart-age-risk-row-label">
            <span className="heart-age-risk-title">Diabetes</span>
          </div>
          <SegmentedControl
            options={YES_NO_OPTIONS}
            value={state.diabetes ? "yes" : "no"}
            onChange={(v) => update({ diabetes: v === "yes" })}
            ariaLabel="Diabetes"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>
      </div>
    </div>
  );
}

function deltaPillTone(bandTone: HeartAgeResultOk["band"]["tone"]): string {
  return `heart-age-delta-pill--${bandTone}`;
}

function deltaLabel(delta: number): string {
  if (delta === 0) return "On par with your age";
  if (delta < 0) return `${fmtYears(delta)} younger than you`;
  return `${fmtYears(delta)} older than you`;
}

function HeartAgeResultPanel({ result, onRestart }: { result: HeartAgeResultOk; onRestart: () => void }) {
  return (
    <div className="tool-calc-result-stack">
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Your heart age</span>
        <div className="tool-calc-value-row">
          <span className="tool-calc-value">{fmtInt(result.heartAgeRounded)}</span>
          <span className="tool-calc-value-unit">years</span>
        </div>
        <span className={`heart-age-delta-pill ${deltaPillTone(result.band.tone)}`}>
          {deltaLabel(result.delta)}
        </span>
        <p className="tool-calc-result-desc">{result.band.description}</p>
        <div className="tool-calc-meta-row">
          <span>10-year cardiovascular risk</span>
          <strong>{fmtPercent(result.risk10yr * 100, 1)}</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>BMI from your height & weight</span>
          <strong>{fmtDecimal(result.bmi, 1)}</strong>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4">
        <a
          href="/chat?msg=I just used the Heart Age calculator and want to discuss my results"
          className="tool-btn tool-btn--primary"
          onClick={() => {
            // track("tool_cta_clicked", { tool: "heart-age-calculator", target: "chat" });
            trackToolEvent("heart-age-calculator", "cta_clicked", { target: "chat" });
          }}
        >
          Talk to august
        </a>
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
          Start over
        </button>
      </div>

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label">What changes if you...</span>
        <p className="tool-calc-table-caption">
          Hypothetical heart age if you changed one risk factor at a time, holding the others constant.
        </p>
        <div className="tool-calc-table" role="table">
          {result.impacts.map((row) => (
            <div
              key={row.id}
              role="row"
              className={`tool-calc-table-row${row.applicable ? "" : " heart-age-table-row--muted"}`}
            >
              <div className="tool-calc-table-cell-label">
                <span className="tool-calc-table-label">{row.label}</span>
                <span className="tool-calc-table-helper">{row.helper}</span>
              </div>
              <div className="tool-calc-table-cell-value">
                <strong>{fmtInt(row.heartAgeYears)}</strong>
                <span className="tool-calc-table-unit">yrs</span>
                {row.applicable && row.delta > 0 && (
                  <span className="heart-age-table-delta">−{fmtInt(row.delta)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface NavProps {
  step: number;
  totalSteps: number;
  canAdvance: boolean;
  onNext: () => void;
  onBack: () => void;
  isLastFormStep: boolean;
}

function NavigationControls({ step, totalSteps, canAdvance, onNext, onBack, isLastFormStep }: NavProps) {
  return (
    <div className="tool-calc-nav">
      {step > 0 ? (
        <button type="button" className="tool-btn tool-btn--ghost tool-calc-nav-btn" onClick={onBack}>
          <ArrowLeftIcon size={14} weight="bold" aria-hidden />
          Back
        </button>
      ) : (
        <div />
      )}

      <div className="tool-calc-dots" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={`tool-calc-dot${i === step ? " tool-calc-dot--active" : i < step ? " tool-calc-dot--completed" : ""}`}
          />
        ))}
      </div>

      <button
        type="button"
        className="tool-btn tool-btn--primary tool-calc-nav-btn"
        disabled={!canAdvance}
        onClick={onNext}
      >
        {isLastFormStep ? "Calculate" : "Next"}
        <ArrowRightIcon size={14} weight="bold" aria-hidden />
      </button>
    </div>
  );
}

interface Props {
  afterContent?: React.ReactNode;
}

export default function HeartAgeCalculator({ afterContent }: Props) {
  const [state, setState] = useState<HeartAgeFormState>(DEFAULT_STATE);
  const { step, next, back, reset } = useStepForm({ totalSteps: TOTAL_STEPS });

  const result = useMemo<HeartAgeResult>(() => computeHeartAge(state), [state]);

  const { markStarted, markCompleted } = useCalculatorAnalytics("heart-age-calculator");

  useEffect(() => {
    trackToolEvent("heart-age-calculator", "section_completed", { step });
  }, [step]);

  const update = useCallback((patch: Partial<HeartAgeFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    markStarted();
  }, [markStarted]);

  const handleRestart = useCallback(() => {
    reset();
    setState(DEFAULT_STATE);
  }, [reset]);

  const canAdvance = useMemo(() => {
    if (step === 0) {
      const h = resolveHeightCm(state);
      const w = resolveWeightKg(state);
      const ageNum = parseNumOrNull(state.ageRaw);
      const ageOk = ageNum != null && ageNum >= AGE_MIN && ageNum <= AGE_MAX;
      const heightOk = h != null && h >= HEIGHT_CM_MIN && h <= HEIGHT_CM_MAX;
      const weightOk = w != null && w >= WEIGHT_KG_MIN && w <= WEIGHT_KG_MAX;
      return ageOk && heightOk && weightOk;
    }
    if (step === 1) return true;
    return false;
  }, [step, state]);

  useEffect(() => {
    if (step !== TOTAL_STEPS - 1) return;
    if (result.kind !== "ok") return;
    const sig = `${heartAgeBucket(result.heartAge)}|${result.band.id}|${result.inputs.age}`;
    markCompleted(sig, {
      heart_age_bucket: heartAgeBucket(result.heartAge),
      band: result.band.id,
      delta: result.delta,
      age: result.inputs.age,
      unit_system: state.unitSystem,
    });
  }, [step, result, state.unitSystem, markCompleted]);

  const isResultsStep = step === TOTAL_STEPS - 1;
  const isLastFormStep = step === TOTAL_STEPS - 2;

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Heart Age</span> Calculator
          </>
        ),
        tagline:
          "Estimate the age your cardiovascular system appears to be, based on the same risk factors a clinician would assess no lab values required.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {step === 0 && <ProfileStep state={state} update={update} />}
                  {step === 1 && <RiskFactorsStep state={state} update={update} />}
                  {isResultsStep && result.kind === "ok" && (
                    <HeartAgeResultPanel result={result} onRestart={handleRestart} />
                  )}
                </motion.div>
              </AnimatePresence>

              {!isResultsStep && (
                <NavigationControls
                  step={step}
                  totalSteps={TOTAL_STEPS}
                  canAdvance={canAdvance}
                  onNext={next}
                  onBack={back}
                  isLastFormStep={isLastFormStep}
                />
              )}
            </div>
            <ToolAuthGate active={isResultsStep && result.kind === "ok"} />
            <p className="tl-disclaimer">
              Heart age is an educational estimate from the non-laboratory Framingham CVD model (D'Agostino 2008). It is not a substitute for a clinical cardiovascular risk assessment.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
