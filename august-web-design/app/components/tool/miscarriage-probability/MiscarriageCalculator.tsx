"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useDownloadResult } from "@/app/components/tool/shared/hooks/useDownloadResult";
import DownloadResultButton from "@/app/components/tool/shared/DownloadResultButton";
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
  kgToLbs,
  lbsToKg,
  parseNumOrNull,
} from "@/app/utils/tools/health-math";
import {
  AGE_MAX,
  AGE_MIN,
  DEFAULT_FORM_STATE,
  GA_WEEK_MAX,
  GA_WEEK_MIN,
  HEIGHT_IN_MAX,
  HEIGHT_IN_MIN,
  WEIGHT_LB_MAX,
  WEIGHT_LB_MIN,
  computeResult,
  factorTimesSmaller,
  formatPercent,
  riskBucket,
  type FormState,
  type MiscarriageResult,
  type MiscarriageResultOk,
  type UnitSystem,
} from "@/app/utils/tools/miscarriage-probability-compute";

const TOTAL_STEPS = 3; // about you + pregnancy + results

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const BIRTHS_OPTIONS = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3+" },
];

const MISC_OPTIONS = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3+" },
];

const DAY_OPTIONS = [
  { value: "0", label: "0d" },
  { value: "1", label: "1d" },
  { value: "2", label: "2d" },
  { value: "3", label: "3d" },
  { value: "4", label: "4d" },
  { value: "5", label: "5d" },
  { value: "6", label: "6d" },
];

interface StepProps {
  state: FormState;
  update: (patch: Partial<FormState>) => void;
}

function resolveHeightIn(state: FormState): number | null {
  if (state.unitSystem === "metric") {
    const cm = parseNumOrNull(state.heightCmRaw);
    return cm == null ? null : cm / 2.54;
  }
  const ft = parseNumOrNull(state.heightFeetRaw);
  if (ft == null) return null;
  const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
  return ft * 12 + inches;
}

function resolveWeightLb(state: FormState): number | null {
  if (state.unitSystem === "metric") {
    const kg = parseNumOrNull(state.weightKgRaw);
    return kg == null ? null : kgToLbs(kg);
  }
  return parseNumOrNull(state.weightLbRaw);
}

