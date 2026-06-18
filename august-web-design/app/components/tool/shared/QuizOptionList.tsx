"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";

interface QuizOption {
  value: number;
  label: string;
}

interface QuizOptionListProps {
  options: readonly QuizOption[];
  selectedAnswer: number | null;
  onAnswer: (value: number) => void;
  showValue?: boolean;
  borderRadius?: string;
  indicatorRadius?: string;
}

export default function QuizOptionList({
  options,
  selectedAnswer,
  onAnswer,
  showValue = false,
  borderRadius = "rounded-2xl",
  indicatorRadius = "rounded-full",
}: QuizOptionListProps) {
  const handleSelect = useCallback(
    (value: number) => onAnswer(value),
    [onAnswer],
  );

  return (
    <>
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option.value;
        return (
          <motion.button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.05 }}
            className={`w-full px-[18px] py-[14px] ${borderRadius} text-[14px] cursor-pointer flex items-center gap-[12px] text-left bg-[var(--surface-subtle)] border transition-all duration-200 hover:bg-[var(--brand-subtle)] hover:border-[var(--brand-primary)]/30 ${
              isSelected
                ? "!bg-[var(--brand-subtle)] !border-[var(--brand-primary)] text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={`w-[16px] h-[16px] ${indicatorRadius} rounded-md shrink-0 flex items-center justify-center transition-all duration-200 text-[10px] font-medium text-white`}
              style={{
                border: `1.5px solid ${isSelected ? "var(--brand-primary)" : "var(--border-strong)"}`,
                background: isSelected ? "var(--brand-primary)" : "transparent",
              }}
            >
              {isSelected && "✓"}
            </div>
            <span className="flex-1">{option.label}</span>
            {showValue && (
              <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums shrink-0">
                {option.value}
              </span>
            )}
          </motion.button>
        );
      })}
    </>
  );
}
