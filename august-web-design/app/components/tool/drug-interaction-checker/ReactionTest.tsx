"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "./GameShell";
import { REACTION_CONFIG } from "@/app/data/tools/drug-interaction-checker-config";
import { ReactionRaw } from "@/app/utils/tools/drug-interaction-checker-scoring";

interface ReactionTestProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  cumulative?: number | null;
  onComplete: (raw: ReactionRaw) => void;
}

// Color a single trial dot by reaction time.
function dotColorFor(ms: number, goodMs: number, badMs: number): string {
  if (ms <= goodMs) return "#3D8168"; // success
  if (ms >= badMs) return "#B8453C"; // danger
  return "#C68E2A"; // warning
}

type Phase = "ready" | "waiting" | "go" | "tooSoon" | "result" | "done";

// Game-state colors. Sage is brand-reserved per design system, so red/green
// here use the muted Danger/Success palette tokens, not raw hex.
const SURFACE = {
  ready: "var(--surface-elevated)",
  waiting: "#B8453C", // danger base — game red
  go: "#3D8168", // success base — game green
  tooSoon: "#C68E2A", // warning base — too-soon amber
  result: "var(--surface-elevated)",
  done: "var(--surface-elevated)",
} as const;

export default function ReactionTest({
  step,
  totalSteps,
  onBack,
  cumulative,
  onComplete,
}: ReactionTestProps) {
  const { trials: TRIALS, minDelay, maxDelay, goodMs, badMs } = REACTION_CONFIG;
  const [phase, setPhase] = useState<Phase>("ready");
  const [trialIndex, setTrialIndex] = useState(0);
  const [lastMs, setLastMs] = useState<number | null>(null);
  // Trial history for the inline trial-history dots. Mirrors trialsRef but
  // triggers re-renders.
  const [trialHistory, setTrialHistory] = useState<number[]>([]);
  const trialsRef = useRef<number[]>([]);
  const falseStartsRef = useRef(0);
  const goAtRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => () => clearTimer(), []);

  const startTrial = useCallback(() => {
    setPhase("waiting");
    const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
    timeoutRef.current = window.setTimeout(() => {
      goAtRef.current = performance.now();
      setPhase("go");
    }, delay);
  }, [minDelay, maxDelay]);

  const finishTrial = useCallback(
    (ms: number) => {
      trialsRef.current.push(ms);
      setTrialHistory([...trialsRef.current]);
      setLastMs(ms);
      setPhase("result");
      timeoutRef.current = window.setTimeout(() => {
        const next = trialIndex + 1;
        if (next >= TRIALS) {
          setPhase("done");
          onComplete({
            trials: trialsRef.current,
            falseStarts: falseStartsRef.current,
          });
        } else {
          setTrialIndex(next);
          startTrial();
        }
      }, 700);
    },
    [trialIndex, TRIALS, onComplete, startTrial]
  );

  const handleTap = useCallback(() => {
    if (phase === "waiting") {
      clearTimer();
      falseStartsRef.current += 1;
      setPhase("tooSoon");
      timeoutRef.current = window.setTimeout(() => {
        startTrial();
      }, 900);
    } else if (phase === "go") {
      const now = performance.now();
      const ms = goAtRef.current ? Math.round(now - goAtRef.current) : 0;
      finishTrial(ms);
    } else if (phase === "ready") {
      setTrialIndex(0);
      trialsRef.current = [];
      setTrialHistory([]);
      falseStartsRef.current = 0;
      startTrial();
    }
  }, [phase, finishTrial, startTrial]);

  const surface = SURFACE[phase];
  const isHotSurface = phase === "waiting" || phase === "go" || phase === "tooSoon";

  const label =
    phase === "ready"
      ? "Tap to start"
      : phase === "waiting"
        ? "Wait for green"
        : phase === "go"
          ? "Tap now"
          : phase === "tooSoon"
            ? "Too soon — keep going"
            : phase === "result"
              ? `${lastMs} ms`
              : "Done";

  return (
    <GameShell
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      cumulative={cumulative}
      title="Reaction tap"
      hint="Tap when the screen flips green. Don't tap too soon."
    >
      <div className="w-full flex items-center justify-between mb-3 text-[12px] text-[var(--text-tertiary)] tabular-nums font-medium">
        <span>
          Trial {Math.min(trialIndex + 1, TRIALS)} / {TRIALS}
        </span>
        <div className="flex items-center gap-1.5" aria-label="Trial history">
          {Array.from({ length: TRIALS }).map((_, i) => {
            const ms = trialHistory[i];
            const filled = ms !== undefined;
            return (
              <span
                key={i}
                className="w-[10px] h-[10px] rounded-full"
                style={{
                  background: filled
                    ? dotColorFor(ms, goodMs, badMs)
                    : "var(--border-subtle)",
                  border: filled
                    ? "none"
                    : "1px solid var(--border-subtle)",
                }}
                title={filled ? `${ms} ms` : "Pending"}
              />
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={handleTap}
        aria-label={label}
        disabled={phase === "done"}
        className="w-full max-w-[560px] rounded-2xl border border-[var(--border-subtle)] flex items-center justify-center select-none active:scale-[0.99] transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:outline-none"
        style={{
          background: surface,
          color: isHotSurface ? "var(--text-inverse, #FFFFFF)" : "var(--text-primary)",
          minHeight: "min(60vh, 460px)",
          touchAction: "manipulation",
          fontSize: "1.25rem",
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </button>
      <div className="w-full text-[12px] text-[var(--text-tertiary)] mt-4 text-center">
        Best results in a quiet, still moment.
      </div>
    </GameShell>
  );
}
