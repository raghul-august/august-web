"use client";

import {
  lazy,
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AgeBand,
  BodyRegion,
  DurationValue,
  FACTORS_BY_SYMPTOM,
  SeverityValue,
  SexValue,
  STEP_ORDER,
  StepId,
  TOTAL_STEPS,
} from "@/app/data/tools/symptoms-checker-questions";
import {
  computeSymptomsResult,
  type SymptomsAnswers,
  type SymptomsResult,
  urgencyBucket,
} from "@/app/utils/tools/symptoms-checker-scoring";
import { track, trackToolEvent } from "@/app/utils/analytics";
import LandingScreen from "./LandingScreen";
import QuestionScreen from "./QuestionScreen";
import { useAutoAdvance } from "../shared/hooks/useAutoAdvance";
import { useQuestionTimer } from "../shared/hooks/useQuestionTimer";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";
import { ToolAuthGate } from "@/components/auth";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

type Screen = "landing" | "question" | "results";

const EMPTY_ANSWERS: SymptomsAnswers = {};

function symptomHasFactors(symptom: string | undefined): boolean {
  if (!symptom) return false;
  return (FACTORS_BY_SYMPTOM[symptom] ?? []).length > 0;
}

const INLINE_NAVBAR_HEIGHT = 56;

function scrollScreen(top: number, behavior: ScrollBehavior) {
  if (typeof document === "undefined") return;
  const container = document.querySelector<HTMLElement>(
    "[data-scroll-container]",
  );
  if (!container) return;
  container.scrollTo({ top, behavior });
}

