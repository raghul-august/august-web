"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameShell from "./GameShell";
import { DOT_CHASE_CONFIG } from "@/app/data/tools/drug-interaction-checker-config";
import { DotChaseRaw } from "@/app/utils/tools/drug-interaction-checker-scoring";

interface DotTrackerTestProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  cumulative?: number | null;
  onComplete: (raw: DotChaseRaw) => void;
}

type Phase = "ready" | "playing" | "done";

interface DotPos {
  xPct: number;
  yPct: number;
}

interface Ripple {
  id: number;
  xPct: number;
  yPct: number;
}

function pickPosition(): DotPos {
  const margin = 12;
  const xPct = margin + Math.random() * (100 - margin * 2);
  const yPct = margin + Math.random() * (100 - margin * 2);
  return { xPct, yPct };
}

export default function DotTrackerTest({
  step,
  totalSteps,
  onBack,
  cumulative,
  onComplete,
}: DotTrackerTestProps) {
  const { duration, initialIntervalMs, minIntervalMs, intervalStepMs, dotSize } =
    DOT_CHASE_CONFIG;

  const [phase, setPhase] = useState<Phase>("ready");
  const [pos, setPos] = useState<DotPos>(() => pickPosition());
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleIdRef = useRef(0);
  const intervalRef = useRef<number>(initialIntervalMs);
  const dotShownAtRef = useRef<number>(0);
  const tapTimesRef = useRef<number[]>([]);
  const jumpTimerRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);

  const clearAll = () => {
    if (jumpTimerRef.current !== null) window.clearTimeout(jumpTimerRef.current);
    if (tickTimerRef.current !== null) window.clearInterval(tickTimerRef.current);
    jumpTimerRef.current = null;
    tickTimerRef.current = null;
  };
  useEffect(() => () => clearAll(), []);

  const finish = useCallback(() => {
    clearAll();
    setPhase("done");
    const sum = tapTimesRef.current.reduce((a, b) => a + b, 0);
    const avgTapMs = tapTimesRef.current.length
      ? Math.round(sum / tapTimesRef.current.length)
      : 1200;
    onComplete({
      hits: hitsRef.current,
      misses: missesRef.current,
      avgTapMs,
    });
  }, [onComplete]);

  const scheduleJump = useCallback(() => {
    if (jumpTimerRef.current !== null) window.clearTimeout(jumpTimerRef.current);
    jumpTimerRef.current = window.setTimeout(() => {
      missesRef.current += 1;
      setMisses((m) => m + 1);
      setPos(pickPosition());
      dotShownAtRef.current = performance.now();
      scheduleJump();
    }, intervalRef.current);
  }, []);

  const startGame = () => {
    hitsRef.current = 0;
    missesRef.current = 0;
    tapTimesRef.current = [];
    intervalRef.current = initialIntervalMs;
    setHits(0);
    setMisses(0);
    setTimeLeft(duration);
    setPos(pickPosition());
    setPhase("playing");
    dotShownAtRef.current = performance.now();
    scheduleJump();
    const startedAt = performance.now();
    tickTimerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const left = Math.max(0, duration - elapsed);
      setTimeLeft(left);
      if (left <= 0) finish();
    }, 100);
  };

  const handleTapDot = () => {
    if (phase !== "playing") return;
    const now = performance.now();
    const ms = now - dotShownAtRef.current;
    tapTimesRef.current.push(ms);
    hitsRef.current += 1;
    setHits((h) => h + 1);
    // Spawn a ripple at the dot's current position before it jumps. ID is
    // monotonically increasing so AnimatePresence can track them.
    const id = rippleIdRef.current++;
    setRipples((r) => [...r, { id, xPct: pos.xPct, yPct: pos.yPct }]);
    window.setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== id));
    }, 600);
    intervalRef.current = Math.max(
      minIntervalMs,
      intervalRef.current - intervalStepMs
    );
    setPos(pickPosition());
    dotShownAtRef.current = performance.now();
    scheduleJump();
  };

  const seconds = Math.ceil(timeLeft / 1000);
  // Bigger tap target than the visual dot — comfortably above the 44px minimum.
  const tapSize = Math.max(72, dotSize);

  return (
    <GameShell
      step={step}
      totalSteps={totalSteps}
      onBack={onBack}
      cumulative={cumulative}
      title="Dot chase"
      hint="Tap the sage dot before it jumps. It speeds up as you go."
    >
      <div className="w-full flex items-center justify-between mb-4 text-[12px] text-[var(--text-tertiary)] tabular-nums font-medium">
        <span>Hits {hits}</span>
        <span>Time {seconds}s</span>
        <span>Misses {misses}</span>
      </div>

      <div
        className="relative w-full max-w-[520px] aspect-square rounded-2xl border border-[var(--border-subtle)] overflow-hidden"
        style={{
          background: "var(--brand-subtle)",
          touchAction: "manipulation",
        }}
      >
        {/* Tap ripples — radial wave from each successful tap */}
        <AnimatePresence>
          {ripples.map((rp) => (
            <motion.span
              key={rp.id}
              aria-hidden
              initial={{ opacity: 0.5, scale: 0.4 }}
              animate={{ opacity: 0, scale: 2.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                left: `${rp.xPct}%`,
                top: `${rp.yPct}%`,
                width: tapSize,
                height: tapSize,
                border: "2px solid var(--brand-primary)",
              }}
            />
          ))}
        </AnimatePresence>
        {phase === "playing" && (
          <button
            type="button"
            onClick={handleTapDot}
            aria-label="Tap dot"
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-none cursor-pointer transition-[left,top] duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:outline-none"
            style={{
              left: `${pos.xPct}%`,
              top: `${pos.yPct}%`,
              width: tapSize,
              height: tapSize,
              background: "var(--brand-primary)",
              boxShadow:
                "0 0 0 3px var(--surface-elevated), 0 0 0 5px var(--brand-primary)",
            }}
          />
        )}
        {phase === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={startGame}
              className="h-12 px-6 rounded-full bg-[var(--brand-primary)] text-white font-medium text-[14px] border-none cursor-pointer hover:bg-[var(--brand-primary-hover)] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Start
            </button>
          </div>
        )}
        {phase === "done" && (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)] text-[14px]">
            Finished
          </div>
        )}
      </div>
      <div className="text-[12px] text-[var(--text-tertiary)] mt-4 text-center">
        Faster taps shrink the next interval. Don&apos;t panic.
      </div>
    </GameShell>
  );
}
