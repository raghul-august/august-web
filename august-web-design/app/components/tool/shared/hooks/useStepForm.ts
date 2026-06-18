import { useState, useCallback } from "react";

export type StepState = "completed" | "active" | "upcoming";

export interface UseStepFormOpts {
  totalSteps: number;
  initialStep?: number;
  onComplete?: () => void;
}

export function useStepForm({ totalSteps, initialStep = 0, onComplete }: UseStepFormOpts) {
  const [step, setStep] = useState(initialStep);
  const [completed, setCompleted] = useState(false);

  const goTo = useCallback(
    (s: number) => setStep(Math.max(0, Math.min(totalSteps - 1, s))),
    [totalSteps]
  );

  const next = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
      onComplete?.();
    }
  }, [step, totalSteps, onComplete]);

  const back = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const stepState = useCallback(
    (s: number): StepState => {
      if (completed) return "completed";
      if (s < step) return "completed";
      if (s === step) return "active";
      return "upcoming";
    },
    [step, completed]
  );

  const reset = useCallback(() => {
    setStep(initialStep);
    setCompleted(false);
  }, [initialStep]);

  return { step, goTo, next, back, stepState, completed, reset };
}
