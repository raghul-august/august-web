"use client";

import { motion } from "framer-motion";
import QuizContainer from "../shared/QuizContainer";

interface InterTestCardProps {
  justFinishedLabel: string;
  justFinishedScore: number;
  nextLabel: string;
  step: number; // 0-indexed step JUST FINISHED
  totalSteps: number;
  onContinue: () => void;
  onAutoContinueMs?: number;
}

export default function InterTestCard({
  justFinishedLabel,
  justFinishedScore,
  nextLabel,
  step,
  totalSteps,
  onContinue,
  onAutoContinueMs = 1800,
}: InterTestCardProps) {
  const callbackRef = (el: HTMLDivElement | null) => {
    if (!el) return;
    if (onAutoContinueMs <= 0) return;
    const t = window.setTimeout(onContinue, onAutoContinueMs);
    el.dataset.timer = String(t);
  };

  const toneColor =
    justFinishedScore >= 70
      ? "var(--brand-primary)"
      : justFinishedScore >= 40
        ? "var(--text-secondary)"
        : "var(--text-tertiary)";
  const toneLabel =
    justFinishedScore >= 70
      ? "Strong"
      : justFinishedScore >= 40
        ? "Moderate"
        : "Low";

  return (
    <QuizContainer showFooter={false}>
      <div
        ref={callbackRef}
        className="max-w-[560px] mx-auto px-5 pt-12 pb-20 w-full flex-1 flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full text-center"
        >
          <p
            className="text-[12px] font-medium mb-6"
            style={{
              color: "var(--text-tertiary)",
              letterSpacing: "0.04em",
            }}
          >
            Test {step + 1} of {totalSteps} done
          </p>

          <p
            className="text-[15px] mb-3"
            style={{ color: "var(--text-tertiary)", fontWeight: 300 }}
          >
            {justFinishedLabel}
          </p>

          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span
              className="text-[3rem] tabular-nums leading-none font-medium"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {justFinishedScore}
            </span>
            <span
              className="text-[16px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              / 100
            </span>
          </div>

          <p
            className="text-[13px] font-medium mb-8"
            style={{ color: toneColor }}
          >
            {toneLabel}
          </p>

          <div
            className="relative w-full max-w-[360px] mx-auto h-1.5 rounded-full overflow-hidden mb-10"
            style={{ background: "var(--border-subtle)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.max(0, Math.min(100, justFinishedScore))}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="h-full rounded-full"
              style={{ background: "var(--brand-primary)" }}
            />
          </div>

          <p
            className="text-[15px] leading-[1.65] mb-8"
            style={{ color: "var(--text-secondary)", fontWeight: 300 }}
          >
            Up next:{" "}
            <span
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {nextLabel}
            </span>
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="rounded-full px-10 py-3.5 text-[15px] font-medium cursor-pointer transition-colors duration-200 hover:bg-[var(--brand-primary-hover)]"
            style={{
              background: "var(--brand-primary)",
              color: "var(--text-inverse)",
              border: "none",
            }}
          >
            Continue
          </button>
        </motion.div>
      </div>
    </QuizContainer>
  );
}
