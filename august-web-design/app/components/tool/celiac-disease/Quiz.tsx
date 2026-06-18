"use client";

import {
  lazy,
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  CELIAC_QUESTIONS,
  CELIAC_TOTAL,
} from "@/app/data/tools/celiac-disease-questions";
import {
  celiacScoreBucket,
  computeCeliacResult,
  type CeliacAnswers,
  type CeliacResult,
} from "@/app/utils/tools/celiac-disease-scoring";
import { track, trackToolEvent } from "@/app/utils/analytics";
import LandingScreen from "./LandingScreen";
import QuestionScreen from "./QuestionScreen";
import { useQuizState } from "../shared/hooks/useQuizState";
import { useAutoAdvance } from "../shared/hooks/useAutoAdvance";
import { useQuestionTimer } from "../shared/hooks/useQuestionTimer";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

type Screen = "landing" | "question" | "results";

export default function Quiz({ afterContent }: { afterContent?: ReactNode }) {
  const {
    screen,
    setScreen,
    currentIndex,
    setCurrentIndex,
    answers,
    setAnswers,
    handleBack,
    handleRestart,
  } = useQuizState<0 | 1 | 2 | 3, Screen>({ initialScreen: "landing" });

  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("celiac-disease", "viewed");
  }, []);

  const advance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= CELIAC_TOTAL) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, 300);

  const handleStartTest = useCallback(() => {
    track("celiac_test_started", { event_category: "Celiac Test" });
    trackToolEvent("celiac-disease", "started");
    setAnswers({});
    setCurrentIndex(0);
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen]);

  const handleAnswer = useCallback(
    (value: 0 | 1 | 2 | 3) => {
      const question = CELIAC_QUESTIONS[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("celiac_test_question_answered", {
        event_category: "Celiac Test",
        question_number: question.id,
        answer_value: value,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<CeliacResult>(
    () => computeCeliacResult(answers as CeliacAnswers),
    [answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${celiacScoreBucket(result.score, result.maxScore)}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("celiac-disease", "completed", {
      score: result.score,
      score_bucket: celiacScoreBucket(result.score, result.maxScore),
      tier: result.tier.id,
      high_risk_flags: result.highRiskFlags.length,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = CELIAC_QUESTIONS[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={CELIAC_TOTAL}
        selectedAnswer={(answers as CeliacAnswers)[current.id] ?? null}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  }

  if (screen === "results") {
    return (
      <Suspense fallback={<QuizSuspenseFallback />}>
        <ResultsScreen result={result} onRestart={handleRestart} />
      </Suspense>
    );
  }

  return (
    <LandingScreen
      onStartTest={handleStartTest}
      afterContent={afterContent}
    />
  );
}
