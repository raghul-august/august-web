"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import { useDownloadResult } from "@/app/components/tool/shared/hooks/useDownloadResult";
import DownloadResultButton from "@/app/components/tool/shared/DownloadResultButton";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import { ToolAuthGate } from "@/components/auth";
import {
  AGE_GUIDELINES,
  CYCLE_MAX_MINUTES,
  CYCLE_MIN_MINUTES,
  DEFAULT_CYCLE_MINUTES,
  DEFAULT_FALL_ASLEEP_MINUTES,
  FALL_ASLEEP_MAX_MINUTES,
  computeSleepResult,
  modeBucket,
  type AgeBand,
  type SleepFormState,
  type SleepMode,
  type SleepResult,
  type SleepResultOk,
} from "@/app/utils/tools/sleep-calculator-compute";

const MODE_OPTIONS = [
  { value: "wake-at", label: "Wake up at" },
  { value: "sleep-at", label: "Sleep at" },
  { value: "sleep-now", label: "Sleep now" },
];

const PERIOD_OPTIONS = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
];

const AGE_BAND_OPTIONS = AGE_GUIDELINES.map((g) => ({ value: g.id, label: g.label }));

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const v = String(i + 1);
  return { value: v, label: v };
});

const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const m = i * 5;
  const v = m.toString().padStart(2, "0");
  return { value: v, label: v };
});

const DEFAULT_STATE: SleepFormState = {
  mode: "wake-at",
  hourRaw: "7",
  minuteRaw: "00",
  period: "AM",
  ageBand: "adult",
  cycleMinutes: DEFAULT_CYCLE_MINUTES,
  fallAsleepMinutes: DEFAULT_FALL_ASLEEP_MINUTES,
};

function modeIntro(mode: SleepMode): { title: string; helper: string } {
  if (mode === "wake-at") {
    return {
      title: "What time do you need to wake up?",
      helper:
        "We'll work backward through 90-minute sleep cycles so you wake at the end of one instead of mid-cycle.",
    };
  }
  if (mode === "sleep-at") {
    return {
      title: "What time will you go to bed?",
      helper:
        "We'll project forward through full sleep cycles so your alarm lands between cycles, not in the middle of deep sleep.",
    };
  }
  return {
    title: "Going to sleep right now?",
    helper:
      "We'll use the current time on your device and show wake times that complete full sleep cycles.",
  };
}

function resultPrimaryLabel(mode: SleepMode): string {
  if (mode === "wake-at") return "Best bedtime";
  return "Best wake time";
}

function resultRowsLabel(mode: SleepMode): string {
  if (mode === "wake-at") return "If you go to bed at…";
  return "If you wake at…";
}

function resultRowsHelper(mode: SleepMode): string {
  if (mode === "wake-at") {
    return "Each row is a bedtime that finishes a full set of 90-minute cycles by your wake time, plus the time it takes you to fall asleep.";
  }
  return "Each row is a wake time that comes at the end of a full set of 90-minute cycles, after you've fallen asleep.";
}

function anchorLabel(mode: SleepMode): string {
  if (mode === "wake-at") return "Wake time";
  if (mode === "sleep-at") return "Bedtime";
  return "Sleeping at";
}

