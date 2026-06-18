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
  fmtDecimal,
  kgToLbs,
  parseNumOrNull,
} from "@/app/utils/tools/health-math";
import {
  AGE_MAX,
  AGE_MIN,
  BMI_CATEGORY_LABEL,
  DEFAULT_FORM_STATE,
  DIAGNOSIS_OPTIONS,
  DONT_KNOW_LABEL,
  HEIGHT_IN_MAX,
  HEIGHT_IN_MIN,
  UNEXPLAINED_OPTION,
  WEIGHT_LB_MAX,
  WEIGHT_LB_MIN,
  computeIVFResult,
  successBucket,
  type DiagnosisFlags,
  type DiagnosisKey,
  type EggSource,
  type IVFFormState,
  type IVFResult,
  type Parity,
  type PriorIVF,
  type ResultOk,
  type UnitSystem,
  type YesNo,
} from "@/app/utils/tools/ivf-success-estimator-compute";
import { ToolAuthGate } from "@/components/auth";

const TOTAL_STEPS = 3; // details + diagnosis & plan + results

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const PRIOR_IVF_OPTIONS: { value: PriorIVF; label: string }[] = [
  { value: "0", label: "Never" },
  { value: "1", label: "1" },
  { value: "2", label: "2+" },
];

const PARITY_OPTIONS: { value: Parity; label: string }[] = [
  { value: "0", label: "None" },
  { value: "1", label: "1" },
  { value: "2+", label: "2+" },
];

const EGG_SOURCE_OPTIONS: { value: EggSource; label: string }[] = [
  { value: "Own", label: "My own eggs" },
  { value: "Donor", label: "Donor eggs" },
];

function resolveWeightLb(state: IVFFormState): number | null {
  if (state.unitSystem === "metric") {
    const kg = parseNumOrNull(state.weightKgRaw);
    return kg == null ? null : kgToLbs(kg);
  }
  return parseNumOrNull(state.weightLbRaw);
}

