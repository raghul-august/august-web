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
  questions,
  totalQuestions,
} from "@/app/data/tools/introversion-test-questions";
import {
  computeIntroversionResult,
  introversionScoreBucket,
  type IntroversionAnswers,
  type IntroversionResult,
} from "@/app/utils/tools/introversion-test-scoring";
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
  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("introversion-test", "viewed");
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

  const handleRestartWithScroll = useCallback(() => {
    handleRestart();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [handleRestart]);

  const handleStartTest = useCallback(() => {
    track("introversion_test_started", {
      event_category: "Introversion / Extroversion",
      total_questions: totalQuestions,
    });
    trackToolEvent("introversion-test", "started");
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = questions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("introversion_test_question_answered", {
        event_category: "Introversion / Extroversion",
        question_number: question.id,
        reverse_keyed: question.reverse,
        answer_value: value,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<IntroversionResult>(
    () => computeIntroversionResult(answers as IntroversionAnswers),
    [answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${introversionScoreBucket(result.score)}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("introversion-test", "completed", {
      score: result.score,
      score_bucket: introversionScoreBucket(result.score),
      tier: result.tier.id,
      percent: result.percent,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = questions[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        selectedAnswer={(answers as IntroversionAnswers)[current.id] ?? null}
        onAnswer={handleAnswer}
        onBack={() => handleBack()}
      />
    );
  }

  if (screen === "results") {
    return (
      <Suspense fallback={<QuizSuspenseFallback />}>
        <ResultsScreen result={result} onRestart={handleRestartWithScroll} />
      </Suspense>
    );
  }

  return (
    <LandingScreen
      onStartTest={handleStartTest}
      totalQuestions={totalQuestions}
      afterContent={afterContent}
    />
  );
}
