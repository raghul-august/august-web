"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStepForm } from "../shared/hooks/useStepForm";
import { trackToolEvent } from "@/app/utils/analytics";
import {
  type HydrationFormData,
  type BeverageId,
  type UnitSystem,
  DEFAULT_FORM_DATA,
} from "@/app/data/tools/hydration-calculator-config";
import {
  calculateHydrationResult,
  lbsToKg,
  kgToLbs,
} from "@/app/utils/tools/hydration-calculator-compute";
import { ProfileStep, ActivityStep, BeverageStep, NavigationControls } from "./FormScreens";
import ResultsScreen from "./ResultsScreen";
import { ToolAuthGate } from "@/components/auth";
import "./hydration-calculator.css";

export default function CalculatorContainer() {
  const { step, next, back, reset } = useStepForm({
    totalSteps: 4,
    onComplete: () => {},
  });

  const handleNext = useCallback(() => {
    next();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [next]);

  const [formData, setFormData] = useState<HydrationFormData>(DEFAULT_FORM_DATA);
  const hasStartedRef = useRef(false);

  const result = useMemo(
    () => (step === 3 ? calculateHydrationResult(formData) : null),
    [formData, step],
  );

  // analytics: started
  useEffect(() => {
    if (!hasStartedRef.current) {
      trackToolEvent("hydration-calculator", "started");
      hasStartedRef.current = true;
    }
  }, []);

  // analytics: step viewed
  useEffect(() => {
    trackToolEvent("hydration-calculator", "section_completed", { step });
  }, [step]);

  // analytics: completed
  useEffect(() => {
    if (step === 3 && result) {
      trackToolEvent("hydration-calculator", "completed", {
        isSufficient: result.isSufficientlyHydrated,
      });
    }
  }, [step, result]);

  const updateField = useCallback(
    <K extends keyof HydrationFormData>(field: K, value: HydrationFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const updateBeverage = useCallback((id: BeverageId, count: number) => {
    setFormData((prev) => ({
      ...prev,
      beverageIntake: { ...prev.beverageIntake, [id]: count },
    }));
  }, []);

  const handleUnitToggle = useCallback(
    (system: UnitSystem) => {
      setFormData((prev) => {
        if (prev.unitSystem === system) return prev;

        let weightValue = prev.weightValue;
        let heightValue = prev.heightValue;
        let weightUnit: "kg" | "lbs" = prev.weightUnit;
        let heightUnit: "cm" | "in" = prev.heightUnit;

        if (system === "imperial") {
          // metric -> imperial
          if (weightValue != null) weightValue = Math.round(kgToLbs(weightValue) * 10) / 10;
          if (heightValue != null) heightValue = Math.round((heightValue / 2.54) * 10) / 10;
          weightUnit = "lbs";
          heightUnit = "in";
        } else {
          // imperial -> metric
          if (weightValue != null) weightValue = Math.round(lbsToKg(weightValue) * 10) / 10;
          if (heightValue != null) heightValue = Math.round(heightValue * 2.54 * 10) / 10;
          weightUnit = "kg";
          heightUnit = "cm";
        }

        return {
          ...prev,
          unitSystem: system,
          weightValue,
          heightValue,
          weightUnit,
          heightUnit,
        };
      });
    },
    [],
  );

  const handleRestart = useCallback(() => {
    reset();
    setFormData(DEFAULT_FORM_DATA);
  }, [reset]);

  const canAdvance = useMemo(() => {
    if (step === 0) {
      return (
        formData.gender !== null &&
        formData.age !== null &&
        formData.weightValue !== null &&
        formData.heightValue !== null
      );
    }
    if (step === 1) return formData.activityLevel !== null;
    if (step === 2) return true; // 0 beverages is valid
    return false;
  }, [step, formData.gender, formData.age, formData.weightValue, formData.heightValue, formData.activityLevel]);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 48px" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step < 3 ? (
            <div className="tool-card" style={{ padding: 24 }}>
              {step === 0 && (
                <ProfileStep
                  formData={formData}
                  onUpdate={updateField}
                  onUnitToggle={handleUnitToggle}
                />
              )}
              {step === 1 && <ActivityStep formData={formData} onUpdate={updateField} />}
              {step === 2 && (
                <BeverageStep beverages={formData.beverageIntake} onUpdate={updateBeverage} />
              )}
              <NavigationControls
                step={step}
                totalSteps={4}
                canAdvance={canAdvance}
                onNext={handleNext}
                onBack={back}
                isLastFormStep={step === 2}
              />
            </div>
          ) : (
            result && <ResultsScreen result={result} onRestart={handleRestart} />
          )}
        </motion.div>
      </AnimatePresence>

      <ToolAuthGate active={step === 3 && !!result} />
    </div>
  );
}