function resolveHeightIn(state: IVFFormState): number | null {
  if (state.unitSystem === "metric") {
    const cm = parseNumOrNull(state.heightCmRaw);
    return cm == null ? null : cm / 2.54;
  }
  const ft = parseNumOrNull(state.heightFeetRaw);
  if (ft == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return ft * 12 + inches;
}

interface StepProps {
  state: IVFFormState;
  update: (patch: Partial<IVFFormState>) => void;
}

function DetailsStep({ state, update }: StepProps) {
  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      track("ivf_calculator_unit_change", { from: state.unitSystem, to: next });

      const converted = convertUnits(state, next);
      update({ unitSystem: next, ...converted });
    },
    [state, update],
  );

  const isMetric = state.unitSystem === "metric";
  const ageNum = parseNumOrNull(state.ageRaw);
  const weightLb = resolveWeightLb(state);
  const heightIn = resolveHeightIn(state);

  const ageError =
    ageNum != null && (ageNum < AGE_MIN || ageNum > AGE_MAX)
      ? `Please enter an age between ${AGE_MIN} and ${AGE_MAX} years.`
      : null;
  const weightError =
    weightLb != null && (weightLb < WEIGHT_LB_MIN || weightLb > WEIGHT_LB_MAX)
      ? `Please enter a weight between ${WEIGHT_LB_MIN} and ${WEIGHT_LB_MAX} lbs (${Math.round(WEIGHT_LB_MIN / 2.20462)}–${Math.round(WEIGHT_LB_MAX / 2.20462)} kg).`
      : null;
  const heightError =
    heightIn != null && (heightIn < HEIGHT_IN_MIN || heightIn > HEIGHT_IN_MAX)
      ? "Please enter a height between 4'6\" and 6'0\" (137–183 cm)."
      : null;

  return (
    <div className="tool-step-body">
      <div className="tool-step-header">
        <h2 className="tool-step-title">About you</h2>
        <p className="tool-step-subtitle">
          Age, BMI, and pregnancy history all feed into the CDC estimator.
        </p>
      </div>

      <div className="ivf-form-sections">
        <div className="ivf-body-row">
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

          {isMetric ? (
            <>
              <div className="tool-form-group">
                <label htmlFor="ivf-height-cm" className="tool-form-label">Height (cm)</label>
                <input
                  id="ivf-height-cm"
                  type="text"
                  inputMode="decimal"
                  className="tool-input"
                  placeholder="e.g. 165"
                  value={state.heightCmRaw}
                  aria-invalid={heightError != null}
                  onChange={(e) => update({ heightCmRaw: e.target.value })}
                />
              </div>
              <div className="tool-form-group">
                <label htmlFor="ivf-weight-kg" className="tool-form-label">Weight (kg)</label>
                <input
                  id="ivf-weight-kg"
                  type="text"
                  inputMode="decimal"
                  className="tool-input"
                  placeholder="e.g. 65"
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
                      placeholder="6"
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
                <label htmlFor="ivf-weight-lb" className="tool-form-label">Weight (lb)</label>
                <input
                  id="ivf-weight-lb"
                  type="text"
                  inputMode="decimal"
                  className="tool-input"
                  placeholder="e.g. 145"
                  value={state.weightLbRaw}
                  aria-invalid={weightError != null}
                  onChange={(e) => update({ weightLbRaw: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="tool-form-group">
            <label htmlFor="ivf-age" className="tool-form-label">Age</label>
            <input
              id="ivf-age"
              type="text"
              inputMode="numeric"
              className="tool-input"
              placeholder="e.g. 32"
              value={state.ageRaw}
              aria-invalid={ageError != null}
              onChange={(e) => update({ ageRaw: e.target.value })}
            />
          </div>
        </div>

        <div className="ivf-history-row">
          <div className="tool-form-group">
            <label className="tool-form-label">Prior pregnancies</label>
            <SegmentedControl
              options={PARITY_OPTIONS}
              value={state.gravida}
              onChange={(v) => {
                const next = v as Parity;
                const patch: Partial<IVFFormState> = { gravida: next };
                if (next === "0") patch.previousLiveBirths = "0";
                else if (next === "1" && state.previousLiveBirths === "2+") {
                  patch.previousLiveBirths = "1";
                }
                update(patch);
              }}
              ariaLabel="Prior pregnancies"
              className="tool-chip-group tool-chip-group--connected"
              buttonClassName="tool-chip"
              activeClassName="tool-chip--active"
            />
          </div>

          <div className="tool-form-group">
            <label className="tool-form-label">Prior live births</label>
            <SegmentedControl
              options={PARITY_OPTIONS.map((o) => ({
                ...o,
                disabled:
                  state.gravida === "0"
                    ? o.value !== "0"
                    : state.gravida === "1"
                      ? o.value === "2+"
                      : false,
              }))}
              value={state.previousLiveBirths}
              onChange={(v) => update({ previousLiveBirths: v as Parity })}
              ariaLabel="Prior live births"
              className="tool-chip-group tool-chip-group--connected"
              buttonClassName="tool-chip"
              activeClassName="tool-chip--active"
            />
          </div>

          <div className="tool-form-group">
            <label className="tool-form-label">Prior IVF cycles</label>
            <SegmentedControl
              options={PRIOR_IVF_OPTIONS}
              value={state.priorIVF}
              onChange={(v) => update({ priorIVF: v as PriorIVF })}
              ariaLabel="Number of prior IVF cycles"
              className="tool-chip-group tool-chip-group--connected"
              buttonClassName="tool-chip"
              activeClassName="tool-chip--active"
            />
          </div>
        </div>
      </div>

      {(ageError || weightError || heightError) && (
        <div className="tool-error-stack">
          {ageError && <p className="tool-error">{ageError}</p>}
          {weightError && <p className="tool-error">{weightError}</p>}
          {heightError && <p className="tool-error">{heightError}</p>}
        </div>
      )}
    </div>
  );
}

function DiagnosisStep({ state, update }: StepProps) {
  const toggleDiagnosis = useCallback(
    (key: DiagnosisKey, next: YesNo) => {
      const patch: Partial<IVFFormState> = {};
      const nextFlags: DiagnosisFlags = { ...state.diagnoses };
      if (next === "Yes") {
        // Choosing any specific reason clears the mutually-exclusive states.
        nextFlags.unexplained = "No";
        patch.donotknow = "No";
      }
      nextFlags[key] = next;
      patch.diagnoses = nextFlags;
      update(patch);
    },
    [state.diagnoses, update],
  );

  const toggleUnexplained = useCallback(() => {
    const willTurnOn = state.diagnoses.unexplained !== "Yes";
    const nextFlags: DiagnosisFlags = {
      tubal: "No",
      male_factor: "No",
      endometriosis: "No",
      pco: "No",
      diminished_ovarian_reserve: "No",
      uterine: "No",
      other: "No",
      unexplained: willTurnOn ? "Yes" : "No",
    };
    update({ diagnoses: nextFlags, donotknow: "No" });
  }, [state.diagnoses, update]);

  const toggleDontKnow = useCallback(() => {
    const willTurnOn = state.donotknow !== "Yes";
    const nextFlags: DiagnosisFlags = {
      tubal: "No",
      male_factor: "No",
      endometriosis: "No",
      pco: "No",
      diminished_ovarian_reserve: "No",
      uterine: "No",
      other: "No",
      unexplained: "No",
    };
    update({ diagnoses: nextFlags, donotknow: willTurnOn ? "Yes" : "No" });
  }, [state.donotknow, update]);

  const anyDiagnosis =
    state.donotknow === "Yes" ||
    state.diagnoses.unexplained === "Yes" ||
    DIAGNOSIS_OPTIONS.some((d) => state.diagnoses[d.key] === "Yes");

  return (
    <div className="tool-step-body">
      <div className="tool-step-header">
        <h2 className="tool-step-title">Diagnosis &amp; plan</h2>
        <p className="tool-step-subtitle">
          Reason for using IVF, plus whether you plan to use your own or donor eggs.
        </p>
      </div>

      <div className="tool-form-group">
        <label className="tool-form-label">
          Reason for using IVF
          <span className="ivf-form-hint"> (select all that apply)</span>
        </label>
        <div className="ivf-checkbox-stack">
          {DIAGNOSIS_OPTIONS.map((opt) => {
            const checked = state.diagnoses[opt.key] === "Yes";
            return (
              <label key={opt.key} className="ivf-checkbox-row">
                <input
                  type="checkbox"
                  className="ivf-checkbox"
                  checked={checked}
                  onChange={(e) => toggleDiagnosis(opt.key, e.target.checked ? "Yes" : "No")}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}

          <div className="ivf-checkbox-divider">Or</div>

          <label className="ivf-checkbox-row">
            <input
              type="checkbox"
              className="ivf-checkbox"
              checked={state.diagnoses.unexplained === "Yes"}
              onChange={toggleUnexplained}
            />
            <span>{UNEXPLAINED_OPTION.label}</span>
          </label>

          <label className="ivf-checkbox-row">
            <input
              type="checkbox"
              className="ivf-checkbox"
              checked={state.donotknow === "Yes"}
              onChange={toggleDontKnow}
            />
            <span>{DONT_KNOW_LABEL}</span>
          </label>
        </div>
        {!anyDiagnosis && (
          <p className="ivf-helper-text">Pick at least one option to continue.</p>
        )}
      </div>

      <div className="tool-form-group">
        <label className="tool-form-label">Egg source</label>
        <SegmentedControl
          options={EGG_SOURCE_OPTIONS}
          value={state.eggSource}
          onChange={(v) => update({ eggSource: v as EggSource })}
          ariaLabel="Egg source"
          className="tool-chip-group tool-chip-group--connected"
          buttonClassName="tool-chip"
          activeClassName="tool-chip--active"
        />
      </div>
    </div>
  );
}

function ResultPanel({
  result,
  onRestart,
}: {
  result: ResultOk;
  onRestart: () => void;
}) {
  const primary = result.cycles[0];
  const intro =
    result.scenario === 3
      ? `Based on the information you entered, there is a ${result.cycles[0].percentText} chance of having a baby after your first embryo transfer with donor eggs. If you complete a second transfer within 12 months, the cumulative chance climbs to ${result.cycles[1].percentText}. A third transfer brings it to ${result.cycles[2].percentText}.`
      : result.scenario === 2
        ? `Based on the information you entered, there is a ${result.cycles[0].percentText} chance of having a baby after your first additional egg retrieval (and all transfers within that year). With a second additional retrieval the cumulative chance is ${result.cycles[1].percentText}, and with a third it is ${result.cycles[2].percentText}.`
        : `Based on the information you entered, there is a ${result.cycles[0].percentText} chance of having a baby after your first egg retrieval (and all transfers within that year). With a second retrieval the cumulative chance climbs to ${result.cycles[1].percentText}, and with a third it is ${result.cycles[2].percentText}.`;

  return (
    <div className="tool-result-stack">
      <div className="tool-result-primary">
        <span className="ivf-section-label">Cumulative chance of a live birth</span>
        <div className="tool-value-row ivf-value-row">
          <span className="tool-value ivf-value">{primary.percentText}</span>
          <span className="tool-value-unit">after the first {result.scenario === 3 ? "transfer" : "retrieval"}</span>
        </div>
        <p className="tool-result-desc ivf-result-desc">{intro}</p>

        <div className="ivf-meta-row">
          <span className="font-medium text-black">Calculated BMI</span>
          <strong>
            {fmtDecimal(result.bmi, 1)}{" "}
            <span className="ivf-meta-suffix">{BMI_CATEGORY_LABEL[result.bmiCategory]}</span>
          </strong>
        </div>
      </div>

      <div className="flex items-center justify-center  gap-4">
        <a
          href="/chat?msg=I just used the IVF success estimator and want to discuss my results"
          className="tool-btn tool-btn--primary"
          onClick={() => trackToolEvent("tool_cta_clicked", "cta_clicked")}
        >
          Talk to august
        </a>
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
          Start over
        </button>
      </div>

      <div className="ivf-result-primary">
        <span className="ivf-section-label">Cumulative chance by cycle</span>
        <p className="tool-table-caption">
          Each row is the combined chance of a live birth after that many{" "}
          {result.scenario === 3 ? "embryo transfers" : "egg retrievals"} (with all transfers in
          the same year).
        </p>
        <div className="tool-table" role="table">
          {result.cycles.map((c) => (
            <div key={c.cycle} role="row" className="tool-table-row ivf-table-row">
              <div className="tool-table-cell-label">
                <span className="tool-table-label">{c.label}</span>
              </div>
              <div className="tool-table-cell-value">
                <strong>{c.percentText}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.smallSampleWarning && (
        <p className="tool-calc-disclaimer">
          Note: estimates near the edges of the CDC's training data (very young, very old, or very
          high BMI) are based on smaller samples and should be interpreted with caution.
        </p>
      )}
    </div>
  );
}

interface Props {
  afterContent?: React.ReactNode;
}

export default function IVFCalculator({ afterContent }: Props) {
  const [state, setState] = useState<IVFFormState>(DEFAULT_FORM_STATE);
  const { step, next, back, reset } = useStepForm({ totalSteps: TOTAL_STEPS });
  const { markStarted, markCompleted } = useCalculatorAnalytics("ivf-success-estimator");

  const result = useMemo<IVFResult>(() => computeIVFResult(state), [state]);

  useEffect(() => {
    trackToolEvent("ivf-success-estimator", "section_completed", { step });
  }, [step]);

  const update = useCallback((patch: Partial<IVFFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    markStarted();
  }, [markStarted]);

  const handleRestart = useCallback(() => {
    reset();
    setState(DEFAULT_FORM_STATE);
  }, [reset]);

  const handleNext = useCallback(() => {
    next();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [next]);

  const canAdvance = useMemo(() => {
    if (step === 0) {
      const ageNum = parseNumOrNull(state.ageRaw);
      const weightLb = resolveWeightLb(state);
      const heightIn = resolveHeightIn(state);
      if (ageNum == null || ageNum < AGE_MIN || ageNum > AGE_MAX) return false;
      if (weightLb == null || weightLb < WEIGHT_LB_MIN || weightLb > WEIGHT_LB_MAX) return false;
      if (heightIn == null || heightIn < HEIGHT_IN_MIN || heightIn > HEIGHT_IN_MAX) return false;
      return true;
    }
    if (step === 1) {
      const anyDiagnosis =
        state.donotknow === "Yes" ||
        state.diagnoses.unexplained === "Yes" ||
        DIAGNOSIS_OPTIONS.some((d) => state.diagnoses[d.key] === "Yes");
      return anyDiagnosis;
    }
    return false;
  }, [step, state]);

  useEffect(() => {
    if (step !== TOTAL_STEPS - 1) return;
    if (result.kind !== "ok") return;
    const sig = `${result.formulaId}|${successBucket(result.cycles[0].probability)}`;
    markCompleted(sig, {
      formula: result.formulaId,
      scenario: result.scenario,
      bucket: successBucket(result.cycles[0].probability),
      cycle_1: Math.round(result.cycles[0].probability * 100),
      cycle_2: Math.round(result.cycles[1].probability * 100),
      cycle_3: Math.round(result.cycles[2].probability * 100),
    });
  }, [step, result, markCompleted]);

  const isResultsStep = step === TOTAL_STEPS - 1;
  const isLastFormStep = step === TOTAL_STEPS - 2;

  return (
    <>
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">IVF</span> Success Estimator
          </>
        ),
        tagline:
          "See your personalised chance of a live birth with IVF, using the CDC's multivariate model for U.S. fertility clinics.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-wizard-card">
              <AnimatedStepPanel stepKey={step}>
                {step === 0 && <DetailsStep state={state} update={update} />}
                {step === 1 && <DiagnosisStep state={state} update={update} />}
                {isResultsStep && result.kind === "ok" && (
                  <ResultPanel result={result} onRestart={handleRestart} />
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
            <p className="tool-calc-disclaimer">
              For educational purposes only — discuss results with your fertility specialist.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
    <ToolAuthGate active={isResultsStep && result.kind === "ok"} />
    </>
  );
}
