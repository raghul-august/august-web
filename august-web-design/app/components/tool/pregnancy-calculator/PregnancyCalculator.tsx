"use client";

import { useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useDownloadResult } from "@/app/components/tool/shared/hooks/useDownloadResult";
import DownloadResultButton from "@/app/components/tool/shared/DownloadResultButton";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { useStepForm } from "@/app/components/tool/shared/hooks/useStepForm";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { parseNumOrNull } from "@/app/utils/tools/health-math";
import { ToolAuthGate } from "@/components/auth";
import {
  CYCLE_LENGTH_DEFAULT,
  CYCLE_LENGTH_MAX,
  CYCLE_LENGTH_MIN,
  DEFAULT_FORM_STATE,
  IVF_TRANSFER_OPTIONS,
  METHODS,
  ULTRASOUND_WEEKS_MAX,
  ULTRASOUND_WEEKS_MIN,
  computePregnancy,
  trimesterFromGestDays,
  type CalcMethod,
  type IVFTransferDay,
  type PregnancyFormState,
  type PregnancyResult,
  type PregnancyResultOk,
} from "@/app/utils/tools/pregnancy-calculator-compute";

const TOTAL_STEPS = 2; // method + inputs → results

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
  state: PregnancyFormState;
  update: (patch: Partial<PregnancyFormState>) => void;
}

/* ── InputsStep: method picker + method-specific fields ──────────────── */

