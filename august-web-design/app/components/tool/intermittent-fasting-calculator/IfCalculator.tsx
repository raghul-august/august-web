"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  BatteryChargingIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  FlameIcon,
  ForkKnifeIcon,
  LightningIcon,
  MinusIcon,
  MoonIcon,
  PlusIcon,
  RecycleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { ToolAuthGate } from "@/components/auth";
import { track, trackToolEvent } from "@/app/utils/analytics";
import {
  CUSTOM_FAST_HOURS_DEFAULT,
  CUSTOM_FAST_HOURS_MAX,
  CUSTOM_FAST_HOURS_MIN,
  FIRST_MEAL_MAX_MINUTES,
  FIRST_MEAL_MIN_MINUTES,
  FIRST_MEAL_STEP_MINUTES,
  type DifficultyTier,
  type MilestoneIcon as MilestoneIconKey,
  PROTOCOLS,
  type Protocol,
  type ProtocolId,
  QUICK_FIRST_MEAL_PRESETS,
} from "@/app/data/tools/intermittent-fasting-calculator-config";
import {
  computeIfSchedule,
  DEFAULT_IF_STATE,
  formatClock,
  type IfFormState,
  type IfInvalidReason,
  type IfResult,
  type IfResultCalorieRestricted,
  type IfResultTimeRestricted,
  ifCalculatorBucket,
} from "@/app/utils/tools/intermittent-fasting-calculator-compute";

interface Props {
  afterContent?: ReactNode;
}

function difficultyClass(tier: DifficultyTier): string {
  switch (tier) {
    case "Beginner":
      return "if-difficulty-badge--beginner";
    case "Intermediate":
      return "if-difficulty-badge--intermediate";
    case "Advanced":
      return "if-difficulty-badge--advanced";
    case "Expert":
      return "if-difficulty-badge--expert";
  }
}

function MilestoneIcon({ icon }: { icon: MilestoneIconKey }) {
  switch (icon) {
    case "fed":
      return <ForkKnifeIcon size={20} />;
    case "battery":
      return <BatteryChargingIcon size={20} />;
    case "fire":
      return <FireIcon size={20} />;
    case "bolt":
      return <LightningIcon size={20} />;
    case "recycle":
      return <RecycleIcon size={20} />;
    case "deep":
      return <FlameIcon size={20} />;
    case "renew":
      return <SparkleIcon size={20} />;
  }
}

function ErrorMessage({ reason }: { reason: IfInvalidReason }) {
  const message: Record<IfInvalidReason, string> = {
    first_meal_out_of_range:
      "Pick a first meal time within the day (00:00 to 23:45).",
    custom_fast_out_of_range: `Custom fasting hours must be between ${CUSTOM_FAST_HOURS_MIN} and ${CUSTOM_FAST_HOURS_MAX}.`,
  };
  return <p className="tool-error">{message[reason]}</p>;
}

function ProtocolCard({
  protocol,
  checked,
  onSelect,
}: {
  protocol: Protocol;
  checked: boolean;
  onSelect: (id: ProtocolId) => void;
}) {
  return (
    <div
      role="radio"
      tabIndex={0}
      aria-checked={checked}
      className="if-protocol-card"
      onClick={() => onSelect(protocol.id)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onSelect(protocol.id);
        }
      }}
    >
      <span className="if-protocol-radio" aria-hidden="true" />
      <div className="if-protocol-body">
        <div className="if-protocol-top">
          <span className="if-protocol-label">{protocol.label}</span>
          <span
            className={`if-difficulty-badge ${difficultyClass(protocol.difficulty)}`}
          >
            {protocol.difficulty}
          </span>
        </div>
        <p className="if-protocol-desc">{protocol.description}</p>
      </div>
    </div>
  );
}

function clampFirstMeal(m: number): number {
  if (m < FIRST_MEAL_MIN_MINUTES) return FIRST_MEAL_MIN_MINUTES;
  if (m > FIRST_MEAL_MAX_MINUTES) return FIRST_MEAL_MAX_MINUTES;
  return m;
}

