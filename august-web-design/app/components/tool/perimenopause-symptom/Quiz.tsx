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
  PERIMENOPAUSE_QUESTIONS,
  PERIMENOPAUSE_TOTAL,
} from "@/app/data/tools/perimenopause-symptom-questions";
import {
  computePerimenopauseResult,
  perimenopauseScoreBucket,
  type PerimenopauseAnswers,
  type PerimenopauseResult,
} from "@/app/utils/tools/perimenopause-symptom-scoring";
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
  } = useQuizState<0 | 1 | 2 | 3, Screen>({ initialScreen: "landing" });

  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("perimenopause-symptom", "viewed");
  }, []);

  const advance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= PERIMENOPAUSE_TOTAL) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, 300);

  const handleStartTest = useCallback(() => {
    track("perimenopause_test_started", {
      event_category: "Perimenopause Test",
    });
    trackToolEvent("perimenopause-symptom", "started");
    setAnswers({});
    setCurrentIndex(0);
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen]);

  const handleAnswer = useCallback(
    (value: 0 | 1 | 2 | 3) => {
      const question = PERIMENOPAUSE_QUESTIONS[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("perimenopause_test_question_answered", {
        event_category: "Perimenopause Test",
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

  const result = useMemo<PerimenopauseResult>(
    () => computePerimenopauseResult(answers as PerimenopauseAnswers),
    [answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${perimenopauseScoreBucket(result.score)}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("perimenopause-symptom", "completed", {
      score: result.score,
      score_bucket: perimenopauseScoreBucket(result.score),
      tier: result.tier.id,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = PERIMENOPAUSE_QUESTIONS[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={PERIMENOPAUSE_TOTAL}
        selectedAnswer={(answers as PerimenopauseAnswers)[current.id] ?? null}
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
