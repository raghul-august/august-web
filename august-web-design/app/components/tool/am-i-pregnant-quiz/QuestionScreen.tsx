"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";
import type { PregnancyQuestion } from "@/app/data/tools/am-i-pregnant-quiz-questions";
import QuizQuestionScreen from "../shared/QuizQuestionScreen";

interface QuestionScreenProps {
  question: PregnancyQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswer: (value: number) => void;
  onBack: () => void;
}

const SECTION_LABELS: Record<PregnancyQuestion["section"], string> = {
  timing: "Cycle timing",
  context: "Context",
  "early-symptoms": "Early symptoms",
};

export default function QuestionScreen({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onBack,
}: QuestionScreenProps) {
  const handleSelect = useCallback(
    (value: number) => {
      onAnswer(value);
    },
    [onAnswer],
  );

  return (
    <QuizQuestionScreen
      questionId={question.id}
      questionText={question.text}
      questionPreamble={
        <span className="inline-block text-xs font-medium tracking-wider text-[var(--brand-primary)] bg-white px-3 py-1.5 rounded-full mb-4">
          {SECTION_LABELS[question.section]}
        </span>
      }
      questionSubtitle={
        question.subtext ? (
          <p className="mt-3 text-[0.9rem] leading-[1.55] text-[var(--text-tertiary)]">
            {question.subtext}
          </p>
        ) : undefined
      }
      currentIndex={currentIndex}
      totalQuestions={totalQuestions}
      onBack={onBack}
      questionClassName="text-[1.3rem] font-medium leading-[1.4] text-[var(--text-primary)] tracking-[-0.01em] m-0 max-[480px]:!text-[1.15rem] max-[360px]:!text-[1.05rem]"
      contentClassName="flex-1 flex flex-col justify-center p-[24px_24px_32px] max-w-[560px] mx-auto w-full"
      questionBlockClassName="mb-[28px]"
      optionsClassName="flex flex-col gap-[8px] mb-auto"
    >
      {question.options.map((option, index) => {
        const isSelected = selectedAnswer === option.value;
        return (
          <motion.button
            key={`${option.label}-${option.value}`}
            onClick={() => handleSelect(option.value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.05 }}
            className={`w-full px-[18px] py-[14px] rounded-xl text-[14px] cursor-pointer flex items-start gap-[12px] text-left bg-[var(--surface-subtle)] border transition-all duration-200 hover:bg-[var(--brand-subtle)] hover:border-[var(--brand-primary)]/30 ${
              isSelected
                ? "!bg-[var(--brand-subtle)] !border-[var(--brand-primary)] text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-[16px] h-[16px] rounded-md shrink-0 flex items-center justify-center transition-all duration-200 text-[10px] font-medium text-white mt-[2px]"
              style={{
                border: `1.5px solid ${
                  isSelected ? "var(--brand-primary)" : "var(--border-strong)"
                }`,
                background: isSelected ? "var(--brand-primary)" : "transparent",
              }}
            >
              {isSelected && "✓"}
            </div>
            <span className="flex-1 flex flex-col gap-1">
              <span>{option.label}</span>
              {option.hint && (
                <span className="text-[12px] text-[var(--text-tertiary)] leading-[1.4]">
                  {option.hint}
                </span>
              )}
            </span>
          </motion.button>
        );
      })}
    </QuizQuestionScreen>
  );
}
