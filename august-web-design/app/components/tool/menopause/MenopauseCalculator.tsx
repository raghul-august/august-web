"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { useStepForm } from "@/app/components/tool/shared/hooks/useStepForm";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { track, trackToolEvent } from "@/app/utils/analytics";
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
  AGE_MAX,
  AGE_MIN,
  CONDITION_LABELS,
  computeMenopause,
  fmtYears,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  menopauseAgeBucket,
  MOTHER_AGE_MAX,
  MOTHER_AGE_MIN,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
  type AlcoholUse,
  type CycleStatus,
  type Ethnicity,
  type MenopauseCondition,
  type MenopauseFormState,
  type MenopauseResult,
  type MenopauseResultOk,
  type SmokingStatus,
  type UnitSystem,
} from "@/app/utils/tools/menopause-compute";

const TOTAL_STEPS = 3;

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const ETHNICITY_OPTIONS = [
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "hispanic", label: "Hispanic" },
  { value: "asian", label: "Asian" },
  { value: "other", label: "Other" },
];

const CYCLE_OPTIONS = [
  { value: "regular", label: "Regular" },
  { value: "irregular", label: "Irregular" },
  { value: "stopped", label: "Stopped" },
];

const SMOKING_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "former", label: "Former" },
  { value: "current", label: "Current" },
];

const ALCOHOL_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "occasional", label: "Occasional" },
  { value: "regular", label: "Regular" },
];

const CONDITION_OPTIONS: { value: MenopauseCondition; label: string; helper: string }[] = [
  { value: "pcos", label: CONDITION_LABELS.pcos, helper: "Polycystic ovary syndrome" },
  { value: "autoimmune", label: CONDITION_LABELS.autoimmune, helper: "e.g. lupus, thyroid, RA" },
  { value: "cancer-treatment", label: CONDITION_LABELS["cancer-treatment"], helper: "Chemo or pelvic radiation" },
  { value: "hysterectomy", label: CONDITION_LABELS.hysterectomy, helper: "Uterus removed, ovaries kept" },
  { value: "both-ovaries-removed", label: CONDITION_LABELS["both-ovaries-removed"], helper: "Bilateral oophorectomy" },
];

const DEFAULT_STATE: MenopauseFormState = {
  unitSystem: "imperial",
  ageRaw: "",
  motherAgeRaw: "",
  ethnicity: "white",
  heightCmRaw: "",
  heightFeetRaw: "",
  heightInchesRaw: "",
  weightKgRaw: "",
  weightLbRaw: "",
  cycleStatus: "regular",
  smoking: "never",
  alcohol: "occasional",
  conditions: [],
};

function resolveHeightCm(state: MenopauseFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.heightCmRaw);
  const feet = parseNumOrNull(state.heightFeetRaw);
  if (feet == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return feetInchesToCm(feet, inches);
}

function resolveWeightKg(state: MenopauseFormState): number | null {
  if (state.unitSystem === "metric") return parseNumOrNull(state.weightKgRaw);
  const lb = parseNumOrNull(state.weightLbRaw);
  return lb == null ? null : lbsToKg(lb);
}

interface StepProps {
  state: MenopauseFormState;
  update: (patch: Partial<MenopauseFormState>) => void;
  toggleCondition: (c: MenopauseCondition) => void;
}

