"use client";

import { type ReactNode, useState, useCallback, useRef, useEffect } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import { DEFAULT_FORM_DATA, PlateauFormData } from "@/app/data/tools/glp1-plateau-calculator-config";
import { computePlateau, validatePlateauInput, PlateauResult } from "@/app/utils/tools/glp1-plateau-compute";
import { kgToLbs } from "@/app/utils/tools/health-math";
import { trackToolEvent } from "@/app/utils/analytics";
import CalculatorForm from "./CalculatorForm";
import ResultsDisplay from "./ResultsDisplay";
import { ToolAuthGate } from "@/components/auth";

export default function PlateauCalculatorClient({ afterContent }: { afterContent?: ReactNode }) {
  const [formData, setFormData] = useState<PlateauFormData>(DEFAULT_FORM_DATA);
  const [result, setResult] = useState<PlateauResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasTrackedRef = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasTrackedRef.current) {
      trackToolEvent("glp1-plateau-calculator", "viewed");
      hasTrackedRef.current = true;
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const validation = validatePlateauInput(formData);
    if (!validation.valid) {
      setError(validation.error || "Check your inputs");
      return;
    }
    setError(null);
    const isMetric = formData.unitSystem === "metric";
    const sw = parseFloat(formData.startingWeight);
    const cw = parseFloat(formData.currentWeight);
    const input = {
      startingWeight: isMetric ? kgToLbs(sw) : sw,
      currentWeight: isMetric ? kgToLbs(cw) : cw,
      weeksOnMedication: parseFloat(formData.weeksOnMedication),
      weeksWithoutChange: parseFloat(formData.weeksWithoutChange),
      medication: formData.medication,
      exercise: formData.exercise,
      protein: formData.protein,
      sleep: formData.sleep,
    };
    const computed = computePlateau(input);
    setResult(computed);
    trackToolEvent("glp1-plateau-calculator", "completed", {
      status: computed.status,
      pctLost: computed.pctLost,
      isOnTrack: computed.isOnTrack,
      medication: computed.medicationLabel,
    });
    if(window != undefined){
        window.scrollTo({top : 0, behavior: "smooth"});
    }
  }, [formData]);

  const handleReset = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setResult(null);
    setError(null);
  }, []);

  const handleFieldChange = useCallback((field: keyof PlateauFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }, [error]);

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            GLP-1 <span className="accent-gradient">Plateau</span> Calculator
          </>
        ),
        tagline: "Diagnose whether your weight loss plateau is real and get a personalized plan to break through.",
      }}
      afterContent={afterContent}
      beforeContent={
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 48px" }}>
          {!result ? (
            <CalculatorForm
              formData={formData}
              error={error}
              onFieldChange={handleFieldChange}
              onSubmit={handleSubmit}
            />
          ) : (
            <div ref={resultsRef}>
              <ResultsDisplay result={result} onReset={handleReset} unitSystem={formData.unitSystem} />
            </div>
          )}
          <ToolAuthGate active={!!result} />
        </div>
      }
    />
  );
}
