"use client";

import { useCallback, useMemo, lazy, Suspense, ReactNode } from "react";
import { chronotypeQuestions, totalQuestions } from "@/app/data/tools/chronotype-questions";
import { computeChronotype, ChronotypeResult } from "../../../utils/tools/chronotype-scoring";
import { track, trackToolEvent } from "@/app/utils/analytics";
import LandingScreen from "./LandingScreen";
import QuestionScreen from "./QuestionScreen";
import { useQuizState } from "../shared/hooks/useQuizState";
import { useQuestionTimer } from "../shared/hooks/useQuestionTimer";
import { useAutoAdvance } from "../shared/hooks/useAutoAdvance";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";
import { useQuizAuth } from "../shared/hooks/useQuizAuth";
import { ToolLoginModal } from "@/components/auth";

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
    // backward-compat: still fires "chronotype_quiz_started"
    track("chronotype_quiz_started", {
      event_category: "Chronotype Quiz",
      total_questions: totalQuestions,
    });
    setCurrentIndex(0);
    setAnswers({});
    timer.reset();
    setScreen("question");
  }, [setCurrentIndex, setAnswers, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = chronotypeQuestions[currentIndex];

      track("chronotype_question_answered", {
        event_category: "Chronotype Quiz",
        question_number: question.id,
        total_answered: Object.keys(answers).length + 1,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance]
  );

  const result = useMemo<ChronotypeResult>(() => computeChronotype(answers), [answers]);

  if (screen === "question") {
    return (
      <QuestionScreen
        question={chronotypeQuestions[currentIndex]}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        selectedAnswer={answers[chronotypeQuestions[currentIndex]?.id] ?? null}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  }

  if (screen === "results") {
    return (
      <>
        <Suspense fallback={<QuizSuspenseFallback bg="#f4f5f5" spinner={false} />}>
          <ResultsScreen result={result} onRestart={handleRestart} />
        </Suspense>
        {shouldGateResults && (
          <ToolLoginModal
            title="Your chronotype results are ready"
            description="Enter your name and email to discover your chronotype."
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
