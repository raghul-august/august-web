"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameShell from "./GameShell";
import { STROOP_CONFIG } from "@/app/data/tools/drug-interaction-checker-config";
import { StroopRaw } from "@/app/utils/tools/drug-interaction-checker-scoring";

interface StroopTestProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  cumulative?: number | null;
  onComplete: (raw: StroopRaw) => void;
}

const STREAK_THRESHOLD = 3;

// Stroop ink colors. Words MUST stay uppercase to function as the canonical
// Stroop stimulus — the design-system sentence-case rule does not override
// the cognitive task definition. Hexes use the muted state palette.
const PALETTE = [
  { name: "RED", hex: "#B8453C" },
  { name: "BLUE", hex: "#3D6B7A" },
  { name: "GREEN", hex: "#3D8168" },
  { name: "YELLOW", hex: "#C68E2A" },
];

interface Trial {
  word: string;
  inkIndex: number;
}

function pickTrial(): Trial {
  const wordIdx = Math.floor(Math.random() * PALETTE.length);
  let inkIdx = Math.floor(Math.random() * PALETTE.length);
  if (inkIdx === wordIdx && Math.random() < 0.7) {
    inkIdx = (inkIdx + 1 + Math.floor(Math.random() * 3)) % PALETTE.length;
  }
  return { word: PALETTE[wordIdx].name, inkIndex: inkIdx };
}

type Phase = "ready" | "playing" | "feedback" | "done";

export default function StroopTest({
  step,
  totalSteps,
  onBack,
  cumulative,
  onComplete,
}: StroopTestProps) {
  const { trials: TOTAL, trialMs } = STROOP_CONFIG;
  const [phase, setPhase] = useState<Phase>("ready");
  const [trialIdx, setTrialIdx] = useState(0);
  const [trial, setTrial] = useState<Trial>(() => pickTrial());
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);
  const [streak, setStreak] = useState(0);
  const correctRef = useRef(0);
  const responseTimesRef = useRef<number[]>([]);
  const trialStartRef = useRef<number>(0);
  const trialTimerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (trialTimerRef.current !== null) {
      window.clearTimeout(trialTimerRef.current);
      trialTimerRef.current = null;
    }
  };
  useEffect(() => () => clearTimer(), []);

  const advance = useCallback(() => {
    const next = trialIdx + 1;
    if (next >= TOTAL) {
      setPhase("done");
      const sum = responseTimesRef.current.reduce((a, b) => a + b, 0);
      const avg = responseTimesRef.current.length
        ? sum / responseTimesRef.current.length
        : trialMs;
      onComplete({
        correct: correctRef.current,
        total: TOTAL,
        avgResponseMs: Math.round(avg),
      });
      return;
    }
    setTrialIdx(next);
    setTrial(pickTrial());
    setFeedback(null);
    setPhase("playing");
    trialStartRef.current = performance.now();
    clearTimer();
    trialTimerRef.current = window.setTimeout(() => {
      responseTimesRef.current.push(trialMs);
      setFeedback("wrong");
      setStreak(0);
      setPhase("feedback");
      window.setTimeout(advance, 400);
    }, trialMs);
  }, [trialIdx, TOTAL, trialMs, onComplete]);

  const startGame = () => {
    correctRef.current = 0;
    responseTimesRef.current = [];
    setTrialIdx(0);
    setTrial(pickTrial());
    setFeedback(null);
    setStreak(0);
    setPhase("playing");
    trialStartRef.current = performance.now();
    clearTimer();
    trialTimerRef.current = window.setTimeout(() => {
      responseTimesRef.current.push(trialMs);
      setFeedback("wrong");
      setStreak(0);
      setPhase("feedback");
      window.setTimeout(advance, 400);
    }, trialMs);
  };

  const handleAnswer = (idx: number) => {
    if (phase !== "playing") return;
    clearTimer();
    const ms = performance.now() - trialStartRef.current;
    responseTimesRef.current.push(ms);
    const correct = idx === trial.inkIndex;
    if (correct) {
      correctRef.current += 1;
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
    setFeedback(correct ? "right" : "wrong");
    setPhase("feedback");
    window.setTimeout(advance, 350);
  };

  const inkHex = PALETTE[trial.inkIndex].hex;

  return (
    <GameShell
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      cumulative={cumulative}
      title="Color trick"
      hint="Pick the COLOR of the ink, not what the word says. You've got a couple of seconds."
    >
      <div className="w-full flex items-center justify-between mb-3 text-[12px] text-[var(--text-tertiary)] tabular-nums font-medium">
        <span>
          Trial {Math.min(trialIdx + 1, TOTAL)} / {TOTAL}
        </span>
        <AnimatePresence>
          {streak >= STREAK_THRESHOLD && (
            <motion.span
              key={streak}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--brand-subtle)]"
              style={{ color: "var(--brand-primary)" }}
            >
              <span aria-hidden>🔥</span>
              <span className="text-[11px] font-medium tabular-nums">
                {streak} in a row
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div
        className="w-full max-w-[520px] aspect-[2/1] rounded-2xl border border-[var(--border-subtle)] flex items-center justify-center mb-6 transition-colors duration-200"
        style={{
          background:
            feedback === "right"
              ? "#E8F2ED" // success-50
              : feedback === "wrong"
                ? "#F7E5E3" // danger-50
                : "var(--surface-elevated)",
          minHeight: 180,
        }}
      >
        {phase === "ready" ? (
          <span className="text-[var(--text-secondary)] text-[14px]">
            Press start to begin
          </span>
        ) : (
          <span
            className="text-[2.75rem] tracking-[0.04em] select-none"
            style={{ color: inkHex, fontWeight: 500 }}
          >
            {trial.word}
          </span>
        )}
      </div>

      {phase === "ready" ? (
        <button
          type="button"
          onClick={startGame}
          className="h-12 px-6 rounded-full bg-[var(--brand-primary)] text-white font-medium text-[14px] border-none cursor-pointer hover:bg-[var(--brand-primary-hover)] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Start
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 w-full max-w-[460px]">
          {PALETTE.map((c, idx) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleAnswer(idx)}
              disabled={phase !== "playing"}
              aria-label={`Ink color ${c.name.toLowerCase()}`}
              className="h-14 rounded-full text-white font-medium text-[15px] border-none cursor-pointer active:scale-[0.98] transition-transform duration-100 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:outline-none"
              style={{ background: c.hex, touchAction: "manipulation" }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </GameShell>
  );
}