function AboutStep({ state, update }: StepProps) {
  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      track("miscarriage_calculator_unit_change", {
        from: state.unitSystem,
        to: next,
      });
      const patch: Partial<FormState> = { unitSystem: next };
      if (next === "metric") {
        const ft = parseNumOrNull(state.heightFeetRaw);
        const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
        if (ft != null) patch.heightCmRaw = fmtDecimal(feetInchesToCm(ft, inches), 0);
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

  const ageNum = parseNumOrNull(state.ageRaw);
  const heightIn = resolveHeightIn(state);
  const weightLb = resolveWeightLb(state);

  const ageError =
    ageNum != null && (ageNum < AGE_MIN || ageNum > AGE_MAX)
      ? `Enter an age between ${AGE_MIN} and ${AGE_MAX}.`
      : null;
  const heightError =
    heightIn != null && (heightIn < HEIGHT_IN_MIN || heightIn > HEIGHT_IN_MAX)
      ? "Please check the height entered."
      : null;
  const weightError =
    weightLb != null && (weightLb < WEIGHT_LB_MIN || weightLb > WEIGHT_LB_MAX)
      ? "Please check the weight entered."
      : null;

  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">About you</h2>
        <p className="tool-step-subtitle">
          Each factor refines the estimate. Height and weight are optional
          skip them to see an age-only result.
        </p>
      </div>

      <div className="tool-calc-form-grid msc-form-grid">
        <div className="tool-form-group tool-calc-form-span-2">
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

        {/* Age */}
        <div className="tool-form-group">
          <label htmlFor="msc-age" className="tool-form-label">Age</label>
          <input
            id="msc-age"
            type="text"
            inputMode="numeric"
            className="tool-input"
            placeholder="e.g. 32"
            value={state.ageRaw}
            aria-invalid={ageError != null}
            onChange={(e) => update({ ageRaw: e.target.value })}
          />
        </div>


        {isMetric ? (
          <div className="tool-form-group">
            <label htmlFor="msc-height-cm" className="tool-form-label">
              Height (cm) <span className="msc-optional">optional</span>
            </label>
            <input
              id="msc-height-cm"
              type="text"
              inputMode="decimal"
              className="tool-input"
              placeholder="e.g. 165"
              value={state.heightCmRaw}
              aria-invalid={heightError != null}
              onChange={(e) => update({ heightCmRaw: e.target.value })}
            />
          </div>
        ) : (
          <div className="tool-form-group">
            <label className="tool-form-label">
              Height <span className="msc-optional">optional</span>
            </label>
            <div className="tool-calc-ft-in-row">
              <div className="tool-calc-ft-in-item">
                <input
                  type="text"
                  inputMode="numeric"
                  className="tool-input tool-calc-ft-in-input"
                  placeholder="5"
                  aria-label="Feet"
                  value={state.heightFeetRaw}
                  aria-invalid={heightError != null}
                  onChange={(e) => update({ heightFeetRaw: e.target.value })}
                />
                <span className="tool-calc-ft-in-suffix">ft</span>
              </div>
              <div className="tool-calc-ft-in-item">
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
                <span className="tool-calc-ft-in-suffix">in</span>
              </div>
            </div>
          </div>
        )}

         {isMetric ? (
          <div className="tool-form-group">
            <label htmlFor="msc-weight-kg" className="tool-form-label">
              Weight (kg) <span className="msc-optional">optional</span>
            </label>
            <input
              id="msc-weight-kg"
              type="text"
              inputMode="decimal"
              className="tool-input"
              placeholder="e.g. 65"
              value={state.weightKgRaw}
              aria-invalid={weightError != null}
              onChange={(e) => update({ weightKgRaw: e.target.value })}
            />
          </div>
        ) : (
          <div className="tool-form-group">
            <label htmlFor="msc-weight-lb" className="tool-form-label">
              Weight (lb) <span className="msc-optional">optional</span>
            </label>
            <input
              id="msc-weight-lb"
              type="text"
              inputMode="decimal"
              className="tool-input"
              placeholder="e.g. 145"
              value={state.weightLbRaw}
              aria-invalid={weightError != null}
              onChange={(e) => update({ weightLbRaw: e.target.value })}
            />
          </div>
        )}



       
        <div className="tool-form-group">
          <label className="tool-form-label">Prior live births</label>
          <SegmentedControl
            options={BIRTHS_OPTIONS}
            value={state.priorBirthsRaw}
            onChange={(v) => update({ priorBirthsRaw: v })}
            ariaLabel="Number of prior live births"
            className="tool-chip-group--connected msc-chip-row"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        <div className="tool-form-group">
          <label className="tool-form-label">Previous miscarriages</label>
          <SegmentedControl
            options={MISC_OPTIONS}
            value={state.priorMiscarriagesRaw}
            onChange={(v) => update({ priorMiscarriagesRaw: v })}
            ariaLabel="Number of prior miscarriages"
            className=" tool-chip-group--connected msc-chip-row"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
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

function PregnancyStep({ state, update }: StepProps) {
  const weeks = parseNumOrNull(state.gestWeeksRaw);
  const weekError =
    weeks != null && (weeks < GA_WEEK_MIN || weeks > GA_WEEK_MAX)
      ? `Enter a gestational age between ${GA_WEEK_MIN + 1} weeks and 19 weeks 6 days.`
      : null;

  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">How far along are you?</h2>
        <p className="tool-step-subtitle">
          Gestational age is measured from the first day of your last
          menstrual period (LMP), not conception.
        </p>
      </div>

      <div className="tool-calc-form-grid msc-form-grid">
        <div className="tool-form-group">
          <label htmlFor="msc-weeks" className="tool-form-label">Weeks</label>
          <input
            id="msc-weeks"
            type="text"
            inputMode="numeric"
            className="tool-input"
            placeholder="e.g. 8"
            value={state.gestWeeksRaw}
            aria-invalid={weekError != null}
            onChange={(e) => update({ gestWeeksRaw: e.target.value })}
          />
        </div>

        <div className="tool-form-group">
          <label htmlFor="msc-days" className="tool-form-label">Days</label>
          <select
            id="msc-days"
            className="tool-input"
            value={state.gestDaysRaw}
            onChange={(e) => update({ gestDaysRaw: e.target.value })}
            aria-label="Additional days"
          >
            {DAY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value === "1" ? "1 day" : `${opt.value} days`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {weekError && (
        <div className="tool-calc-error-stack">
          <p className="tool-error">{weekError}</p>
        </div>
      )}

      {/* <p className="msc-helper">
        Not sure? Your due date minus 40 weeks gives your LMP. The tool covers
        2w 1d through 19w 6d — miscarriage is defined as loss before 20 weeks.
      </p> */}
    </div>
  );
}

function ResultPanel({
  result,
  onRestart,
}: {
  result: MiscarriageResultOk;
  onRestart: () => void;
}) {
  const reassurer = formatPercent(result.notMiscarriage, 1);
  const remaining = formatPercent(result.probability, 1);

  const maxWeekly = Math.max(...result.weekRows.map((r) => r.probability), 0.001);
  const timesSmaller = factorTimesSmaller(result.initialProbability, result.probability);
  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "miscarriage-probability",
    filename: `miscarriage-probability-${result.gestLabel}`,
    heading: "Miscarriage Probability Estimate",
    subtitle: `Miscarriage Probability Report • ${result.gestLabel}`,
    toolName: "Miscarriage Probability Calculator",
  });

  return (
    <div ref={resultRef} className="tool-calc-result-stack">
      <div className="flex justify-end" data-skip-screenshot="true">
        <DownloadResultButton onClick={handleDownload} />
      </div>
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Probability of not miscarrying</span>
        <div className="tool-calc-value-row">
          <span className="tool-calc-value" style={{ color: "var(--brand-primary)" }}>{reassurer}</span>
          <span className="tool-calc-value-unit">at {result.gestLabel}</span>
        </div>
        <p className="tool-calc-result-desc">
          At {result.gestLabel}, the probability that your pregnancy continues
          past 20 weeks is {reassurer}. The complementary probability of
          miscarriage from now through 20 weeks is {remaining}.
          {timesSmaller != null && (
            <>
              {" "}Your miscarriage risk is now{" "}
              <strong>{timesSmaller}× smaller</strong> than when you first
              became pregnant.
            </>
          )}
        </p>

        <div className="tool-calc-meta-row">
          <span className="font-medium text-black">Risk-factor adjustment</span>
          <strong>
            ×{result.factor.mean.toFixed(2)}{" "}
            <span className="msc-meta-suffix">
              {result.factor.values.length === 0
                ? "baseline"
                : `mean of ${result.factor.values.length} factor${
                    result.factor.values.length === 1 ? "" : "s"
                  }`}
            </span>
          </strong>
        </div>
      </div>

      <div className="flex justify-center gap-4" data-skip-screenshot="true">
        <a
          href="/chat?msg=I just used the miscarriage probability calculator and want to discuss my results"
          className="tool-btn tool-btn--primary"
          onClick={() => {
            // track("tool_cta_clicked", {
            //   tool: "miscarriage-probability",
            //   target: "chat",
            // });
            trackToolEvent("miscarriage-probability", "cta_clicked", { target: "chat" });
          }}
        >
          Talk to august
        </a>
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
          Start over
        </button>
      </div>

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label">Risk curve by gestational week</span>
        <p className="tool-calc-table-caption">
          Cumulative probability of miscarriage from the start of each week
          through 20 weeks, adjusted for your inputs.
        </p>
        <div className="msc-week-table" role="table">
          {result.weekRows.map((row) => {
            const isCurrent = row.weeks === Math.floor(result.idx / 7);
            const widthPct = Math.max(2, (row.probability / maxWeekly) * 100);
            return (
              <div
                key={row.weeks}
                role="row"
                className={`msc-week-row${isCurrent ? " msc-week-row--current" : ""}`}
              >
                <div className="msc-week-cell-label">
                  <span className="msc-week-label">Week {row.weeks}</span>
                </div>
                <div className="msc-week-bar-track" aria-hidden="true">
                  <div className="msc-week-bar-fill" style={{ width: `${widthPct}%` }} />
                </div>
                <div className="msc-week-cell-value">
                  <strong>{formatPercent(row.probability, 1)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* <p className="msc-disclaimer">
        Educational only. Model and table reproduced from{" "}
        <a
          href="https://datayze.com/miscarriage-reassurer"
          target="_blank"
          rel="noreferrer"
          className="msc-inline-link"
        >
          datayze.com/miscarriage-reassurer
        </a>
        . Not a substitute for evaluation by your OB-GYN or midwife.
      </p> */}
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
            className={`tool-calc-dot${
              i === step ? " tool-calc-dot--active" : i < step ? " tool-calc-dot--completed" : ""
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
  afterContent?: React.ReactNode;
}

export default function MiscarriageCalculator({ afterContent }: Props) {
  const [state, setState] = useState<FormState>(DEFAULT_FORM_STATE);
  const { step, next, back, reset } = useStepForm({ totalSteps: TOTAL_STEPS });

  const result = useMemo<MiscarriageResult>(() => computeResult(state), [state]);

  const { markStarted, markCompleted } = useCalculatorAnalytics("miscarriage-probability");

  useEffect(() => {
    trackToolEvent("miscarriage-probability", "section_completed", { step });
  }, [step]);

  const didMountScrollRef = useRef(false);
  useEffect(() => {
    if (!didMountScrollRef.current) {
      didMountScrollRef.current = true;
      return;
    }
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [step]);

  const update = useCallback((patch: Partial<FormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    markStarted();
  }, [markStarted]);

  const handleRestart = useCallback(() => {
    reset();
    setState(DEFAULT_FORM_STATE);
  }, [reset]);

  const canAdvance = useMemo(() => {
    if (step === 0) {
      const ageNum = parseNumOrNull(state.ageRaw);
      if (ageNum == null || ageNum < AGE_MIN || ageNum > AGE_MAX) return false;
      // Height + weight are optional, but if entered, must be in-range.
      const h = resolveHeightIn(state);
      if (h != null && (h < HEIGHT_IN_MIN || h > HEIGHT_IN_MAX)) return false;
      const w = resolveWeightLb(state);
      if (w != null && (w < WEIGHT_LB_MIN || w > WEIGHT_LB_MAX)) return false;
      return true;
    }
    if (step === 1) {
      const wk = parseNumOrNull(state.gestWeeksRaw);
      if (wk == null || wk < GA_WEEK_MIN || wk > GA_WEEK_MAX) return false;
      const dy = parseNumOrNull(state.gestDaysRaw);
      if (dy == null || dy < 0 || dy > 6) return false;
      // Reject 2w0d exactly (Datayze: idx > 14) and any 19w7d.
      const idx = Math.floor(wk) * 7 + Math.floor(dy);
      if (idx <= 14 || idx >= 140) return false;
      return true;
    }
    return false;
  }, [step, state]);

  useEffect(() => {
    if (step !== TOTAL_STEPS - 1) return;
    if (result.kind !== "ok") return;
    const sig = `${result.idx}|${result.factor.mean.toFixed(3)}`;
    markCompleted(sig, {
      idx: result.idx,
      factor_mean: Math.round(result.factor.mean * 1000) / 1000,
      probability_pct: Math.round(result.probability * 1000) / 10,
      reassurer_pct: Math.round(result.notMiscarriage * 1000) / 10,
      risk_bucket: riskBucket(result.probability),
    });
  }, [step, result, markCompleted]);

  const isResultsStep = step === TOTAL_STEPS - 1;
  const isLastFormStep = step === TOTAL_STEPS - 2;

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Miscarriage</span> Probability
          </>
        ),
        tagline:
          "See your remaining miscarriage risk and the probability your pregnancy continues past 20 weeks based on age, gestational age, BMI, and pregnancy history.",
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
                  {step === 0 && <AboutStep state={state} update={update} />}
                  {step === 1 && <PregnancyStep state={state} update={update} />}
                  {isResultsStep && result.kind === "ok" && (
                    <ResultPanel result={result} onRestart={handleRestart} />
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
            <p className="tool-calc-disclaimer">
              Educational only. Not a substitute for evaluation by your OB-GYN
              or midwife. If you have bleeding, cramping, or any concern about
              your pregnancy, contact your healthcare team.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