function CalorieRestrictedPanel({
  result,
  onRestart,
}: {
  result: IfResultCalorieRestricted;
  onRestart: () => void;
}) {
  const talkHref = `/chat?msg=${encodeURIComponent(
    "Hi August. I'm planning to try the 5:2 fasting protocol (eat normally 5 days a week, 500 to 600 kcal on 2 non-consecutive days). What should I think about for nutrition on the restricted days?",
  )}`;

  return (
    <div className="if-result-stack">
      <div className="if-protocol-summary">
        <div className="if-protocol-summary-text">
          <span className="if-protocol-summary-eyebrow">Your protocol</span>
          <span className="if-protocol-summary-name">
            {result.protocol.label}
          </span>
        </div>
        <span
          className={`if-difficulty-badge ${difficultyClass(result.protocol.difficulty)}`}
        >
          {result.protocol.difficulty}
        </span>
        <p className="if-protocol-summary-desc">{result.protocol.description}</p>
      </div>

      <div className="if-cr-card">
        <span className="if-cr-headline">How this works</span>
        <p className="if-cr-body">
          5:2 is a weekly pattern, not a daily eating window. On 5 days each
          week you eat normally. On 2 non-consecutive days you cap intake at a
          modest calorie target.
        </p>
        <span className="if-cr-target">
          Restricted-day target: 500 to 600 kcal
        </span>
        <p className="if-cr-body">
          Most people split the restricted-day calories across a small
          breakfast and dinner, or a single larger meal. Stay well hydrated and
          favor high-protein, high-fiber foods to manage hunger.
        </p>
      </div>

      <div className="flex justify-center items-center gap-4">
        <Link
          href={talkHref}
          className="tool-btn tool-btn--primary"
          onClick={() =>
            trackToolEvent("intermittent-fasting-calculator", "cta_clicked", {
              cta_type: "talk_to_august",
              protocol: result.protocol.id,
            })
          }
        >
          Talk to august
        </Link>
        <button
          type="button"
          className="tool-btn tool-btn--ghost"
          onClick={onRestart}
        >
          Start over
        </button>
      </div>
    </div>
  );
}

