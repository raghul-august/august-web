"use client";

import { Egg, Dumbbell, Moon, Pill, Calculator } from "lucide-react";
import { PlateauResult } from "@/app/utils/tools/glp1-plateau-compute";
import { lbsToKg } from "@/app/utils/tools/health-math";
import { track, trackToolEvent } from "@/app/utils/analytics";
import TrajectoryChart from "./TrajectoryChart";
import { useDownloadResult } from "../shared/hooks/useDownloadResult";
import DownloadResultButton from "../shared/DownloadResultButton";

const ICON_MAP: Record<string, React.ElementType> = {
  protein: Egg,
  exercise: Dumbbell,
  sleep: Moon,
  dose: Pill,
  calories: Calculator,
};

interface Props {
  result: PlateauResult;
  onReset: () => void;
  unitSystem?: "imperial" | "metric";
}

export default function ResultsDisplay({ result, onReset, unitSystem = "imperial" }: Props) {
  const isMetric = unitSystem === "metric";
  const weightUnit = isMetric ? "kg" : "lbs";
  const displayLost = isMetric ? Math.round(lbsToKg(result.lbsLost) * 10) / 10 : result.lbsLost;
  const displayWeekly = isMetric ? Math.round(lbsToKg(result.avgWeeklyLoss) * 10) / 10 : result.avgWeeklyLoss;
  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "glp1-plateau-calculator",
    filename: `glp1-plateau-${result.status}`,
    heading: "GLP-1 Plateau Calculator Result",
    subtitle: `Plateau Analysis • ${result.statusLabel}`,
    toolName: "GLP-1 Plateau Calculator",
    maxPageHeight : 1335
  });
  return (
    <div ref={resultRef} className="pc-results">
      <div className="flex justify-end mb-3" data-skip-screenshot="true">
        <DownloadResultButton onClick={handleDownload} /></div>
      {/* Header with badge */}
      <div className="pc-results-header">
        <span className={`pc-badge pc-badge--${result.status}`}>
          {result.statusLabel}
        </span>
      </div>
      <h3 className="pc-results-title">
        {result.status === "true"
          ? "Plateau Detected"
          : result.status === "likely"
          ? "Possible Plateau"
          : "Keep Going"}
      </h3>

      <div className="tool-button-row" data-skip-screenshot="true">
        <a
          href="/chat?msg=I just used the GLP-1 plateau calculator and want to discuss my results"
          className="tool-btn tool-btn--primary"
          style={{ textDecoration: "none" }}
          onClick={() => {
            // track("tool_cta_clicked", { tool: "glp1-plateau-calculator", target: "chat" });
            trackToolEvent("glp1-plateau-calculator", "cta_clicked", { target: "chat" });
          }}
        >Talk to august</a>
        <button className="tool-btn tool-btn--ghost" onClick={onReset}>Start over</button>
      </div>

      {/* Stats grid */}
      <div className="pc-stats-grid">
        <div className="pc-stat-card">
          <div className="pc-stat-label">Total Lost</div>
          <div className="pc-stat-value">{result.pctLost}%</div>
          <div className="pc-stat-context">{displayLost} {weightUnit}</div>
        </div>
        <div className="pc-stat-card">
          <div className="pc-stat-label">Avg Weekly</div>
          <div className="pc-stat-value">{displayWeekly} {weightUnit}</div>
          <div className="pc-stat-context">per week</div>
        </div>
        <div className="pc-stat-card">
          <div className="pc-stat-label">Weeks Stalled</div>
          <div className="pc-stat-value">{result.weeksStalled}</div>
          <div className="pc-stat-context">weeks</div>
        </div>
        <div className="pc-stat-card">
          <div className="pc-stat-label">Expected Loss</div>
          <div className="pc-stat-value">{result.expectedPctTotal}%</div>
          <div className="pc-stat-context">at 72 weeks on {result.medicationLabel}</div>
        </div>
        <div className="pc-stat-card">
          <div className="pc-stat-label">At This Point</div>
          <div className="pc-stat-value">{result.expectedPctAtThisPoint}%</div>
          <div className="pc-stat-context">expected at your week</div>
        </div>
        <div className="pc-stat-card">
          <div className="pc-stat-label">Progress</div>
          <div className={`pc-stat-value ${result.isOnTrack ? "pc-on-track" : "pc-off-track"}`}>
            {result.isOnTrack ? "On Track" : "Below Average"}
          </div>
        </div>
      </div>

      {/* Trajectory chart */}
      <div style={{ margin: "24px 0" }}>
        <TrajectoryChart
          weeksOnMedication={result.weeksOnMedication}
          weeksStalled={result.weeksStalled}
          pctLost={result.pctLost}
          expectedPctAtThisPoint={result.expectedPctAtThisPoint}
          expectedPctTotal={result.expectedPctTotal}
        />
      </div>

      {/* Reassurance (only if not-yet) */}
      {result.status === "not-yet" && (
        <div className="pc-reassurance">
          Weight fluctuations are normal in the first weeks of GLP-1 therapy. Your body may be adjusting to the medication. Continue your current regimen and reassess after 4 weeks of no change.
        </div>
      )}

      {/* Action Plan */}
      {result.recommendations.length > 0 && (
        <div className="pc-actions">
          <h4 className="pc-actions-title">Your Action Plan</h4>
          {result.recommendations.map(rec => {
            const IconComponent = ICON_MAP[rec.id] ?? Calculator;
            return (
              <div key={rec.id} className="pc-action-card">
                <div className="pc-action-icon">
                  <IconComponent size={18} />
                </div>
                <div className="pc-action-content">
                  <div className="pc-action-title">{rec.title}</div>
                  <div className="pc-action-desc">{rec.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="tool-disclaimer">
        This calculator is for educational purposes only and does not replace professional medical advice.
        Always consult your healthcare provider about medication adjustments or treatment changes.
      </p>
    </div>
  );
}
