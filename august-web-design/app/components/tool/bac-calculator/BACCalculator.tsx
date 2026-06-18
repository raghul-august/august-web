"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
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
  fmtDecimal,
  fmtInt,
  lbsToKg,
  kgToLbs,
  parseNumOrNull,
} from "@/app/utils/tools/health-math";
import {
  BAC_LEVELS,
  DRINKS_MAX,
  DRINK_PRESETS,
  DRINK_PRESETS_BY_ID,
  HOURS_MAX,
  HOURS_MIN,
  LEGAL_LIMIT,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
  bacBucket,
  computeBAC,
  fmtBac,
  fmtHours,
  type BACFormState,
  type BACResult,
  type BACResultOk,
  type DrinkEntry,
  type Sex,
  type UnitSystem,
} from "@/app/utils/tools/bac-compute";
import { ToolAuthGate } from "@/components/auth";

const TOTAL_STEPS = 3; // details + drinks + results

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const DEFAULT_STATE: BACFormState = {
  unitSystem: "imperial",
  sex: "male",
  weightKgRaw: "",
  weightLbRaw: "",
  hoursRaw: "1",
  drinks: [],
};

function makeDrinkId(): string {
  return `drink-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

function makeDrink(presetId: string): DrinkEntry {
  const preset = DRINK_PRESETS_BY_ID[presetId] ?? DRINK_PRESETS[0];
  return {
    id: makeDrinkId(),
    presetId,
    volumeOz: String(preset.volumeOz),
    abv: String(preset.abv),
    count: "1",
  };
}

interface StepProps {
  state: BACFormState;
  update: (patch: Partial<BACFormState>) => void;
}

function DetailsStep({ state, update }: StepProps) {
  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      track("bac_calculator_unit_change", { from: state.unitSystem, to: next });

      const converted = convertUnits(state, next);
      update({ unitSystem: next, ...converted });
    },
    [state, update],
  );

  const isMetric = state.unitSystem === "metric";
  const weightKg = isMetric ? parseNumOrNull(state.weightKgRaw) : (parseNumOrNull(state.weightLbRaw) != null ? lbsToKg(parseNumOrNull(state.weightLbRaw)!) : null);
  const hours = parseNumOrNull(state.hoursRaw);

  const weightError = weightKg != null && (weightKg < WEIGHT_KG_MIN || weightKg > WEIGHT_KG_MAX)
    ? "Please check the weight entered."
    : null;
  const hoursError = hours != null && (hours < HOURS_MIN || hours > HOURS_MAX)
    ? `Enter hours between ${HOURS_MIN} and ${HOURS_MAX}.`
    : null;

  return (
    <div className="tool-step-body">
      <div className="tool-step-header">
        <h2 className="tool-step-title">Your details</h2>
        <p className="tool-step-subtitle">We use sex and body weight to estimate alcohol distribution.</p>
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

        {isMetric ? (
          <div className="tool-form-group">
            <label htmlFor="bac-weight-kg" className="tool-form-label">Weight (kg)</label>
            <input
              id="bac-weight-kg"
              type="text"
              inputMode="decimal"
              className="tool-input"
              placeholder="e.g. 70"
              value={state.weightKgRaw}
              aria-invalid={weightError != null}
              onChange={(e) => update({ weightKgRaw: e.target.value })}
            />
          </div>
        ) : (
          <div className="tool-form-group">
            <label htmlFor="bac-weight-lb" className="tool-form-label">Weight (lb)</label>
            <input
              id="bac-weight-lb"
              type="text"
              inputMode="decimal"
              className="tool-input"
              placeholder="e.g. 160"
              value={state.weightLbRaw}
              aria-invalid={weightError != null}
              onChange={(e) => update({ weightLbRaw: e.target.value })}
            />
          </div>
        )}

        <div className="tool-form-group">
          <label htmlFor="bac-hours" className="tool-form-label">Hours since first drink</label>
          <input
            id="bac-hours"
            type="text"
            inputMode="decimal"
            className="tool-input"
            placeholder="e.g. 2"
            value={state.hoursRaw}
            aria-invalid={hoursError != null}
            onChange={(e) => update({ hoursRaw: e.target.value })}
          />
        </div>
      </div>

      {(weightError || hoursError) && (
        <div className="tool-error-stack">
          {weightError && <p className="tool-error">{weightError}</p>}
          {hoursError && <p className="tool-error">{hoursError}</p>}
        </div>
      )}
    </div>
  );
}

function DrinksStep({ state, update }: StepProps) {
  const addDrink = useCallback(
    (presetId: string) => {
      const next = [...state.drinks, makeDrink(presetId)];
      track("bac_calculator_drink_added", { preset: presetId, count: next.length });
      update({ drinks: next });
    },
    [state.drinks, update],
  );

  const removeDrink = useCallback(
    (id: string) => {
      update({ drinks: state.drinks.filter((d) => d.id !== id) });
    },
    [state.drinks, update],
  );

  const patchDrink = useCallback(
    (id: string, patch: Partial<DrinkEntry>) => {
      update({
        drinks: state.drinks.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      });
    },
    [state.drinks, update],
  );

  return (
    <div className="tool-step-body">
      <div className="tool-step-header">
        <h2 className="tool-step-title">What did you drink?</h2>
        <p className="tool-step-subtitle">Pick a preset to add a drink, then adjust volume, ABV, and count.</p>
      </div>

      <div className="bac-add-drink">
        <span className="bac-add-drink-label">Add a drink</span>
        <div className="bac-preset-grid">
          {DRINK_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="bac-preset-chip"
              onClick={() => addDrink(p.id)}
              aria-label={`Add ${p.label}`}
            >
              <span className="bac-preset-label">{p.label}</span>
              <span className="bac-preset-helper">{p.helper}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bac-drinks-list">
        {state.drinks.length === 0 ? (
          <div className="bac-drinks-empty">No drinks yet. Tap a preset above to add one.</div>
        ) : (
          state.drinks.map((d) => {
            const preset = DRINK_PRESETS_BY_ID[d.presetId];
            return (
              <div key={d.id} className="bac-drink-row">
                <div className="bac-drink-header">
                  <div className="bac-drink-label">
                    <span className="bac-drink-title">{preset?.label ?? "Custom drink"}</span>
                    <span className="bac-drink-helper">Volume, ABV %, and how many</span>
                  </div>
                  <button
                    type="button"
                    className="bac-drink-remove"
                    onClick={() => removeDrink(d.id)}
                    aria-label="Remove drink"
                  >
                    <XIcon size={14} weight="bold" aria-hidden />
                  </button>
                </div>

                <div className="bac-drink-fields">
                  <div className="tool-form-group">
                    <label className="tool-form-label">Volume (oz)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="tool-input"
                      value={d.volumeOz}
                      onChange={(e) => patchDrink(d.id, { volumeOz: e.target.value })}
                    />
                  </div>
                  <div className="tool-form-group">
                    <label className="tool-form-label">ABV %</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="tool-input"
                      value={d.abv}
                      onChange={(e) => patchDrink(d.id, { abv: e.target.value })}
                    />
                  </div>
                  <div className="tool-form-group">
                    <label className="tool-form-label">Count</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="tool-input"
                      value={d.count}
                      onChange={(e) => patchDrink(d.id, { count: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function BACResultPanel({ result, onRestart }: { result: BACResultOk; onRestart: () => void }) {
  const overLimit = result.bac > LEGAL_LIMIT;

  return (
    <div className="tool-result-stack bac-result-stack">
      <div className="tool-result-primary">
        <span className={`bac-level-tag bac-level-tag--${result.level.tone}`}>
          {result.level.label}
        </span>
        <span className="bac-section-label">Estimated BAC</span>
        <div className="tool-value-row">
          <span className="tool-value">{fmtBac(result.bac)}%</span>
        </div>
        <p className="tool-result-desc">{result.level.description}</p>

        <div className="bac-meta-row">
          <span>Standard drinks consumed</span>
          <strong>{fmtDecimal(result.totalStandardDrinks, 1)}</strong>
        </div>
        <div className="bac-meta-row">
          <span>Total pure alcohol</span>
          <strong>{fmtInt(result.totalAlcoholGrams)} g</strong>
        </div>
        {overLimit && (
          <div className="bac-meta-row">
            <span>Time to reach 0.08% legal limit</span>
            <strong>{fmtHours(result.hoursToLegalLimit)}</strong>
          </div>
        )}
        <div className="bac-meta-row">
          <span>Time to reach 0.00%</span>
          <strong>{fmtHours(result.hoursToSober)}</strong>
        </div>
      </div>

      <ToolResultActions
        toolId="bac-calculator"
        chatMessage="I just used the BAC calculator and want to discuss my results"
        onRestart={onRestart}
      />

      <div className="tool-table-card">
        <span className="bac-section-label">BAC impairment scale</span>
        <p className="tool-table-caption">
          Educational reference. Reactions vary widely with food, sleep, medication, and tolerance.
        </p>
        <div className="tool-table" role="table">
          {BAC_LEVELS.map((lvl) => {
            const isActive = lvl.id === result.level.id;
            return (
              <div
                key={lvl.id}
                role="row"
                className={`tool-table-row${isActive ? " tool-table-row--active" : ""}`}
              >
                <div className="tool-table-cell-label">
                  <span className="tool-table-label">{lvl.label}</span>
                  <span className="tool-table-helper">{lvl.description}</span>
                </div>
                <div className="tool-table-cell-value">
                  <strong>{lvl.range}</strong>
                  <span className="tool-table-unit">%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tool-table-card">
        <span className="bac-section-label">Drinks counted</span>
        <div className="tool-table bac-table--separated" role="table">
          {result.drinks.map((d) => (
            <div key={d.id} role="row" className="tool-table-row">
              <div className="tool-table-cell-label">
                <span className="tool-table-label">{d.label}</span>
                <span className="tool-table-helper">
                  {d.count} × {fmtDecimal(d.volumeOz, 1)} oz · {fmtDecimal(d.abv, 1)}% ABV
                </span>
              </div>
              <div className="tool-table-cell-value">
                <strong>{fmtDecimal(d.standardDrinks, 1)}</strong>
                <span className="tool-table-unit">std drinks</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props {
  afterContent?: React.ReactNode;
}

export default function BACCalculator({ afterContent }: Props) {
  const [state, setState] = useState<BACFormState>(DEFAULT_STATE);
  const { step, next, back, reset } = useStepForm({ totalSteps: TOTAL_STEPS });
  const { markStarted, markCompleted } = useCalculatorAnalytics("bac-calculator");

  const result = useMemo<BACResult>(() => computeBAC(state), [state]);

  useEffect(() => {
    trackToolEvent("bac-calculator", "section_completed", { step });
  }, [step]);

  const update = useCallback((patch: Partial<BACFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    markStarted();
  }, [markStarted]);

  const handleRestart = useCallback(() => {
    reset();
    setState(DEFAULT_STATE);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [reset]);

  const handleNext = useCallback(() => {
    next();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [next]);

  const canAdvance = useMemo(() => {
    if (step === 0) {
      const weightKg = state.unitSystem === "metric"
        ? parseNumOrNull(state.weightKgRaw)
        : (() => {
            const lb = parseNumOrNull(state.weightLbRaw);
            return lb == null ? null : lbsToKg(lb);
          })();
      const hours = parseNumOrNull(state.hoursRaw);
      const weightOk = weightKg != null && weightKg >= WEIGHT_KG_MIN && weightKg <= WEIGHT_KG_MAX;
      const hoursOk = hours != null && hours >= HOURS_MIN && hours <= HOURS_MAX;
      return weightOk && hoursOk;
    }
    if (step === 1) {
      return state.drinks.length > 0 && result.kind === "ok";
    }
    return false;
  }, [step, state, result]);

  useEffect(() => {
    if (step !== TOTAL_STEPS - 1) return;
    if (result.kind !== "ok") return;
    const sig = `${bacBucket(result.bac)}|${result.drinks.length}|${result.inputs.hours}`;
    markCompleted(sig, {
      bac_bucket: bacBucket(result.bac),
      bac: Number(result.bac.toFixed(3)),
      drinks_count: result.drinks.length,
      hours: result.inputs.hours,
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
            <span className="accent-gradient">BAC</span> Calculator
          </>
        ),
        tagline:
          "Estimate your Blood Alcohol Content from drinks consumed, body weight, sex, and time elapsed. Educational only never a substitute for sober judgment.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-wizard-card">
              <AnimatedStepPanel stepKey={step}>
                {step === 0 && <DetailsStep state={state} update={update} />}
                {step === 1 && <DrinksStep state={state} update={update} />}
                {isResultsStep && result.kind === "ok" && (
                  <BACResultPanel result={result} onRestart={handleRestart} />
                )}
              </AnimatedStepPanel>

              {!isResultsStep && (
                <WizardNavigation
                  step={step}
                  totalSteps={TOTAL_STEPS}
                  canAdvance={canAdvance}
                  onNext={handleNext}
                  onBack={back}
                  isLastFormStep={isLastFormStep}
                />
              )}
            </div>
            <ToolAuthGate active={isResultsStep && result.kind === "ok"} />
            <p className="tool-calc-disclaimer">
              This BAC estimate is for education only. Real BAC depends on many factors not captured here, and the only safe BAC for driving is 0.00.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
