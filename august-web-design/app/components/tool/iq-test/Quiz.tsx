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
import { IQ_QUESTIONS, IQ_TOTAL } from "@/app/data/tools/iq-test-questions";
import {
  computeIqResult,
  iqScoreBucket,
  type IqAnswers,
  type IqResult,
} from "@/app/utils/tools/iq-test-scoring";
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
    handleBack: baseHandleBack,
    handleRestart,
  } = useQuizState<number, Screen>({ initialScreen: "landing" });

  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("iq-test", "viewed");
  }, []);

  const advance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= IQ_TOTAL) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, 300);

  const handleStartTest = useCallback(() => {
    track("iq_test_started", { event_category: "IQ Test" });
    trackToolEvent("iq-test", "started");
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = IQ_QUESTIONS[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("iq_test_question_answered", {
        event_category: "IQ Test",
        question_number: question.id,
        question_category: question.category,
        answer_value: value,
        is_correct: value === question.correctIndex,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const handleBack = useCallback(() => {
    baseHandleBack();
  }, [baseHandleBack]);

  const result = useMemo<IqResult | null>(() => {
    if (screen !== "results") return null;
    return computeIqResult(answers as IqAnswers);
  }, [screen, answers]);

  useEffect(() => {
    if (screen !== "results" || !result) return;
    const sig = `${result.iqScore}|${result.tier.id}|${result.raw}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("iq-test", "completed", {
      iq_score: result.iqScore,
      iq_bucket: iqScoreBucket(result.iqScore),
      percentile: result.percentile,
      tier: result.tier.id,
      raw: result.raw,
      total: result.total,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = IQ_QUESTIONS[currentIndex];
    const selectedAnswer = (answers as IqAnswers)[current.id];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={IQ_TOTAL}
        selectedAnswer={selectedAnswer ?? null}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  }

  if (screen === "results" && result) {
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
