"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QuizContainer from "./QuizContainer";
import QuizQuestionHeader from "./QuizQuestionHeader";

interface QuizQuestionScreenProps {
  questionId: string | number;
  questionText: string;
  questionPreamble?: ReactNode; // content above question text (category pills, etc.)
  questionSubtitle?: ReactNode; // content below question text
  currentIndex: number;
  totalQuestions: number;
  onBack: () => void;
  customHeader?: ReactNode;
  children: ReactNode;
  showBlobs?: boolean;
  bgColor?: string;
  /** extra className on the question text <h2> */
  questionClassName?: string;
  /** extra className on the outer content wrapper */
  contentClassName?: string;
  /** extra className on the animated question block (default mb-12) */
  questionBlockClassName?: string;
  /** className on the options motion.div wrapper (default "w-full") */
  optionsClassName?: string;
  /** when true, skip framer-motion and use a plain div (for CSS-animated tools) */
  cssAnimation?: boolean;
  /** className applied to the plain div when cssAnimation is true */
  cssAnimationClassName?: string;
}

const questionAnim = {
  initial: { opacity: 0, y: 30, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -30, filter: "blur(10px)" },
  transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
} as const;

const optionsAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.2 },
};

export default function QuizQuestionScreen({
  questionId,
  questionText,
  questionPreamble,
  questionSubtitle,
  currentIndex,
  totalQuestions,
  onBack,
  customHeader,
  children,
  showBlobs,
  bgColor,
  questionClassName = "text-[1.75rem] font-light text-[var(--text-primary)] leading-[1.4] tracking-[-0.01em] m-0",
  contentClassName = "flex-1 flex flex-col justify-center py-8 px-6 max-w-[560px] mx-auto w-full",
  questionBlockClassName = "mb-12",
  optionsClassName = "w-full",
  cssAnimation = false,
  cssAnimationClassName,
}: QuizQuestionScreenProps) {
  return (
    <QuizContainer showFooter={true} showBlobs={showBlobs} bgColor={bgColor}>
      {/* Header */}
      {customHeader ?? (
        <QuizQuestionHeader
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          onBack={onBack}
        />
      )}

      {/* Question + options content area */}
      <div className={contentClassName}>
        {/* Question text block */}
        {cssAnimation ? (
          <div key={questionId} className={`${cssAnimationClassName ?? ""} ${questionBlockClassName}`}>
            {questionPreamble}
            <h2 className={questionClassName}>{questionText}</h2>
            {questionSubtitle}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={questionId}
              {...questionAnim}
              className={questionBlockClassName}
            >
              {questionPreamble}
              <h2 className={questionClassName}>{questionText}</h2>
              {questionSubtitle}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Options slot */}
        {cssAnimation ? (
          children
        ) : (
          <motion.div {...optionsAnim} className={optionsClassName}>
            {children}
          </motion.div>
        )}
      </div>
    </QuizContainer>
  );
}
