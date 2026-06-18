"use client";

import { useCallback } from "react";
import type { DoseResult } from "@/app/utils/tools/glp1-dose-compute";
import { WARNING_ORDER, WARNING_META } from "@/app/data/tools/glp1-dose-calculator-config";
import { track } from "@/app/utils/analytics";
import SyringeSVG from "./SyringeSVG";
import { fmtDecimal, fmtInt } from "@/app/utils/tools/health-math";

export interface ResultCardProps {
  dose: number;
  barrelMl: 0.3 | 0.5 | 1.0;
  result: DoseResult;
  onCtaClick?: (target: "consult") => void;
  onRestart?: () => void;
}

// Values are already rounded in glp1-dose-compute
const fmt1 = (n: number) => fmtDecimal(n, 1);

export default function ResultCard({
  dose,
  barrelMl,
  result,
  onCtaClick,
  onRestart,
}: ResultCardProps) {
  const invalid = result.displayState === "invalid";
  const over = result.displayState === "over";

  const warningsRaw = Array.isArray(result.warnings) ? result.warnings : [];
  const warnings = WARNING_ORDER.filter((w) => warningsRaw.includes(w));

  // unitsU100 is already rounded to 1 decimal in computeDose
  const unitsRounded =
    typeof result.unitsU100 === "number" && Number.isFinite(result.unitsU100)
      ? result.unitsU100
      : null;

  const unitsDisplay = unitsRounded !== null ? fmt1(unitsRounded) : "-";
  const doseDisplay = fmt1(dose);

  const handleConsult = useCallback(() => {
    onCtaClick?.("consult");
  }, [onCtaClick]);

  const handleRestart = useCallback(() => {
    track("glp1_calc_restarted", { event_category: "GLP-1 Dose Calculator" });
    onRestart?.();
     if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [onRestart]);

  return (
    <section
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="glp1-card glp1-result-card"
    >
      {/* Warnings - above hero, stable order */}
      {warnings.length > 0 && (
        <div className="glp1-warnings">
          {warnings.map((w) => {
            const m = WARNING_META[w];
            return (
              <div
                key={w}
                role="alert"
                className={`glp1-warning-${m.tone}`}
                style={{
                  padding: "12px 16px",
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                {m.msg}
              </div>
            );
          })}
        </div>
      )}

      {/* Composed result block - hero + syringe (left) and metrics (right) on ≥768px. */}
      <div className="glp1-result-block">
        <div className="glp1-result-left">
          {/* Hero units row */}
          <div className="glp1-hero">
            {invalid || unitsRounded === null ? (
              <span
                className="glp1-hero-number glp1-hero-invalid"
                aria-label="No result"
              >
                -
              </span>
            ) : over ? (
              <span
                className="glp1-hero-number"
                aria-label={`${unitsDisplay} units (U-100 syringe)`}
                style={{ color: "var(--glp1-error)" }}
              >
                {unitsDisplay}
              </span>
            ) : (
              <span
                className="glp1-hero-number accent-gradient"
                aria-label={`${unitsDisplay} units (U-100 syringe)`}
              >
                {unitsDisplay}
              </span>
            )}
            <span className="glp1-hero-label">units</span>
          </div>

          {/* Syringe - connector from hero → tick when valid */}
          {!invalid && unitsRounded !== null && (
            <div className="glp1-syringe-wrap">
              <SyringeSVG
                barrelMl={barrelMl}
                units={result.unitsU100}
                state={over ? "over" : "ok"}
                className="glp1-syringe"
                animate
                connector
              />
            </div>
          )}
        </div>

        {/* Secondary metrics grid - 2x2 on ≥768px */}
        {!invalid && (
          <div className="glp1-metrics glp1-result-right">
            {typeof result.totalMg === "number" && Number.isFinite(result.totalMg) && (
              <MetricCard
                label="Total in vial"
                value={`${fmt1(result.totalMg)} mg`}
              />
            )}
            {typeof result.dosesPerVial === "number" &&
              Number.isFinite(result.dosesPerVial) && (
                <MetricCard
                  label="Doses per vial"
                  value={fmtInt(result.dosesPerVial)}
                />
              )}
          </div>
        )}
      </div>

      {/* Sentence echo */}
      {!invalid && unitsRounded !== null && (
        <p className="glp1-echo">
          For <strong>{doseDisplay} mg</strong>, draw the plunger to{" "}
          <strong>{unitsDisplay} units</strong>.
        </p>
      )}

      {/* Action row */}
      <div className="glp1-actions">
        <button
          type="button"
          onClick={handleConsult}
          disabled={invalid}
          className="tool-btn tool-btn--primary mb-0"
        >
          Talk to august
        </button>
        <button
          type="button"
          className="tool-btn tool-btn--ghost mb-0"
          onClick={handleRestart}
          disabled={invalid}
        >
          Start over
        </button>
      </div>

    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glp1-metric-card">
      <span className="glp1-metric-label">{label}</span>
      <span className="glp1-metric-value" title={value}>
        {value}
      </span>
    </div>
  );
}
