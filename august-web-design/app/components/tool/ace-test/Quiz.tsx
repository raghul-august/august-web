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
  ACE_QUESTIONS,
  ACE_TOTAL,
} from "@/app/data/tools/ace-test-questions";
import {
  aceScoreBucket,
  computeAceResult,
  type AceAnswers,
  type AceResult,
} from "@/app/utils/tools/ace-test-scoring";
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
  } = useQuizState<0 | 1, Screen>({ initialScreen: "landing" });

  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("ace-test", "viewed");
  }, []);

  const advance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= ACE_TOTAL) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, 300);

  const handleStartTest = useCallback(() => {
    track("ace_test_started", { event_category: "ACE Test" });
    trackToolEvent("ace-test", "started");
    setAnswers({});
    setCurrentIndex(0);
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen]);

  const handleAnswer = useCallback(
    (value: 0 | 1) => {
      const question = ACE_QUESTIONS[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("ace_test_question_answered", {
        event_category: "ACE Test",
        question_number: question.id,
        answer_value: value,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<AceResult>(
    () => computeAceResult(answers as AceAnswers),
    [answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${aceScoreBucket(result.score)}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("ace-test", "completed", {
      score: result.score,
      score_bucket: aceScoreBucket(result.score),
      tier: result.tier.id,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = ACE_QUESTIONS[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={ACE_TOTAL}
        selectedAnswer={(answers as AceAnswers)[current.id] ?? null}
        onAnswer={handleAnswer}
        onBack={handleBack}
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
      afterContent={afterContent}
    />
  );
}