function InputsStep({ state, update }: StepProps) {
  const onMethodChange = useCallback(
    (raw: string) => {
      const next = raw as CalcMethod;
      if (next === state.method) return;
      track("pregnancy_calculator_method_change", { from: state.method, to: next });
      update({ method: next });
    },
    [state.method, update],
  );

  const activeMethod = METHODS.find((m) => m.id === state.method) ?? METHODS[0];

  const cycle = parseNumOrNull(state.cycleLengthRaw);
  const cycleError =
    cycle != null && (cycle < CYCLE_LENGTH_MIN || cycle > CYCLE_LENGTH_MAX)
      ? `Enter a cycle length between ${CYCLE_LENGTH_MIN} and ${CYCLE_LENGTH_MAX} days.`
      : null;

  const usWeeks = parseNumOrNull(state.ultrasoundWeeksRaw);
  const usWeeksError =
    usWeeks != null && (usWeeks < ULTRASOUND_WEEKS_MIN || usWeeks > ULTRASOUND_WEEKS_MAX)
      ? `Enter weeks between ${ULTRASOUND_WEEKS_MIN} and ${ULTRASOUND_WEEKS_MAX}.`
      : null;

  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">Pregnancy details</h2>
        <p className="tool-step-subtitle">{activeMethod.blurb}</p>
      </div>

      <div className="tool-calc-form-grid">
        <div className="tool-form-group tool-calc-form-span-2">
          <label htmlFor="preg-method" className="tool-form-label">Calculate from</label>
          <select
            id="preg-method"
            className="tool-input preg-method-select"
            value={state.method}
            onChange={(e) => onMethodChange(e.target.value)}
            aria-label="Calculation method"
          >
            {METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {state.method === "lmp" && (
          <>
            <div className="tool-form-group">
              <label htmlFor="preg-lmp" className="tool-form-label">First day of last period</label>
              <input
                id="preg-lmp"
                type="date"
                className="tool-input"
                value={state.lmpDate}
                onChange={(e) => update({ lmpDate: e.target.value })}
              />
            </div>
            <div className="tool-form-group">
              <label htmlFor="preg-cycle" className="tool-form-label">Average cycle length (days)</label>
              <input
                id="preg-cycle"
                type="text"
                inputMode="numeric"
                className="tool-input"
                placeholder={`e.g. ${CYCLE_LENGTH_DEFAULT}`}
                value={state.cycleLengthRaw}
                aria-invalid={cycleError != null}
                onChange={(e) => update({ cycleLengthRaw: e.target.value })}
              />
            </div>
          </>
        )}

        {state.method === "conception" && (
          <div className="tool-form-group tool-calc-form-span-2">
            <label htmlFor="preg-conception" className="tool-form-label">Conception date</label>
            <input
              id="preg-conception"
              type="date"
              className="tool-input"
              value={state.conceptionDate}
              onChange={(e) => update({ conceptionDate: e.target.value })}
            />
          </div>
        )}

        {state.method === "ivf" && (
          <>
            <div className="tool-form-group">
              <label htmlFor="preg-ivf-date" className="tool-form-label">Embryo transfer date</label>
              <input
                id="preg-ivf-date"
                type="date"
                className="tool-input"
                value={state.ivfTransferDate}
                onChange={(e) => update({ ivfTransferDate: e.target.value })}
              />
            </div>
            <div className="tool-form-group">
              <label className="tool-form-label">Transfer day</label>
              <SegmentedControl
                options={IVF_TRANSFER_OPTIONS.map((o) => ({ value: o.value, label: o.value === "3" ? "Day 3" : o.value === "5" ? "Day 5" : "Day 6" }))}
                value={state.ivfTransferDay}
                onChange={(v) => update({ ivfTransferDay: v as IVFTransferDay })}
                ariaLabel="IVF transfer day"
                className="tool-chip-group tool-chip-group--connected"
                buttonClassName="tool-chip"
                activeClassName="tool-chip--active"
              />
            </div>
          </>
        )}

        {state.method === "ultrasound" && (
          <>
            <div className="tool-form-group tool-calc-form-span-2">
              <label htmlFor="preg-us-date" className="tool-form-label">Ultrasound date</label>
              <input
                id="preg-us-date"
                type="date"
                className="tool-input"
                value={state.ultrasoundDate}
                onChange={(e) => update({ ultrasoundDate: e.target.value })}
              />
            </div>
            <div className="tool-form-group">
              <label htmlFor="preg-us-weeks" className="tool-form-label">Weeks at scan</label>
              <input
                id="preg-us-weeks"
                type="text"
                inputMode="numeric"
                className="tool-input"
                placeholder="e.g. 8"
                value={state.ultrasoundWeeksRaw}
                aria-invalid={usWeeksError != null}
                onChange={(e) => update({ ultrasoundWeeksRaw: e.target.value })}
              />
            </div>
            <div className="tool-form-group">
              <label htmlFor="preg-us-days" className="tool-form-label">Plus days</label>
              <select
                id="preg-us-days"
                className="tool-input"
                value={state.ultrasoundDaysRaw}
                onChange={(e) => update({ ultrasoundDaysRaw: e.target.value })}
                aria-label="Additional days at scan"
              >
                {DAY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value === "1" ? "1 day" : `${opt.value} days`}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {state.method === "dueDate" && (
          <div className="tool-form-group tool-calc-form-span-2">
            <label htmlFor="preg-due" className="tool-form-label">Known due date</label>
            <input
              id="preg-due"
              type="date"
              className="tool-input"
              value={state.dueDateInput}
              onChange={(e) => update({ dueDateInput: e.target.value })}
            />
          </div>
        )}
      </div>

      {(cycleError || usWeeksError) && (
        <div className="tool-calc-error-stack">
          {cycleError && <p className="tool-error">{cycleError}</p>}
          {usWeeksError && <p className="tool-error">{usWeeksError}</p>}
        </div>
      )}
    </div>
  );
}

/* ── Result panel ────────────────────────────────────────────────────── */

function ResultPanel({
  result,
  onRestart,
  resultRef,
  onDownload,
}: {
  result: PregnancyResultOk;
  onRestart: () => void;
  resultRef: RefObject<HTMLDivElement | null>;
  onDownload: () => void | Promise<void>;
}) {
  const overdue = result.daysRemaining < 0;
  const progressPct = Math.round(result.percentComplete);

  return (
    <div ref={resultRef} className="tool-calc-result-stack">
      <div className="flex justify-end" data-skip-screenshot="true">
        <DownloadResultButton onClick={onDownload} />
      </div>
      <div className="tool-calc-result-primary preg-result-primary">
        <span className={`preg-trimester-tag preg-trimester-tag--t${result.trimester}`}>
          {result.trimesterLabel}
        </span>
        <span className="tool-calc-section-label preg-section-label">Estimated due date</span>
        <div className="tool-calc-value-row preg-value-row">
          <span className="tool-calc-value preg-value">{result.dueDateLong}</span>
        </div>
        <p className="tool-calc-result-desc preg-result-desc">
          You are currently <strong>{result.gestLabel}</strong> pregnant.{" "}
          {overdue
            ? `Your due date passed ${Math.abs(result.daysRemaining)} day${Math.abs(result.daysRemaining) === 1 ? "" : "s"} ago.`
            : `${result.daysRemaining} day${result.daysRemaining === 1 ? "" : "s"} (about ${result.weeksRemaining} week${result.weeksRemaining === 1 ? "" : "s"}) to go.`}
        </p>

        <div className="preg-progress-track" aria-hidden="true">
          <div
            className="preg-progress-fill"
            style={{ width: `${Math.max(2, Math.min(100, progressPct))}%` }}
          />
        </div>
        <div className="preg-progress-meta">
          <span>{progressPct}% complete</span>
          <span>Week {result.gestWeeks} of 40</span>
        </div>

        <div className="tool-calc-meta-row preg-meta-row">
          <span>Conception date</span>
          <strong>{result.conceptionDateLong}</strong>
        </div>
        <div className="tool-calc-meta-row preg-meta-row">
          <span>First day of LMP</span>
          <strong>{result.lmpDateLong}</strong>
        </div>
      </div>

      <div className="flex items-center gap-4 justify-center" data-skip-screenshot="true">
        <a
          href="/chat?msg=I just used the pregnancy calculator and want to discuss my results"
          className="tool-btn tool-btn--primary"
          onClick={() => {
            // track("tool_cta_clicked", { tool: "pregnancy-calculator", target: "chat" });
            trackToolEvent("pregnancy-calculator", "cta_clicked", { target: "chat" });
          }}
        >
          Talk to august
        </a>
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
          Start over
        </button>
      </div>

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label preg-section-label">Key dates</span>
        <div className="tool-calc-table" role="table">
          <div role="row" className="tool-calc-table-row">
            <div className="tool-calc-table-cell-label">
              <span className="tool-calc-table-label">End of 1st trimester</span>
              <span className="tool-calc-table-helper">13 weeks 0 days</span>
            </div>
            <div className="tool-calc-table-cell-value">
              <strong>{formatRefDate(result.firstTrimesterEnd)}</strong>
            </div>
          </div>
          <div role="row" className="tool-calc-table-row">
            <div className="tool-calc-table-cell-label">
              <span className="tool-calc-table-label">End of 2nd trimester</span>
              <span className="tool-calc-table-helper">27 weeks 6 days</span>
            </div>
            <div className="tool-calc-table-cell-value">
              <strong>{formatRefDate(result.secondTrimesterEnd)}</strong>
            </div>
          </div>
          <div role="row" className="tool-calc-table-row">
            <div className="tool-calc-table-cell-label">
              <span className="tool-calc-table-label">Viability</span>
              <span className="tool-calc-table-helper">24 weeks</span>
            </div>
            <div className="tool-calc-table-cell-value">
              <strong>{formatRefDate(result.viabilityDate)}</strong>
            </div>
          </div>
          <div role="row" className="tool-calc-table-row">
            <div className="tool-calc-table-cell-label">
              <span className="tool-calc-table-label">Full term</span>
              <span className="tool-calc-table-helper">37 weeks</span>
            </div>
            <div className="tool-calc-table-cell-value">
              <strong>{formatRefDate(result.fullTermDate)}</strong>
            </div>
          </div>
          <div role="row" className="tool-calc-table-row preg-table-row--accent">
            <div className="tool-calc-table-cell-label">
              <span className="tool-calc-table-label">Due date</span>
              <span className="tool-calc-table-helper">40 weeks</span>
            </div>
            <div className="tool-calc-table-cell-value">
              <strong>{formatRefDate(result.dueDate)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label preg-section-label">Pregnancy milestones</span>
        <p className="tool-calc-table-caption">
          Approximate dates based on your inputs. Individual timelines vary.
        </p>
        <div className="preg-milestone-list" role="table">
          {result.milestones.map((m) => (
            <div
              key={m.id}
              role="row"
              className={`preg-milestone-row${m.reached ? " preg-milestone-row--reached" : ""}`}
            >
              <div className="preg-milestone-dot" aria-hidden="true" />
              <div className="preg-milestone-body">
                <div className="preg-milestone-head">
                  <span className="preg-milestone-label">{m.label}</span>
                  <span className="preg-milestone-week">Week {m.weeks}</span>
                </div>
                <span className="preg-milestone-helper">{m.helper}</span>
              </div>
              <div className="preg-milestone-date">
                <strong>{m.date}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatRefDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => Number(n));
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ── Navigation controls ─────────────────────────────────────────────── */

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

/* ── Default export ──────────────────────────────────────────────────── */

interface Props {
  afterContent?: React.ReactNode;
}

export default function PregnancyCalculator({ afterContent }: Props) {
  const [state, setState] = useState<PregnancyFormState>(DEFAULT_FORM_STATE);
  const { step, next, back, reset } = useStepForm({ totalSteps: TOTAL_STEPS });

  const result = useMemo<PregnancyResult>(() => computePregnancy(state), [state]);

  const { markStarted, markCompleted } = useCalculatorAnalytics("pregnancy-calculator");

  useEffect(() => {
    trackToolEvent("pregnancy-calculator", "section_completed", { step });
  }, [step]);

  const update = useCallback((patch: Partial<PregnancyFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    markStarted();
  }, [markStarted]);

  const handleRestart = useCallback(() => {
    reset();
    if(window != undefined){
      window.scrollTo({top : 0, behavior : "smooth"})
    }
    setState(DEFAULT_FORM_STATE);
  }, [reset]);

  const canAdvance = useMemo(() => {
    if (step === 0) return result.kind === "ok";
    return false;
  }, [step, result]);

  useEffect(() => {
    if (step !== TOTAL_STEPS - 1) return;
    if (result.kind !== "ok") return;
    const sig = `${result.method}|${result.dueDate}`;
    markCompleted(sig, {
      method: result.method,
      trimester: trimesterFromGestDays(result.gestationalAgeDays),
      gest_weeks: result.gestWeeks,
    });
  }, [step, result, markCompleted]);

  const isResultsStep = step === TOTAL_STEPS - 1;
  const isLastFormStep = step === TOTAL_STEPS - 2;

  const resultOk = result.kind === "ok" ? result : null;
  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "pregnancy-calculator",
    filename: resultOk ? `pregnancy-due-date-${resultOk.dueDateLong}` : "pregnancy-due-date",
    heading: "Pregnancy Schedule and Due Date",
    subtitle: resultOk
      ? `Pregnancy Progress Report • ${resultOk.trimesterLabel}`
      : "Pregnancy Progress Report",
    toolName: "Pregnancy Calculator",
  });

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Pregnancy</span> Calculator
          </>
        ),
        tagline:
          "Estimate your due date and current gestational age from your last period, conception date, IVF transfer, ultrasound, or known due date.",
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
                  {step === 0 && <InputsStep state={state} update={update} />}
                  {isResultsStep && result.kind === "ok" && (
                    <ResultPanel
                      result={result}
                      onRestart={handleRestart}
                      resultRef={resultRef}
                      onDownload={handleDownload}
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
            <ToolAuthGate active={isResultsStep && result.kind === "ok"} />
            <p className="tool-calc-disclaimer">
              Educational only. Most due dates come from a combination of LMP and an early ultrasound &mdash;
              confirm yours with your OB-GYN, midwife, or family physician.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