export default function Quiz({ afterContent }: { afterContent?: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SymptomsAnswers>(EMPTY_ANSWERS);
  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("symptoms-checker", "viewed");
    // First mount is always the landing screen — pin to the very top so the
    // navbar/login chrome stays visible.
    scrollScreen(0, "instant");
  }, []);

  useEffect(() => {
    // Landing keeps the navbar in view; question/results scroll past it so the
    // progress bar (or results hero) sits at the top of the viewport.
    scrollScreen(screen === "landing" ? 0 : INLINE_NAVBAR_HEIGHT, "smooth");
  }, [screen, currentIndex]);

  // Find the next step index that should actually display, skipping
  // "factors" when the chosen symptom has no factor groups.
  const nextDisplayableIndex = useCallback(
    (fromIndex: number, currentAnswers: SymptomsAnswers): number => {
      let i = fromIndex;
      while (i < TOTAL_STEPS) {
        const id = STEP_ORDER[i];
        if (id === "factors" && !symptomHasFactors(currentAnswers.symptom)) {
          i += 1;
          continue;
        }
        return i;
      }
      return TOTAL_STEPS;
    },
    [],
  );

  const prevDisplayableIndex = useCallback(
    (fromIndex: number, currentAnswers: SymptomsAnswers): number => {
      let i = fromIndex;
      while (i >= 0) {
        const id = STEP_ORDER[i];
        if (id === "factors" && !symptomHasFactors(currentAnswers.symptom)) {
          i -= 1;
          continue;
        }
        return i;
      }
      return -1;
    },
    [],
  );

  const advance = useAutoAdvance(() => {
    setAnswers((curr) => {
      const ni = nextDisplayableIndex(currentIndex + 1, curr);
      if (ni >= TOTAL_STEPS) {
        setScreen("results");
      } else {
        setCurrentIndex(ni);
      }
      timer.reset();
      return curr;
    });
  }, 300);

  const handleStart = useCallback(() => {
    track("symptoms_checker_started", {
      event_category: "Symptoms Checker",
      total_steps: TOTAL_STEPS,
    });
    trackToolEvent("symptoms-checker", "started");
    hasStartedRef.current = true;
    setAnswers(EMPTY_ANSWERS);
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [timer]);

  const handleRestart = useCallback(() => {
    setAnswers(EMPTY_ANSWERS);
    setCurrentIndex(0);
    completedRef.current = "";
    setScreen("landing");
  }, []);

  const handleBack = useCallback(() => {
    const prev = prevDisplayableIndex(currentIndex - 1, answers);
    if (prev >= 0) {
      setCurrentIndex(prev);
      setScreen("question");
    } else {
      setScreen("landing");
    }
  }, [currentIndex, answers, prevDisplayableIndex]);

  const handleSingleAnswer = useCallback(
    (step: StepId, value: string) => {
      const elapsed = timer.getElapsedSeconds();
      track("symptoms_checker_answered", {
        event_category: "Symptoms Checker",
        step,
        value,
        time_spent_seconds: elapsed,
      });
      setAnswers((prev) => {
        const next: SymptomsAnswers = { ...prev };
        if (step === "sex") next.sex = value as SexValue;
        else if (step === "age") next.age = value as AgeBand;
        else if (step === "region") {
          if (prev.region !== (value as BodyRegion)) {
            next.symptom = undefined;
            next.factors = [];
          }
          next.region = value as BodyRegion;
        } else if (step === "symptom") {
          if (prev.symptom !== value) next.factors = [];
          next.symptom = value;
        } else if (step === "duration") next.duration = value as DurationValue;
        else if (step === "severity") next.severity = value as SeverityValue;
        return next;
      });
      advance();
    },
    [advance, timer],
  );

  const handleToggleFactor = useCallback((value: string) => {
    setAnswers((prev) => {
      const set = new Set(prev.factors ?? []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, factors: Array.from(set) };
    });
  }, []);

  const handleSubmitFactors = useCallback(() => {
    track("symptoms_checker_factors_submitted", {
      event_category: "Symptoms Checker",
      factor_count: (answers.factors ?? []).length,
      symptom: answers.symptom ?? "unknown",
    });
    setAnswers((curr) => {
      const ni = nextDisplayableIndex(currentIndex + 1, curr);
      if (ni >= TOTAL_STEPS) setScreen("results");
      else setCurrentIndex(ni);
      timer.reset();
      return curr;
    });
  }, [answers.factors, answers.symptom, currentIndex, nextDisplayableIndex, timer]);

  const handleToggleRedFlag = useCallback((value: string) => {
    setAnswers((prev) => {
      const current = new Set(prev.redFlags ?? []);
      if (value === "none") {
        if (current.has("none")) {
          current.delete("none");
        } else {
          current.clear();
          current.add("none");
        }
      } else {
        current.delete("none");
        if (current.has(value)) current.delete(value);
        else current.add(value);
      }
      return { ...prev, redFlags: Array.from(current) };
    });
  }, []);

  const handleSubmitRedFlags = useCallback(() => {
    track("symptoms_checker_red_flags_submitted", {
      event_category: "Symptoms Checker",
      red_flag_count: (answers.redFlags ?? []).filter((v) => v !== "none").length,
    });
    setScreen("results");
  }, [answers.redFlags]);

  const result = useMemo<SymptomsResult>(() => computeSymptomsResult(answers), [answers]);

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${urgencyBucket(result.urgency.id)}|${result.summary.symptomLabel ?? "none"}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("symptoms-checker", "completed", {
      urgency: result.urgency.id,
      symptom: answers.symptom,
      region: answers.region,
      severity: answers.severity,
      duration: answers.duration,
      red_flag_count: result.matchedRedFlags.length,
      factor_count: result.matchedFactors.length,
    });
  }, [screen, result, answers]);

  if (screen === "question") {
    const stepId = STEP_ORDER[currentIndex];
    return (
      <QuestionScreen
        step={stepId}
        currentIndex={currentIndex}
        totalQuestions={TOTAL_STEPS}
        region={answers.region}
        symptom={answers.symptom}
        factorsSelected={answers.factors ?? []}
        redFlagsSelected={answers.redFlags ?? []}
        selectedFor={{
          sex: answers.sex,
          age: answers.age,
          region: answers.region,
          symptom: answers.symptom,
          duration: answers.duration,
          severity: answers.severity,
        }}
        onSingleAnswer={handleSingleAnswer}
        onToggleFactor={handleToggleFactor}
        onSubmitFactors={handleSubmitFactors}
        onToggleRedFlag={handleToggleRedFlag}
        onSubmitRedFlags={handleSubmitRedFlags}
        onBack={handleBack}
      />
    );
  }

  if (screen === "results") {
    return (
      <>
        <Suspense fallback={<QuizSuspenseFallback />}>
          <ResultsScreen result={result} onRestart={handleRestart} />
        </Suspense>
        <ToolAuthGate active={screen === "results"} />
      </>
    );
  }

  return (
    <LandingScreen
      onStart={handleStart}
      totalSteps={TOTAL_STEPS}
      afterContent={afterContent}
    />
  );
}
