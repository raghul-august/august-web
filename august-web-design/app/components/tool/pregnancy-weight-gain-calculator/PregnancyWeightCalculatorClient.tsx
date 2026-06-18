"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  lazy,
  Suspense,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";
import { trackToolEvent } from "@/app/utils/analytics";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { ToolAuthGate } from "@/components/auth";
import {
  type FormData,
  calculatePregnancyWeightResult,
  validateFormData,
  kgToLbs,
  lbsToKg,
  feetInchesToCm,
} from "@/app/utils/tools/pregnancy-weight-gain-compute";
import { cmToFeetInches } from "@/app/utils/tools/health-math";
import { FormStep } from "./FormScreens";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

const TOOL_ID = "pregnancy-weight-gain-calculator";

const DEFAULT_FORM: FormData = {
  unitSystem: "imperial",
  heightFt: null,
  heightIn: null,
  heightCm: null,
  preWeight: null,
  currentWeight: null,
  gestationalWeek: 20,
  twins: false,
};

export default function PregnancyWeightCalculatorClient({
  afterContent,
}: {
  afterContent?: ReactNode;
}) {
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [touched, setTouched] = useState(false);

  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const stepStartRef = useRef<number>(Date.now());

  // ── Result ────────────────────────────────────────────────────────────
  const result = useMemo(
    () => (showResults ? calculatePregnancyWeightResult(formData) : null),
    [formData, showResults],
  );

  // ── Analytics ─────────────────────────────────────────────────────────
  const { markStarted, markCompleted, resetCompleted } = useCalculatorAnalytics(TOOL_ID);

  useEffect(() => {
    if (!showResults || !result) return;
    const sig = `${result.bmi}|${result.category}|${formData.twins}|${formData.gestationalWeek}`;
    markCompleted(sig, {
      bmi: result.bmi,
      category: result.category,
      twins: formData.twins,
      gestational_week: formData.gestationalWeek,
      gain_low_lbs: result.totalRange.lowLbs,
      gain_high_lbs: result.totalRange.highLbs,
      current_status: result.currentStatus ?? "unset",
      has_current_weight: formData.currentWeight != null,
    });
  }, [showResults, result, formData, markCompleted]);

  // ── Field update ───────────────────────────────────────────────────────
  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // ── Unit toggle with in-place conversion ───────────────────────────────
  const handleUnitToggle = useCallback(
    (newSystem: FormData["unitSystem"]) => {
      setFormData((prev) => {
        if (prev.unitSystem === newSystem) return prev;

        const next = { ...prev, unitSystem: newSystem };

        if (newSystem === "metric") {
          if (prev.heightFt != null) {
            next.heightCm = Math.round(feetInchesToCm(prev.heightFt, prev.heightIn ?? 0));
          }
          next.heightFt = null;
          next.heightIn = null;
          if (prev.preWeight != null)
            next.preWeight = Math.round(lbsToKg(prev.preWeight) * 10) / 10;
          if (prev.currentWeight != null)
            next.currentWeight = Math.round(lbsToKg(prev.currentWeight) * 10) / 10;
        } else {
          if (prev.heightCm != null) {
            const fi = cmToFeetInches(prev.heightCm);
            next.heightFt = fi.feet;
            next.heightIn = fi.inches;
          }
          next.heightCm = null;
          if (prev.preWeight != null)
            next.preWeight = Math.round(kgToLbs(prev.preWeight) * 10) / 10;
          if (prev.currentWeight != null)
            next.currentWeight = Math.round(kgToLbs(prev.currentWeight) * 10) / 10;
        }

        return next;
      });
    },
    [],
  );

  // ── Validation ─────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    if (!touched) return {};
    return validateFormData(formData);
  }, [formData, touched]);

  const canSubmit = useMemo(() => {
    if (formData.unitSystem === "imperial") {
      if (!formData.heightFt || formData.heightFt <= 0) return false;
    } else {
      if (!formData.heightCm || formData.heightCm <= 0) return false;
    }
    if (!formData.preWeight || formData.preWeight <= 0) return false;
    const errs = validateFormData(formData);
    return !errs.heightFt && !errs.heightCm && !errs.preWeight && !errs.currentWeight;
  }, [formData]);

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    setTouched(true);
    if (!canSubmit) return;
    const elapsed = Date.now() - stepStartRef.current;
    trackToolEvent(TOOL_ID, "section_completed", { step: 0, time_spent_ms: elapsed });
    setShowResults(true);

    if(window != undefined){
      window.scrollTo({top : 0, behavior : "smooth"})
    }
  }, [canSubmit]);

  // ── Restart ────────────────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    setShowResults(false);
    setFormData(DEFAULT_FORM);
    setTouched(false);
    resetCompleted();
    stepStartRef.current = Date.now();
    if(window != undefined){
      window.scrollTo({top : 0, behavior : "smooth"})
    }
  }, [resetCompleted]);

  // ── Wizard content ─────────────────────────────────────────────────────
  const wizard = (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "0 20px 48px" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={showResults ? "results" : "form"}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {!showResults ? (
            <>
              <div className="tool-card tool-wizard-card">
                <FormStep
                  formData={formData}
                  errors={errors}
                  onUpdate={(field, value) => {
                    if (field === "unitSystem") {
                      handleUnitToggle(value as FormData["unitSystem"]);
                    } else {
                      updateField(field, value);
                    }
                  }}
                  onMarkStarted={markStarted}
                  onSubmit={handleSubmit}
                  canSubmit={canSubmit}
                />
              </div>
              <p className="tool-calc-disclaimer tool-calc-disclaimer--spaced">
                This tool is for educational purposes only and does not replace medical advice. Consult your doctor for personalized guidance.
              </p>
            </>
          ) : (
            <Suspense fallback={<QuizSuspenseFallback bg="var(--brand-subtle)" spinner={false} />}>
              {result && (
                <ResultsScreen
                  result={result}
                  formData={{
                    gestationalWeek: formData.gestationalWeek,
                    twins: formData.twins,
                  }}
                  onRestart={handleRestart}
                />
              )}
            </Suspense>
          )}
        </motion.div>
      </AnimatePresence>
      <ToolAuthGate active={Boolean(showResults && result)} />
    </div>
  );

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Pregnancy <span className="accent-gradient">Weight Gain</span> Calculator
          </>
        ),
        tagline:
          "See your IOM-recommended gain range and track if you're on pace, week by week.",
      }}
      beforeContent={wizard}
      afterContent={afterContent}
    />
  );
}
