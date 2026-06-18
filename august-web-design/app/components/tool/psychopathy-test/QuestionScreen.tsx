"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";
import {
  LIKERT_OPTIONS,
  type PsychopathyQuestion,
} from "@/app/data/tools/psychopathy-test-questions";
import QuizQuestionScreen from "../shared/QuizQuestionScreen";

interface QuestionScreenProps {
  question: PsychopathyQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswer: (value: number) => void;
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
        <span className="inline-block text-xs font-medium tracking-wider text-(--brand-primary) bg-white px-3 py-1.5 rounded-full mb-4">
          Rate how true this feels
        </span>
      }
      questionSubtitle={
        <p className="mt-3 text-[0.85rem] leading-[1.55] text-(--text-tertiary)">
          Strongly Disagree → Strongly Agree
        </p>
      }
      currentIndex={currentIndex}
      totalQuestions={totalQuestions}
      onBack={onBack}
      questionClassName="text-[1.3rem] font-medium leading-[1.4] text-(--text-primary) tracking-[-0.01em] m-0 max-[480px]:!text-[1.15rem] max-[360px]:!text-[1.05rem]"
      contentClassName="flex-1 flex flex-col justify-center p-[24px_24px_32px] max-w-140 mx-auto w-full"
      questionBlockClassName="mb-[28px]"
      optionsClassName="flex flex-col gap-2 mb-auto"
    >
      {LIKERT_OPTIONS.map((option, index) => {
        const isSelected = selectedAnswer === option.value;
        return (
          <motion.button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.05 }}
            className={`w-full px-4.5 py-3.5 rounded-xl text-[14px] cursor-pointer flex items-center gap-3 text-left bg-(--surface-subtle) border transition-all duration-200 hover:bg-(--brand-subtle) hover:border-(--brand-primary)/30 ${
              isSelected
                ? "bg-(--brand-subtle)! border-(--brand-primary)! text-(--text-primary)"
                : "border-(--border-subtle) text-(--text-secondary)"
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-4 h-4 rounded-md shrink-0 flex items-center justify-center transition-all duration-200 text-[10px] font-medium text-white"
              style={{
                border: `1.5px solid ${isSelected ? "var(--brand-primary)" : "var(--border-strong)"}`,
                background: isSelected ? "var(--brand-primary)" : "transparent",
              }}
            >
              {isSelected && "✓"}
            </div>
            <span className="flex-1">{option.label}</span>
            <span className="text-[0.7rem] font-medium text-(--text-tertiary) tabular-nums shrink-0">
              {option.value}
            </span>
          </motion.button>
        );
      })}
    </QuizQuestionScreen>
  );
}