function ProfileStep({ state, update }: StepProps) {
  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      track("menopause_calculator_unit_change", { from: state.unitSystem, to: next });

      const patch: Partial<MenopauseFormState> = { unitSystem: next };
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
  const motherAgeNum = parseNumOrNull(state.motherAgeRaw);

  const ageError =
    ageNum != null && (ageNum < AGE_MIN || ageNum > AGE_MAX)
      ? `Enter an age between ${AGE_MIN} and ${AGE_MAX}.`
      : null;
  const motherAgeError =
    motherAgeNum != null && (motherAgeNum < MOTHER_AGE_MIN || motherAgeNum > MOTHER_AGE_MAX)
      ? `Maternal menopause typically falls between ${MOTHER_AGE_MIN} and ${MOTHER_AGE_MAX}.`
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
        <p className="tool-step-subtitle">A few basics so we can anchor your estimate.</p>
      </div>

      <div className="tool-calc-form-grid">

        {/* Units */}
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

        

     

         <div className="tool-calc-hwa-row menopause-hwa-row tool-calc-form-span-2">
          {isMetric ? (
            <>
              <div className="tool-form-group">
                <label htmlFor="menopause-height-cm" className="tool-form-label">Height (cm)</label>
                <input
                  id="menopause-height-cm"
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
                <label htmlFor="menopause-weight-kg" className="tool-form-label">Weight (kg)</label>
                <input
                  id="menopause-weight-kg"
                  type="text"
                  inputMode="decimal"
                  className="tool-input"
                  placeholder="e.g. 65"
                  value={state.weightKgRaw}
                  aria-invalid={weightError != null}
                  onChange={(e) => update({ weightKgRaw: e.target.value })}
                />
              </div>
                 <div className="tool-form-group">
                <label htmlFor="menopause-age" className="tool-form-label">Your current age</label>
                <input
                  id="menopause-age"
                  type="text"
                  inputMode="numeric"
                  className="tool-input"
                  placeholder="e.g. 42"
                  value={state.ageRaw}
                  aria-invalid={ageError != null}
                  onChange={(e) => update({ ageRaw: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="tool-form-group">
                <label className="tool-form-label" htmlFor="menopause-height-feet">Height</label>
                <div className="tool-calc-combo-input" aria-invalid={heightError != null}>
                  <div className="tool-calc-combo-segment">
                    <input
                      id="menopause-height-feet"
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
                      placeholder="5"
                      aria-label="Inches"
                      value={state.heightInchesRaw}
                      onChange={(e) => update({ heightInchesRaw: e.target.value })}
                    />
                    <span className="tool-calc-combo-input__suffix">in</span>
                  </div>
                </div>
              </div>
              <div className="tool-form-group">
                <label htmlFor="menopause-weight-lb" className="tool-form-label">Weight (lb)</label>
                <input
                  id="menopause-weight-lb"
                  type="text"
                  inputMode="decimal"
                  className="tool-input"
                  placeholder="e.g. 140"
                  value={state.weightLbRaw}
                  aria-invalid={weightError != null}
                  onChange={(e) => update({ weightLbRaw: e.target.value })}
                />
              </div>
                <div className="tool-form-group">
                <label htmlFor="menopause-age" className="tool-form-label">Your current age</label>
                <input
                  id="menopause-age"
                  type="text"
                  inputMode="numeric"
                  className="tool-input"
                  placeholder="e.g. 42"
                  value={state.ageRaw}
                  aria-invalid={ageError != null}
                  onChange={(e) => update({ ageRaw: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        <div className="tool-form-group tool-calc-form-span-2">
          <label htmlFor="menopause-mother-age" className="tool-form-label">
            Your mother&apos;s age at menopause <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            id="menopause-mother-age"
            type="text"
            inputMode="numeric"
            className="tool-input"
            placeholder="Leave blank if unknown"
            value={state.motherAgeRaw}
            aria-invalid={motherAgeError != null}
            onChange={(e) => update({ motherAgeRaw: e.target.value })}
          />
        </div>

        <div className="tool-form-group tool-calc-form-span-2">
          <label htmlFor="menopause-ethnicity" className="tool-form-label">Background</label>
          <select
            id="menopause-ethnicity"
            className="tool-input"
            value={state.ethnicity}
            aria-label="Ethnic background"
            onChange={(e) => update({ ethnicity: e.target.value as Ethnicity })}
          >
            {ETHNICITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

       
      </div>

      {(ageError || motherAgeError || heightError || weightError) && (
        <div className="tool-calc-error-stack">
          {ageError && <p className="tool-error">{ageError}</p>}
          {motherAgeError && <p className="tool-error">{motherAgeError}</p>}
          {heightError && <p className="tool-error">{heightError}</p>}
          {weightError && <p className="tool-error">{weightError}</p>}
        </div>
      )}
    </div>
  );
}

function LifestyleStep({ state, update, toggleCondition }: StepProps) {
  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">Cycle, lifestyle &amp; health</h2>
        <p className="tool-step-subtitle">These are the personal factors that nudge the timeline.</p>
      </div>

      <div className="menopause-risk-stack">
        <div className="menopause-risk-row">
          <div className="menopause-risk-row-label">
            <span className="menopause-risk-title">Menstrual cycle status</span>
          </div>
          <SegmentedControl
            options={CYCLE_OPTIONS}
            value={state.cycleStatus}
            onChange={(v) => update({ cycleStatus: v as CycleStatus })}
            ariaLabel="Menstrual cycle status"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        <div className="menopause-risk-row">
          <div className="menopause-risk-row-label">
            <span className="menopause-risk-title">Smoking</span>
          </div>
          <SegmentedControl
            options={SMOKING_OPTIONS}
            value={state.smoking}
            onChange={(v) => {
              track("menopause_calculator_smoking_change", { smoking: v });
              update({ smoking: v as SmokingStatus });
            }}
            ariaLabel="Smoking status"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        <div className="menopause-risk-row">
          <div className="menopause-risk-row-label">
            <span className="menopause-risk-title">Alcohol</span>
          </div>
          <SegmentedControl
            options={ALCOHOL_OPTIONS}
            value={state.alcohol}
            onChange={(v) => update({ alcohol: v as AlcoholUse })}
            ariaLabel="Alcohol consumption"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>
      </div>

      <div className="tool-form-group" style={{ marginTop: 8 }}>
        <label className="tool-form-label">Health history (tap any that apply)</label>
        <div className="menopause-conditions-grid" role="group" aria-label="Health conditions">
          {CONDITION_OPTIONS.map((opt) => {
            const selected = state.conditions.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                className="menopause-condition-chip"
                aria-pressed={selected}
                onClick={() => toggleCondition(opt.value)}
              >
                <span className="menopause-condition-check" aria-hidden="true">
                  {selected && "✓"}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{opt.label}</span>
                  <span style={{ color: "var(--text-tertiary)", fontSize: "0.7rem" }}>{opt.helper}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function deltaPillTone(bandTone: MenopauseResultOk["band"]["tone"]): string {
  return `menopause-delta-pill--${bandTone}`;
}

function yearsRemainingLabel(result: MenopauseResultOk): string {
  if (result.band.id === "surgical") return "Menopause complete (surgical)";
  if (result.band.id === "already") return "Already at or past predicted age";
  if (result.yearsRemaining === 0) return "Right around now";
  return `${fmtYears(result.yearsRemaining)} from now`;
}

function factorImpactTone(impact: number): string {
  if (impact > 0.05) return "menopause-factor-impact--later";
  if (impact < -0.05) return "menopause-factor-impact--earlier";
  return "menopause-factor-impact--neutral";
}

function factorImpactLabel(impact: number): string {
  if (Math.abs(impact) < 0.05) return "neutral";
  const yrs = Math.abs(impact);
  const formatted = yrs >= 1 ? yrs.toFixed(1) : yrs.toFixed(2);
  return impact > 0 ? `+${formatted} yrs` : `−${formatted} yrs`;
}

function MenopauseResultPanel({
  result,
  onRestart,
}: {
  result: MenopauseResultOk;
  onRestart: () => void;
}) {
  return (
    <div className="tool-calc-result-stack">
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Your predicted menopause age</span>
        <div className="tool-calc-value-row">
          <span className="tool-calc-value">{fmtInt(result.predictedAgeRounded)}</span>
          <span className="tool-calc-value-unit">years</span>
        </div>
        <span className={`menopause-delta-pill ${deltaPillTone(result.band.tone)}`}>
          {yearsRemainingLabel(result)}
        </span>
        <p className="tool-calc-result-desc"><strong style={{ color: "var(--text-primary)", fontWeight: 500 }}>{result.band.label}.</strong>{" "}{result.band.description}</p>
        {result.bmi != null && (
          <div className="tool-calc-meta-row">
            <span>BMI from your height &amp; weight</span>
            <strong>{fmtDecimal(result.bmi, 1)}</strong>
          </div>
        )}
        <div className="tool-calc-meta-row">
          <span>Current age</span>
          <strong>{fmtInt(result.age)}</strong>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <a
          href={`/chat?msg=${encodeURIComponent(
            `Hi, I just used the Menopause Age calculator and got a predicted age of ${result.predictedAgeRounded}. I'd like to talk about what this means and what good next steps look like.`,
          )}`}
          className="tool-btn tool-btn--primary"
          onClick={() => {
            // track("tool_cta_clicked", { tool: "menopause", target: "chat" });
            trackToolEvent("menopause", "cta_clicked", { target: "chat" });
          }}
        >
          Talk to august
        </a>
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
          Start over
        </button>
      </div>

      {result.factors.length > 0 && (
        <div className="tool-calc-table-card">
          <span className="tool-calc-section-label">What&apos;s shaping your estimate</span>
          <p className="tool-calc-table-caption">
            Top contributing factors from the inputs you gave us, ordered by impact.
          </p>
          <ul className="menopause-factors-list">
            {result.factors.map((f) => (
              <li key={f.id} className="menopause-factor-row">
                <div className="menopause-factor-text">
                  <span className="menopause-factor-label">{f.label}</span>
                  <span className="menopause-factor-desc">{f.description}</span>
                </div>
                <span
                  className={`menopause-factor-impact ${factorImpactTone(f.yearsImpact)}`}
                >
                  {factorImpactLabel(f.yearsImpact)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label">What changes if you...</span>
        <p className="tool-calc-table-caption">
          Hypothetical predicted age if you changed one factor at a time, holding the others constant.
        </p>
        <div className="tool-calc-table" role="table">
          {result.impacts.map((row) => (
            <div
              key={row.id}
              role="row"
              className={`tool-calc-table-row${row.applicable ? "" : " menopause-table-row--muted"}`}
            >
              <div className="tool-calc-table-cell-label">
                <span className="tool-calc-table-label">{row.label}</span>
                <span className="tool-calc-table-helper">{row.helper}</span>
              </div>
              <div className="tool-calc-table-cell-value">
                <strong>{fmtInt(Math.round(row.predictedAge))}</strong>
                <span className="tool-calc-table-unit">yrs</span>
                {row.applicable && row.delta !== 0 && (
                  <span className="menopause-table-delta">
                    {row.delta > 0 ? `+${row.delta}` : row.delta}
                  </span>
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

export default function MenopauseCalculator({ afterContent }: Props) {
  const [state, setState] = useState<MenopauseFormState>(DEFAULT_STATE);
  const { step, next, back, reset } = useStepForm({ totalSteps: TOTAL_STEPS });

  const result = useMemo<MenopauseResult>(() => computeMenopause(state), [state]);

  const { markStarted, markCompleted } = useCalculatorAnalytics("menopause");

  useEffect(() => {
    trackToolEvent("menopause", "section_completed", { step });
  }, [step]);

  const update = useCallback(
    (patch: Partial<MenopauseFormState>) => {
      setState((prev) => ({ ...prev, ...patch }));
      markStarted();
    },
    [markStarted],
  );

  const toggleCondition = useCallback(
    (c: MenopauseCondition) => {
      setState((prev) => {
        const present = prev.conditions.includes(c);
        return {
          ...prev,
          conditions: present
            ? prev.conditions.filter((x) => x !== c)
            : [...prev.conditions, c],
        };
      });
      markStarted();
    },
    [markStarted],
  );

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
      const ageNum = parseNumOrNull(state.ageRaw);
      const ageOk = ageNum != null && ageNum >= AGE_MIN && ageNum <= AGE_MAX;
      const motherAgeNum = parseNumOrNull(state.motherAgeRaw);
      const motherOk =
        motherAgeNum == null ||
        (motherAgeNum >= MOTHER_AGE_MIN && motherAgeNum <= MOTHER_AGE_MAX);
      const h = resolveHeightCm(state);
      const w = resolveWeightKg(state);
      const heightOk = h == null || (h >= HEIGHT_CM_MIN && h <= HEIGHT_CM_MAX);
      const weightOk = w == null || (w >= WEIGHT_KG_MIN && w <= WEIGHT_KG_MAX);
      return ageOk && motherOk && heightOk && weightOk;
    }
    if (step === 1) return true;
    return false;
  }, [step, state]);

  useEffect(() => {
    if (step !== TOTAL_STEPS - 1) return;
    if (result.kind !== "ok") return;
    const sig = `${menopauseAgeBucket(result.predictedAge)}|${result.band.id}|${result.inputs.age}`;
    markCompleted(sig, {
      predicted_age_bucket: menopauseAgeBucket(result.predictedAge),
      predicted_age: result.predictedAgeRounded,
      band: result.band.id,
      years_remaining: result.yearsRemaining,
      age: result.inputs.age,
      mother_age_known: result.inputs.motherAge != null,
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
            <span className="accent-gradient">Menopause Age</span> Calculator
          </>
        ),
        tagline:
          "Estimate when natural menopause is likely to happen for you, based on family history, lifestyle, and the factors clinicians actually look at no labs, no email required.",
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
                  {step === 0 && (
                    <ProfileStep
                      state={state}
                      update={update}
                      toggleCondition={toggleCondition}
                    />
                  )}
                  {step === 1 && (
                    <LifestyleStep
                      state={state}
                      update={update}
                      toggleCondition={toggleCondition}
                    />
                  )}
                  {isResultsStep && result.kind === "ok" && (
                    <MenopauseResultPanel result={result} onRestart={handleRestart} />
                  )}
                </motion.div>
              </AnimatePresence>

              {!isResultsStep && (
                <NavigationControls
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
              This is an educational estimate built from population-level studies (primarily SWAN). It does not diagnose perimenopause or menopause a clinician using your cycle history and, when needed, hormone testing can do that.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
