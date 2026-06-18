"use client";

import { lazy, ReactNode, Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import {
  questions,
  totalQuestions,
} from "@/app/data/tools/personality-disorder-test-questions";
import {
  computePersonalityDisorderResult,
  personalityDisorderScoreBucket,
  type PersonalityDisorderAnswers,
  type PersonalityDisorderResult,
} from "@/app/utils/tools/personality-disorder-test-scoring";
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
    trackToolEvent("personality-disorder-test", "viewed");
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
    track("personality_disorder_test_started", {
      event_category: "Personality Disorder Test",
      total_questions: totalQuestions,
    });
    trackToolEvent("personality-disorder-test", "started");
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = questions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("personality_disorder_test_question_answered", {
        event_category: "Personality Disorder Test",
        question_number: question.id,
        criterion: question.criterion,
        answer_value: value,
        scoring: question.scoring,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<PersonalityDisorderResult>(
    () => computePersonalityDisorderResult(answers as PersonalityDisorderAnswers),
    [answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${personalityDisorderScoreBucket(result.score)}|${result.tier.id}|${result.showSelfHarmWarning ? "sh" : "0"}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("personality-disorder-test", "completed", {
      score: result.score,
      score_bucket: personalityDisorderScoreBucket(result.score),
      tier: result.tier.id,
      self_harm_flag: result.showSelfHarmWarning,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = questions[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        selectedAnswer={(answers as PersonalityDisorderAnswers)[current.id] ?? null}
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
