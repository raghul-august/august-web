"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";
import { Question, QuestionOption, scaleOptions } from "@/app/data/tools/adhd-questions";
import QuizQuestionScreen from "../shared/QuizQuestionScreen";

interface QuestionScreenProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
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
  const options: QuestionOption[] =
    question.type === "binary" ? question.options! : scaleOptions;

  const handleSelect = useCallback(
    (label: string) => {
      onAnswer(label);
    },
    [onAnswer]
  );

  return (
    <QuizQuestionScreen
      questionId={question.id}
      questionText={question.text}
      currentIndex={currentIndex}
      totalQuestions={totalQuestions}
      onBack={onBack}
      showBlobs={true}
      questionClassName="text-[1.3rem] font-medium leading-[1.4] text-[var(--text-primary)] tracking-[-0.01em] m-0 max-[480px]:!text-[1.15rem] max-[360px]:!text-[1.05rem]"
      contentClassName="flex-1 flex flex-col justify-center p-[24px_24px_32px] max-w-[560px] mx-auto w-full"
      questionBlockClassName="mb-[28px]"
      optionsClassName="flex flex-col gap-[8px] mb-auto"
    >
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option.label;
        return (
          <motion.button
            key={option.label}
            onClick={() => handleSelect(option.label)}
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
            {question.type === "scale" ? (
              <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums shrink-0">
                {index + 1}
              </span>
            ) : option.subtext ? (
              <span className="text-[11px] text-[var(--text-tertiary)] shrink-0">
                {option.subtext}
              </span>
            ) : null}
          </motion.button>
        );
      })}
    </QuizQuestionScreen>
  );
}