interface FormProps {
  state: SleepFormState;
  update: (patch: Partial<SleepFormState>) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

function SleepForm({ state, update, showAdvanced, onToggleAdvanced }: FormProps) {
  const intro = modeIntro(state.mode);

  const onModeChange = useCallback(
    (raw: string) => {
      const next = raw as SleepMode;
      if (next === state.mode) return;
      track("sleep_calculator_mode_change", { from: state.mode, to: next });
      update({ mode: next });
    },
    [state.mode, update],
  );

  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">{intro.title}</h2>
        <p className="tool-step-subtitle">{intro.helper}</p>
      </div>

      <div className="tool-calc-form-grid">
        <div className="tool-form-group">
          <label className="tool-form-label">Calculate</label>
          <SegmentedControl
            options={MODE_OPTIONS}
            value={state.mode}
            onChange={onModeChange}
            ariaLabel="Sleep calculation mode"
            className="tool-chip-group tool-chip-group--connected sleep-mode-group"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        {state.mode !== "sleep-now" && (
          <div className="tool-form-group ">
            <label className="tool-form-label">
              {state.mode === "wake-at" ? "Wake-up time" : "Bedtime"}
            </label>
            <div className="sleep-time-row" role="group" aria-label="Time picker">
              <div className="sleep-time-picker">
                <select
                  className="tool-input sleep-time-select"
                  value={state.hourRaw}
                  aria-label="Hour"
                  onChange={(e) => update({ hourRaw: e.target.value })}
                >
                  {HOUR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="sleep-time-colon" aria-hidden="true">:</span>
                <select
                  className="tool-input sleep-time-select"
                  value={state.minuteRaw}
                  aria-label="Minute"
                  onChange={(e) => update({ minuteRaw: e.target.value })}
                >
                  {MINUTE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <SegmentedControl
                options={PERIOD_OPTIONS}
                value={state.period}
                onChange={(v) => update({ period: v as "AM" | "PM" })}
                ariaLabel="AM or PM"
                className="tool-chip-group tool-chip-group--connected sleep-period-group"
                buttonClassName="tool-chip"
                activeClassName="tool-chip--active"
              />
            </div>
          </div>
        )}

        {/* Age */}
        <div className="tool-form-group tool-calc-form-span-2 ">
          <label htmlFor="sleep-age" className="tool-form-label">Age group</label>
          <select
            id="sleep-age"
            className="tool-input"
            value={state.ageBand}
            onChange={(e) => {
              const v = e.target.value as AgeBand;
              track("sleep_calculator_age_change", { age: v });
              update({ ageBand: v });
            }}
          >
            {AGE_BAND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        className="sleep-advanced-toggle"
        onClick={onToggleAdvanced}
        aria-expanded={showAdvanced}
      >
        <span className={`sleep-advanced-chevron${showAdvanced ? " sleep-advanced-chevron--open" : ""}`} aria-hidden="true" />
        {showAdvanced ? "Hide" : "Show"} advanced settings
      </button>

      <AnimatePresence initial={false}>
        {showAdvanced && (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sleep-advanced-panel"
          >
            <div className="tool-calc-form-grid">
              <div className="tool-form-group">
                <label htmlFor="sleep-cycle" className="tool-form-label">
                  Sleep cycle length (minutes)
                </label>
                <input
                  id="sleep-cycle"
                  type="number"
                  inputMode="numeric"
                  min={CYCLE_MIN_MINUTES}
                  max={CYCLE_MAX_MINUTES}
                  className="tool-input"
                  value={state.cycleMinutes}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    update({
                      cycleMinutes: Number.isFinite(n) ? n : DEFAULT_CYCLE_MINUTES,
                    });
                  }}
                />
              </div>
              <div className="tool-form-group">
                <label htmlFor="sleep-buffer" className="tool-form-label">
                  Time to fall asleep (minutes)
                </label>
                <input
                  id="sleep-buffer"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={FALL_ASLEEP_MAX_MINUTES}
                  className="tool-input"
                  value={state.fallAsleepMinutes}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    update({
                      fallAsleepMinutes: Number.isFinite(n) ? n : DEFAULT_FALL_ASLEEP_MINUTES,
                    });
                  }}
                />
              </div>
            </div>
            <p className="sleep-advanced-note">
              The default 90-minute cycle and 15-minute fall-asleep buffer match
              what most clinicians use. Bump them if you know your own sleep
              latency or have tracker data suggesting a different cycle length.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultPanel({
  result,
  onTalkToAugust,
  onRestart,
}: {
  result: SleepResultOk;
  onTalkToAugust: () => void;
  onRestart: () => void;
}) {

  const primaryLabel = resultPrimaryLabel(result.mode);
  const rowsLabel = resultRowsLabel(result.mode);
  const rowsHelper = resultRowsHelper(result.mode);
  const isWakeMode = result.mode === "wake-at";
  const totalHours = result.bestRow.totalSleepLabel;
  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "sleep-calculator",
    filename: `sleep-schedule-${result.bestRow.clockLabel}`,
    heading: "Sleep Cycle Schedule",
    subtitle: `Sleep Cycle Report • ${
      isWakeMode
        ? `Wake at ${result.bestRow.clockLabel}`
        : `Bedtime ${result.bestRow.clockLabel}`
    }`,
    toolName: "Sleep Calculator",
  });

  return (
    <div ref={resultRef} className="tool-calc-result-stack">
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center" data-skip-screenshot="true">
       <button
        type="button"
        className="tool-btn tool-btn--primary mb-0"
        onClick={onTalkToAugust}
      >
        Talk to august
      </button>
      <button
        type="button"
        className="tool-btn tool-btn--ghost mb-0"
        onClick={onRestart}
      >
        Start over
      </button>
      </div>
      <div className="flex justify-end" data-skip-screenshot="true">
        <DownloadResultButton onClick={handleDownload} />
      </div>
      <div className="tool-calc-result-primary sleep-result-primary relative">
        <span className="tool-calc-section-label">{primaryLabel}</span>
        <div className="tool-calc-value-row sleep-result-value-row">
          <span className="tool-calc-value">{result.bestRow.clockLabel}</span>
        </div>
        <span className="sleep-best-pill absolute right-0 mr-2">
          {result.bestRow.cycles} sleep cycles : {totalHours}
        </span>
        <p className="tool-calc-result-desc">
          {isWakeMode
            ? "Go to bed at this time to finish a full set of sleep cycles by your "
            : "Set your alarm for this time to finish a full set of sleep cycles starting from your "}
          <strong>{result.anchorLabel}</strong>
          {isWakeMode ? " wake-up." : " bedtime."}
        </p>
        
        <div className='w-full'>
        <div className="tool-calc-meta-row sleep-result-meta grow shrink basis-0">
          <span>{anchorLabel(result.mode)}</span>
          <strong>{result.anchorLabel}</strong>
        </div>
        <div className="tool-calc-meta-row sleep-result-meta">
          <span>Recommended for your age</span>
          <strong>{result.ageGuideline.range}</strong>
        </div>
        <div className="tool-calc-meta-row sleep-result-meta">
          <span>Cycle length</span>
          <strong>
            {result.cycleMinutes} min 
          </strong>
        </div>
        <div className="tool-calc-meta-row sleep-result-meta">
          <span>Fall-asleep buffer</span>
          <strong>
            {result.fallAsleepMinutes} min
          </strong>
        </div>
        
        </div>
      </div>

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label">{rowsLabel}</span>
        <p className="tool-calc-table-caption">{rowsHelper}</p>
        <div className="tool-calc-table" role="table">
          {result.rows.map((row) => {
            const isBest = row.cycles === result.bestRow.cycles;
            const className = [
              "tool-calc-table-row",
              isBest ? "sleep-table-row--best" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div
                key={row.cycles}
                role="row"
                className={className}
                aria-current={isBest ? "true" : undefined}
              >
                <div className="tool-calc-table-cell-label">
                  <span className="tool-calc-table-label">{row.clockLabel}</span>
                  <span className="tool-calc-table-helper">
                    {row.cycles} cycle{row.cycles === 1 ? "" : "s"} ·{" "}
                    {row.totalSleepLabel}
                  </span>
                </div>
                <div className="tool-calc-table-cell-value">
                  {isBest ? (
                    <span className="sleep-table-best-tag">Best pick</span>
                  ) : row.recommended ? (
                    <span className="sleep-table-rec-tag">Recommended</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      
    </div>
  );
}

interface Props {
  afterContent?: ReactNode;
}

export default function SleepCalculator({ afterContent }: Props) {
  const [state, setState] = useState<SleepFormState>(DEFAULT_STATE);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const { markStarted, markCompleted, resetCompleted } = useCalculatorAnalytics("sleep-calculator");

  // Tick the live clock for sleep-now mode so the result updates each minute.
  useEffect(() => {
    if (state.mode !== "sleep-now") {
      setNowMinutes(null);
      return;
    }
    const update = () => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    };
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, [state.mode]);

  const update = useCallback((patch: Partial<SleepFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    markStarted();
  }, [markStarted]);

  const handleCalculate = useCallback(() => {
    setHasCalculated(true);
  }, []);

  const handleRestart = useCallback(() => {
    setState(DEFAULT_STATE);
    setShowAdvanced(false);
    setNowMinutes(null);
    setHasCalculated(false);
    resetCompleted();
  }, [resetCompleted]);

  const result = useMemo<SleepResult>(
    () => computeSleepResult(state, nowMinutes != null ? { nowMinutes } : {}),
    [state, nowMinutes],
  );

  useEffect(() => {
    if (result.kind !== "ok") return;
    // In sleep-now mode the anchor ticks every minute — exclude it from the
    // sig so we don't fire a "completed" event on every clock tick.
    const anchorPart = result.mode === "sleep-now" ? "now" : String(result.anchorMinutes);
    const sig = `${modeBucket(result.mode)}|${result.bestRow.cycles}|${anchorPart}|${state.ageBand}`;
    markCompleted(sig, {
      mode: result.mode,
      best_cycles: result.bestRow.cycles,
      anchor_time: result.anchorLabel,
      age_band: state.ageBand,
    });
  }, [result, state.ageBand, markCompleted]);

  const handleTalkToAugust = useCallback(() => {
    if (result.kind !== "ok") return;
    // track("tool_cta_clicked", {
    //   tool: "sleep-calculator",
    //   cta_type: "talk_to_august",
    //   mode: result.mode,
    //   best_cycles: result.bestRow.cycles,
    //   age_band: state.ageBand,
    // });
    trackToolEvent("sleep-calculator", "cta_clicked", {
      cta_type: "talk_to_august",
      mode: result.mode,
      best_cycles: result.bestRow.cycles,
      age_band: state.ageBand,
    });
    const action =
      result.mode === "wake-at"
        ? `go to bed at ${result.bestRow.clockLabel} to wake at ${result.anchorLabel}`
        : `wake at ${result.bestRow.clockLabel} after ${result.mode === "sleep-now" ? "going to sleep now" : `going to bed at ${result.anchorLabel}`}`;
    openAugustChat(
      `Hi, I just used the Sleep Calculator. It suggests I ${action} (${result.bestRow.cycles} cycles, ${result.bestRow.totalSleepLabel}). Can we talk about my sleep?`,
    );
  }, [result, state.ageBand]);

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Sleep</span> Calculator
          </>
        ),
        tagline:
          "Plan a bedtime or wake time around 90-minute sleep cycles so your alarm lands between cycles instead of mid-deep sleep — when groggy morning sleep inertia hits hardest.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card sleep-calc-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <SleepForm
                    state={state}
                    update={update}
                    showAdvanced={showAdvanced}
                    onToggleAdvanced={() => setShowAdvanced((s) => !s)}
                  />
                </motion.div>
              </AnimatePresence>

              {!hasCalculated && (
                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    className="tool-btn tool-btn--primary mb-0"
                    onClick={handleCalculate}
                  >
                    Calculate
                  </button>
                </div>
              )}

              {hasCalculated && (
                result.kind === "ok" ? (
                  <ResultPanel
                    result={result}
                    onTalkToAugust={handleTalkToAugust}
                    onRestart={handleRestart}
                  />
                ) : (
                  <p className="tool-error sleep-error">
                    Pick a valid hour and minute to see your sleep schedule.
                  </p>
                )
              )}
            </div>
            <ToolAuthGate active={hasCalculated && result.kind === "ok"} />
            <p className="tl-disclaimer">
              Educational estimate based on average 90-minute sleep cycles and
              the CDC and American Academy of Sleep Medicine recommended sleep
              hours. Not a substitute for a sleep study or clinician's advice.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
