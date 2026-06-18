"use client";

import { useCallback } from "react";
import { allQuestions, totalQuestions } from "@/app/data/tools/rice-purity-questions";
import QuizContainer from "../shared/QuizContainer";
import QuizQuestionHeader from "../shared/QuizQuestionHeader";

interface QuestionScreenProps {
  checked: Set<number>;
  onToggle: (id: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function QuestionScreen({
  checked,
  onToggle,
  onSubmit,
  onBack,
}: QuestionScreenProps) {
  const handleToggle = useCallback(
    (id: number) => {
      onToggle(id);
    },
    [onToggle]
  );

  return (
    <QuizContainer showFooter={true}>
      {/* QuizQuestionHeader: currentIndex = checked.size so progress bar reflects items checked */}
      <QuizQuestionHeader
        currentIndex={checked.size}
        totalQuestions={totalQuestions}
        onBack={onBack}
      />

      {/* Instruction */}
      <div className="text-center px-6 pb-2">
        <p className="text-base text-[var(--text-primary)] font-medium m-0">
          Click on every item you have done
        </p>
      </div>

      {/* All Questions - flat list */}
      <div className="flex-1 flex flex-col gap-2 py-4 px-6 max-w-[600px] mx-auto w-full overflow-y-auto">
        {allQuestions.map((question, index) => {
          const isChecked = checked.has(question.id);

          return (
            <button
              key={question.id}
              onClick={() => handleToggle(question.id)}
              className={`rp-checkbox-item w-full flex items-start gap-3 p-4 rounded-2xl border cursor-pointer text-left ${
                isChecked
                  ? "bg-[var(--brand-subtle)] border-[var(--brand-primary)]"
                  : "bg-[var(--surface-elevated)] border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`shrink-0 w-4 h-4 rounded-md border-2 flex items-center justify-center mt-1 transition-all duration-200 ${
                  isChecked
                    ? "bg-[var(--brand-primary)] border-[var(--brand-primary)]"
                    : "bg-white border-[var(--border-strong)]"
                }`}
              >
                {isChecked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              {/* Number + Text */}
              <span
                className={`text-[0.9rem] leading-relaxed ${
                  isChecked ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {index + 1}. {question.text}
              </span>
            </button>
          );
        })}

        {/* Submit */}
        <div className="flex items-center justify-between mt-2 mb-4">
          <span className="text-sm text-[var(--text-tertiary)]">
            {checked.size} of {totalQuestions} checked
          </span>
          <button
            onClick={onSubmit}
            className="px-6 py-3 bg-[var(--brand-primary)] text-white border-none rounded-full text-sm font-medium cursor-pointer hover:bg-[var(--brand-primary-hover)]"
          >
            See my score
          </button>
        </div>
      </div>
    </QuizContainer>
  );
}
