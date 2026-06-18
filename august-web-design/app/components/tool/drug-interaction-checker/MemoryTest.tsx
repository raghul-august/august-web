"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "./GameShell";
import { MEMORY_CONFIG } from "@/app/data/tools/drug-interaction-checker-config";
import { MemoryRaw } from "@/app/utils/tools/drug-interaction-checker-scoring";

interface MemoryTestProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  cumulative?: number | null;
  onComplete: (raw: MemoryRaw) => void;
}

type Phase = "ready" | "showing" | "input" | "right" | "wrong" | "done";

// Simon-style cells must be visually distinguishable. Palette uses muted
// Danger / Info / Warning / Success base hexes from the design system semantic
// state table (section 3.5) so they read as august, not arcade.
//
// Each cell also has a tone (Hz) — pentatonic-ish so any combination sounds
// pleasant. Played on tap and on auto-flash via Web Audio.
const CELLS = [
  { id: 0, base: "#B8453C", glow: "rgba(184,69,60,0.45)", hz: 261.63 }, // danger / C4
  { id: 1, base: "#3D6B7A", glow: "rgba(61,107,122,0.45)", hz: 329.63 }, // info / E4
  { id: 2, base: "#C68E2A", glow: "rgba(198,142,42,0.45)", hz: 392.0 }, // warning / G4
  { id: 3, base: "#3D8168", glow: "rgba(61,129,104,0.45)", hz: 523.25 }, // success / C5
];

function randomSequence(length: number, cells: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * cells));
}

export default function MemoryTest({
  step,
  totalSteps,
  onBack,
  cumulative,
  onComplete,
}: MemoryTestProps) {
  const { rounds, startLength, cells, flashMs, gapMs } = MEMORY_CONFIG;
  const [phase, setPhase] = useState<Phase>("ready");
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [userIndex, setUserIndex] = useState(0);
  const correctRoundsRef = useRef(0);
  const longestRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const clearAllTimers = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
  };
  useEffect(() => () => {
    clearAllTimers();
    audioCtxRef.current?.close().catch(() => {});
  }, []);

  // Play a soft tone for the given cell. Lazily creates the AudioContext on
  // first interaction (autoplay-policy compliant). Respects reduced-motion as
  // a proxy for "user wants minimum stimulation."
  const playTone = useCallback(
    (cellId: number, durationMs = 220) => {
      if (typeof window === "undefined") return;
      try {
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }
        const W = window as unknown as {
          AudioContext?: typeof AudioContext;
          webkitAudioContext?: typeof AudioContext;
        };
        const Ctor = W.AudioContext ?? W.webkitAudioContext;
        if (!Ctor) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new Ctor();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const cell = CELLS.find((c) => c.id === cellId);
        osc.frequency.value = cell?.hz ?? 440;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + durationMs / 1000
        );
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + durationMs / 1000 + 0.05);
      } catch {
        // Audio failures should never break the game.
      }
    },
    []
  );

  const playSequence = useCallback(
    (seq: number[]) => {
      setPhase("showing");
      setActiveCell(null);
      seq.forEach((cell, i) => {
        const onAt = i * (flashMs + gapMs);
        const offAt = onAt + flashMs;
        timeoutsRef.current.push(
          window.setTimeout(() => {
            setActiveCell(cell);
            playTone(cell, flashMs);
          }, onAt)
        );
        timeoutsRef.current.push(
          window.setTimeout(() => setActiveCell(null), offAt)
        );
      });
      const totalMs = seq.length * (flashMs + gapMs);
      timeoutsRef.current.push(
        window.setTimeout(() => {
          setPhase("input");
          setUserIndex(0);
        }, totalMs + 200)
      );
    },
    [flashMs, gapMs, playTone]
  );

  const startRound = useCallback(
    (idx: number) => {
      const length = startLength + idx;
      const seq = randomSequence(length, cells);
      setRound(idx);
      setSequence(seq);
      playSequence(seq);
    },
    [startLength, cells, playSequence]
  );

  const handleStart = () => {
    correctRoundsRef.current = 0;
    longestRef.current = 0;
    startRound(0);
  };

  const finishRound = useCallback(
    (correct: boolean) => {
      if (correct) {
        correctRoundsRef.current += 1;
        if (sequence.length > longestRef.current) {
          longestRef.current = sequence.length;
        }
      }
      setPhase(correct ? "right" : "wrong");
      timeoutsRef.current.push(
        window.setTimeout(() => {
          const next = round + 1;
          if (!correct || next >= rounds) {
            setPhase("done");
            onComplete({
              correctRounds: correctRoundsRef.current,
              totalRounds: rounds,
              longestSequence: longestRef.current,
            });
          } else {
            startRound(next);
          }
        }, 850)
      );
    },
    [round, rounds, sequence.length, onComplete, startRound]
  );

  const handleCellPress = (idx: number) => {
    if (phase !== "input") return;
    setActiveCell(idx);
    playTone(idx, 200);
    window.setTimeout(() => setActiveCell(null), 180);
    if (sequence[userIndex] !== idx) {
      finishRound(false);
      return;
    }
    const next = userIndex + 1;
    if (next >= sequence.length) {
      finishRound(true);
    } else {
      setUserIndex(next);
    }
  };

  const status =
    phase === "ready"
      ? "Press start to see the pattern"
      : phase === "showing"
        ? "Watch carefully"
        : phase === "input"
          ? `Repeat the pattern (${userIndex} / ${sequence.length})`
          : phase === "right"
            ? "Nice — next round"
            : phase === "wrong"
              ? "Missed it"
              : "Done";

  return (
    <GameShell
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      cumulative={cumulative}
      title="Pattern memory"
      hint="Watch the colors flash, then tap them in the same order. Each round adds one."
    >
      <div className="w-full text-[12px] text-[var(--text-tertiary)] tabular-nums mb-3 text-center font-medium">
        Round {Math.min(round + 1, rounds)} / {rounds}
      </div>
      <div className="text-[14px] text-[var(--text-secondary)] mb-5 text-center min-h-[20px]">
        {status}
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-[420px]">
        {CELLS.slice(0, cells).map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={phase !== "input"}
            onClick={() => handleCellPress(c.id)}
            aria-label={`Cell ${c.id + 1}`}
            className="aspect-square rounded-2xl border border-[var(--border-subtle)] cursor-pointer transition-transform duration-100 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-default"
            style={{
              background: c.base,
              opacity:
                phase === "showing" && activeCell !== c.id
                  ? 0.55
                  : activeCell === c.id
                    ? 1
                    : 0.92,
              transform: activeCell === c.id ? "scale(1.03)" : undefined,
              boxShadow:
                activeCell === c.id
                  ? `0 0 0 3px var(--surface-elevated), 0 0 0 5px ${c.base}, 0 0 24px ${c.glow}`
                  : undefined,
              touchAction: "manipulation",
              minHeight: 88,
            }}
          />
        ))}
      </div>
      {phase === "ready" && (
        <button
          type="button"
          onClick={handleStart}
          className="mt-8 h-12 px-6 rounded-full bg-[var(--brand-primary)] text-white font-medium text-[14px] border-none cursor-pointer hover:bg-[var(--brand-primary-hover)] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Start
        </button>
      )}
    </GameShell>
  );
}
