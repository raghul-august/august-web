"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { useDownloadResult } from "@/app/components/tool/shared/hooks/useDownloadResult";
import DownloadResultButton from "@/app/components/tool/shared/DownloadResultButton";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import {
  computeOvulation,
  formatHumanDate,
  ovulationBucket,
  relativeDayDescription,
  type OvulationFormState,
  type OvulationResult,
  type OvulationResultOk,
} from "@/app/utils/tools/ovulation-calculator-compute";
import {
  CYCLE_LENGTH_DEFAULT,
  CYCLE_LENGTH_MAX,
  CYCLE_LENGTH_MIN,
  PERIOD_LENGTH_DEFAULT,
  PERIOD_LENGTH_MAX,
  PERIOD_LENGTH_MIN,
} from "@/app/data/tools/ovulation-calculator-config";
import { ArrowRightIcon } from "@phosphor-icons/react";
interface Props {
  afterContent?: ReactNode;
}

const DEFAULT_STATE: OvulationFormState = {
  lmpRaw: "",
  cycleLength: CYCLE_LENGTH_DEFAULT,
  periodLength: PERIOD_LENGTH_DEFAULT,
};

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ErrorMessage({ reason }: { reason: string }) {
  const message: Record<string, string> = {
    missing_lmp: "Please enter the first day of your last period.",
    unparseable_lmp: "That date looks malformed — try yyyy-mm-dd.",
    future_lmp: "Your last period can't be in the future.",
    lmp_too_old:
      "That date is more than four months ago. If you might be pregnant, try our pregnancy calculator.",
    cycle_out_of_range: `Cycle length must be between ${CYCLE_LENGTH_MIN} and ${CYCLE_LENGTH_MAX} days.`,
  };
  return <p className="tool-error">{message[reason] ?? "Please review your inputs."}</p>;
}

