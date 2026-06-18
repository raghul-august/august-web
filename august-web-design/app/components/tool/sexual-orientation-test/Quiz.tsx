"use client";

import React, { useCallback, useMemo, lazy, Suspense } from "react";
import {
  orientationQuestions,
  totalQuestions,
} from "@/app/data/tools/sexual-orientation-questions";
import {
  computeOrientation,
  OrientationResult,
} from "@/app/utils/tools/sexual-orientation-scoring";
import { track } from "@/app/utils/analytics";
import LandingScreen from "./LandingScreen";
import QuestionScreen from "./QuestionScreen";
import { useQuizState } from "../shared/hooks/useQuizState";
import { useAutoAdvance } from "../shared/hooks/useAutoAdvance";
import { useQuestionTimer } from "../shared/hooks/useQuestionTimer";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";
import { useQuizAuth } from "../shared/hooks/useQuizAuth";
import { ToolLoginModal } from "@/components/auth";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

export default function Quiz({ afterContent }: { afterContent?: React.ReactNode }) {
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
  const { shouldGateResults } = useQuizAuth();

  const advance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, 350);

  const handleStartTest = useCallback(() => {
    track("sexual_orientation_quiz_started", {
      event_category: "Sexual Orientation Quiz",
      total_questions: totalQuestions,
    });
    setCurrentIndex(0);
    setAnswers({});
    timer.reset();
    setScreen("question");
  }, [setCurrentIndex, setAnswers, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = orientationQuestions[currentIndex];
      track("sexual_orientation_question_answered", {
        event_category: "Sexual Orientation Quiz",
        question_number: question.id,
        total_answered: Object.keys(answers).length + 1,
      });
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      // Auto-advance only if this question has no helper card.
      // Questions with a helper need user time to read it; advance via Continue button.
      if (!question.helper) {
        advance();
      }
    },
    [currentIndex, answers, setAnswers, advance]
  );

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, [currentIndex, setCurrentIndex, setScreen, timer]);

  const result = useMemo<OrientationResult>(
    () => computeOrientation(answers),
    [answers]
  );

  if (screen === "question") {
    const question = orientationQuestions[currentIndex];
    return (
      <QuestionScreen
        question={question}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        selectedAnswer={answers[question.id] ?? null}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onBack={handleBack}
        isLast={currentIndex + 1 >= totalQuestions}
      />
    );
  }

  if (screen === "results") {
    return (
      <>
        <Suspense fallback={<QuizSuspenseFallback bg="var(--surface-page)" spinner={false} />}>
          <ResultsScreen result={result} onRestart={handleRestart} />
        </Suspense>
        {shouldGateResults && (
          <ToolLoginModal
            title="Your results are ready"
            description="Enter your name and email to view your orientation results."
            onSuccess={() => {}}
          />
        )}
      </>
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
