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
} from "@/app/data/tools/am-i-pregnant-quiz-questions";
import {
  computePregnancyResult,
  pregnancyScoreBucket,
  type PregnancyAnswers,
  type PregnancyResult,
} from "@/app/utils/tools/am-i-pregnant-quiz-scoring";
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
    trackToolEvent("am-i-pregnant-quiz", "viewed");
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
    track("am_i_pregnant_quiz_started", {
      event_category: "Am I Pregnant Quiz",
    });
    trackToolEvent("am-i-pregnant-quiz", "started");
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = questions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("am_i_pregnant_quiz_question_answered", {
        event_category: "Am I Pregnant Quiz",
        question_number: question.id,
        question_key: question.key,
        section: question.section,
        answer_value: value,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<PregnancyResult | null>(() => {
    if (Object.keys(answers).length === 0) return null;
    return computePregnancyResult(answers as PregnancyAnswers);
  }, [answers]);

  useEffect(() => {
    if (screen !== "results" || !result) return;
    const sig = `${result.tier.id}|${result.score}|${result.testConfirmed ? 1 : 0}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("am-i-pregnant-quiz", "completed", {
      tier: result.tier.id,
      score: result.score,
      score_bucket: pregnancyScoreBucket(result.score),
      test_confirmed: result.testConfirmed,
      percent: result.percent,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = questions[currentIndex];
    return (
      <QuestionScreen
        question={current}
        currentIndex={currentIndex}
        totalQuestions={TOTAL_QUESTIONS}
        selectedAnswer={(answers as PregnancyAnswers)[current.id] ?? null}
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
