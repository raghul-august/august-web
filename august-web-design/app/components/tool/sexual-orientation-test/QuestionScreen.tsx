"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback } from "react";
import {
  OrientationQuestion,
  likertOptions,
} from "@/app/data/tools/sexual-orientation-questions";
import QuizQuestionScreen from "../shared/QuizQuestionScreen";
import QuizQuestionHeader from "../shared/QuizQuestionHeader";

interface QuestionScreenProps {
  question: OrientationQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswer: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
}

export default function QuestionScreen({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onNext,
  onBack,
  isLast,
}: QuestionScreenProps) {
  const handleSelect = useCallback(
    (value: number) => {
      onAnswer(value);
    },
    [onAnswer]
  );

  // Only questions with helper content require manual advance.
  const requiresManualAdvance = !!question.helper;

  return (
    <QuizQuestionScreen
      questionId={question.id}
      questionText={question.text}
      questionSubtitle={
        <p className="text-[13px] text-[var(--text-tertiary)] mt-[8px] leading-[1.5]">
          How much do you agree with this statement?
        </p>
      }
      currentIndex={currentIndex}
      totalQuestions={totalQuestions}
      onBack={onBack}
      customHeader={
        <QuizQuestionHeader
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          onBack={onBack}
        />
      }
      questionClassName="text-[1.3rem] font-medium leading-[1.4] text-[var(--text-primary)] tracking-[-0.01em] m-0 max-[480px]:!text-[1.15rem] max-[360px]:!text-[1.05rem]"
      contentClassName="flex-1 flex flex-col justify-center p-[24px_24px_32px] max-w-[560px] mx-auto w-full"
      questionBlockClassName="mb-[28px]"
      optionsClassName="flex flex-col gap-[8px] mb-auto"
    >
      {likertOptions.map((option, index) => {
        const isSelected = selectedAnswer === option.value;

        return (
          <motion.button
            key={option.label}
            onClick={() => handleSelect(option.value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.06 }}
             className={`w-full px-[18px] py-[14px] rounded-xl text-[14px] cursor-pointer flex items-center gap-[12px] text-left bg-[var(--surface-subtle)] border transition-all duration-200 hover:bg-[var(--brand-subtle)] hover:border-[var(--brand-primary)]/30 font-light ${
              isSelected
                ? "!bg-[var(--brand-subtle)] !border-[var(--brand-primary)] text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-[16px] h-[16px] rounded-md shrink-0 flex items-center justify-center transition-all duration-200 text-[10px] font-medium text-white"
              style={{
                border: `1.5px solid ${isSelected ? "var(--brand-primary)" : "var(--border-strong)"}`,
                background: isSelected ? "var(--brand-primary)" : "transparent",
              }}
            >
              {isSelected && "✓"}
            </div>
            <span
              className={`font-normal transition-colors duration-300 ${
                isSelected ? "text-[var(--text-primary)]" : ""
              }`}
            >
              {option.label}
            </span>
          </motion.button>
        );
      })}

      {/* Helper card + Continue button — only for questions with helper content */}
      {requiresManualAdvance ? (
        <>
          <AnimatePresence>
            {selectedAnswer !== null && question.helper ? (
              <motion.div
                key={`helper-${question.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="mt-5 bg-[var(--brand-subtle)] border border-[var(--border-subtle)] rounded-2xl p-5"
              >
                <div className="text-[1rem] font-medium text-[var(--brand-primary)] tracking-[0.08em] mb-2">
                  {question.helper.title}
                </div>
                <div className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)]">
                  {question.helper.body}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {selectedAnswer !== null ? (
              <motion.button
                key={`continue-${question.id}`}
                onClick={onNext}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 mx-auto inline-flex items-center justify-center  border-none rounded-full px-8 py-3 text-[1.05rem] font-medium cursor-pointer transition-all duration-200 hover:bg-[var(--brand-primary-hover)] tool-btn tool-btn--primary"
              >
                {isLast ? "See your spectrum" : "Continue"}
              </motion.button>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </QuizQuestionScreen>
  );
}
