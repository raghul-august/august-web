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
  questions,
  totalQuestions,
} from "@/app/data/tools/compatibility-test-questions";
import {
  compatibilityScoreBucket,
  computeCompatibilityResult,
  type CompatibilityAnswers,
  type CompatibilityResult,
} from "@/app/utils/tools/compatibility-test-scoring";
import { track, trackToolEvent } from "@/app/utils/analytics";
import LandingScreen from "./LandingScreen";
import QuestionScreen from "./QuestionScreen";
import { useQuizState } from "../shared/hooks/useQuizState";
import { useAutoAdvance } from "../shared/hooks/useAutoAdvance";
import { useQuestionTimer } from "../shared/hooks/useQuestionTimer";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

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
  } = useQuizState<number>();
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("compatibility-test", "viewed");
  }, []);

  const advance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, 300);

  const handleStartTest = useCallback(
    (a: string, b: string) => {
      setNameA(a);
      setNameB(b);
      track("compatibility_test_started", {
        event_category: "Love Compatibility Test",
        total_questions: totalQuestions,
        has_name_a: a.length > 0,
        has_name_b: b.length > 0,
      });
      trackToolEvent("compatibility-test", "started", {
        has_name_a: a.length > 0,
        has_name_b: b.length > 0,
      });
      setAnswers({});
      setCurrentIndex(0);
      timer.reset();
      setScreen("question");
    },
    [setAnswers, setCurrentIndex, setScreen, timer],
  );

  const handleAnswer = useCallback(
    (value: number) => {
      const question = questions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("compatibility_question_answered", {
        event_category: "Love Compatibility Test",
        question_number: question.id,
        dimension: question.dimension,
        answer_value: value,
        reverse: question.reverse,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<CompatibilityResult>(
    () => computeCompatibilityResult(answers as CompatibilityAnswers),
    [answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${compatibilityScoreBucket(result.percent)}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("compatibility-test", "completed", {
      percent: result.percent,
      score_bucket: compatibilityScoreBucket(result.percent),
      tier: result.tier.id,
      top_dimension: result.topDimension?.id ?? "",
      bottom_dimension: result.bottomDimension?.id ?? "",
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = questions[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        selectedAnswer={(answers as CompatibilityAnswers)[current.id] ?? null}
        onAnswer={handleAnswer}
        onBack={() => handleBack()}
      />
    );
  }

  if (screen === "results") {
    return (
      <Suspense fallback={<QuizSuspenseFallback />}>
        <ResultsScreen
          result={result}
          nameA={nameA}
          nameB={nameB}
          onRestart={handleRestart}
        />
      </Suspense>
    );
  }

  return (
    <LandingScreen
      onStartTest={handleStartTest}
      totalQuestions={totalQuestions}
      initialNameA={nameA}
      initialNameB={nameB}
      afterContent={afterContent}
    />
  );
}
