"use client";

import { lazy, ReactNode } from "react";
import { questions, totalQuestions } from "@/app/data/tools/anger-management-test-questions";
import {
  angerScoreBucket,
  computeAngerResult,
} from "@/app/utils/tools/anger-management-test-scoring";
import GenericQuiz from "../shared/GenericQuiz";
import QuizLandingScreen from "../shared/QuizLandingScreen";
import QuestionScreen from "./QuestionScreen";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

const config = {
  toolId: "anger-management-test" as const,
  startedEventName: "anger_management_quiz_started",
  startedEventCategory: "Anger Management Test",
  answeredEventName: "anger_management_question_answered",
  answeredEventCategory: "Anger Management Test",
  questions,
  totalQuestions,
  computeResult: computeAngerResult,
  scoreBucket: angerScoreBucket,
  getQuestionId: (q: (typeof questions)[number]) => q.id,
  renderLanding: ({ onStartTest, totalQuestions: total, afterContent }: { onStartTest: () => void; totalQuestions: number; afterContent?: ReactNode }) => (
    <QuizLandingScreen
      heroTitle={<>Free <span className="accent-gradient">Anger</span> Management Test</>}
      heroTagline="See how readily everyday situations spark anger for you, and where your score lands against published norms."
      expectations={[
        { bold: `${total} scenarios`, rest: "from everyday life — rate how angry each one would make you" },
        { bold: "~5 minutes", rest: "to complete, one tap per question" },
        { bold: "Based on the Novaco Anger Inventory", rest: ", a long-running research-backed measure of anger reactivity" },
      ]}
      disclaimer={<>This is a <strong>self-reflection tool</strong>, not a clinical diagnosis. If anger is interfering with your life, a licensed therapist can help.</>}
      onStartTest={onStartTest}
      afterContent={afterContent}
    />
  ),
  renderQuestion: (props: { question: (typeof questions)[number]; currentIndex: number; totalQuestions: number; selectedAnswer: number | null; onAnswer: (v: number) => void; onBack: () => void }) => (
    <QuestionScreen {...props} />
  ),
  ResultsScreen,
};

export default function Quiz({ afterContent }: { afterContent?: ReactNode }) {
  return <GenericQuiz config={config} afterContent={afterContent} />;
}
