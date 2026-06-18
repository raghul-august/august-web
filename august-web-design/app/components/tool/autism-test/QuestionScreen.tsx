"use client";

import {
  AUTISM_OPTIONS,
  type AutismQuestion,
} from "@/app/data/tools/autism-test-questions";
import QuizQuestionScreen from "../shared/QuizQuestionScreen";
import QuizOptionList from "../shared/QuizOptionList";

interface QuestionScreenProps {
  question: AutismQuestion;
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
  return (
    <QuizQuestionScreen
      questionId={question.id}
      questionText={question.text}
      questionPreamble={
        <span className="inline-block text-xs font-medium tracking-wider text-[var(--brand-primary)] bg-white px-3 py-1.5 rounded-full mb-4">
          How strongly do you agree?
        </span>
      }
      currentIndex={currentIndex}
      totalQuestions={totalQuestions}
      onBack={onBack}
      questionClassName="text-[1.3rem] font-medium leading-[1.4] text-[var(--text-primary)] tracking-[-0.01em] m-0 max-[480px]:!text-[1.15rem] max-[360px]:!text-[1.05rem]"
      contentClassName="flex-1 flex flex-col justify-center p-[24px_24px_32px] max-w-[560px] mx-auto w-full"
      questionBlockClassName="mb-[28px]"
      optionsClassName="flex flex-col gap-[8px] mb-auto"
    >
      <QuizOptionList
        options={AUTISM_OPTIONS}
        selectedAnswer={selectedAnswer}
        onAnswer={onAnswer}
        showValue={false}
        borderRadius="rounded-xl"
        indicatorRadius="rounded-md"
      />
    </QuizQuestionScreen>
  );
}
