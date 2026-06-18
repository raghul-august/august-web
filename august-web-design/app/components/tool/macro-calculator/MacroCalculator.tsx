"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AnimatedStepPanel,
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
  type UnitSystem,
} from "@/app/utils/tools/health-math";
import {
  ACTIVITIES,
  AGE_MAX,
  AGE_MIN,
  BODY_FAT_MAX,
  BODY_FAT_MIN,
  DEFAULT_STATE,
  GOALS,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
  type ActivityId,
  type Formula,
  type GoalId,
  type MacroFormState,
  type Sex,
  type SplitId,
} from "@/app/data/tools/macro-calculator-config";
import { computeMacros, type MacroResult } from "@/app/utils/tools/macro-calculator-compute";

const TOTAL_STEPS = 3;
const TOOL_ID = "macro-calculator";

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const FORMULA_OPTIONS = [
  { value: "mifflin", label: "Mifflin-St Jeor" },
  { value: "katch", label: "Katch-McArdle" },
];

interface StepProps {
  state: MacroFormState;
  update: (patch: Partial<MacroFormState>) => void;
}

function DetailsStep({ state, update }: StepProps) {
  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      track("macro_calculator_unit_change", { from: state.unitSystem, to: next });
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
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">Your details</h2>
        <p className="tool-step-subtitle">
          Used to estimate your calorie and macronutrient needs.
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
                <label htmlFor="macro-height-cm" className="tool-form-label">
                  Height (cm)
                </label>
                <input
                  id="macro-height-cm"
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
                <label htmlFor="macro-weight-kg" className="tool-form-label">
                  Weight (kg)
                </label>
                <input
                  id="macro-weight-kg"
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
                <label className="tool-form-label" htmlFor="macro-height-feet">
                  Height
                </label>
                <div
                  className="tool-calc-combo-input"
                  aria-invalid={heightError != null}
                >
                  <div className="tool-calc-combo-segment">
                    <input
                      id="macro-height-feet"
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
                      onChange={(e) => update({ heightInchesRaw: e.target.value })}
                    />
                    <span className="tool-calc-combo-input__suffix">in</span>
                  </div>
                </div>
              </div>
              <div className="tool-form-group">
                <label htmlFor="macro-weight-lb" className="tool-form-label">
                  Weight (lb)
                </label>
                <input
                  id="macro-weight-lb"
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
            <label htmlFor="macro-age" className="tool-form-label">
              Age
            </label>
            <input
              id="macro-age"
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

        <div className="tool-form-group tool-calc-form-span-2">
          <label className="tool-form-label">BMR formula</label>
          <SegmentedControl
            options={FORMULA_OPTIONS}
            value={state.formula}
            onChange={(v) => {
              track("macro_calculator_formula_change", { formula: v });
              update({ formula: v as Formula });
            }}
            ariaLabel="BMR formula"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        {needsBodyFat && (
          <div className="tool-form-group tool-calc-form-span-2">
            <label htmlFor="macro-body-fat" className="tool-form-label">
              Body fat (%)
            </label>
            <input
              id="macro-body-fat"
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
        <div className="tool-calc-error-stack">
          {heightError && <p className="tool-error">{heightError}</p>}
          {weightError && <p className="tool-error">{weightError}</p>}
          {ageError && <p className="tool-error">{ageError}</p>}
          {bodyFatError && <p className="tool-error">{bodyFatError}</p>}
        </div>
      )}
    </div>
  );
}

