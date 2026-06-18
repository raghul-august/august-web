"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";
import type { ColorBlindPlate } from "@/app/data/tools/color-blind-test-questions";
import QuizQuestionScreen from "../shared/QuizQuestionScreen";
import IshiharaPlate from "./IshiharaPlate";

interface QuestionScreenProps {
  plate: ColorBlindPlate;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswer: (value: string) => void;
  onBack: () => void;
}

export default function QuestionScreen({
  plate,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onBack,
}: QuestionScreenProps) {
  const handleSelect = useCallback(
    (value: string) => {
      onAnswer(value);
    },
    [onAnswer],
  );

  return (
    <QuizQuestionScreen
      questionId={plate.id}
      questionText="What number do you see?"
      questionSubtitle={
        <p className="cbt-plate-prompt mt-2">
          Look at the dot pattern below. If you can&apos;t make out a number, tap
          &ldquo;I can&apos;t see a number.&rdquo;
        </p>
      }
      currentIndex={currentIndex}
      totalQuestions={totalQuestions}
      onBack={onBack}
      questionClassName="text-[1.3rem] font-medium leading-[1.4] text-[var(--text-primary)] tracking-[-0.01em] m-0 text-center max-[480px]:!text-[1.15rem]"
      contentClassName="flex-1 flex flex-col justify-center p-[24px_20px_32px] max-w-[560px] mx-auto w-full"
      questionBlockClassName="mb-5"
      optionsClassName="flex flex-col gap-3 mb-auto w-full"
    >
      <IshiharaPlate plate={plate} />
      <div className="cbt-options-grid">
        {plate.options.map((option, index) => {
          const isSelected = selectedAnswer === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="cbt-option-tile"
              data-selected={isSelected}
              whileTap={{ scale: 0.97 }}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </QuizQuestionScreen>
  );
}
