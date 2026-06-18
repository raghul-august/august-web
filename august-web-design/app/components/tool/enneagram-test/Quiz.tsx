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
  TOTAL_QUESTIONS,
} from "@/app/data/tools/enneagram-test-questions";
import {
  computeEnneagramResult,
  type EnneagramAnswers,
  type EnneagramResult,
} from "@/app/utils/tools/enneagram-test-scoring";
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
    handleBack,
    handleRestart,
  } = useQuizState<number, Screen>({ initialScreen: "landing" });

  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("enneagram-test", "viewed");
  }, []);

  const advance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= TOTAL_QUESTIONS) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, 300);

  const handleStartTest = useCallback(() => {
    track("enneagram_test_started", {
      event_category: "Enneagram Test",
    });
    trackToolEvent("enneagram-test", "started");
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = questions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("enneagram_test_question_answered", {
        event_category: "Enneagram Test",
        question_number: question.id,
        question_type: question.type,
        answer_value: value,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<EnneagramResult | null>(() => {
    if (Object.keys(answers).length === 0) return null;
    return computeEnneagramResult(answers as EnneagramAnswers);
  }, [answers]);

  useEffect(() => {
    if (screen !== "results" || !result) return;
    const sig = `${result.primaryType}|${result.wing ?? "none"}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("enneagram-test", "completed", {
      primary_type: result.primaryType,
      wing: result.wing,
      tier: result.tier.id,
      primary_gap: result.primaryGap,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = questions[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={TOTAL_QUESTIONS}
        selectedAnswer={(answers as EnneagramAnswers)[current.id] ?? null}
        onAnswer={handleAnswer}
        onBack={() => handleBack()}
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
