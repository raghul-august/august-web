"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { useStepForm } from "@/app/components/tool/shared/hooks/useStepForm";
import { trackToolEvent } from "@/app/utils/analytics";
import {
  cmToFeetInches,
  feetInchesToCm,
  fmtDecimal,
  fmtInt,
  kgToLbs,
  lbsToKg,
  parseNumOrNull,
} from "@/app/utils/tools/health-math";
import {
  ACTIVITY_OPTIONS,
  type ActivityLevel,
  type Gender,
  type TDEEResult,
  type FormData as TDEEFormData,
} from "@/app/data/tools/tdee-config";
import { calculateTDEEResult } from "@/app/utils/tools/tdee-compute";
import { ToolAuthGate } from "@/components/auth";

const TOTAL_STEPS = 3;

const AGE_MIN = 15;
const AGE_MAX = 100;
const HEIGHT_CM_MIN = 120;
const HEIGHT_CM_MAX = 220;
const WEIGHT_KG_MIN = 30;
const WEIGHT_KG_MAX = 250;
const BODY_FAT_MIN = 3;
const BODY_FAT_MAX = 60;

type UnitSystem = "imperial" | "metric";

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Non-binary" },
];

const YES_NO_OPTIONS = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
];

interface TDEEFormState {
  unitSystem: UnitSystem;
  sex: Gender;
  ageRaw: string;
  heightCmRaw: string;
  heightFeetRaw: string;
  heightInchesRaw: string;
  weightKgRaw: string;
  weightLbRaw: string;
  activityLevel: ActivityLevel;
  knowsBodyFat: boolean;
  bodyFatRaw: string;
}

const DEFAULT_STATE: TDEEFormState = {
  unitSystem: "imperial",
  sex: "male",
  ageRaw: "",
  heightCmRaw: "",
  heightFeetRaw: "",
  heightInchesRaw: "",
  weightKgRaw: "",
  weightLbRaw: "",
  activityLevel: "moderate",
  knowsBodyFat: false,
  bodyFatRaw: "",
};

function resolveHeightCm(state: TDEEFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.heightCmRaw);
  const feet = parseNumOrNull(state.heightFeetRaw);
  if (feet == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return feetInchesToCm(feet, inches);
}

function resolveWeightKg(state: TDEEFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.weightKgRaw);
  const lb = parseNumOrNull(state.weightLbRaw);
  return lb == null ? null : lbsToKg(lb);
}

function buildFormData(state: TDEEFormState): TDEEFormData | null {
  const heightCm = resolveHeightCm(state);
  const weightKg = resolveWeightKg(state);
  const age = parseNumOrNull(state.ageRaw);
  if (heightCm == null || weightKg == null || age == null) return null;
  const bodyFatPercent = state.knowsBodyFat
    ? parseNumOrNull(state.bodyFatRaw)
    : null;
  return {
    gender: state.sex,
    height: { value: heightCm, unit: "cm" },
    weight: { value: weightKg, unit: "kg" },
    age,
    activityLevel: state.activityLevel,
    bodyFatPercent,
  };
}

interface StepProps {
  state: TDEEFormState;
  update: (patch: Partial<TDEEFormState>) => void;
}

