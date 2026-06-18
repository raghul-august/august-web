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
import { track, trackToolEvent } from "@/app/utils/analytics";
import {
  computeReactionTimeResult,
  type ReactionTimeResult,
} from "@/app/utils/tools/reaction-time-scoring";
import LandingScreen from "./LandingScreen";
import GameScreen from "./GameScreen";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

type Screen = "landing" | "game" | "results";

export default function Quiz({ afterContent }: { afterContent?: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [times, setTimes] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const [runId, setRunId] = useState(0);
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("reaction-time", "viewed");
  }, []);

  const handleStartTest = useCallback(() => {
    track("reaction_time_started", { event_category: "Reaction Time" });
    trackToolEvent("reaction-time", "started");
    setTimes([]);
    setFalseStarts(0);
    setRunId((n) => n + 1);
    setScreen("game");
  }, []);

  const handleComplete = useCallback(
    (allTimes: number[], allFalseStarts: number) => {
      setTimes(allTimes);
      setFalseStarts(allFalseStarts);
      setScreen("results");
    },
    [],
  );

  const handleTrialRecorded = useCallback(
    (timeMs: number, trialIndex: number) => {
      trackToolEvent("reaction-time", "question_answered", {
        trial_number: trialIndex,
        time_ms: timeMs,
      });
    },
    [],
  );

  const handleFalseStart = useCallback(() => {
    track("reaction_time_false_start", { event_category: "Reaction Time" });
  }, []);

  const handleBack = useCallback(() => {
    setScreen("landing");
  }, []);

  const handleRestart = useCallback(() => {
    setTimes([]);
    setFalseStarts(0);
    setRunId((n) => n + 1);
    setScreen("landing");
  }, []);

  const result = useMemo<ReactionTimeResult | null>(
    () => computeReactionTimeResult(times, falseStarts),
    [times, falseStarts],
  );

  useEffect(() => {
    if (screen !== "results" || !result) return;
    const sig = `${result.averageMs}|${result.tier.id}|${result.trials.length}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("reaction-time", "completed", {
      average_ms: result.averageMs,
      best_ms: result.bestMs,
      worst_ms: result.worstMs,
      tier: result.tier.id,
      false_starts: result.falseStarts,
      trials: result.trials.length,
    });
  }, [screen, result]);

  if (screen === "game") {
    return (
      <GameScreen
        key={runId}
        onComplete={handleComplete}
        onBack={handleBack}
        onTrialRecorded={handleTrialRecorded}
        onFalseStart={handleFalseStart}
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
