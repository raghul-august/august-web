"use client";

import { lazy, ReactNode } from "react";
import { questions, totalQuestions } from "@/app/data/tools/borderline-personality-test-questions";
import type { BpdQuestion } from "@/app/data/tools/borderline-personality-test-questions";
import {
  bpdScoreBucket,
  computeBpdResult,
} from "@/app/utils/tools/borderline-personality-test-scoring";
import GenericQuiz from "../shared/GenericQuiz";
import QuizLandingScreen from "../shared/QuizLandingScreen";
import QuestionScreen from "./QuestionScreen";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

const config = {
  toolId: "borderline-personality-test" as const,
  startedEventName: "bpd_quiz_started",
  startedEventCategory: "Borderline Personality Test",
  answeredEventName: "bpd_question_answered",
  answeredEventCategory: "Borderline Personality Test",
  questions,
  totalQuestions,
  computeResult: computeBpdResult,
  scoreBucket: bpdScoreBucket,
  getQuestionId: (q: BpdQuestion) => q.id,
  extraAnswerTracking: (question: BpdQuestion, _value: number) => ({
    reverse: question.reverse,
  }),
  renderLanding: ({ onStartTest, totalQuestions: total, afterContent }: { onStartTest: () => void; totalQuestions: number; afterContent?: ReactNode }) => (
    <QuizLandingScreen
      heroTitle={<>Free <span className="accent-gradient">Borderline Personality</span>{" "}Disorder Test</>}
      heroTagline="See how strongly your experiences match the patterns associated with borderline personality disorder — 20 self-reflection statements, no signup, no diagnosis."
      expectations={[
        { bold: `${total} statements`, rest: "drawn from the DSM-5-TR criteria for borderline personality disorder — rate how strongly you agree with each." },
        { bold: "~5 minutes", rest: "to complete, one tap per question." },
        { bold: "Five interpretation tiers", rest: "from very-low overlap to strong overlap with BPD trait patterns." },
      ]}
      disclaimer={<>This is a <strong>self-reflection tool</strong>, not a clinical diagnosis. If you or someone you know is in crisis, call or text{" "}<strong>988</strong> (US Suicide and Crisis Lifeline) or text{" "}<strong>HOME to 741741</strong>.</>}
      onStartTest={onStartTest}
      afterContent={afterContent}
    />
  ),
  renderQuestion: (props: { question: BpdQuestion; currentIndex: number; totalQuestions: number; selectedAnswer: number | null; onAnswer: (v: number) => void; onBack: () => void }) => (
    <QuestionScreen {...props} />
  ),
  ResultsScreen,
};

export default function Quiz({ afterContent }: { afterContent?: ReactNode }) {
  return <GenericQuiz config={config} afterContent={afterContent} />;
}