function LifestyleStep({ state, update }: StepProps) {
  const activity = ACTIVITIES.find((a) => a.id === state.activity);
  const goal = GOALS.find((g) => g.id === state.goal);

  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">Activity and goal</h2>
        <p className="tool-step-subtitle">
          How active you are, and what you want to do with your weight.
        </p>
      </div>

      <div className="tool-calc-form-grid">
        <div className="tool-form-group tool-calc-form-span-2">
          <label htmlFor="macro-activity" className="tool-form-label">
            Activity level
          </label>
          <select
            id="macro-activity"
            className="tool-input"
            value={state.activity}
            aria-label="Activity level"
            onChange={(e) => {
              const v = e.target.value as ActivityId;
              track("macro_calculator_activity_change", { activity: v });
              update({ activity: v });
            }}
          >
            {ACTIVITIES.filter((a) => a.id !== "bmr").map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}: {a.helper}
              </option>
            ))}
          </select>
        </div>

        <div className="tool-form-group tool-calc-form-span-2">
          <label htmlFor="macro-goal" className="tool-form-label">
            Your goal
          </label>
          <select
            id="macro-goal"
            className="tool-input"
            value={state.goal}
            aria-label="Weight goal"
            onChange={(e) => {
              const v = e.target.value as GoalId;
              track("macro_calculator_goal_change", { goal: v });
              update({ goal: v });
            }}
          >
            {GOALS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}: {g.helper}
              </option>
            ))}
          </select>
        </div>

        {(activity || goal) && (
          <div className="tool-form-group tool-calc-form-span-2">
            <p className="tool-calc-table-helper" style={{ margin: 0 }}>
              {activity && (
                <span>
                  <strong>{activity.label}</strong> × BMR multiplier{" "}
                  {activity.multiplier}
                </span>
              )}
              {activity && goal && goal.calorieDelta !== 0 && (
                <span aria-hidden="true"> · </span>
              )}
              {goal && goal.calorieDelta !== 0 && (
                <span>
                  <strong>
                    {goal.calorieDelta > 0 ? "+" : ""}
                    {goal.calorieDelta} kcal/day
                  </strong>{" "}
                  for {goal.label.toLowerCase()}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultPanel({
  result,
  selectedSplit,
  onSelectSplit,
  onRestart,
}: {
  result: MacroResult;
  selectedSplit: SplitId;
  onSelectSplit: (id: SplitId) => void;
  onRestart: () => void;
}) {
  const split = result.splits.find((s) => s.id === selectedSplit) ?? result.splits[0];

  return (
    <div className="tool-calc-result-stack">
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Your daily target</span>
        <div className="tool-calc-value-row">
          <span className="tool-calc-value">{fmtInt(result.targetCalories)}</span>
          <span className="tool-calc-value-unit">kcal / day</span>
        </div>
        <p className="tool-calc-result-desc">
          Calories per day to reach your weight goal at your selected activity level.
          About {fmtInt(result.targetCalories * 4.184)} kJ.
        </p>
        <div className="tool-calc-meta-row">
          <span>Basal metabolic rate (BMR)</span>
          <strong>{fmtInt(result.bmr)} kcal</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Daily expenditure (TDEE)</span>
          <strong>{fmtInt(result.tdee)} kcal</strong>
        </div>
        {result.goalDelta !== 0 && (
          <div className="tool-calc-meta-row">
            <span>Goal adjustment</span>
            <strong>
              {result.goalDelta > 0 ? "+" : ""}
              {fmtInt(result.goalDelta)} kcal
            </strong>
          </div>
        )}
        {result.belowFloor && (
          <p className="tool-calc-result-desc" style={{ color: "var(--text-warning, var(--text-secondary))" }}>
            Note: your goal would push calories below 1,200 kcal. We&apos;ve floored the
            target at a safer baseline. Consider a slower deficit.
          </p>
        )}
      </div>

      <div className="flex justify-center items-center gap-4">
        <Link
          href="/chat?msg=I%20just%20used%20the%20Macro%20Calculator%20and%20want%20to%20discuss%20my%20numbers."
          className="tool-btn tool-btn--primary"
          onClick={() => trackToolEvent(TOOL_ID, "cta_clicked", { target: "chat" })}
        >
          Talk to august
        </Link>
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
          Start over
        </button>
      </div>

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label">Macro splits</span>
        <p className="tool-calc-table-caption">
          Tap a split to view its daily protein, carbs, and fat targets.
        </p>
        <select
          id="macro-split-select"
          aria-label="Macro split"
          className="tool-input macro-split-select"
          value={selectedSplit}
          onChange={(e) => {
            const v = e.target.value as SplitId;
            track("macro_calculator_split_change", { split: v });
            onSelectSplit(v);
          }}
          style={{ marginBottom: 8 }}
        >
          {result.splits.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="tool-calc-table-caption" style={{ marginBottom: 4 }}>{split.blurb}</p>
        <div className="tool-calc-table" role="table">
          <div role="row" className="tool-calc-table-row">
            <div className="tool-calc-table-cell-label">
              <span className="tool-calc-table-label">Protein</span>
              <span className="tool-calc-table-helper">
                {Math.round(split.proteinPct * 100)}% of calories · 4 kcal/g
              </span>
            </div>
            <div className="tool-calc-table-cell-value">
              <strong>{fmtInt(split.protein)}</strong>
              <span className="tool-calc-table-unit">g / day</span>
            </div>
          </div>
          <div role="row" className="tool-calc-table-row">
            <div className="tool-calc-table-cell-label">
              <span className="tool-calc-table-label">Carbs</span>
              <span className="tool-calc-table-helper">
                {Math.round(split.carbPct * 100)}% of calories · 4 kcal/g
              </span>
            </div>
            <div className="tool-calc-table-cell-value">
              <strong>{fmtInt(split.carbs)}</strong>
              <span className="tool-calc-table-unit">g / day</span>
            </div>
          </div>
          <div role="row" className="tool-calc-table-row">
            <div className="tool-calc-table-cell-label">
              <span className="tool-calc-table-label">Fat</span>
              <span className="tool-calc-table-helper">
                {Math.round(split.fatPct * 100)}% of calories · 9 kcal/g
              </span>
            </div>
            <div className="tool-calc-table-cell-value">
              <strong>{fmtInt(split.fat)}</strong>
              <span className="tool-calc-table-unit">g / day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  afterContent?: ReactNode;
}

export default function MacroCalculator({ afterContent }: Props) {
  const [state, setState] = useState<MacroFormState>(DEFAULT_STATE);
  const [selectedSplit, setSelectedSplit] = useState<SplitId>("balanced");
  const { step, next, back, reset } = useStepForm({ totalSteps: TOTAL_STEPS });
  const { markStarted, markCompleted } = useCalculatorAnalytics(TOOL_ID);

  const formReady = useMemo(() => {
    const h = resolveHeightCm(state);
    const w = resolveWeightKg(state);
    const ageNum = parseNumOrNull(state.ageRaw);
    if (h == null || h < HEIGHT_CM_MIN || h > HEIGHT_CM_MAX) return null;
    if (w == null || w < WEIGHT_KG_MIN || w > WEIGHT_KG_MAX) return null;
    if (ageNum == null || ageNum < AGE_MIN || ageNum > AGE_MAX) return null;
    let bodyFat: number | null = null;
    if (state.formula === "katch") {
      bodyFat = parseNumOrNull(state.bodyFatRaw);
      if (bodyFat == null || bodyFat < BODY_FAT_MIN || bodyFat > BODY_FAT_MAX) return null;
    }
    return { heightCm: h, weightKg: w, age: ageNum, bodyFat };
  }, [state]);

  const result = useMemo<MacroResult | null>(() => {
    if (!formReady) return null;
    return computeMacros({
      sex: state.sex,
      age: formReady.age,
      heightCm: formReady.heightCm,
      weightKg: formReady.weightKg,
      formula: state.formula,
      bodyFatPct: formReady.bodyFat,
      activity: state.activity,
      goal: state.goal,
    });
  }, [formReady, state.sex, state.formula, state.activity, state.goal]);

  useEffect(() => {
    trackToolEvent(TOOL_ID, "section_completed", { step });
  }, [step]);

  // Re-mount on bfcache restore so AnimatePresence doesn't stick on stale exit state.
  
  const [mountToken, setMountToken] = useState(0);
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setMountToken((n) => n + 1);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const update = useCallback(
    (patch: Partial<MacroFormState>) => {
      setState((prev) => ({ ...prev, ...patch }));
      markStarted();
    },
    [markStarted],
  );

  const handleRestart = useCallback(() => {
    reset();
    setState(DEFAULT_STATE);
    setSelectedSplit("balanced");
  }, [reset]);

  const canAdvance = useMemo(() => {
    if (step === 0) return formReady != null;
    if (step === 1) return state.activity != null && state.goal != null;
    return false;
  }, [step, formReady, state.activity, state.goal]);

  const isResultsStep = step === TOTAL_STEPS - 1;
  const isLastFormStep = step === TOTAL_STEPS - 2;

  useEffect(() => {
    if (!isResultsStep || !result) return;
    const sig = `${Math.round(result.targetCalories / 50)}|${state.activity}|${state.goal}|${state.formula}`;
    markCompleted(sig, {
      target_kcal_bucket: Math.round(result.targetCalories / 50) * 50,
      activity: state.activity,
      goal: state.goal,
      formula: state.formula,
      unit_system: state.unitSystem,
    });
  }, [isResultsStep, result, state.activity, state.goal, state.formula, state.unitSystem, markCompleted]);

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Macro</span> Calculator
          </>
        ),
        tagline:
          "Get a daily calorie target plus protein, carb, and fat gram targets tuned to your goal. Backed by Mifflin-St Jeor and AMDR guidelines.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card macro-calc-card" key={mountToken}>
              <AnimatedStepPanel stepKey={step}>
                {step === 0 && <DetailsStep state={state} update={update} />}
                {step === 1 && <LifestyleStep state={state} update={update} />}
                {isResultsStep && result && (
                  <ResultPanel
                    result={result}
                    selectedSplit={selectedSplit}
                    onSelectSplit={setSelectedSplit}
                    onRestart={handleRestart}
                  />
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
            <p className="tl-disclaimer">
              Macro and calorie estimates are educational and based on population averages.
              For athletes, pregnant or breastfeeding people, or anyone managing a medical
              condition, please consult a registered dietitian or doctor.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
