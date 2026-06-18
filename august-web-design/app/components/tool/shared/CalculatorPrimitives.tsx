"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { track } from "@/app/utils/analytics";

export function AnimatedStepPanel({
  stepKey,
  children,
}: {
  stepKey: string | number;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function ToolResultActions({
  toolId,
  chatMessage,
  onRestart,
}: {
toolId: string;
  chatMessage: string;
  onRestart: () => void;
}) {
  return (
    <div className="tool-result-actions flex flex-row justify-center">
      <a
        href={`/chat?msg=${encodeURIComponent(chatMessage)}`}
        className="tool-btn tool-btn--primary"
        onClick={() => track("tool_cta_clicked", { tool: toolId, target: "chat" })}
      >
        Talk to august
      </a>
      <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
        Start over
      </button>
    </div>
  );
}

export function WizardNavigation({
  step,
  totalSteps,
  canAdvance,
  onNext,
  onBack,
  isLastFormStep,
}: {
  step: number;
  totalSteps: number;
  canAdvance: boolean;
  onNext: () => void;
  onBack: () => void;
  isLastFormStep: boolean;
}) {
  return (
    <div className="tool-wizard-nav">
      {step > 0 ? (
        <button type="button" className="tool-btn tool-btn--ghost tool-nav-btn" onClick={onBack}>
          <ArrowLeftIcon size={14} weight="bold" aria-hidden />
          Back
        </button>
      ) : (
        <div />
      )}

      <div className="tool-wizard-dots" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={`tool-wizard-dot${
              i === step ? " tool-wizard-dot--active" : i < step ? " tool-wizard-dot--completed" : ""
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        className="tool-btn tool-btn--primary tool-nav-btn"
        disabled={!canAdvance}
        onClick={onNext}
      >
        {isLastFormStep ? "Calculate" : "Next"}
        <ArrowRightIcon size={14} weight="bold" aria-hidden />
      </button>
    </div>
  );
}
