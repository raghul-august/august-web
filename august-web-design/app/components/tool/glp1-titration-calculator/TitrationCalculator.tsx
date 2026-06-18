"use client";

import { type ReactNode, useState, useCallback, useRef, useEffect } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import {
  MEDICATIONS,
  MEDICATION_OPTIONS,
  DEFAULT_FORM_DATA,
} from "@/app/data/tools/glp1-titration-calculator-config";
import type { TitrationFormData, MedicationKey } from "@/app/data/tools/glp1-titration-calculator-config";
import { computeTitration, validateTitrationInput } from "@/app/utils/tools/glp1-titration-compute";
import type { TitrationResult } from "@/app/utils/tools/glp1-titration-compute";
import { trackToolEvent } from "@/app/utils/analytics";
import { ToolAuthGate } from "@/components/auth";
import ScheduleResults from "./ScheduleResults";

export default function TitrationCalculator({ afterContent }: { afterContent?: ReactNode }) {
  const [formData, setFormData] = useState<TitrationFormData>(DEFAULT_FORM_DATA);
  const [result, setResult] = useState<TitrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasTrackedRef = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasTrackedRef.current) {
      trackToolEvent("glp1-titration-calculator", "viewed");
      hasTrackedRef.current = true;
    }
  }, []);

  const handleFieldChange = useCallback(
    (field: keyof TitrationFormData, value: string | boolean) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "medication" && typeof value === "string" && value) {
          const med = MEDICATIONS[value as MedicationKey];
          if (med) {
            next.concentration = String(med.defaultConcentration);
            next.targetDose = String(med.maxDose);
          }
        }
        return next;
      });
      if (error) setError(null);
    },
    [error],
  );

  const handleSubmit = useCallback(() => {
    const validation = validateTitrationInput(formData);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    setError(null);
    const computed = computeTitration(
      formData.medication as MedicationKey,
      parseFloat(formData.concentration),
      formData.extendedTitration,
      formData.customTarget,
      formData.customTarget ? parseFloat(formData.targetDose) : undefined,
    );
    if (!computed) return;
    setResult(computed);
    trackToolEvent("glp1-titration-calculator", "completed", {
      medication: formData.medication,
      concentration: formData.concentration,
      extendedTitration: formData.extendedTitration,
      customTarget: formData.customTarget,
    });
     if(window != undefined) {
        window.scrollTo({top : 0, behavior :"smooth"})
     }  
  }, [formData]);

  const handleReset = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setResult(null);
    setError(null);
  }, []);

  const selectedMed = formData.medication ? MEDICATIONS[formData.medication as MedicationKey] : null;

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            GLP-1 <span className="accent-gradient">Titration</span> Calculator
          </>
        ),
        tagline:
          "Build a week-by-week dose escalation schedule with injection units for your compound GLP-1 medication.",
      }}
      afterContent={afterContent}
      beforeContent={
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 48px" }}>
          {!result ? (
            <div className="tool-card" style={{ padding: 24 }}>
              <div className="tool-form-section-title">Medication and Concentration</div>
              <div className="tool-form-grid">
                <div className="tool-form-group">
                  <label className="tool-form-label" htmlFor="tc-med">
                    Medication
                  </label>
                  <select
                    id="tc-med"
                    className="tool-input"
                    value={formData.medication}
                    onChange={(e) => handleFieldChange("medication", e.target.value)}
                  >
                    <option value="">Select medication</option>
                    {MEDICATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tool-form-group">
                  <label className="tool-form-label" htmlFor="tc-conc">
                    Concentration (mg/mL)
                  </label>
                  <input
                    id="tc-conc"
                    className="tool-input"
                    type="number"
                    inputMode="decimal"
                    step={0.1}
                    min={0.1}
                    placeholder="e.g. 10"
                    value={formData.concentration}
                    onChange={(e) => handleFieldChange("concentration", e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  />
                </div>
              </div>

              <div className="tc-customize-section">
                <div className="tc-customize-title">Customization options</div>
                <div className="tc-toggle-grid">
                  <label className="tc-toggle-row">
                    <input
                      type="checkbox"
                      className="tc-toggle-checkbox"
                      checked={formData.extendedTitration}
                      onChange={(e) => handleFieldChange("extendedTitration", e.target.checked)}
                    />
                    <div className="tc-toggle-text">
                      <span className="tc-toggle-label">Extended titration</span>
                      <span className="tc-toggle-desc">Add 4 weeks to each dose step</span>
                    </div>
                  </label>

                  <label className="tc-toggle-row">
                    <input
                      type="checkbox"
                      className="tc-toggle-checkbox"
                      checked={formData.customTarget}
                      onChange={(e) => handleFieldChange("customTarget", e.target.checked)}
                    />
                    <div className="tc-toggle-text">
                      <span className="tc-toggle-label">Custom target dose</span>
                      <span className="tc-toggle-desc">Stop escalation at specific dose</span>
                    </div>
                  </label>
                </div>

                {formData.customTarget && (
                  <div className="tc-target-field">
                    <div className="tool-form-group">
                      <label className="tool-form-label" htmlFor="tc-target">
                        Target dose (mg)
                      </label>
                      <input
                        id="tc-target"
                        className="tool-input"
                        type="number"
                        inputMode="decimal"
                        step={0.1}
                        min={0.1}
                        placeholder="e.g. 1.7"
                        value={formData.targetDose}
                        onChange={(e) => handleFieldChange("targetDose", e.target.value)}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      />
                      {selectedMed && (
                        <span className="tc-form-helper">
                          Maximum: {selectedMed.maxDose} mg
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {error && <p className="tool-error">{error}</p>}

              <button
                className="tool-btn tool-btn--primary"
                style={{ width: "100%", marginTop: 24 }}
                onClick={handleSubmit}
              >
                Calculate schedule
              </button>

              <button type="button" className="tc-reset-link" onClick={handleReset}>
                Reset
              </button>

              <p className="tool-disclaimer">
                This tool is for educational purposes only. It does not constitute medical advice.
                Dosage calculations should be verified by a healthcare professional.
              </p>
            </div>
          ) : (
            <div ref={resultsRef}>
              <ScheduleResults result={result} onReset={handleReset} />
            </div>
          )}
          <ToolAuthGate active={!!result} />
        </div>
      }
    />
  );
}
