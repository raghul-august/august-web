"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FALSE_START_FLOOR_MS,
  NUM_TRIALS,
  WAIT_MAX_MS,
  WAIT_MIN_MS,
} from "@/app/data/tools/reaction-time-config";
import QuizContainer from "../shared/QuizContainer";
import QuizQuestionHeader from "../shared/QuizQuestionHeader";

export type GamePhase = "ready" | "waiting" | "go" | "result" | "tooSoon";

interface GameScreenProps {
  onComplete: (times: number[], falseStarts: number) => void;
  onBack: () => void;
  onTrialRecorded?: (timeMs: number, trialIndex: number) => void;
  onFalseStart?: () => void;
}

function randomWaitMs() {
  return Math.floor(
    Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS) + WAIT_MIN_MS,
  );
}

export default function GameScreen({
  onComplete,
  onBack,
  onTrialRecorded,
  onFalseStart,
}: GameScreenProps) {
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [trialsCompleted, setTrialsCompleted] = useState(0);
  const [lastTime, setLastTime] = useState<number | null>(null);

  const timesRef = useRef<number[]>([]);
  const falseStartsRef = useRef(0);
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goStartRef = useRef<number>(0);

  const clearWaitTimer = useCallback(() => {
    if (waitTimerRef.current !== null) {
      clearTimeout(waitTimerRef.current);
      waitTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearWaitTimer(), [clearWaitTimer]);

  const startWaiting = useCallback(() => {
    setPhase("waiting");
    clearWaitTimer();
    waitTimerRef.current = setTimeout(() => {
      goStartRef.current = performance.now();
      setPhase("go");
    }, randomWaitMs());
  }, [clearWaitTimer]);

  const handleStageClick = useCallback(() => {
    if (phase === "ready") {
      startWaiting();
      return;
    }

    if (phase === "waiting") {
      // Clicked before green appeared = false start.
      clearWaitTimer();
      falseStartsRef.current += 1;
      onFalseStart?.();
      setPhase("tooSoon");
      return;
    }

    if (phase === "go") {
      const reaction = performance.now() - goStartRef.current;
      if (reaction < FALSE_START_FLOOR_MS) {
        // Implausibly fast — treat as a false start.
        falseStartsRef.current += 1;
        onFalseStart?.();
        setPhase("tooSoon");
        return;
      }
      const rounded = Math.round(reaction);
      timesRef.current = [...timesRef.current, rounded];
      const nextCount = timesRef.current.length;
      setTrialsCompleted(nextCount);
      setLastTime(rounded);
      onTrialRecorded?.(rounded, nextCount);
      setPhase("result");
      return;
    }

    if (phase === "result") {
      if (timesRef.current.length >= NUM_TRIALS) {
        onComplete([...timesRef.current], falseStartsRef.current);
        return;
      }
      startWaiting();
      return;
    }

    if (phase === "tooSoon") {
      startWaiting();
    }
  }, [phase, startWaiting, clearWaitTimer, onComplete, onFalseStart, onTrialRecorded]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleStageClick();
      }
    },
    [handleStageClick],
  );

  const stageClass = `rt-stage rt-stage--${
    phase === "tooSoon" ? "too-soon" : phase
  } rt-stage-enter`;

  // Index used by the header progress bar (0-based for the currently-displayed
  // trial). After a result, we're still "on" the trial just recorded.
  const headerIndex =
    phase === "result"
      ? Math.max(0, trialsCompleted - 1)
      : Math.min(trialsCompleted, NUM_TRIALS - 1);

  return (
    <QuizContainer showFooter={true}>
      <QuizQuestionHeader
        currentIndex={headerIndex}
        totalQuestions={NUM_TRIALS}
        onBack={onBack}
      />

      <div className="flex-1 flex flex-col justify-center px-5 pb-10 max-w-[640px] mx-auto w-full">
        <div
          role="button"
          tabIndex={0}
          aria-label="Reaction time stage. Click when the screen turns green."
          className={stageClass}
          onClick={handleStageClick}
          onKeyDown={handleKeyDown}
        >
          {phase === "ready" && (
            <>
              <div className="rt-stage-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </div>
              <h2 className="rt-stage-title">Click to start</h2>
              <p className="rt-stage-subtitle">
                When the box turns red, wait — then click the instant it turns
                green.
              </p>
            </>
          )}

          {phase === "waiting" && (
            <>
              <div className="rt-stage-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <h2 className="rt-stage-title">Wait for green…</h2>
              <p className="rt-stage-subtitle">
                Don&apos;t click yet. Stay ready.
              </p>
            </>
          )}

          {phase === "go" && (
            <>
              <div className="rt-stage-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </div>
              <h2 className="rt-stage-title">Click!</h2>
              <p className="rt-stage-subtitle">As fast as you can.</p>
            </>
          )}

          {phase === "result" && lastTime !== null && (
            <>
              <p className="rt-stage-subtitle" style={{ marginTop: 0, marginBottom: 14, opacity: 0.85 }}>
                Trial {trialsCompleted} of {NUM_TRIALS}
              </p>
              <p className="rt-stage-time">
                {lastTime}
                <span className="rt-stage-time-unit">ms</span>
              </p>
              <p className="rt-stage-subtitle">
                {trialsCompleted >= NUM_TRIALS
                  ? "Click to see your results"
                  : "Click to continue"}
              </p>
            </>
          )}

          {phase === "tooSoon" && (
            <>
              <div className="rt-stage-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4" />
                  <path d="M12 16h0" />
                </svg>
              </div>
              <h2 className="rt-stage-title">Too soon!</h2>
              <p className="rt-stage-subtitle">
                You clicked before the green. This trial doesn&apos;t count —
                click to try again.
              </p>
            </>
          )}

          <div className="rt-trial-dots" aria-hidden="true">
            {Array.from({ length: NUM_TRIALS }).map((_, i) => {
              const done = i < trialsCompleted;
              const current =
                !done &&
                i === Math.min(trialsCompleted, NUM_TRIALS - 1) &&
                phase !== "result";
              return (
                <span
                  key={i}
                  className={`rt-trial-dot ${
                    done ? "rt-trial-dot--done" : ""
                  } ${current ? "rt-trial-dot--current" : ""}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
