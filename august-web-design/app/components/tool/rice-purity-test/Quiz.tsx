"use client";

import React, { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { computeScore, getScoreTier, getSecretZone, getCategoryBreakdowns } from "../../../utils/tools/rice-purity-scoring";
import { track } from "@/app/utils/analytics";
import { totalQuestions } from "@/app/data/tools/rice-purity-questions";
import LandingScreen from "./LandingScreen";
import QuestionScreen from "./QuestionScreen";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";
import { useQuizAuth } from "../shared/hooks/useQuizAuth";
import { ToolLoginModal } from "@/components/auth";
import "./rice-purity-test.css";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

type Screen = "landing" | "quiz" | "results";

export default function Quiz({ afterContent }: { afterContent?: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const { shouldGateResults } = useQuizAuth();

  const handleStartTest = useCallback(() => {
    track("rice_purity_quiz_started", {
      event_category: "Rice Purity Test",
      total_questions: totalQuestions,
    });
    setChecked(new Set());
    setScreen("quiz");
  }, []);

  const handleToggleQuestion = useCallback((questionId: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    track("rice_purity_quiz_completed", {
      event_category: "Rice Purity Test",
      checked_count: checked.size,
    });
    setScreen("results");
    if(window != undefined){
      window.scrollTo({top : 0, behavior: "smooth"});
    }
  }, [checked]);

  const handleBack = useCallback(() => {
    setScreen("landing");
  }, []);

  const handleRestart = useCallback(() => {
    setChecked(new Set());
    setScreen("landing");
  }, []);

  const score = useMemo(() => computeScore(checked), [checked]);
  const tier = useMemo(() => getScoreTier(score), [score]);
  const secretZone = useMemo(() => getSecretZone(checked), [checked]);
  const breakdowns = useMemo(() => getCategoryBreakdowns(checked), [checked]);

  if (screen === "quiz") {
    return (
      <QuestionScreen
        checked={checked}
        onToggle={handleToggleQuestion}
        onSubmit={handleSubmit}
        onBack={handleBack}
      />
    );
  }

  if (screen === "results") {
    return (
      <>
        <Suspense fallback={<QuizSuspenseFallback bg="#e9f1ee" />}>
          <ResultsScreen
            score={score}
            tier={tier}
            secretZone={secretZone}
            breakdowns={breakdowns}
            checkedCount={checked.size}
            onRestart={handleRestart}
          />
        </Suspense>
        {shouldGateResults && (
          <ToolLoginModal
            title="Your purity score is ready"
            description="Enter your name and email to view your Rice Purity Test results."
            onSuccess={() => {}}
          />
        )}
      </>
    );
  }

  return <LandingScreen onStartTest={handleStartTest} afterContent={afterContent} />;
}
