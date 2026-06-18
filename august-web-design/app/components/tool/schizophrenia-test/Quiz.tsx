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
} from "@/app/data/tools/schizophrenia-test-questions";
import {
  computeSchizophreniaResult,
  schizophreniaScoreBucket,
  type SchizophreniaAnswers,
  type SchizophreniaResult,
} from "@/app/utils/tools/schizophrenia-test-scoring";
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
    trackToolEvent("schizophrenia-test", "viewed");
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
    track("schizophrenia_test_started", {
      event_category: "Schizophrenia Test",
      total_questions: totalQuestions,
    });
    trackToolEvent("schizophrenia-test", "started");
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = questions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("schizophrenia_test_question_answered", {
        event_category: "Schizophrenia Test",
        question_number: question.id,
        domain: question.domain,
        answer_value: value,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<SchizophreniaResult>(
    () => computeSchizophreniaResult(answers as SchizophreniaAnswers),
    [answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${schizophreniaScoreBucket(result.score)}|${result.tier.id}|${result.positiveScreen ? "pos" : "neg"}|${result.primaryDomain.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("schizophrenia-test", "completed", {
      score: result.score,
      score_bucket: schizophreniaScoreBucket(result.score),
      tier: result.tier.id,
      endorsed_count: result.endorsedCount,
      positive_screen: result.positiveScreen,
      primary_domain: result.primaryDomain.id,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = questions[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        selectedAnswer={(answers as SchizophreniaAnswers)[current.id] ?? null}
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
