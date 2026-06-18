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
} from "@/app/data/tools/attachment-style-questions";
import {
  computeAttachmentResult,
  type AttachmentAnswers,
  type AttachmentResult,
} from "@/app/utils/tools/attachment-style-scoring";
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
    trackToolEvent("attachment-style", "viewed");
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
    track("attachment_style_test_started", {
      event_category: "Attachment Style Test",
    });
    trackToolEvent("attachment-style", "started");
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = questions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("attachment_style_question_answered", {
        event_category: "Attachment Style Test",
        question_number: question.id,
        axis: question.axis,
        reverse: question.reverse ?? false,
        answer_value: value,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<AttachmentResult | null>(() => {
    if (Object.keys(answers).length === 0) return null;
    return computeAttachmentResult(answers as AttachmentAnswers);
  }, [answers]);

  useEffect(() => {
    if (screen !== "results" || !result) return;
    const sig = `${result.primary}|${result.secondary}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("attachment-style", "completed", {
      primary_style: result.primary,
      secondary_style: result.secondary,
      tier: result.tier.id,
      anxiety_percent: result.anxiety.percent,
      avoidance_percent: result.avoidance.percent,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = questions[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={TOTAL_QUESTIONS}
        selectedAnswer={(answers as AttachmentAnswers)[current.id] ?? null}
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

  return <LandingScreen onStartTest={handleStartTest} afterContent={afterContent} />;
}
