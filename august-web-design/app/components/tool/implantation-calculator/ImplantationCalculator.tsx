"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@phosphor-icons/react";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { useDownloadResult } from "@/app/components/tool/shared/hooks/useDownloadResult";
import DownloadResultButton from "@/app/components/tool/shared/DownloadResultButton";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import {
  computeImplantation,
  formatHumanDate,
  formatShortDate,
  implantationBucket,
  type ImplantationFormState,
  type ImplantationInvalidReason,
  type ImplantationMode,
  type ImplantationResult,
  type ImplantationResultOk,
} from "@/app/utils/tools/implantation-calculator-compute";
import {
  CYCLE_LENGTH_DEFAULT,
  CYCLE_LENGTH_MAX,
  CYCLE_LENGTH_MIN,
} from "@/app/data/tools/implantation-calculator-config";

interface Props {
  afterContent?: ReactNode;
}

const DEFAULT_STATE: ImplantationFormState = {
  mode: "ovulation",
  ovulationRaw: "",
  lmpRaw: "",
  cycleLength: String(CYCLE_LENGTH_DEFAULT),
};

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ErrorMessage({ reason }: { reason: ImplantationInvalidReason }) {
  const message: Record<ImplantationInvalidReason, string> = {
    missing_ovulation: "Please enter your ovulation date.",
    missing_lmp: "Please enter the first day of your last period.",
    unparseable_date: "That date looks malformed. Try yyyy-mm-dd.",
    future_date: "That date can't be in the future.",
    date_too_old:
      "That date is too far in the past for this calculator. If you might be pregnant, try a pregnancy calculator.",
    cycle_out_of_range: `Cycle length must be between ${CYCLE_LENGTH_MIN} and ${CYCLE_LENGTH_MAX} days.`,
  };
  return <p className="tool-error">{message[reason]}</p>;
}

