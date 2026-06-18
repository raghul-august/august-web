"use client";

import { lazy, ReactNode } from "react";
import { questions, totalQuestions } from "@/app/data/tools/autism-test-questions";
import type { AutismQuestion } from "@/app/data/tools/autism-test-questions";
import {
  autismScoreBucket,
  computeAutismResult,
  type AutismResult,
} from "@/app/utils/tools/autism-test-scoring";
import GenericQuiz from "../shared/GenericQuiz";
import QuizLandingScreen from "../shared/QuizLandingScreen";
import QuestionScreen from "./QuestionScreen";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

const config = {
  toolId: "autism-test" as const,
  startedEventName: "autism_test_started",
  startedEventCategory: "Autism Test (AQ-10)",
  answeredEventName: "autism_question_answered",
  answeredEventCategory: "Autism Test (AQ-10)",
  questions,
  totalQuestions,
  computeResult: computeAutismResult,
  scoreBucket: autismScoreBucket,
  getQuestionId: (q: AutismQuestion) => q.id,
  extraAnswerTracking: (question: AutismQuestion, _value: number) => ({
    score_on_agree: question.scoreOnAgree,
  }),
  extraCompletionTracking: (result: AutismResult) => ({
    meets_referral_cutoff: result.meetsReferralCutoff,
  }),
  renderLanding: ({ onStartTest, totalQuestions: total, afterContent }: { onStartTest: () => void; totalQuestions: number; afterContent?: ReactNode }) => (
    <QuizLandingScreen
      heroTitle={<>Free <span className="accent-gradient">Autism</span> Test</>}
      heroTagline="The 10-item adult autism screener used by the NHS-Allison, Auyeung & Baron-Cohen (2012). Answer 10 short statements and see whether you meet the published referral threshold."
      expectations={[
        { bold: `${total} short statements`, rest: "the official AQ-10 items : the screener the NHS uses to decide on an adult autism referral." },
        { bold: "~2 minutes", rest: "to complete, one tap per question, no signup." },
        { bold: "A 0–10 score", rest: "with the validated referral threshold (6+) and an interpretation tier." },
      ]}
      disclaimer={<>This is a <strong>screening tool</strong>, not a clinical diagnosis. Only a trained clinician can diagnose autism. If you are an adult wondering whether to seek an assessment, this score is a useful starting point to take to your GP or primary-care provider.</>}
      onStartTest={onStartTest}
      afterContent={afterContent}
    />
  ),
  renderQuestion: (props: { question: AutismQuestion; currentIndex: number; totalQuestions: number; selectedAnswer: number | null; onAnswer: (v: number) => void; onBack: () => void }) => (
    <QuestionScreen {...props} />
  ),
  ResultsScreen,
};

export default function Quiz({ afterContent }: { afterContent?: ReactNode }) {
  return <GenericQuiz config={config} afterContent={afterContent} />;
}
