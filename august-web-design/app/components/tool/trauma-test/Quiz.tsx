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
  TRAUMA_GATE_ID,
  totalQuestions,
} from "@/app/data/tools/trauma-test-questions";
import {
  computeTraumaResult,
  traumaScoreBucket,
  type TraumaAnswers,
  type TraumaResult,
} from "@/app/utils/tools/trauma-test-scoring";
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
  } = useQuizState<0 | 1>();
  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("trauma-test", "viewed");
  }, []);

  const goNext = useCallback(
    (skipToResults: boolean) => {
      if (skipToResults) {
        setScreen("results");
      } else {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= totalQuestions) {
          setScreen("results");
        } else {
          setCurrentIndex(nextIndex);
        }
      }
      timer.reset();
    },
    [currentIndex, setCurrentIndex, setScreen, timer],
  );

  const advance = useAutoAdvance(() => goNext(false), 300);
  const advanceToResults = useAutoAdvance(() => goNext(true), 300);

  const handleStartTest = useCallback(() => {
    track("trauma_test_started", {
      event_category: "Trauma Test",
      total_questions: totalQuestions,
    });
    trackToolEvent("trauma-test", "started");
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: 0 | 1) => {
      const question = questions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("trauma_test_question_answered", {
        event_category: "Trauma Test",
        question_number: question.id,
        criterion: question.criterion,
        answer_value: value,
        scoring: question.scoring,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));

      // Trauma gate: if "No", skip the symptom items and go straight to results.
      if (question.id === TRAUMA_GATE_ID && value === 0) {
        advanceToResults();
      } else {
        advance();
      }
    },
    [currentIndex, answers, setAnswers, advance, advanceToResults, timer],
  );

  const result = useMemo<TraumaResult>(
    () => computeTraumaResult(answers as TraumaAnswers),
    [answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${traumaScoreBucket(result.noTrauma, result.score)}|${result.tier.id}|${result.isPositive ? "pos" : "neg"}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("trauma-test", "completed", {
      score: result.score,
      score_bucket: traumaScoreBucket(result.noTrauma, result.score),
      tier: result.tier.id,
      no_trauma: result.noTrauma,
      is_positive: result.isPositive,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = questions[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        selectedAnswer={(answers as TraumaAnswers)[current.id] ?? null}
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
