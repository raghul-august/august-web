"use client";

import { useCallback, useMemo, lazy, Suspense, ReactNode } from "react";
import {
  computeScore,
  getScoreTier,
  getCategoryBreakdowns,
} from "../../../utils/tools/childhood-trauma-scoring";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { questions } from "@/app/data/tools/childhood-trauma-questions";
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

const ResultsScreen = lazy(() => import("./ResultsScreen"));

const loadingMessages = [
  "Reviewing your responses...",
  "Calculating your score...",
  "Preparing your results...",
  "Almost there...",
];

export default function Quiz({ afterContent }: { afterContent?: ReactNode }) {
  const { screen, setScreen, currentIndex, setCurrentIndex, answers, setAnswers, handleRestart } =
    useQuizState<boolean>();
  const { shouldGateResults } = useQuizAuth();
  const timer = useQuestionTimer();

  const handleStartTest = useCallback(() => {
    // backward-compat: still fires "childhood_trauma_quiz_started"
    track("childhood_trauma_quiz_started", {
      event_category: "Childhood Trauma Test",
      total_questions: questions.length,
    });
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen, timer]);

  const advance = useAutoAdvance(() => {
    if (currentIndex === questions.length - 1) {
      setScreen("loading");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
    timer.reset();
  }, 300);

  const handleAnswer = useCallback(
    (questionId: number, answer: boolean) => {
      const timeSpentSeconds = timer.getElapsedSeconds();
      track("childhood_trauma_question_answered", {
        event_category: "Childhood Trauma Test",
        question_number: questionId,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      const newAnswers = { ...answers, [questionId]: answer };
      setAnswers(newAnswers);

      if (currentIndex === questions.length - 1) {
        const score = computeScore(newAnswers);
        const tier = getScoreTier(score);
        track("childhood_trauma_quiz_completed", {
          event_category: "Childhood Trauma Test",
          score,
          risk_category: tier.title,
        });
      }

      advance();
    },
    [answers, currentIndex, setAnswers, timer, advance]
  );

  const handleBack = useCallback(() => {
    if (currentIndex === 0) {
      setScreen("landing");
    } else {
      timer.reset();
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, setCurrentIndex, setScreen, timer]);

  const handleLoadingComplete = useCallback(() => {
    setScreen("results");
  }, [setScreen]);

  const score = useMemo(() => computeScore(answers), [answers]);
  const tier = useMemo(() => getScoreTier(score), [score]);
  const breakdowns = useMemo(() => getCategoryBreakdowns(answers), [answers]);

  if (screen === "question") {
    return (
      <QuestionScreen
        question={questions[currentIndex]}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        selectedAnswer={answers[questions[currentIndex].id]}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  }

  if (screen === "loading") {
    return (
      <QuizContainer showFooter={false}>
        <LoadingCard
          emoji="🌿"
          messages={loadingMessages}
          onComplete={handleLoadingComplete}
        />
      </QuizContainer>
    );
  }

  if (screen === "results") {
    return (
      <>
        <Suspense fallback={<QuizSuspenseFallback bg="#f0f5f3" />}>
          <ResultsScreen
            score={score}
            tier={tier}
            breakdowns={breakdowns}
            onRestart={handleRestart}
          />
        </Suspense>
        {shouldGateResults && (
          <ToolLoginModal
            title="Your results are ready"
            description="Enter your name and email to view your Childhood Trauma Test results."
            onSuccess={() => {}}
          />
        )}
      </>
    );
  }

  return <LandingScreen onStartTest={handleStartTest} afterContent={afterContent} />;
}
