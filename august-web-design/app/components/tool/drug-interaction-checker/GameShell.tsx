"use client";

import React from "react";
import { motion } from "framer-motion";
import QuizContainer from "../shared/QuizContainer";
import QuizQuestionHeader from "../shared/QuizQuestionHeader";

interface GameShellProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  title: string;
  hint: string;
  cumulative?: number | null;
  children: React.ReactNode;
}

export default function GameShell({
  step,
  totalSteps,
  onBack,
  title,
  hint,
  cumulative,
  children,
}: GameShellProps) {
  const showGauge =
    cumulative !== null && cumulative !== undefined && step > 0;

  return (
    <QuizContainer showFooter={false}>
      <QuizQuestionHeader
        currentIndex={step}
        totalQuestions={totalSteps}
        onBack={onBack}
      />

      {/* Running score gauge — visible from test 2 onward */}
      {showGauge && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-[640px] mx-auto px-5 mb-2"
        >
          <div
            className="flex items-center gap-3 rounded-full pl-4 pr-3 py-2"
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span
              className="text-[12px] font-medium"
              style={{ color: "var(--text-tertiary)" }}
            >
              Running score
            </span>
            <div
              className="flex-1 h-1 rounded-full overflow-hidden"
              style={{ background: "var(--border-subtle)" }}
            >
              <motion.div
                key={cumulative}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(0, Math.min(100, cumulative))}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "var(--brand-primary)" }}
              />
            </div>
            <span
              className="text-[13px] tabular-nums font-medium min-w-[34px] text-right"
              style={{ color: "var(--text-primary)" }}
            >
              {cumulative}
            </span>
          </div>
        </motion.div>
      )}

      {/* Test header sits flat on cream — no outer card. The test content
          (button/board) below is the visible card-like element. */}
      <div className="max-w-[640px] mx-auto px-5 pt-8 pb-12 w-full">
        <div className="text-center mb-8">
          <p
            className="text-[12px] font-medium mb-3"
            style={{
              color: "var(--text-tertiary)",
              letterSpacing: "0.04em",
            }}
          >
            Test {step + 1} of {totalSteps}
          </p>
          <h2
            className="text-[1.75rem] font-medium mb-3"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          <p
            className="text-[15px] leading-[1.65] max-w-[480px] mx-auto"
            style={{ color: "var(--text-secondary)", fontWeight: 300 }}
          >
            {hint}
          </p>
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </QuizContainer>
  );
}
