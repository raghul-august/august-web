"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";
import {
  PERIMENOPAUSE_OPTIONS,
  type PerimenopauseQuestion,
} from "@/app/data/tools/perimenopause-symptom-questions";
import QuizQuestionScreen from "../shared/QuizQuestionScreen";

interface QuestionScreenProps {
  question: PerimenopauseQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: 0 | 1 | 2 | 3 | null;
  onAnswer: (value: 0 | 1 | 2 | 3) => void;
  onBack: () => void;
}

export default function QuestionScreen({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onBack,
}: QuestionScreenProps) {
  const handleSelect = useCallback(
    (value: 0 | 1 | 2 | 3) => {
      onAnswer(value);
    },
    [onAnswer],
  );

  return (
    <QuizQuestionScreen
      questionId={`perimenopause-${question.id}`}
      questionText={question.text}
      questionPreamble={
        <span className="inline-block text-xs font-medium tracking-wider text-[var(--brand-primary)] bg-white px-3 py-1.5 rounded-full mb-4">
          In the past month, how much has this bothered you?
        </span>
      }
      currentIndex={currentIndex}
      totalQuestions={totalQuestions}
      onBack={onBack}
      questionClassName="text-[1.3rem] font-medium leading-[1.4] text-[var(--text-primary)] tracking-[-0.01em] m-0 max-[480px]:!text-[1.15rem]"
      contentClassName="flex-1 flex flex-col justify-center p-[24px_24px_32px] max-w-[560px] mx-auto w-full"
      questionBlockClassName="mb-[28px]"
      optionsClassName="flex flex-col gap-[8px] mb-auto"
    >
      {PERIMENOPAUSE_OPTIONS.map((option, index) => {
        const isSelected = selectedAnswer === option.value;
        return (
          <motion.button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.05 }}
            className={`w-full px-[18px] py-[14px] rounded-xl text-[14px] cursor-pointer flex items-center gap-[12px] text-left bg-[var(--surface-subtle)] border transition-all duration-200 hover:bg-[var(--brand-subtle)] hover:border-[var(--brand-primary)]/30 ${
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
            <span className="flex-1">{option.label}</span>
          </motion.button>
        );
      })}
    </QuizQuestionScreen>
  );
}
