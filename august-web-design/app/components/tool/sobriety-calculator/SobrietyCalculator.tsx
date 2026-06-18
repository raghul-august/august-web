"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { fmtInt } from "@/app/utils/tools/health-math";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import {
  computeSobriety,
  formatBreakdown,
  sobrietyBucket,
  type SobrietyResult,
  type SobrietyResultOk,
} from "@/app/utils/tools/sobriety-calculator-compute";
import {
  SOBRIETY_FROM_HELPER,
  SOBRIETY_FROM_LABEL,
  SOBRIETY_MILESTONES,
} from "@/app/data/tools/sobriety-calculator-config";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
interface Props {
  afterContent?: ReactNode;
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ResultPanel({
  result,
  onRestart,
}: {
  result: SobrietyResultOk;
  onRestart: () => void;
}) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("sobriety-calculator", "cta_clicked", {
      cta_type: "talk_to_august",
      days: result.days,
      bucket: sobrietyBucket(result.days),
    });
    openAugustChat(
      `Hi August. I'm marking ${result.days} day${result.days === 1 ? "" : "s"} of sobriety (${formatBreakdown(result.breakdown)}). I'd like to talk through how I'm doing and what good next steps look like.`,
    );
  }, [result]);

  return (
    <div className="tool-calc-result-stack">
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">You&apos;ve been sober for</span>
        <div className="tool-calc-value-row">
          <span className="tool-calc-value">{fmtInt(result.days)}</span>
          <span className="tool-calc-value-unit">
            {result.days === 1 ? "day" : "days"}
          </span>
        </div>
        <p className="tool-calc-result-desc">
          {formatBreakdown(result.breakdown)}
        </p>

        <div className="tool-calc-meta-row no-border-top">
          <span>Weeks</span>
          <strong>{fmtInt(result.weeks)}</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Months</span>
          <strong>{fmtInt(result.months)}</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Hours</span>
          <strong>{fmtInt(result.hours)}</strong>
        </div>
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

      {result.current && (
        <div className="tool-calc-result-primary" style={{ background: "var(--brand-subtle)" }}>
          <span className="tool-calc-section-label">Most recent milestone</span>
          <div className="tool-calc-value-row">
            <span
              className="tool-calc-value"
              style={{ fontSize: "1.75rem", lineHeight: 1.1 }}
            >
              {result.current.label}
            </span>
          </div>
          <p className="tool-calc-result-desc">{result.current.description}</p>
        </div>
      )}

      {result.next && (
        <div className="tool-calc-table-card">
          <span className="tool-calc-section-label">Next milestone</span>
          <p className="tool-calc-table-caption">
            <strong>{result.next.label}</strong> — {result.daysToNext}{" "}
            {result.daysToNext === 1 ? "day" : "days"} to go.
          </p>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "var(--surface-subtle)",
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.round(result.progress * 100)}%`,
                background: "var(--brand-primary)",
                transition: "width 600ms ease",
              }}
            />
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              color: "var(--text-tertiary)",
              lineHeight: 1.6,
            }}
          >
            {result.next.description}
          </p>
        </div>
      )}

     

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label">Milestone ladder</span>
        <p className="tool-calc-table-caption">
          Every milestone, with the date you reached it (or will reach it).
        </p>
        <div className="tool-calc-table" role="table">
          {SOBRIETY_MILESTONES.map((m) => {
            const reached = result.days >= m.days;
            const start = new Date(result.sobrietyDate + "T00:00:00");
            const target = new Date(start);
            target.setDate(start.getDate() + (m.days - 1));
            const dateStr = target.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <div
                key={m.id}
                role="row"
                className="tool-calc-table-row"
                style={{ opacity: reached ? 1 : 0.55 }}
              >
                <div className="tool-calc-table-cell-label">
                  <span className="tool-calc-table-label">
                    {reached ? "✓ " : ""}
                    {m.label}
                  </span>
                  <span className="tool-calc-table-helper">{dateStr}</span>
                </div>
                <div className="tool-calc-table-cell-value">
                  <strong>{fmtInt(m.days)}</strong>
                  <span className="tool-calc-table-unit">days</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SobrietyCalculator({ afterContent }: Props) {
  const [dateInput, setDateInput] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const { markStarted, markCompleted } = useCalculatorAnalytics(
    "sobriety-calculator",
  );

  const result = useMemo<SobrietyResult>(
    () => (submitted ? computeSobriety(dateInput) : { kind: "invalid", reason: "missing_date" }),
    [submitted, dateInput],
  );

  const today = useMemo(() => todayIso(), []);

  const handleDateChange = useCallback(
    (value: string) => {
      setDateInput(value);
      markStarted();
      track("sobriety_calculator_date_change", { has_value: Boolean(value) });
    },
    [markStarted],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!dateInput) return;
      markStarted();
      setSubmitted(true);
    },
    [dateInput, markStarted],
  );

  const handleRestart = useCallback(() => {
    trackToolEvent("sobriety-calculator", "cta_clicked", {
      cta_type: "start_over",
    });
    setSubmitted(false);
    setDateInput("")
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const showResults = submitted && result.kind === "ok";

  useEffect(() => {
    trackToolEvent("sobriety-calculator", "section_completed", {
      section: showResults ? "result" : "form",
    });
  }, [showResults]);

  useEffect(() => {
    if (!submitted || result.kind !== "ok") return;
    const sig = `${sobrietyBucket(result.days)}|${result.current?.id ?? "none"}`;
    markCompleted(sig, {
      bucket: sobrietyBucket(result.days),
      days: result.days,
      milestone: result.current?.id ?? "none",
    });
  }, [submitted, result, markCompleted]);

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Sobriety</span> Calculator
          </>
        ),
        tagline:
          "Mark every day. Enter your sobriety date and see your days, weeks, months, years and the next milestone you're working toward.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card">
              {!showResults ? (
                <form onSubmit={handleSubmit} className="tool-calc-step-body">
                  <div className="tool-calc-step-header">
                    <h2 className="tool-step-title">Your sobriety date</h2>
                    <p className="tool-step-subtitle">
                      The first day of your current continuous sobriety.
                    </p>
                  </div>

                  <div className="tool-calc-form-grid">
                    <div className="tool-form-group tool-calc-form-span-2">
                      <label
                        htmlFor="sobriety-date"
                        className="tool-form-label"
                      >
                        {SOBRIETY_FROM_LABEL}
                      </label>
                      <input
                        id="sobriety-date"
                        type="date"
                        className="tool-input"
                        max={today}
                        value={dateInput}
                        onChange={(e) => handleDateChange(e.target.value)}
                        required
                      />
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "0.8rem",
                          color: "var(--text-tertiary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {SOBRIETY_FROM_HELPER}
                      </p>
                    </div>
                  </div>

                  {result.kind === "invalid" && submitted && (
                    <div className="tool-calc-error-stack">
                      <p className="tool-error">
                        {result.reason === "future_date"
                          ? "Sobriety date can't be in the future."
                          : "Please enter a valid date."}
                      </p>
                    </div>
                  )}

                  <div className="tool-calc-nav">
                    <div />
                    <button
                      type="submit"
                      className="tool-btn tool-btn--primary tool-calc-nav-btn"
                      disabled={!dateInput}
                    >
                      <span>Calculate</span>
                      <ArrowRightIcon size={14} weight="bold" aria-hidden />
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
                    result={result as SobrietyResultOk}
                    onRestart={handleRestart}
                  />
                </motion.div>
              )}
            </div>
            <p className="tl-disclaimer">
              This is a counting tool, not a substitute for medical care. If you&apos;re
              in crisis or going through withdrawal, call SAMHSA&apos;s National
              Helpline at 1-800-662-HELP (4357).
            </p>
          </div>

          {/* <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              padding: "0 24px",
            }}
          >
            <FaqAccordion faqs={FAQ_ITEMS} />
          </div> */}
        </section>
      }
      afterContent={afterContent}
    />
  );
}
