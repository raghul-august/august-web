"use client";

import { useCallback } from "react";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import { formatScheduleDate } from "@/app/utils/tools/injection-site-tracker-compute";
import { trackToolEvent } from "@/app/utils/analytics";
import { SITE_LABELS, MEDICATIONS } from "@/app/data/tools/injection-site-tracker-config";
import type { WizardFormData, ScheduleResult, InjectionSite } from "@/app/data/tools/injection-site-tracker-config";
import { useDownloadResult } from "@/app/components/tool/shared/hooks/useDownloadResult";
import DownloadResultButton from "@/app/components/tool/shared/DownloadResultButton";
interface ScheduleResultsProps {
  result: ScheduleResult;
  formData: WizardFormData;
  onRestart: () => void;
}


export default function ScheduleResults({ result, formData, onRestart }: ScheduleResultsProps) {
  const medLabel = MEDICATIONS.find(m => m.value === formData.medication)?.label ?? formData.medication ?? "GLP-1";
  const showSpotCode = formData.trackingMode === "advanced";
  const { resultRef: cardRef, handleDownload } = useDownloadResult({
    toolId: "injection-site-tracker",
    filename: `injection-schedule-${medLabel}`,
    heading: "GLP-1 Injection Site Rotation Schedule",
    subtitle: `Injection Schedule Report • ${medLabel} • every ${formData.frequencyDays} days • ${result.totalInjections} injections`,
    toolName: "GLP-1 Injection Site Tracker",
  });

  const handleChat = useCallback(() => {
    // track("tool_cta_clicked", { tool: "injection-site-tracker", target: "chat", medication: formData.medication ?? "unknown" });
    trackToolEvent("injection-site-tracker", "cta_clicked", {
      target: "chat",
      medication: formData.medication ?? "unknown",
    });
    openAugustChat(
      `I just set up my GLP-1 injection site rotation schedule for ${medLabel}. Can you help me understand best practices for injection site care?`
    );
  }, [medLabel]);

  return (
    <>
    <div ref={cardRef} className="tool-card" style={{ animation: "toolFadeIn 0.4s ease-out" }}>
      <div className="ist-results-header" data-skip-screenshot="true">
        <h2 className="ist-results-title">Your Injection Schedule</h2>
        <div data-skip-screenshot="true">
          <DownloadResultButton
            onClick={handleDownload}
            className="tool-btn tool-btn--primary ist-download-btn"
          />
        </div>
      </div>

      <p className="ist-results-summary" data-skip-screenshot="true">
        {medLabel} &middot; every {formData.frequencyDays} days &middot; {result.totalInjections} injections
      </p>

      <div style={{ overflowX: "auto" }}>
        <table className="ist-schedule-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Site</th>
              <th>Side</th>
              {showSpotCode && <th>Spot</th>}
            </tr>
          </thead>
          <tbody>
            {result.entries.map((entry) => (
              <tr key={entry.injectionNumber}>
                <td>{entry.injectionNumber}</td>
                <td>{formatScheduleDate(entry.date)}</td>
                <td>{SITE_LABELS[entry.site as InjectionSite]}</td>
                <td>{entry.side === "L" ? "Left" : "Right"}</td>
                {showSpotCode && <td>{entry.spotCode}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
      <div className="flex justify-center gap-4 mt-4" data-skip-screenshot="true">
        <button className="tool-btn tool-btn--primary" onClick={handleChat}>
          Talk to August
        </button>
        <button className="tool-btn tool-btn--ghost" onClick={onRestart}>
          Start Over
        </button>
      </div>
    </>
  );
}
