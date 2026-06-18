"use client";

import React, { useCallback, useMemo, lazy, Suspense } from "react";
import {
  allQuestions,
  encouragementCheckpoints,
  encouragementStories,
} from "@/app/data/tools/adhd-questions";
import { computeScores, getVibeCheck } from "../../../utils/tools/adhd-scoring";
import { track, trackToolEvent } from "@/app/utils/analytics";
import LandingScreen from "./LandingScreen";
import QuestionScreen from "./QuestionScreen";
import { useQuizState } from "../shared/hooks/useQuizState";
import { useQuestionTimer } from "../shared/hooks/useQuestionTimer";
import { useAutoAdvance } from "../shared/hooks/useAutoAdvance";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";

import QuizContainer from "../shared/QuizContainer";
import LoadingCard from "../shared/LoadingCard";
import { useQuizAuth } from "../shared/hooks/useQuizAuth";
import { ToolLoginModal } from "@/components/auth";

const EncouragementScreen = lazy(() => import("./EncouragementScreen"));
const ResultsScreen = lazy(() => import("./ResultsScreen"));

const loadingMessages = [
  "Analyzing your responses...",
  "Crunching the numbers...",
  "Comparing patterns...",
  "Preparing your results...",
];

type AdhdScreen = "landing" | "question" | "encouragement" | "loading" | "results";

const questionIds = allQuestions.map((q) => q.id);

export default function Quiz({ afterContent }: { afterContent?: React.ReactNode }) {
  const {
    screen,
    setScreen,
    currentIndex,
    setCurrentIndex,
    answers,
    setAnswers,
    handleRestart,
  } = useQuizState<string, AdhdScreen>({ initialScreen: "landing" });
  const timer = useQuestionTimer();
  const { shouldGateResults } = useQuizAuth();

  // useAutoAdvance's cb ref always picks up latest closure, so currentIndex is fresh
  const triggerAdvance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= allQuestions.length) {
      setScreen("loading");
    } else if (encouragementCheckpoints.includes(nextIndex)) {
      setCurrentIndex(nextIndex);
      setScreen("encouragement");
    } else {
      setCurrentIndex(nextIndex);
    }

    timer.reset();
  }, 350);

  const handleStartTest = useCallback(() => {
    // backward-compat: wire name "quiz_started" preserved
    track("quiz_started", {
      event_category: "ADHD Quiz",
      total_questions: allQuestions.length,
    });

    setCurrentIndex(0);
    setAnswers({});
    timer.reset();
    setScreen("question");
  }, [setCurrentIndex, setAnswers, setScreen, timer]);

  const handleAnswer = useCallback(
    (answer: string) => {
      const question = allQuestions[currentIndex];
      const timeSpent = timer.getElapsedSeconds();
      const questionsAnswered = Object.keys(answers).length + 1;

      track("quiz_question_answered", {
        event_category: "ADHD Quiz",
        question_number: question.id,
        time_spent_seconds: timeSpent,
        total_answered: questionsAnswered,
      });

      const newAnswers = { ...answers, [question.id]: answer };
      setAnswers(newAnswers);

      // fire quiz_completed when last question answered (before advance)
      if (currentIndex === allQuestions.length - 1) {
        const { continuous, dichotomous } = computeScores(newAnswers, questionIds);
        // new event - backward-compat: no prior "quiz_completed" event existed in free-adhd
        trackToolEvent("adhd", "completed", { continuous, dichotomous });
      }

      triggerAdvance();
    },
    [currentIndex, answers, setAnswers, timer, triggerAdvance]
  );

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      timer.reset();
      setScreen("question");
    } else {
      setScreen("landing");
    }
  }, [currentIndex, setCurrentIndex, setScreen, timer]);

  const handleContinueFromEncouragement = useCallback(() => {
    setScreen("question");
  }, [setScreen]);

  const handleLoadingComplete = useCallback(() => {
    setScreen("results");
  }, [setScreen]);

  const { continuous, dichotomous } = useMemo(
    () => computeScores(answers, questionIds),
    [answers]
  );
  const vibe = useMemo(() => getVibeCheck(continuous), [continuous]);

  if (screen === "question") {
    return (
      <QuestionScreen
        question={allQuestions[currentIndex]}
        currentIndex={currentIndex}
        totalQuestions={allQuestions.length}
        selectedAnswer={answers[allQuestions[currentIndex]?.id] ?? null}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  }

  if (screen === "encouragement" && encouragementStories[currentIndex]) {
    return (
      <Suspense fallback={<QuizSuspenseFallback bg="var(--brand-subtle)" spinner={false} />}>
        <EncouragementScreen
          data={encouragementStories[currentIndex]}
          onContinue={handleContinueFromEncouragement}
        />
      </Suspense>
    );
  }

  if (screen === "loading") {
    return (
      <QuizContainer showFooter={false} showBlobs={true}>
        <LoadingCard
          emoji="🧠"
          messages={loadingMessages}
          onComplete={handleLoadingComplete}
        />
      </QuizContainer>
    );
  }

  if (screen === "results") {
    return (
      <>
        <Suspense fallback={<QuizSuspenseFallback bg="var(--brand-subtle)" spinner={false} />}>
          <ResultsScreen
            continuous={continuous}
            dichotomous={dichotomous}
            vibe={vibe}
            onRestart={handleRestart}
          />
        </Suspense>
        {shouldGateResults && (
          <ToolLoginModal
            title="Your ADHD screening is ready"
            description="Enter your name and email to view your results."
            onSuccess={() => {}}
          />
        )}
      </>
    );
  }

  return (
    <LandingScreen
      onStartTest={handleStartTest}
      totalQuestions={allQuestions.length}
      afterContent={afterContent}
    />
  );
}
