"use client";

import { type ReactNode, useCallback, useMemo, useState } from "react";
import { trackToolEvent } from "@/app/utils/analytics";
import { generateSchedule } from "@/app/utils/tools/injection-site-tracker-compute";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import WizardCard from "./WizardCard";
import ScheduleResults from "./ScheduleResults";
import {
  DEFAULT_FORM_DATA, HERO, WIZARD_STEPS,
} from "@/app/data/tools/injection-site-tracker-config";
import type { WizardFormData } from "@/app/data/tools/injection-site-tracker-config";
import { ToolAuthGate } from "@/components/auth";

export default function InjectionSiteTracker({ afterContent }: { afterContent?: ReactNode }) {
  const [formData, setFormData] = useState<WizardFormData>({ ...DEFAULT_FORM_DATA });
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);

  const totalSteps = formData.trackingMode === "advanced" ? 6 : 5;

  const handleStart = useCallback(() => {
    trackToolEvent("injection-site-tracker", "started");
    setStarted(true);
    setStepIndex(0);
    setFormData({ ...DEFAULT_FORM_DATA });
    setCompleted(false);

    if(typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleUpdate = useCallback((partial: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...partial }));
  }, []);

  const handleNext = useCallback(() => {
    if(typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    trackToolEvent("injection-site-tracker", "question_answered", {
      step: WIZARD_STEPS[stepIndex]?.id,
      step_index: stepIndex,
    });

    if (stepIndex === 4 && formData.trackingMode === "simple") {
      setCompleted(true);
      trackToolEvent("injection-site-tracker", "completed", {
        medication: formData.medication,
        frequency: formData.frequencyDays,
        sites_count: formData.selectedSites.length,
        tracking_mode: formData.trackingMode,
      });
      return;
    }

    const nextIndex = stepIndex + 1;
    if (nextIndex >= totalSteps) {
      setCompleted(true);
      trackToolEvent("injection-site-tracker", "completed", {
        medication: formData.medication,
        frequency: formData.frequencyDays,
        sites_count: formData.selectedSites.length,
        tracking_mode: formData.trackingMode,
      });
      return;
    }

    setStepIndex(nextIndex);
  }, [stepIndex, totalSteps, formData]);

  const handleBack = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  }, [stepIndex]);

  const handleRestart = useCallback(() => {
    setFormData({ ...DEFAULT_FORM_DATA });
    setStepIndex(0);
    setCompleted(false);
    setStarted(false);
  }, []);

  const result = useMemo(() => generateSchedule(formData), [formData]);

  return (
    <>
    <ToolLandingLayout
      hero={{
        title: (
          <>
            GLP-1 <span className="accent-gradient" id="heading">{HERO.accentWord}</span> Tracker
          </>
        ),
        tagline: HERO.tagline,
      }}
      afterContent={afterContent}
      beforeContent={
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 48px" }}>
          {completed ? (
            <ScheduleResults
              result={result}
              formData={formData}
              onRestart={handleRestart}
            />
          ) : started ? (
            <WizardCard
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              formData={formData}
              onUpdate={handleUpdate}
              onNext={handleNext}
              onBack={handleBack}
            />
          ) : (
            <div className="ist-start-card tool-card" style={{ textAlign: "center", padding: "48px 32px" }}>
              <h2 className="ist-start-heading">
                Build Your Rotation Schedule
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.6 }}>
                Answer 5 quick questions to generate a personalized 12-injection site rotation plan.
              </p>
              <button className="tool-btn tool-btn--primary" onClick={handleStart}>
                Get started
              </button>
            </div>
          )}
          <p className="tl-disclaimer" style={{ textAlign: "center", marginTop: 16 }}>
            Your data never leaves your device. All calculations are performed locally.
          </p>
        </div>
      }
    />
    <ToolAuthGate active={completed} />
    </>
  );
}
