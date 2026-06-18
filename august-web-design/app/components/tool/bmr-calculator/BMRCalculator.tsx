"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatedStepPanel,
  ToolResultActions,
  WizardNavigation,
} from "@/app/components/tool/shared/CalculatorPrimitives";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { useStepForm } from "@/app/components/tool/shared/hooks/useStepForm";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { track, trackToolEvent } from "@/app/utils/analytics";
import {
  convertUnits,
  fmtInt,
  parseNumOrNull,
  resolveHeightCm,
  resolveWeightKg,
  type ActivityLevel,
} from "@/app/utils/tools/health-math";
import {
  ACTIVITIES,
  AGE_MAX,
  AGE_MIN,
  BODY_FAT_MAX,
  BODY_FAT_MIN,
  bmrBucket,
  computeBMR,
  FORMULAS,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
  type BMRFormState,
  type BMRFormula,
  type BMRResult,
  type BMRResultOk,
  type Sex,
  type UnitSystem,
} from "@/app/utils/tools/bmr-compute";

/* ── Constants ────────────────────────────────────────────────────────── */

const TOTAL_STEPS = 3; // details + activity + results

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const FORMULA_OPTIONS = FORMULAS.map((f) => ({ value: f.id, label: f.shortLabel }));

const DEFAULT_STATE: BMRFormState = {
  unitSystem: "imperial",
  sex: "male",
  ageRaw: "",
  heightCmRaw: "",
  heightFeetRaw: "",
  heightInchesRaw: "",
  weightKgRaw: "",
  weightLbRaw: "",
  bodyFatRaw: "",
  formula: "mifflin",
  activity: "moderate",
};

/* ── DetailsStep (units + measurements + profile + formula) ──────────── */

interface StepProps {
  state: BMRFormState;
  update: (patch: Partial<BMRFormState>) => void;
}