function ResultPanel({
  result,
  onRestart,
  resultRef,
  onDownload,
}: {
  result: OvulationResultOk;
  onRestart: () => void;
  resultRef: RefObject<HTMLDivElement | null>;
  onDownload: () => void | Promise<void>;
}) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("ovulation-calculator", "cta_clicked", {
      cta_type: "talk_to_august",
      bucket: ovulationBucket(result.daysUntilOvulation),
    });
    openAugustChat(
      `Hi August. I used the ovulation calculator. My next ovulation is around ${formatHumanDate(result.ovulationDate)} and my fertile window is ${formatHumanDate(result.fertileWindowStart)} to ${formatHumanDate(result.fertileWindowEnd)}. I'd like to talk about fertility or cycle tracking.`,
    );
  }, [result]);

  return (
    <div ref={resultRef} className="tool-calc-result-stack">
      <div className="flex justify-end" data-skip-screenshot="true">
        <DownloadResultButton onClick={onDownload} />
      </div>
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Estimated ovulation</span>
        <div className="tool-calc-value-row">
          <span
            className="tool-calc-value"
            style={{ fontSize: "1.75rem", lineHeight: 1.15 }}
          >
            {formatHumanDate(result.ovulationDate)}
          </span>
        </div>
        <p className="tool-calc-result-desc">
          {relativeDayDescription(result.daysUntilOvulation)}
        </p>

        <div className="tool-calc-meta-row no-border-top">
          <span>Fertile window</span>
          <strong>
            {formatHumanDate(result.fertileWindowStart)} →{" "}
            {formatHumanDate(result.fertileWindowEnd)}
          </strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Next period</span>
          <strong>{formatHumanDate(result.nextPeriodStart)}</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>If conception occurs, due date</span>
          <strong>{formatHumanDate(result.dueDate)}</strong>
        </div>
      </div>

      <div
        className="flex justify-center items-center gap-4 flex-wrap"
        data-skip-screenshot="true"
      >
        <button
          type="button"
          className="tool-btn tool-btn--primary"
          onClick={handleTalkToAugust}
        >
          Talk to august
        </button>
        <button
          type="button"
          className="tool-btn tool-btn--ghost"
          onClick={onRestart}
        >
          Start Over
        </button>
      </div>

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label">Next three cycles</span>
        <p className="tool-calc-table-caption">
          Based on your average cycle length, projected forward.
        </p>
        <div className="tool-calc-table" role="table">
          {result.upcoming.map((row) => (
            <div key={row.cycleNumber} role="row" className="tool-calc-table-row">
              <div className="tool-calc-table-cell-label">
                <span className="tool-calc-table-label">
                  Cycle {row.cycleNumber}
                </span>
                <span className="tool-calc-table-helper">
                  Period starts {formatHumanDate(row.periodStart)}
                </span>
              </div>
              <div className="tool-calc-table-cell-value">
                <strong>{formatHumanDate(row.ovulation)}</strong>
                <span className="tool-calc-table-unit">ovulation</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OvulationCalculator({ afterContent }: Props) {
  const [state, setState] = useState<OvulationFormState>(DEFAULT_STATE);
  const [submitted, setSubmitted] = useState(false);

  const { markStarted, markCompleted } = useCalculatorAnalytics(
    "ovulation-calculator",
  );

  const result = useMemo<OvulationResult>(
    () =>
      submitted
        ? computeOvulation(state)
        : { kind: "invalid", reason: "missing_lmp" },
    [submitted, state],
  );

  const today = useMemo(() => todayIso(), []);

  const update = useCallback(
    (patch: Partial<OvulationFormState>) => {
      setState((prev) => ({ ...prev, ...patch }));
      markStarted();
      for (const [field, value] of Object.entries(patch)) {
        track("ovulation_calculator_field_change", {
          field,
          has_value: Boolean(value),
        });
      }
    },
    [markStarted],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!state.lmpRaw) return;
      markStarted();
      setSubmitted(true);
    },
    [state.lmpRaw, markStarted],
  );

  const handleRestart = useCallback(() => {
    trackToolEvent("ovulation-calculator", "cta_clicked", {
      cta_type: "start_over",
    });
    setSubmitted(false);
    setState(DEFAULT_STATE);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (!submitted || result.kind !== "ok") return;
    const sig = `${ovulationBucket(result.daysUntilOvulation)}|${result.cycleLength}`;
    markCompleted(sig, {
      bucket: ovulationBucket(result.daysUntilOvulation),
      cycle_length: result.cycleLength,
      days_until_ovulation: result.daysUntilOvulation,
    });
  }, [submitted, result, markCompleted]);

  const showResults = submitted && result.kind === "ok";
  const resultOk = result.kind === "ok" ? result : null;
  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "ovulation-calculator",
    filename: resultOk
      ? `ovulation-${formatHumanDate(resultOk.ovulationDate)}`
      : "ovulation",
    heading: "Ovulation and Fertility Window",
    subtitle: resultOk
      ? `Ovulation Report • ${formatHumanDate(resultOk.ovulationDate)}`
      : "Ovulation Report",
    toolName: "Ovulation Calculator",
  });

  useEffect(() => {
    trackToolEvent("ovulation-calculator", "section_completed", {
      section: showResults ? "result" : "form",
    });
  }, [showResults]);

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Ovulation</span> Calculator
          </>
        ),
        tagline:
          "Predict your fertile window, ovulation day, next period, and due date from your last menstrual period and average cycle length.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card">
              {!showResults ? (
                <form onSubmit={handleSubmit} className="tool-calc-step-body">
                  <div className="tool-calc-step-header">
                    <h2 className="tool-step-title">Your cycle</h2>
                    <p className="tool-step-subtitle">
                      A few details so we can map your fertile window.
                    </p>
                  </div>

                  <div className="tool-calc-form-grid">
                    <div className="tool-form-group tool-calc-form-span-2">
                      <label
                        htmlFor="ovulation-lmp"
                        className="tool-form-label"
                      >
                        First day of your last period
                      </label>
                      <input
                        id="ovulation-lmp"
                        type="date"
                        className="tool-input"
                        max={today}
                        value={state.lmpRaw}
                        onChange={(e) => update({ lmpRaw: e.target.value })}
                        required
                      />
                    </div>

                    <div className="tool-form-group">
                      <label
                        htmlFor="ovulation-cycle"
                        className="tool-form-label"
                      >
                        Average cycle length (days)
                      </label>
                      <input
                        id="ovulation-cycle"
                        type="number"
                        inputMode="numeric"
                        className="tool-input"
                        min={CYCLE_LENGTH_MIN}
                        max={CYCLE_LENGTH_MAX}
                        value={state.cycleLength}
                        onChange={(e) =>
                          update({
                            cycleLength: Number(e.target.value) || CYCLE_LENGTH_DEFAULT,
                          })
                        }
                      />
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "0.8rem",
                          color: "var(--text-tertiary)",
                          lineHeight: 1.5,
                        }}
                      >
                        Typical range: {CYCLE_LENGTH_MIN}–{CYCLE_LENGTH_MAX} days.
                      </p>
                    </div>

                    <div className="tool-form-group">
                      <label
                        htmlFor="ovulation-period"
                        className="tool-form-label"
                      >
                        Period length (days)
                      </label>
                      <input
                        id="ovulation-period"
                        type="number"
                        inputMode="numeric"
                        className="tool-input"
                        min={PERIOD_LENGTH_MIN}
                        max={PERIOD_LENGTH_MAX}
                        value={state.periodLength}
                        onChange={(e) =>
                          update({
                            periodLength:
                              Number(e.target.value) || PERIOD_LENGTH_DEFAULT,
                          })
                        }
                      />
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "0.8rem",
                          color: "var(--text-tertiary)",
                          lineHeight: 1.5,
                        }}
                      >
                        Optional, doesn&apos;t affect ovulation timing.
                      </p>
                    </div>
                  </div>

                  {result.kind === "invalid" && submitted && (
                    <div className="tool-calc-error-stack">
                      <ErrorMessage reason={result.reason} />
                    </div>
                  )}

                  <div className="tool-calc-nav">
                    <div />
                    <button
                      type="submit"
                      className="tool-btn tool-btn--primary tool-calc-nav-btn"
                      disabled={!state.lmpRaw}
                    >
                      Calculate
                      <ArrowRightIcon/>
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <ResultPanel
                    result={result as OvulationResultOk}
                    onRestart={handleRestart}
                    resultRef={resultRef}
                    onDownload={handleDownload}
                  />
                </motion.div>
              )}
            </div>
            <p className="tl-disclaimer">
              An ovulation calculator is most accurate for regular cycles. For
              irregular cycles, basal body temperature, cervical mucus tracking,
              or ovulation predictor kits give a more precise picture. Not a
              substitute for clinical fertility advice.
            </p>
          </div>

        </section>
      }
      afterContent={afterContent}
    />
  );
}
