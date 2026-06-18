"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { fmtInt } from "@/app/utils/tools/health-math";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import {
  computeThcDetox,
  formatHumanDate,
  thcDetoxBucket,
  type ThcDetoxFormState,
  type ThcDetoxResult,
  type ThcDetoxResultOk,
} from "@/app/utils/tools/thc-detox-calculator-compute";
import {
  BMI_OPTIONS,
  FREQUENCY_OPTIONS,
  TEST_OPTIONS,
  type TestType,
  type UsageFrequency,
} from "@/app/data/tools/thc-detox-calculator-config";
import { ArrowRightIcon } from "@phosphor-icons/react";
interface Props {
  afterContent?: ReactNode;
}

const DEFAULT_STATE: ThcDetoxFormState = {
  frequency: null,
  testType: "urine",
  bmi: "normal",
  lastUseRaw: "",
};

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ErrorMessage({ reason }: { reason: string }) {
  const messages: Record<string, string> = {
    missing_frequency: "Please pick how often you've been using.",
    missing_test_type: "Please pick a test type.",
    missing_bmi: "Please pick a body composition range.",
    unparseable_date: "That date looks malformed — try yyyy-mm-dd.",
    future_date: "Last-use date can't be in the future.",
    hair_single_use:
      "Hair tests very rarely detect a single use. The result for hair-+-single use isn't meaningful.",
  };
  return <p className="tool-error">{messages[reason] ?? "Please review your inputs."}</p>;
}

function StatusBadge({ status }: { status: ThcDetoxResultOk["status"] }) {
  const map: Record<
    ThcDetoxResultOk["status"],
    { label: string; modifier: string }
  > = {
    "likely-clear": {
      label: "Likely clear",
      modifier: "detox-status-badge--clear",
    },
    borderline: {
      label: "Borderline — could go either way",
      modifier: "detox-status-badge--borderline",
    },
    "still-detectable": {
      label: "Still detectable",
      modifier: "detox-status-badge--detectable",
    },
  };
  const v = map[status];
  return <span className={`detox-status-badge ${v.modifier}`}>{v.label}</span>;
}