function ProfileStep({ state, update }: StepProps) {
  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      const patch: Partial<TDEEFormState> = { unitSystem: next };
      if (next === "metric") {
        const feet = parseNumOrNull(state.heightFeetRaw);
        const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
        if (feet != null)
          patch.heightCmRaw = fmtDecimal(feetInchesToCm(feet, inches), 0);
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
      ? `Please enter an age between ${AGE_MIN} and ${AGE_MAX}.`
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
        <p className="tool-step-subtitle">
          A few basics so we can estimate your daily calorie burn.
        </p>
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

        <div className="tool-form-group">
          <label className="tool-form-label">Sex</label>
          <SegmentedControl
            options={SEX_OPTIONS}
            value={state.sex}
            onChange={(v) => update({ sex: v as Gender })}
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
                <label htmlFor="tdee-height-cm" className="tool-form-label">
                  Height (cm)
                </label>
                <input
                  id="tdee-height-cm"
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
                <label htmlFor="tdee-weight-kg" className="tool-form-label">
                  Weight (kg)
                </label>
                <input
                  id="tdee-weight-kg"
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
                <label className="tool-form-label" htmlFor="tdee-height-feet">
                  Height
                </label>
                <div
                  className="tool-calc-combo-input"
                  aria-invalid={heightError != null}
                >
                  <div className="tool-calc-combo-segment">
                    <input
                      id="tdee-height-feet"
                      type="text"
                      inputMode="numeric"
                      className="tool-calc-combo-input__field"
                      placeholder="5"
                      aria-label="Feet"
                      value={state.heightFeetRaw}
                      onChange={(e) =>
                        update({ heightFeetRaw: e.target.value })
                      }
                    />
                    <span className="tool-calc-combo-input__suffix">ft</span>
                  </div>
                  <span
                    className="tool-calc-combo-input__divider"
                    aria-hidden="true"
                  />
                  <div className="tool-calc-combo-segment">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="tool-calc-combo-input__field"
                      placeholder="11"
                      aria-label="Inches"
                      value={state.heightInchesRaw}
                      onChange={(e) =>
                        update({ heightInchesRaw: e.target.value })
                      }
                    />
                    <span className="tool-calc-combo-input__suffix">in</span>
                  </div>
                </div>
              </div>

              <div className="tool-form-group">
                <label htmlFor="tdee-weight-lb" className="tool-form-label">
                  Weight (lb)
                </label>
                <input
                  id="tdee-weight-lb"
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
            <label htmlFor="tdee-age" className="tool-form-label">
              Age
            </label>
            <input
              id="tdee-age"
              type="text"
              inputMode="numeric"
              className="tool-input"
              placeholder="e.g. 30"
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

function ActivityStep({ state, update }: StepProps) {
  const bodyFatNum = parseNumOrNull(state.bodyFatRaw);
  const bodyFatError =
    state.knowsBodyFat &&
    bodyFatNum != null &&
    (bodyFatNum < BODY_FAT_MIN || bodyFatNum > BODY_FAT_MAX)
      ? `Body fat should be between ${BODY_FAT_MIN}% and ${BODY_FAT_MAX}%.`
      : null;

  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">Activity & body composition</h2>
        <p className="tool-step-subtitle">
          These fine-tune your daily calorie estimate.
        </p>
      </div>

      <div className="flex gap-4 flex-col md:gap-6">
        <div className="heart-age-risk-row">
          <div className="heart-age-risk-row-label">
            <label
              htmlFor="tdee-activity-level"
              className="heart-age-risk-title"
            >
              Activity level
            </label>
          </div>
          <select
            id="tdee-activity-level"
            className="tool-input"
            value={state.activityLevel}
            aria-label="Activity level"
            style={{
              fontSize: "0.8rem",
              paddingRight: "36px",
              textOverflow: "ellipsis",
            }}
            onChange={(e) =>
              update({ activityLevel: e.target.value as ActivityLevel })
            }
          >
            {ACTIVITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — {opt.description}
              </option>
            ))}
          </select>
        </div>

        <div className="heart-age-risk-row">
          <div className="heart-age-risk-row-label">
            <span className="heart-age-risk-title">
              Do you know your body fat %?
            </span>
            <span className="heart-age-risk-helper">
              Optional. When known, we use the Katch-McArdle formula instead of
              Mifflin-St Jeor.
            </span>
          </div>
          <SegmentedControl
            options={YES_NO_OPTIONS}
            value={state.knowsBodyFat ? "yes" : "no"}
            onChange={(v) => update({ knowsBodyFat: v === "yes" })}
            ariaLabel="Know body fat percent"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        {state.knowsBodyFat && (
          <div className="heart-age-risk-row tool-calc-form-span-2">
            <div className="heart-age-risk-row-label">
              <label htmlFor="tdee-body-fat" className="heart-age-risk-title">
                Body fat (%)
              </label>
            </div>
            <input
              id="tdee-body-fat"
              type="text"
              inputMode="decimal"
              className="tool-input"
              placeholder="e.g. 18"
              value={state.bodyFatRaw}
              aria-invalid={bodyFatError != null}
              onChange={(e) => update({ bodyFatRaw: e.target.value })}
            />
          </div>
        )}
      </div>

      {bodyFatError && (
        <div className="tool-calc-error-stack">
          <p className="tool-error">{bodyFatError}</p>
        </div>
      )}
    </div>
  );
}

