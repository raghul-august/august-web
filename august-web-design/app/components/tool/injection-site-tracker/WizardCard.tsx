"use client";

import { useCallback, useMemo } from "react";
import { useAutoAdvance } from "../shared/hooks/useAutoAdvance";
import {
  MEDICATIONS, FREQUENCIES, TRACKING_MODES, GRID_SIZES, WIZARD_STEPS,
} from "@/app/data/tools/injection-site-tracker-config";
import BodyDiagram from "./body-diagram/BodyDiagram";
import type { WizardFormData, ISTMedication, InjectionSite, FrequencyDays, TrackingMode, GridSize } from "@/app/data/tools/injection-site-tracker-config";
import { getDayOfWeek, getTodayISO, getQuickDates } from "@/app/utils/tools/injection-site-tracker-compute";

interface WizardCardProps {
  stepIndex: number;
  totalSteps: number;
  formData: WizardFormData;
  onUpdate: (partial: Partial<WizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function WizardCard({
  stepIndex, totalSteps, formData, onUpdate, onNext, onBack,
}: WizardCardProps) {
  const step = WIZARD_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  const triggerAdvance = useAutoAdvance(() => { onNext();  }, 350);

  const handleMedication = useCallback((v: ISTMedication) => {
    onUpdate({ medication: v });
    triggerAdvance();
  }, [onUpdate, triggerAdvance]);

  const handleFrequency = useCallback((v: FrequencyDays) => {
    onUpdate({ frequencyDays: v });
    triggerAdvance();
  }, [onUpdate, triggerAdvance]);

  const handleToggleSite = useCallback((site: InjectionSite) => {
    const current = formData.selectedSites;
    const next = current.includes(site) ? current.filter(s => s !== site) : [...current, site];
    onUpdate({ selectedSites: next });
  }, [formData.selectedSites, onUpdate]);

  const handleTrackingMode = useCallback((v: TrackingMode) => {
    onUpdate({ trackingMode: v });
  }, [onUpdate]);

  const handleGridSize = useCallback((v: GridSize) => {
    onUpdate({ gridSize: v });
    triggerAdvance();
  }, [onUpdate, triggerAdvance]);

  const quickDates = useMemo(() => getQuickDates(), []);

  const renderStep = () => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="ist-card-options">
            {MEDICATIONS.map((med) => {
              const active = formData.medication === med.value;
              return (
                <button key={med.value} className={`ist-option ${active ? "ist-option--active" : ""}`} onClick={() => handleMedication(med.value)}>
                  <span className="ist-option-label">{med.label}</span>
                  {med.subtitle && <span className="ist-option-sub">{med.subtitle}</span>}
                </button>
              );
            })}
          </div>
        );

      case 1:
        return (
          <div className="ist-card-options">
            <input type="date" className="tool-input" style={{ width: "100%" }} value={formData.lastDoseDate ?? ""} max={getTodayISO()} onChange={(e) => onUpdate({ lastDoseDate: e.target.value || null })} />
            <div className="ist-quick-dates">
              {quickDates.map((qd) => (
                <button key={qd.value} className={`ist-quick-date ${formData.lastDoseDate === qd.value ? "ist-quick-date--active" : ""}`} onClick={() => onUpdate({ lastDoseDate: qd.value })}>
                  {qd.label}
                </button>
              ))}
            </div>
            {formData.lastDoseDate && (
              <p className="ist-day-feedback">Your injection day will be every {getDayOfWeek(formData.lastDoseDate)}</p>
            )}
            <button className="tool-btn tool-btn--primary" style={{ width: "100%", marginTop: 8 }} disabled={!formData.lastDoseDate} onClick={onNext}>
              Next
            </button>
          </div>
        );

      case 2:
        return (
          <div className="ist-card-options">
            {FREQUENCIES.map((freq) => {
              const active = formData.frequencyDays === freq.value;
              return (
                <button key={freq.value} className={`ist-option ${active ? "ist-option--active" : ""}`} onClick={() => handleFrequency(freq.value)}>
                  <span className="ist-option-label">
                    {freq.label}
                    {freq.recommended && <span className="ist-card-badge" style={{ marginLeft: 8 }}>Recommended</span>}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 3:
        return (
          <div className="ist-card-options">
            <BodyDiagram
              selectedSites={formData.selectedSites}
              onToggleSite={handleToggleSite}
            />
            {formData.selectedSites.length > 0 && (
              <div className="ist-selected-pills">
                {formData.selectedSites.map((s) => (
                  <button key={s} className="ist-site-pill" onClick={() => handleToggleSite(s)}>
                    {s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    <span className="ist-site-pill-x">✕</span>
                  </button>
                ))}
              </div>
            )}
            <p className="ist-validation-msg">
              {formData.selectedSites.length < 2
                ? `Select at least 2 sites (${formData.selectedSites.length} selected)`
                : `${formData.selectedSites.length} sites selected`}
            </p>
            <button className="tool-btn tool-btn--primary" style={{ width: "100%", marginTop: 4 }} disabled={formData.selectedSites.length < 2} onClick={onNext}>
              Next
            </button>
          </div>
        );

      case 4:
        return (
          <div className="ist-card-options">
            {TRACKING_MODES.map((mode) => {
              const active = formData.trackingMode === mode.value;
              return (
                <button key={mode.value} className={`ist-option ${active ? "ist-option--active" : ""}`} onClick={() => handleTrackingMode(mode.value)}>
                  <span className="ist-option-label">
                    {mode.label}
                    {mode.recommended && <span className="ist-card-badge" style={{ marginLeft: 8 }}>Recommended</span>}
                  </span>
                  <span className="ist-option-sub">{mode.description}</span>
                </button>
              );
            })}
            <button
              className="tool-btn tool-btn--primary"
              style={{ width: "100%", marginTop: 8 }}
              disabled={!formData.trackingMode}
              onClick={onNext}
            >
              {formData.trackingMode === "advanced" ? "Next" : "See my schedule"}
            </button>
          </div>
        );

      case 5:
        return (
          <div className="ist-card-options">
            {GRID_SIZES.map((gs) => {
              const active = formData.gridSize === gs.value;
              return (
                <button key={gs.value} className={`ist-option ${active ? "ist-option--active" : ""}`} onClick={() => handleGridSize(gs.value)}>
                  <span className="ist-option-label">{gs.label} ({gs.value})</span>
                  <span className="ist-option-sub">{gs.description}</span>
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="tool-card ist-wizard-container">
      {/* Progress bar */}
      <div className="ist-progress-bar">
        <div className="ist-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="ist-step-label">Step {stepIndex + 1} of {totalSteps}</div>

      {/* Question */}
      <h3 className="ist-question">{step.question}</h3>
      <p className="ist-subtitle">{step.subtitle}</p>

      {/* Step content */}
      {renderStep()}

      {/* Back button */}
      {stepIndex > 0 && (
        <button className="ist-back-btn" onClick={onBack}>
          &larr; Back
        </button>
      )}
    </div>
  );
}
