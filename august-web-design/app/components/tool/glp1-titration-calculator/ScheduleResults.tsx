"use client";

import type { TitrationResult } from "@/app/utils/tools/glp1-titration-compute";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { useCallback } from "react";
import { useDownloadResult } from "@/app/components/tool/shared/hooks/useDownloadResult";
import DownloadResultButton from "@/app/components/tool/shared/DownloadResultButton";

interface Props {
  result: TitrationResult;
  onReset: () => void;
}

export default function ScheduleResults({ result, onReset }: Props) {
  const stepsWithNotes = result.rows.filter((r) => r.note);
  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "glp1-titration-calculator",
    filename: `glp1-titration-${result.medicationName}`,
    heading: "GLP-1 Titration Schedule",
    subtitle: `GLP-1 Titration Report • ${result.medicationName}`,
    toolName: "GLP-1 Titration Calculator",
    maxPageHeight : 1500
  });

  const handleChat = useCallback(() => {
    // track("tool_cta_clicked", { tool: "glp1-titration-calculator", target: "consult" });
    trackToolEvent("glp1-titration-calculator", "cta_clicked", { target: "consult" });
    openAugustChat(
      `I just used the GLP-1 Titration Calculator for ${result.medicationName}. Can you help me understand my titration schedule?`,
    );
  }, [result.medicationName]);

  return (
    <div ref={resultRef} className="tc-results">
      <div className="tc-alert-banner" role="status">
        <div className="tc-alert-title">Titration plan generated</div>
        This follows FDA-recommended schedules. Always consult your healthcare provider before
        starting or modifying your treatment plan.
      </div>

      <div className="tool-button-row flex justify-center" data-skip-screenshot="true">
        <button className="tool-btn tool-btn--primary" onClick={handleChat}>
          Chat with august
        </button>
        <button className="tool-btn tool-btn--ghost" onClick={onReset}>
          Start over
        </button>
      </div>
      <div className="flex justify-end" data-skip-screenshot="true">
        <DownloadResultButton onClick={handleDownload} className='tool-btn tool-btn--primary mb-3'/>
      </div>

      <div className="tc-schedule-list">
        {result.rows.map((row, i) => (
          <div
            key={i}
            className={`tc-schedule-row${row.isMaintenanceStart ? " tc-schedule-row--maintenance" : ""}`}
          >
            <span className="tc-schedule-week">Week {row.week}</span>
            <span className="tc-schedule-dose">{row.doseMg} mg</span>
            {row.isMaintenanceStart && <span className="tc-maintenance-badge">Maintenance</span>}
            <div className="tc-schedule-metrics">
              <span className="tc-schedule-units">{row.units} units</span>
              <span className="tc-schedule-volume">{row.volumeMl} mL</span>
            </div>
          </div>
        ))}
      </div>

      {stepsWithNotes.length > 0 && (
        <div className="tc-notes-section">
          <div className="tc-notes-title">Notes</div>
          <ul className="tc-notes-list">
            {stepsWithNotes.map((row, i) => (
              <li key={i} className="tc-notes-item">
                <strong>Week {row.week}:</strong> {row.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="tc-fda-box">
        <div className="tc-fda-header">FDA Titration Guidelines</div>
        <div className="tc-fda-content">
          <ul className="tc-fda-list">
            <li className="tc-fda-item">Start low to minimize GI side effects</li>
            <li className="tc-fda-item">Increase gradually every 4 weeks minimum</li>
            <li className="tc-fda-item">Extended titration may be needed for tolerability</li>
            <li className="tc-fda-item">Maintenance dose varies by individual response</li>
          </ul>
          <div className="tc-fda-med-summary">
            <span className="tc-fda-med-name">{result.medicationName}</span>
            {" "}({result.indication})
            <br />
            Maximum dose: {result.maxDose} mg weekly
          </div>
        </div>
      </div>

      <p className="tool-disclaimer" data-skip-screenshot="true">
        This calculator is for educational purposes only. It does not constitute medical advice,
        diagnosis, or treatment. Dosage calculations should be verified by a healthcare
        professional. Consult your prescriber before starting or modifying any medication regimen.
      </p>
    </div>
  );
}
