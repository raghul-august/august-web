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
  COLOR_BLIND_PLATES,
  COLOR_BLIND_TOTAL,
} from "@/app/data/tools/color-blind-test-questions";
import {
  colorBlindScoreBucket,
  computeColorBlindResult,
  type ColorBlindAnswers,
  type ColorBlindResult,
} from "@/app/utils/tools/color-blind-test-scoring";
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
  } = useQuizState<string, Screen>({ initialScreen: "landing" });

  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("color-blind-test", "viewed");
  }, []);

  const advance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= COLOR_BLIND_TOTAL) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, 300);

  const handleStartTest = useCallback(() => {
    track("color_blind_test_started", { event_category: "Color Blind Test" });
    trackToolEvent("color-blind-test", "started");
    setAnswers({});
    setCurrentIndex(0);
    setScreen("question");
  }, [setAnswers, setCurrentIndex, setScreen]);

  const handleAnswer = useCallback(
    (value: string) => {
      const plate = COLOR_BLIND_PLATES[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("color_blind_test_question_answered", {
        event_category: "Color Blind Test",
        plate_id: plate.id,
        plate_type: plate.deficiencyType,
        answer_value: value,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [plate.id]: value }));
      advance();
    },
    [currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<ColorBlindResult>(
    () => computeColorBlindResult(answers as ColorBlindAnswers),
    [answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${colorBlindScoreBucket(result.score)}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("color-blind-test", "completed", {
      score: result.score,
      total: result.total,
      score_bucket: colorBlindScoreBucket(result.score),
      tier: result.tier.id,
      protan_misses: result.patternCounts.protan,
      deutan_misses: result.patternCounts.deutan,
      tritan_misses: result.patternCounts.tritan,
      red_green_misses: result.patternCounts.redGreen,
    });
  }, [screen, result]);

  if (screen === "question") {
    const current = COLOR_BLIND_PLATES[currentIndex];
    return (
      <QuestionScreen
        plate={current}
        currentIndex={currentIndex}
        totalQuestions={COLOR_BLIND_TOTAL}
        selectedAnswer={(answers as ColorBlindAnswers)[current.id] ?? null}
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

  return <LandingScreen onStartTest={handleStartTest} afterContent={afterContent} />;
}