function DetailsStep({ state, update }: StepProps) {
  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      track("bmr_calculator_unit_change", { from: state.unitSystem, to: next });

      const converted = convertUnits(state, next);
      update({ unitSystem: next, ...converted });
    },
    [state, update],
  );

  const isMetric = state.unitSystem === "metric";
  const needsBodyFat = state.formula === "katch";

  const heightCm = resolveHeightCm(state);
  const weightKg = resolveWeightKg(state);
  const ageNum = parseNumOrNull(state.ageRaw);
  const bodyFat = parseNumOrNull(state.bodyFatRaw);

  const heightError =
    heightCm != null && (heightCm < HEIGHT_CM_MIN || heightCm > HEIGHT_CM_MAX)
      ? "Please check the height entered."
      : null;
  const weightError =
    weightKg != null && (weightKg < WEIGHT_KG_MIN || weightKg > WEIGHT_KG_MAX)
      ? "Please check the weight entered."
      : null;
  const ageError =
    ageNum != null && (ageNum < AGE_MIN || ageNum > AGE_MAX)
      ? `Enter an age between ${AGE_MIN} and ${AGE_MAX}.`
      : null;
  const bodyFatError =
    needsBodyFat && bodyFat != null && (bodyFat < BODY_FAT_MIN || bodyFat > BODY_FAT_MAX)
      ? `Body-fat % should fall between ${BODY_FAT_MIN}% and ${BODY_FAT_MAX}%.`
      : null;

  return (
    <div className="tool-step-body">
      <div className="tool-step-header">
        <h2 className="tool-step-title">Your details</h2>
        <p className="tool-step-subtitle">Tell us about you so we can estimate your BMR.</p>
      </div>
      <div className="tool-form-grid-responsive">
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
            onChange={(v) => update({ sex: v as Sex })}
            ariaLabel="Sex"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        <div className="bmr-hwa-row tool-form-span-2">
          {isMetric ? (
            <>
              <div className="tool-form-group">
                <label htmlFor="bmr-height-cm" className="tool-form-label">Height (cm)</label>
                <input
                  id="bmr-height-cm"
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
                <label htmlFor="bmr-weight-kg" className="tool-form-label">Weight (kg)</label>
                <input
                  id="bmr-weight-kg"
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
                      className="tool-input tool-ft-in-input"
                      placeholder="5"
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
                <label htmlFor="bmr-weight-lb" className="tool-form-label">Weight (lb)</label>
                <input
                  id="bmr-weight-lb"
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
            <label htmlFor="bmr-age" className="tool-form-label">Age</label>
            <input
              id="bmr-age"
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

        <div className="tool-form-group tool-form-span-2">
          <label className="tool-form-label">Formula</label>
          <SegmentedControl
            options={FORMULA_OPTIONS}
            value={state.formula}
            onChange={(v) => {
              track("bmr_calculator_formula_change", { formula: v });
              update({ formula: v as BMRFormula });
            }}
            ariaLabel="BMR formula"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        {needsBodyFat && (
          <div className="tool-form-group tool-form-span-2">
            <label htmlFor="bmr-body-fat" className="tool-form-label">Body fat (%)</label>
            <input
              id="bmr-body-fat"
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

      {(heightError || weightError || ageError || bodyFatError) && (
        <div className="tool-error-stack">
          {heightError && <p className="tool-error">{heightError}</p>}
          {weightError && <p className="tool-error">{weightError}</p>}
          {ageError && <p className="tool-error">{ageError}</p>}
          {bodyFatError && <p className="tool-error">{bodyFatError}</p>}
        </div>
      )}
    </div>
  );
}

/* ── ActivityStep ─────────────────────────────────────────────────────── */

function ActivityStep({ state, update }: StepProps) {
  return (
    <div className="tool-step-body">
      <div className="tool-step-header">
        <h2 className="tool-step-title">How active are you?</h2>
        <p className="tool-step-subtitle">Used to estimate your daily calorie needs.</p>
      </div>

      <div className="bmr-activity-grid" role="radiogroup" aria-label="Activity level">
        {ACTIVITIES.map((a) => {
          const active = a.id === state.activity;
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`bmr-activity-chip${active ? " bmr-activity-chip--active" : ""}`}
              onClick={() => {
                track("bmr_calculator_activity_change", { activity: a.id });
                update({ activity: a.id as ActivityLevel });
              }}
            >
              <div className="tool-table-cell-label">
                <span className="tool-table-label">{a.label}</span>
                <span className="tool-table-helper">{a.helper}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── BMRResultPanel ──────────────────────────────────────────────────── */

function BMRResultPanel({ result, onRestart }: { result: BMRResultOk; onRestart: () => void }) {
  return (
    <div className="tool-result-stack">
      <div className="tool-result-primary bmr-result-primary">
        <span className="bmr-section-label">Your BMR</span>
        <div className="tool-value-row">
          <span className="tool-value">{fmtInt(result.bmr)}</span>
          <span className="tool-value-unit">kcal / day</span>
        </div>
        <p className="tool-result-desc">
          The energy your body burns at complete rest. Kept warm, breathing, and pumping blood.
        </p>
        <div className="bmr-tdee-line">
          <span>Daily calories at your selected activity</span>
          <strong>{fmtInt(result.tdee)} kcal</strong>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <a
          href="/chat?msg=I just used the BMR calculator and want to discuss my results"
          className="tool-btn tool-btn--primary"
          onClick={() => {
            // track("tool_cta_clicked", { tool: "bmr-calculator", target: "chat" });
            trackToolEvent("bmr-calculator", "cta_clicked", { target: "chat" });
          }}
        >
          Talk to august
        </a>
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
          Start over
        </button>
      </div>

      <div className="tool-table-card">
        <span className="bmr-section-label">Daily calories by activity</span>
        <div className="tool-table" role="table">
          {result.activityCalories.map((row) => {
            const isActive = row.id === result.activity;
            return (
              <div
                key={row.id}
                role="row"
                className={`tool-table-row${isActive ? " tool-table-row--active" : ""}`}
              >
                <div className="tool-table-cell-label">
                  <span className="tool-table-label">{row.label}</span>
                  <span className="tool-table-helper">{row.helper}</span>
                </div>
                <div className="tool-table-cell-value">
                  <span className="bmr-table-mult">×{row.multiplier}</span>
                  <strong>{fmtInt(row.calories)}</strong>
                  <span className="tool-table-unit">kcal</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tool-table-card">
        <span className="bmr-section-label">Calorie targets by weight goal</span>
        <p className="tool-table-caption">
          Adjusted from your daily expenditure ({fmtInt(result.tdee)} kcal).
        </p>
        <div className="tool-table" role="table">
          {result.goals.map((row) => (
            <div key={row.id} role="row" className="tool-table-row">
              <div className="tool-table-cell-label">
                <span className="tool-table-label">{row.label}</span>
                <span className="tool-table-helper">{row.description}</span>
              </div>
              <div className="tool-table-cell-value">
                <strong>{fmtInt(row.calories)}</strong>
                <span className="tool-table-unit">kcal</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── BMRCalculator (default export) ──────────────────────────────────── */

interface Props {
  afterContent?: React.ReactNode;
}

export default function BMRCalculator({ afterContent }: Props) {
  const [state, setState] = useState<BMRFormState>(DEFAULT_STATE);
  const { step, next, back, reset } = useStepForm({ totalSteps: TOTAL_STEPS });
  const { markStarted, markCompleted } = useCalculatorAnalytics("bmr-calculator");

  const result = useMemo<BMRResult>(() => computeBMR(state), [state]);

  useEffect(() => {
    trackToolEvent("bmr-calculator", "section_completed", { step });
  }, [step]);

  const update = useCallback((patch: Partial<BMRFormState>) => {
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
      const heightOk = h != null && h >= HEIGHT_CM_MIN && h <= HEIGHT_CM_MAX;
      const weightOk = w != null && w >= WEIGHT_KG_MIN && w <= WEIGHT_KG_MAX;
      const ageOk = ageNum != null && ageNum >= AGE_MIN && ageNum <= AGE_MAX;
      if (!heightOk || !weightOk || !ageOk) return false;
      if (state.formula === "katch") {
        const bf = parseNumOrNull(state.bodyFatRaw);
        if (bf == null || bf < BODY_FAT_MIN || bf > BODY_FAT_MAX) return false;
      }
      return true;
    }
    if (step === 1) return true;
    return false;
  }, [step, state]);

  useEffect(() => {
    if (step !== TOTAL_STEPS - 1) return;
    if (result.kind !== "ok") return;
    const sig = `${bmrBucket(result.bmr)}|${result.formula}|${result.activity}`;
    markCompleted(sig, {
      bmr_bucket: bmrBucket(result.bmr),
      formula: result.formula,
      activity: result.activity,
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
            <span className="accent-gradient">BMR</span> Calculator
          </>
        ),
        tagline:
          "Estimate your Basal Metabolic Rate, the calories your body burns at rest, plus daily calorie needs for every activity level.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-wizard-card">
              <AnimatedStepPanel stepKey={step}>
                {step === 0 && <DetailsStep state={state} update={update} />}
                {step === 1 && <ActivityStep state={state} update={update} />}
                {isResultsStep && result.kind === "ok" && (
                  <BMRResultPanel result={result} onRestart={handleRestart} />
                )}
              </AnimatedStepPanel>

              {!isResultsStep && (
                <WizardNavigation
                  step={step}
                  totalSteps={TOTAL_STEPS}
                  canAdvance={canAdvance}
                  onNext={next}
                  onBack={back}
                  isLastFormStep={isLastFormStep}
                />
              )}
            </div>
            <p className="tool-calc-disclaimer">
              BMR estimates are educational and depend on the formula and inputs used. They are not a substitute for clinical assessment.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