function ResultPanel({
  result,
  onRestart,
}: {
  result: ThcDetoxResultOk;
  onRestart: () => void;
}) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("thc-detox-calculator", "cta_clicked", {
      cta_type: "talk_to_august",
      test_type: result.testType,
      frequency: result.frequency,
      bmi: result.bmi,
      status: result.status,
    });
    openAugustChat(
      `Hi August. I used the THC detection calculator for a ${result.testType} test. The estimated window from last use is ${result.windowMinDays}-${result.windowMaxDays} days. I'd like to talk about realistic next steps.`,
    );
  }, [result]);

  const frequencyLabel = FREQUENCY_OPTIONS.find(
    (o) => o.value === result.frequency,
  )?.label;
  const testLabel = TEST_OPTIONS.find((o) => o.value === result.testType)?.label;

  return (
    <div className="tool-calc-result-stack">
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Estimated detection window</span>
        <div className="tool-calc-value-row">
          <span className="tool-calc-value">
            {fmtInt(result.windowMinDays)}–{fmtInt(result.windowMaxDays)}
          </span>
          <span className="tool-calc-value-unit">days</span>
        </div>
        <p className="tool-calc-result-desc">
          For a {testLabel?.toLowerCase()} test with{" "}
          <strong>{frequencyLabel?.toLowerCase()}</strong> use,
          measured from your last use date.
        </p>

        <div style={{ margin: "12px 0" }}>
          <StatusBadge status={result.status} />
        </div>

        <div className="tool-calc-meta-row no-border-top">
          <span>Days since last use</span>
          <strong>{fmtInt(result.daysSinceLastUse)}</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Earliest likely-clear date</span>
          <strong>{formatHumanDate(result.earliestClearDate)}</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Conservative clear date</span>
          <strong>{formatHumanDate(result.conservativeClearDate)}</strong>
        </div>
        {result.status !== "likely-clear" && (
          <div className="tool-calc-meta-row">
            <span>Days remaining (range)</span>
            <strong>
              {fmtInt(result.daysRemainingMin)}–{fmtInt(result.daysRemainingMax)}
            </strong>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center gap-4 flex-wrap">
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
        <span className="tool-calc-section-label">Important caveats</span>
        <p className="tool-calc-table-caption">
          These windows are population averages from cannabis pharmacokinetic
          literature. Individual variation is large.
        </p>
        <ul
          style={{
            margin: 0,
            // paddingLeft: 18,
            fontSize: "0.88rem",
            lineHeight: 1.65,
            color: "var(--text-secondary)",
          }}
        >
          <li className="add-border-top">
            BMI is a rough proxy for fat mass. THC is fat-soluble, so higher
            body fat usually means longer detection.
          </li>
          <li className="add-border-top">
            Hair tests can detect use up to ~90 days back; they rarely catch a
            single use.
          </li>
          <li className="add-border-top">
            Exercising right before a urine test can temporarily{" "}
            <em>raise</em> THC-COOH levels in chronic users.
          </li>
          <li className="add-border-top">
            This is not a guarantee when stakes are high, allow more buffer
            than the calculator suggests.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function ThcDetoxCalculator({ afterContent }: Props) {
  const [state, setState] = useState<ThcDetoxFormState>(DEFAULT_STATE);
  const [submitted, setSubmitted] = useState(false);

  const { markStarted, markCompleted } = useCalculatorAnalytics(
    "thc-detox-calculator",
  );

  const result = useMemo<ThcDetoxResult>(
    () =>
      submitted
        ? computeThcDetox(state)
        : { kind: "invalid", reason: "missing_frequency" },
    [submitted, state],
  );

  const today = useMemo(() => todayIso(), []);

  const update = useCallback(
    (patch: Partial<ThcDetoxFormState>) => {
      setState((prev) => ({ ...prev, ...patch }));
      markStarted();
    },
    [markStarted],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!state.frequency) return;
      setSubmitted(true);
    },
    [state.frequency],
  );

  const handleRestart = useCallback(() => {
    trackToolEvent("thc-detox-calculator", "cta_clicked", {
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
    const sig = thcDetoxBucket(result);
    markCompleted(sig, {
      test_type: result.testType,
      frequency: result.frequency,
      bmi: result.bmi,
      status: result.status,
      window_max: result.windowMaxDays,
    });
  }, [submitted, result, markCompleted]);

  const showResults = submitted && result.kind === "ok";

  useEffect(() => {
    trackToolEvent("thc-detox-calculator", "section_completed", {
      section: showResults ? "result" : "form",
    });
  }, [showResults]);

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">THC Detox</span> Calculator
          </>
        ),
        tagline:
          "Estimate how long THC stays detectable in your system, by test type, usage frequency, and body composition.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card">
              {!showResults ? (
                <form onSubmit={handleSubmit} className="tool-calc-step-body">
                  <div className="tool-calc-step-header">
                    <h2 className="tool-step-title">Your situation</h2>
                    <p className="tool-step-subtitle">
                      Four short questions to estimate your detection window.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                    <div className="tool-form-group tool-calc-form-span-2">
                      <label
                        htmlFor="thc-frequency"
                        className="tool-form-label"
                      >
                        Usage frequency
                      </label>
                      <select
                        id="thc-frequency"
                        className="tool-input"
                        value={state.frequency ?? ""}
                        onChange={(e) => {
                          const v = (e.target.value || null) as
                            | UsageFrequency
                            | null;
                          track("thc_detox_calculator_frequency_change", {
                            frequency: v ?? "none",
                          });
                          update({ frequency: v });
                        }}
                      >
                        <option value="" disabled>
                          Select usage frequency
                        </option>
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {state.frequency && (
                        <p
                          style={{
                            margin: "8px 0 0",
                            fontSize: "0.8rem",
                            color: "var(--text-tertiary)",
                            lineHeight: 1.5,
                          }}
                        >
                          {
                            FREQUENCY_OPTIONS.find(
                              (o) => o.value === state.frequency,
                            )?.helper
                          }
                        </p>
                      )}
                    </div>

                    <div className="tool-form-group tool-calc-form-span-2">
                      <label
                        htmlFor="thc-test-type"
                        className="tool-form-label"
                      >
                        Test type
                      </label>
                      <select
                        id="thc-test-type"
                        className="tool-input"
                        value={state.testType}
                        onChange={(e) => {
                          const v = e.target.value as TestType;
                          track("thc_detox_calculator_test_type_change", {
                            test_type: v,
                          });
                          update({ testType: v });
                        }}
                      >
                        {TEST_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "0.8rem",
                          color: "var(--text-tertiary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {
                          TEST_OPTIONS.find((o) => o.value === state.testType)
                            ?.helper
                        }
                      </p>
                    </div>

                    <div className="tool-form-group tool-calc-form-span-2">
                      <label className="tool-form-label">
                        Body composition
                      </label>
                      <select
                        className="tool-input"
                        value={state.bmi}
                        onChange={(e) => {
                          const v = e.target.value as ThcDetoxFormState["bmi"];
                          track("thc_detox_calculator_bmi_change", { bmi: v });
                          update({ bmi: v });
                        }}
                      >
                        {BMI_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "0.8rem",
                          color: "var(--text-tertiary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {
                          BMI_OPTIONS.find((o) => o.value === state.bmi)
                            ?.helper
                        }
                      </p>
                    </div>

                    <div className="tool-form-group tool-calc-form-span-2">
                      <label
                        htmlFor="thc-last-use"
                        className="tool-form-label"
                      >
                        Date of last use (optional)
                      </label>
                      <input
                        id="thc-last-use"
                        type="date"
                        className="tool-input"
                        max={today}
                        value={state.lastUseRaw}
                        onChange={(e) => {
                          track("thc_detox_calculator_last_use_change", {
                            has_value: Boolean(e.target.value),
                          });
                          update({ lastUseRaw: e.target.value });
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
                        Defaults to today if blank.
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
                      disabled={!state.frequency}
                    >
                      Calculate
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
                    result={result as ThcDetoxResultOk}
                    onRestart={handleRestart}
                  />
                </motion.div>
              )}
            </div>
            <p className="tl-disclaimer">
              Educational estimate only — not a guarantee against a positive
              test, and not medical, legal, or employment advice. Individual
              clearance varies widely.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
