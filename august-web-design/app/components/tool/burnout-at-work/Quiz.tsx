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
} from "@/app/data/tools/burnout-at-work-questions";
import {
  computeBurnoutResult,
  burnoutScoreBucket,
  type BurnoutAnswers,
  type BurnoutResult,
} from "@/app/utils/tools/burnout-at-work-scoring";
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
    trackToolEvent("burnout-at-work", "viewed");
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

  const handleStartTest = useCallback(() => {
    track("burnout_at_work_started", {
      event_category: "Burnout at Work",
      total_questions: totalQuestions,
    });
    trackToolEvent("burnout-at-work", "started");
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = questions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("burnout_at_work_question_answered", {
        event_category: "Burnout at Work",
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

  const result = useMemo<BurnoutResult>(
    () => computeBurnoutResult(answers as BurnoutAnswers),
    [answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${burnoutScoreBucket(result.score)}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("burnout-at-work", "completed", {
      score: result.score,
      score_bucket: burnoutScoreBucket(result.score),
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
        selectedAnswer={(answers as BurnoutAnswers)[current.id] ?? null}
        onAnswer={handleAnswer}
        onBack={() => handleBack()}
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
      totalQuestions={totalQuestions}
      afterContent={afterContent}
    />
  );
}