function ResultPanel({
  result,
  onRestart,
  resultRef,
  onDownload,
}: {
  result: ImplantationResultOk;
  onRestart: () => void;
  resultRef: RefObject<HTMLDivElement | null>;
  onDownload: () => void | Promise<void>;
}) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("implantation-calculator", "cta_clicked", {
      cta_type: "talk_to_august",
      mode: result.mode,
    });
    openAugustChat(
      `Hi August. I used the implantation calculator. My estimated ovulation date is ${formatHumanDate(result.ovulationDate)} and the most likely implantation date is ${formatHumanDate(result.mostLikelyDate)}. I'd like to talk about early pregnancy signs and when to test.`,
    );
  }, [result]);

  return (
    <div ref={resultRef} className="tool-calc-result-stack">
      <div className="flex justify-end" data-skip-screenshot="true">
        <DownloadResultButton onClick={onDownload} />
      </div>

      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Most likely implantation</span>
        <div className="tool-calc-value-row">
          <span
            className="tool-calc-value"
            style={{ fontSize: "1.75rem", lineHeight: 1.15 }}
          >
            {formatHumanDate(result.mostLikelyDate)}
          </span>
        </div>
        <p className="tool-calc-result-desc">
          Based on an{" "}
          {result.ovulationWasDerived ? "estimated " : ""}ovulation date of{" "}
          <strong>{formatHumanDate(result.ovulationDate)}</strong>, day 9 after
          ovulation is when implantation is most often reported.
        </p>

        <div className="tool-calc-meta-row no-border-top">
          <span>Implantation window</span>
          <strong>
            {formatShortDate(result.windowStart)} to{" "}
            {formatShortDate(result.windowEnd)}
          </strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Earliest reliable home test</span>
          <strong>{formatShortDate(result.earliestTestDate)}</strong>
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
        <span className="tool-calc-section-label">Day by day</span>
        <p className="tool-calc-table-caption">
          DPO = days past ovulation. The peak around day 9 is when most
          pregnancies are reported to implant.
        </p>
        <div className="tool-calc-table" role="table">
          {result.days.map((row) => {
            const isPeak = row.probability === "most-common";
            return (
              <div
                key={row.dpo}
                role="row"
                className={
                  isPeak
                    ? "tool-calc-table-row tool-calc-table-row--active"
                    : "tool-calc-table-row"
                }
              >
                <div className="tool-calc-table-cell-label">
                  <span className="tool-calc-table-label">
                    {row.dpo} DPO
                  </span>
                  <span className="tool-calc-table-helper">{row.label}</span>
                </div>
                <div className="tool-calc-table-cell-value">
                  <strong>{formatShortDate(row.date)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ImplantationCalculator({ afterContent }: Props) {
  const [state, setState] = useState<ImplantationFormState>(DEFAULT_STATE);
  const [submitted, setSubmitted] = useState(false);

  const { markStarted, markCompleted } = useCalculatorAnalytics(
    "implantation-calculator",
  );

  const result = useMemo<ImplantationResult>(
    () =>
      submitted
        ? computeImplantation(state)
        : { kind: "invalid", reason: "missing_ovulation" },
    [submitted, state],
  );

  const today = useMemo(() => todayIso(), []);

  const update = useCallback(
    (patch: Partial<ImplantationFormState>) => {
      setState((prev) => ({ ...prev, ...patch }));
      markStarted();
      for (const [field, value] of Object.entries(patch)) {
        track("implantation_calculator_field_change", {
          field,
          has_value: Boolean(value),
        });
      }
    },
    [markStarted],
  );

  const setMode = useCallback(
    (mode: ImplantationMode) => {
      update({ mode });
    },
    [update],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      markStarted();
      setSubmitted(true);
    },
    [markStarted],
  );

  const handleRestart = useCallback(() => {
    trackToolEvent("implantation-calculator", "cta_clicked", {
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
    const sig = implantationBucket(result);
    markCompleted(sig, {
      mode: result.mode,
      cycle_length: result.cycleLength,
      ovulation_derived: result.ovulationWasDerived,
    });
  }, [submitted, result, markCompleted]);

  const showResults = submitted && result.kind === "ok";
  const resultOk = result.kind === "ok" ? result : null;

  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "implantation-calculator",
    filename: resultOk
      ? `implantation-${resultOk.mostLikelyDate}`
      : "implantation",
    heading: "Implantation Window",
    subtitle: resultOk
      ? `Implantation Report • ${formatHumanDate(resultOk.mostLikelyDate)}`
      : "Implantation Report",
    toolName: "Implantation Calculator",
    maxPageHeight : 1300
  });

  useEffect(() => {
    trackToolEvent("implantation-calculator", "section_completed", {
      section: showResults ? "result" : "form",
    });
  }, [showResults]);

  const submitDisabled =
    state.mode === "ovulation" ? !state.ovulationRaw : !state.lmpRaw;

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Implantation</span> Calculator
          </>
        ),
        tagline:
          "Estimate when implantation may have happened from your ovulation date, or back-calculate from your last period and cycle length.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card implantation-calc-card">
              {!showResults ? (
                <form onSubmit={handleSubmit} className="tool-calc-step-body">
                  <div className="tool-calc-step-header">
                    <h2 className="tool-step-title">When did you ovulate?</h2>
                    <p className="tool-step-subtitle">
                      Pick how you want to calculate.
                    </p>
                  </div>

                  <div
                    className="tool-chip-group tool-chip-group--connected"
                    role="tablist"
                    aria-label="Calculation mode"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={state.mode === "ovulation"}
                      className={
                        state.mode === "ovulation"
                          ? "tool-chip tool-chip--active"
                          : "tool-chip"
                      }
                      onClick={() => setMode("ovulation")}
                    >
                      Ovulation date
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={state.mode === "lmp"}
                      className={
                        state.mode === "lmp"
                          ? "tool-chip tool-chip--active"
                          : "tool-chip"
                      }
                      onClick={() => setMode("lmp")}
                    >
                      Last period date
                    </button>
                  </div>

                  <div className="tool-calc-form-grid">
                    {state.mode === "ovulation" ? (
                      <div className="tool-form-group tool-calc-form-span-2">
                        <label
                          htmlFor="implantation-ovulation"
                          className="tool-form-label"
                        >
                          Ovulation date
                        </label>
                        <input
                          id="implantation-ovulation"
                          type="date"
                          className="tool-input"
                          max={today}
                          value={state.ovulationRaw}
                          onChange={(e) =>
                            update({ ovulationRaw: e.target.value })
                          }
                          required
                        />
                      </div>
                    ) : (
                      <>
                        <div className="tool-form-group tool-calc-form-span-2">
                          <label
                            htmlFor="implantation-lmp"
                            className="tool-form-label"
                          >
                            First day of your last period
                          </label>
                          <input
                            id="implantation-lmp"
                            type="date"
                            className="tool-input"
                            max={today}
                            value={state.lmpRaw}
                            onChange={(e) =>
                              update({ lmpRaw: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="tool-form-group tool-calc-form-span-2">
                          <label
                            htmlFor="implantation-cycle"
                            className="tool-form-label"
                          >
                            Average cycle length (days)
                          </label>
                          <input
                            id="implantation-cycle"
                            type="number"
                            inputMode="numeric"
                            className="tool-input"
                            min={CYCLE_LENGTH_MIN}
                            max={CYCLE_LENGTH_MAX}
                            value={state.cycleLength}
                            onChange={(e) =>
                              update({ cycleLength: e.target.value })
                            }
                            onBlur={(e) => {
                              if (e.target.value.trim() === "") {
                                update({
                                  cycleLength: String(CYCLE_LENGTH_DEFAULT),
                                });
                              }
                            }}
                          />
                          <p
                            style={{
                              margin: "8px 0 0",
                              fontSize: "0.8rem",
                              color: "var(--text-tertiary)",
                              lineHeight: 1.5,
                            }}
                          >
                            ACOG considers {CYCLE_LENGTH_MIN + 1} to 35 days
                            typical. Outside that range, talk to a clinician.
                          </p>
                        </div>
                      </>
                    )}
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
                      disabled={submitDisabled}
                    >
                      Show my implantation window
                      <ArrowRightIcon />
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
                    result={result as ImplantationResultOk}
                    onRestart={handleRestart}
                    resultRef={resultRef}
                    onDownload={handleDownload}
                  />
                </motion.div>
              )}
            </div>
            <p className="tl-disclaimer">
              All calculations run in your browser. Nothing you enter is sent to
              a server or stored. Results are estimates based on average
              biology; for irregular cycles, late ovulation, or fertility
              concerns, talk to a healthcare provider.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