function TimeRestrictedPanel({
  result,
  onRestart,
}: {
  result: IfResultTimeRestricted;
  onRestart: () => void;
}) {
  const talkHref = `/chat?msg=${encodeURIComponent(
    `Hi August. I'm planning an intermittent fasting schedule using the ${result.protocol.label} protocol. My eating window will be ${result.eatingWindowLabel}. What should I think about for nutrition and breaking my fast?`,
  )}`;

  return (
    <div className="if-result-stack">
      <div className="if-protocol-summary">
        <div className="if-protocol-summary-text">
          <span className="if-protocol-summary-eyebrow">Your protocol</span>
          <span className="if-protocol-summary-name">
            {result.protocol.label}
          </span>
        </div>
        <span
          className={`if-difficulty-badge ${difficultyClass(result.protocol.difficulty)}`}
        >
          {result.protocol.difficulty}
        </span>
        <p className="if-protocol-summary-desc">{result.protocol.description}</p>
      </div>

      <div className="if-window-grid">
        <div className="if-window-card if-window-card--eat">
          <span className="if-window-icon" aria-hidden="true">
            <ForkKnifeIcon size={20} />
          </span>
          <div className="if-window-body">
            <span className="if-window-label">Eating window</span>
            <span className="if-window-value">{result.eatingWindowLabel}</span>
            <span className="if-window-helper">
              {result.eatHours} {result.eatHours === 1 ? "hour" : "hours"} ·{" "}
              {result.protocol.recommendedMeals}
            </span>
          </div>
        </div>
        <div className="if-window-card if-window-card--fast">
          <span className="if-window-icon" aria-hidden="true">
            <MoonIcon size={20} />
          </span>
          <div className="if-window-body">
            <span className="if-window-label">Fasting window</span>
            <span className="if-window-value">{result.fastingWindowLabel}</span>
            <span className="if-window-helper">{result.fastHours} hours</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4">
        <Link
          href={talkHref}
          className="tool-btn tool-btn--primary"
          onClick={() =>
            trackToolEvent("intermittent-fasting-calculator", "cta_clicked", {
              cta_type: "talk_to_august",
              protocol: result.protocol.id,
              fast_hours: result.fastHours,
            })
          }
        >
          Talk to august
        </Link>
        <button
          type="button"
          className="tool-btn tool-btn--ghost"
          onClick={onRestart}
        >
          Start over
        </button>
      </div>

      <div className="if-section">
        <h3 className="if-section-title">Your daily schedule</h3>
        <div className="if-schedule" role="list">
          {result.schedule.map((event) => (
            <div key={event.id} className="if-schedule-row" role="listitem">
              <span className="if-schedule-time">{event.time}</span>
              <span className="if-schedule-label">{event.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="if-section">
        <h3 className="if-section-title">Metabolic milestones</h3>
        <p className="if-section-caption">
          Estimated times based on when your eating window closes. Individual
          timing varies with activity, glycogen stores, and the macronutrient
          mix of your last meal.
        </p>
        <div className="if-milestones">
          {result.milestones.map((m) => {
            const reachedClass = m.withinFast ? " if-milestone--reached" : "";
            return (
              <div key={m.id} className={`if-milestone${reachedClass}`}>
                <span className="if-milestone-icon" aria-hidden="true">
                  <MilestoneIcon icon={m.icon} />
                </span>
                <div className="if-milestone-body">
                  <div className="if-milestone-head">
                    <span className="if-milestone-label">{m.label}</span>
                    <span className="if-milestone-approx">{m.approxLabel}</span>
                  </div>
                  <span className="if-milestone-desc">{m.description}</span>
                  {m.withinFast ? (
                    <span className="if-milestone-status if-milestone-status--reached">
                      <CheckCircleIcon size={14} weight="fill" />
                      Reached at {m.reachedAt}
                    </span>
                  ) : (
                    <span className="if-milestone-status if-milestone-status--beyond">
                      <ClockIcon size={14} />
                      Would occur at {m.reachedAt} (beyond your fast)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="if-section">
        <h3 className="if-section-title">Protocol information</h3>
        <div className="if-protocol-info">
          <div className="if-protocol-info-item">
            <span className="if-protocol-info-key">Difficulty</span>
            <span className="if-protocol-info-value">
              {result.protocol.difficulty}
            </span>
          </div>
          <div className="if-protocol-info-item">
            <span className="if-protocol-info-key">Calorie restriction</span>
            <span className="if-protocol-info-value">
              {result.protocol.calorieRestriction}
            </span>
          </div>
          <div className="if-protocol-info-item">
            <span className="if-protocol-info-key">Recommended meals</span>
            <span className="if-protocol-info-value">
              {result.protocol.recommendedMeals}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function IfCalculator({ afterContent }: Props) {
  const [state, setState] = useState<IfFormState>(DEFAULT_IF_STATE);
  const [submitted, setSubmitted] = useState(false);

  const { markStarted, markCompleted } =
    useCalculatorAnalytics("intermittent-fasting-calculator");

  const result = useMemo<IfResult>(
    () =>
      submitted
        ? computeIfSchedule(state)
        : { kind: "invalid", reason: "first_meal_out_of_range" },
    [submitted, state],
  );

  const update = useCallback(
    (patch: Partial<IfFormState>) => {
      setState((prev) => ({ ...prev, ...patch }));
      markStarted();
      for (const [field, value] of Object.entries(patch)) {
        track("intermittent_fasting_calculator_field_change", {
          field,
          has_value: value !== undefined && value !== null,
        });
      }
    },
    [markStarted],
  );

  const selectProtocol = useCallback(
    (id: ProtocolId) => {
      update({ protocolId: id });
    },
    [update],
  );

  const stepFirstMeal = useCallback(
    (deltaMinutes: number) => {
      update({
        firstMealMinutes: clampFirstMeal(
          state.firstMealMinutes + deltaMinutes,
        ),
      });
    },
    [state.firstMealMinutes, update],
  );

  const setFirstMealPreset = useCallback(
    (minutes: number) => {
      update({ firstMealMinutes: minutes });
    },
    [update],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      markStarted();
      setSubmitted(true);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [markStarted],
  );

  const handleRestart = useCallback(() => {
    trackToolEvent("intermittent-fasting-calculator", "cta_clicked", {
      cta_type: "start_over",
    });
    setSubmitted(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (!submitted || result.kind === "invalid") return;
    const sig = ifCalculatorBucket(result);
    markCompleted(sig, {
      protocol: result.protocol.id,
      kind: result.kind,
      ...(result.kind === "time-restricted" && {
        fast_hours: result.fastHours,
        first_meal_minutes: result.firstMealMinutes,
      }),
    });
  }, [submitted, result, markCompleted]);

  const showResults = submitted && result.kind !== "invalid";

  const selectedProtocol = useMemo(
    () => PROTOCOLS.find((p) => p.id === state.protocolId) ?? PROTOCOLS[0],
    [state.protocolId],
  );

  const isCustom = selectedProtocol.id === "custom";
  const isCalorieRestricted = selectedProtocol.kind === "calorie-restricted";

  const submitDisabled =
    isCustom &&
    (!Number.isFinite(state.customFastHours) ||
      state.customFastHours < CUSTOM_FAST_HOURS_MIN ||
      state.customFastHours > CUSTOM_FAST_HOURS_MAX);

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Intermittent Fasting</span>{" "}
            Calculator
          </>
        ),
        tagline:
          "Plan your eating and fasting windows for 16:8, 18:6, 20:4, OMAD, or 5:2 and see when key metabolic milestones land.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card if-calc-card">
              {!showResults ? (
                <form onSubmit={handleSubmit} className="tool-calc-step-body">
                  <div className="tool-calc-step-header">
                    <h2 className="tool-step-title">Choose your protocol</h2>
                    <p className="tool-step-subtitle">
                      Pick a fasting pattern. You can change it any time.
                    </p>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Fasting protocol"
                    className="if-protocol-list"
                  >
                    {PROTOCOLS.map((p) => (
                      <ProtocolCard
                        key={p.id}
                        protocol={p}
                        checked={state.protocolId === p.id}
                        onSelect={selectProtocol}
                      />
                    ))}
                  </div>

                  {isCustom && (
                    <div className="tool-calc-form-grid">
                      <div className="tool-form-group tool-calc-form-span-2">
                        <label
                          htmlFor="if-custom-fast"
                          className="tool-form-label"
                        >
                          Fasting hours per day
                        </label>
                        <input
                          id="if-custom-fast"
                          type="number"
                          inputMode="numeric"
                          className="tool-input"
                          min={CUSTOM_FAST_HOURS_MIN}
                          max={CUSTOM_FAST_HOURS_MAX}
                          value={state.customFastHours}
                          onChange={(e) =>
                            update({
                              customFastHours: Number(e.target.value),
                            })
                          }
                          onBlur={(e) => {
                            if (e.target.value.trim() === "") {
                              update({
                                customFastHours: CUSTOM_FAST_HOURS_DEFAULT,
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
                          Pick between {CUSTOM_FAST_HOURS_MIN} and{" "}
                          {CUSTOM_FAST_HOURS_MAX} hours of fasting. Eating
                          window will be {24 - state.customFastHours} hours.
                        </p>
                      </div>
                    </div>
                  )}

                  {!isCalorieRestricted && (
                    <>
                      <div className="tool-calc-step-header">
                        <h3 className="tool-step-title">
                          When do you want to eat your first meal?
                        </h3>
                        <p className="tool-step-subtitle">
                          This determines your eating window. Your fasting
                          period will end at this time.
                        </p>
                      </div>

                      <div className="if-time-stepper">
                        <button
                          type="button"
                          aria-label="Decrease time by 15 minutes"
                          className="if-time-step-btn"
                          onClick={() => stepFirstMeal(-FIRST_MEAL_STEP_MINUTES)}
                          disabled={
                            state.firstMealMinutes <=
                            FIRST_MEAL_MIN_MINUTES
                          }
                        >
                          <MinusIcon size={18} weight="bold" />
                        </button>
                        <span
                          className="if-time-display"
                          aria-live="polite"
                        >
                          {formatClock(state.firstMealMinutes)}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase time by 15 minutes"
                          className="if-time-step-btn"
                          onClick={() => stepFirstMeal(FIRST_MEAL_STEP_MINUTES)}
                          disabled={
                            state.firstMealMinutes >=
                            FIRST_MEAL_MAX_MINUTES
                          }
                        >
                          <PlusIcon size={18} weight="bold" />
                        </button>
                      </div>

                      <select
                        id="if-first-meal-preset"
                        aria-label="Quick first meal time"
                        className="tool-input if-time-preset-select"
                        value={
                          QUICK_FIRST_MEAL_PRESETS.includes(
                            state.firstMealMinutes,
                          )
                            ? state.firstMealMinutes
                            : ""
                        }
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (Number.isFinite(v)) setFirstMealPreset(v);
                        }}
                      >
                        <option value="" disabled>
                          Jump to a quick hour
                        </option>
                        {QUICK_FIRST_MEAL_PRESETS.map((minutes) => {
                          const hour = Math.floor(minutes / 60);
                          const label =
                            hour === 12
                              ? "12:00 PM"
                              : hour > 12
                                ? `${hour - 12}:00 PM`
                                : `${hour}:00 AM`;
                          return (
                            <option key={minutes} value={minutes}>
                              {label}
                            </option>
                          );
                        })}
                      </select>

                      <p className="if-time-helper">
                        Use the stepper for 15-minute precision, or jump to a
                        quick hour above.
                      </p>
                    </>
                  )}

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
                      Calculate my schedule
                      <ArrowRightIcon size={16} weight="bold" />
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {result.kind === "time-restricted" ? (
                    <TimeRestrictedPanel
                      result={result}
                      onRestart={handleRestart}
                    />
                  ) : result.kind === "calorie-restricted" ? (
                    <CalorieRestrictedPanel
                      result={result}
                      onRestart={handleRestart}
                    />
                  ) : null}
                </motion.div>
              )}
            </div>
            <p className="tl-disclaimer">
              All calculations run in your browser. Nothing you enter is sent
              to a server. Milestone times are estimates based on average
              physiology and vary by activity, glycogen stores, and prior meal
              composition.
            </p>
          </div>
        </section>
      }
      afterContent={
        <>
          {afterContent}
          <ToolAuthGate active={showResults} />
        </>
      }
    />
  );
}