function TDEEResultPanel({
  result,
  state,
  onRestart,
}: {
  result: TDEEResult;
  state: TDEEFormState;
  onRestart: () => void;
}) {
  const activity = ACTIVITY_OPTIONS.find((a) => a.value === state.activityLevel);
  const goalRows = [
    {
      id: "lose-fast",
      label: "Lose 2 lb / week",
      helper: "≈1 kg per week — aggressive cut",
      calories: result.loseWeight.fast,
    },
    {
      id: "lose-slow",
      label: "Lose 1 lb / week",
      helper: "≈0.45 kg per week — sustainable cut",
      calories: result.loseWeight.slow,
    },
    {
      id: "gain-slow",
      label: "Gain 0.25 kg / week",
      helper: "Slow lean gain",
      calories: result.gainWeight.slow,
    },
    {
      id: "gain-fast",
      label: "Gain 0.5 kg / week",
      helper: "Faster gain — more fat alongside muscle",
      calories: result.gainWeight.fast,
    },
  ];

  return (
    <div className="tool-calc-result-stack">
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Your estimated TDEE</span>
        <div className="tool-calc-value-row">
          <span className="tool-calc-value">{fmtInt(result.tdee)}</span>
          <span className="tool-calc-value-unit">cal / day</span>
        </div>
        <p className="tool-calc-result-desc">
          This is roughly how many calories your body burns in a day at your
          current activity level ({activity?.label.toLowerCase() ?? "moderate"}).
          Eat near this number to maintain your weight.
        </p>
        <div className="tool-calc-meta-row">
          <span>Basal metabolic rate (BMR)</span>
          <strong>{fmtInt(result.bmr)} cal</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>BMI from your height & weight</span>
          <strong>{fmtDecimal(result.bmi, 1)}</strong>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4">
        <a
          href="/chat?msg=I just used the TDEE calculator and want to discuss my results"
          className="tool-btn tool-btn--primary"
          onClick={() =>
            trackToolEvent("tdee", "cta_clicked", { target: "chat" })
          }
        >
          Talk to august
        </a>
        <button
          type="button"
          className="tool-btn tool-btn--ghost"
          onClick={onRestart}
        >
          Start over
        </button>
      </div>

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label">Calorie goals</span>
        <p className="tool-calc-table-caption">
          Adjust your daily intake by these amounts to hit a weight-change rate.
          Cutting more than 1,000 cal / day isn&apos;t recommended for most
          adults.
        </p>
        <div className="tool-calc-table" role="table">
          {goalRows.map((row) => (
            <div key={row.id} role="row" className="tool-calc-table-row">
              <div className="tool-calc-table-cell-label">
                <span className="tool-calc-table-label">{row.label}</span>
                <span className="tool-calc-table-helper">{row.helper}</span>
              </div>
              <div className="tool-calc-table-cell-value">
                <strong>{fmtInt(row.calories)}</strong>
                <span className="tool-calc-table-unit">cal</span>
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

function NavigationControls({
  step,
  totalSteps,
  canAdvance,
  onNext,
  onBack,
  isLastFormStep,
}: NavProps) {
  return (
    <div className="tool-calc-nav">
      {step > 0 ? (
        <button
          type="button"
          className="tool-btn tool-btn--ghost tool-calc-nav-btn"
          onClick={onBack}
        >
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
            className={`tool-calc-dot${
              i === step
                ? " tool-calc-dot--active"
                : i < step
                  ? " tool-calc-dot--completed"
                  : ""
            }`}
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
  afterContent?: ReactNode;
}

export default function TDEECalculatorClient({ afterContent }: Props) {
  const [state, setState] = useState<TDEEFormState>(DEFAULT_STATE);
  const { step, next, back, reset } = useStepForm({ totalSteps: TOTAL_STEPS });

  const formData = useMemo(() => buildFormData(state), [state]);
  const result = useMemo<TDEEResult | null>(
    () => (formData ? calculateTDEEResult(formData) : null),
    [formData],
  );

  const hasViewedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const lastCompletedSigRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("tdee", "viewed");
  }, []);

  useEffect(() => {
    trackToolEvent("tdee", "section_completed", { step });
  }, [step]);

  const update = useCallback((patch: Partial<TDEEFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackToolEvent("tdee", "started");
    }
  }, []);

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
      const heightOk =
        h != null && h >= HEIGHT_CM_MIN && h <= HEIGHT_CM_MAX;
      const weightOk =
        w != null && w >= WEIGHT_KG_MIN && w <= WEIGHT_KG_MAX;
      return ageOk && heightOk && weightOk;
    }
    if (step === 1) {
      if (!state.activityLevel) return false;
      if (!state.knowsBodyFat) return true;
      const bf = parseNumOrNull(state.bodyFatRaw);
      return bf != null && bf >= BODY_FAT_MIN && bf <= BODY_FAT_MAX;
    }
    return false;
  }, [step, state]);

  useEffect(() => {
    if (step !== TOTAL_STEPS - 1) return;
    if (!result) return;
    const sig = `${result.tdee}|${result.bmr}|${state.activityLevel}`;
    if (sig === lastCompletedSigRef.current) return;
    lastCompletedSigRef.current = sig;
    trackToolEvent("tdee", "completed", {
      tdee: result.tdee,
      bmr: result.bmr,
      gender: state.sex,
      activity_level: state.activityLevel,
    });
  }, [step, result, state.sex, state.activityLevel]);

  const isResultsStep = step === TOTAL_STEPS - 1;
  const isLastFormStep = step === TOTAL_STEPS - 2;

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">TDEE</span> Calculator
          </>
        ),
        tagline:
          "Estimate your Total Daily Energy Expenditure the calories your body burns each day and see how to adjust intake for weight-loss or weight-gain goals.",
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
                  {step === 1 && <ActivityStep state={state} update={update} />}
                  {isResultsStep && result && (
                    <TDEEResultPanel
                      result={result}
                      state={state}
                      onRestart={handleRestart}
                    />
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
            <ToolAuthGate active={isResultsStep && result != null} />
            <p className="tl-disclaimer">
              TDEE estimates use the Mifflin-St Jeor (or Katch-McArdle when
              body fat is provided) equation. Your data never leaves your
              device.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
