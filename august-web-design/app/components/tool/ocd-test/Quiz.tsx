"use client";

import {
  lazy,
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getQuestionsForTrack,
  type OcdTrack,
} from "@/app/data/tools/ocd-test-questions";
import {
  computeOcdResult,
  ocdScoreBucket,
  type OcdAnswers,
  type OcdResult,
} from "@/app/utils/tools/ocd-test-scoring";
import { track, trackToolEvent } from "@/app/utils/analytics";
import LandingScreen from "./LandingScreen";
import TrackSelectScreen from "./TrackSelectScreen";
import QuestionScreen from "./QuestionScreen";
import { useQuizState } from "../shared/hooks/useQuizState";
import { useAutoAdvance } from "../shared/hooks/useAutoAdvance";
import { useQuestionTimer } from "../shared/hooks/useQuestionTimer";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

type Screen = "landing" | "track" | "question" | "results";

export default function Quiz({ afterContent }: { afterContent?: ReactNode }) {
  const {
    screen,
    setScreen,
    currentIndex,
    setCurrentIndex,
    answers,
    setAnswers,
    handleBack: baseHandleBack,
    handleRestart: baseHandleRestart,
  } = useQuizState<number, Screen>({ initialScreen: "landing" });
  const [selectedTrack, setSelectedTrack] = useState<OcdTrack | null>(null);
  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("ocd-test", "viewed");
  }, []);

  const trackQuestions = useMemo(
    () => (selectedTrack ? getQuestionsForTrack(selectedTrack) : []),
    [selectedTrack],
  );
  const totalQuestions = trackQuestions.length;

  const advance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, 300);

  const handleStartTest = useCallback(() => {
    track("ocd_test_started", {
      event_category: "OCD Test",
    });
    trackToolEvent("ocd-test", "started");
    setAnswers({});
    setCurrentIndex(0);
    setSelectedTrack(null);
    setScreen("track");
  }, [setAnswers, setCurrentIndex, setScreen]);

  const handleTrackSelect = useCallback(
    (chosen: OcdTrack) => {
      track("ocd_test_track_selected", {
        event_category: "OCD Test",
        ocd_track: chosen,
      });
      setSelectedTrack(chosen);
      setAnswers({});
      setCurrentIndex(0);
      timer.reset();
      setScreen("question");
    },
    [setAnswers, setCurrentIndex, setScreen, timer],
  );

  const handleAnswer = useCallback(
    (value: number) => {
      if (!selectedTrack) return;
      const question = trackQuestions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();

      track("ocd_test_question_answered", {
        event_category: "OCD Test",
        ocd_track: selectedTrack,
        question_number: question.id,
        answer_value: value,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
      });

      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      advance();
    },
    [selectedTrack, trackQuestions, currentIndex, answers, setAnswers, advance, timer],
  );

  const handleBack = useCallback(() => {
    if (screen === "question" && currentIndex === 0) {
      setScreen("track");
      return;
    }
    baseHandleBack();
  }, [screen, currentIndex, baseHandleBack, setScreen]);

  const handleRestart = useCallback(() => {
    setSelectedTrack(null);
    baseHandleRestart();
  }, [baseHandleRestart]);

  const result = useMemo<OcdResult | null>(
    () =>
      selectedTrack
        ? computeOcdResult(selectedTrack, answers as OcdAnswers)
        : null,
    [selectedTrack, answers],
  );

  useEffect(() => {
    if (screen !== "results" || !result) return;
    const sig = `${result.track}|${ocdScoreBucket(result.track, result.score)}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("ocd-test", "completed", {
      ocd_track: result.track,
      score: result.score,
      score_bucket: ocdScoreBucket(result.track, result.score),
      tier: result.tier.id,
      above_cutoff: result.aboveCutoff,
    });
  }, [screen, result]);

  if (screen === "track") {
    return (
      <TrackSelectScreen
        onSelect={handleTrackSelect}
        onBack={() => setScreen("landing")}
      />
    );
  }

  if (screen === "question" && selectedTrack) {
    const current = trackQuestions[currentIndex];
    return (
      <QuestionScreen
        question={current}
        track={selectedTrack}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        selectedAnswer={(answers as OcdAnswers)[current.id] ?? null}
        onAnswer={handleAnswer}
        onBack={handleBack}
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
