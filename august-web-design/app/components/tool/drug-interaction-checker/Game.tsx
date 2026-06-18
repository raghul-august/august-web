"use client";

import { ReactNode, useCallback, useMemo, useState } from "react";
import LandingScreen from "./LandingScreen";
import ReactionTest from "./ReactionTest";
import MemoryTest from "./MemoryTest";
import StroopTest from "./StroopTest";
import DotTrackerTest from "./DotTrackerTest";
import ResultsScreen from "./ResultsScreen";
import InterTestCard from "./InterTestCard";
import { track } from "@/app/utils/analytics";
import { TOTAL_TESTS } from "@/app/data/tools/drug-interaction-checker-config";
import {
  CookedRaw,
  CookedResult,
  computeCookedResult,
  getTestLabel,
  scoreSingle,
} from "@/app/utils/tools/drug-interaction-checker-scoring";

type Screen = "landing" | "playing" | "transition" | "results";

const TEST_ORDER = ["reaction", "memory", "stroop", "dotChase"] as const;
type TestKey = (typeof TEST_ORDER)[number];

export default function Game({ afterContent }: { afterContent?: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [step, setStep] = useState(0);
  const [raw, setRaw] = useState<CookedRaw>({});
  // Step that was just finished — drives the transition card content.
  const [justFinishedStep, setJustFinishedStep] = useState(0);

  const handleStart = useCallback(() => {
    track("drug_interaction_checker_started", {
      event_category: "Drug Interaction Checker",
      total_tests: TOTAL_TESTS,
    });
    setRaw({});
    setStep(0);
    setScreen("playing");
  }, []);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      setScreen("landing");
    }
  }, [step]);

  const handleRestart = useCallback(() => {
    setRaw({});
    setStep(0);
    setScreen("landing");
  }, []);

  const advanceFrom = useCallback(
    (key: TestKey, value: CookedRaw[TestKey]) => {
      track("drug_interaction_checker_test_completed", {
        event_category: "Drug Interaction Checker",
        test: key,
        step: step + 1,
      });
      const updated: CookedRaw = { ...raw, [key]: value };
      setRaw(updated);
      const next = step + 1;
      if (next >= TOTAL_TESTS) {
        track("drug_interaction_checker_completed", {
          event_category: "Drug Interaction Checker",
        });
        setScreen("results");
      } else {
        setJustFinishedStep(step);
        setScreen("transition");
      }
    },
    [raw, step]
  );

  const handleContinueFromTransition = useCallback(() => {
    track("drug_interaction_checker_transition_continue", {
      event_category: "Drug Interaction Checker",
      from_step: justFinishedStep + 1,
    });
    setStep(justFinishedStep + 1);
    setScreen("playing");
  }, [justFinishedStep]);

  const result = useMemo<CookedResult | null>(
    () => (screen === "results" ? computeCookedResult(raw) : null),
    [raw, screen]
  );

  // Cumulative score so far (average of completed tests). Drives the gauge in
  // the GameShell. We compute once per render — cheap.
  const completedScores = TEST_ORDER.slice(0, step)
    .map((k) => scoreSingle(k, raw));
  const cumulative =
    completedScores.length > 0
      ? Math.round(
          completedScores.reduce((a, b) => a + b, 0) / completedScores.length
        )
      : null;

  if (screen === "landing") {
    return <LandingScreen onStartTest={handleStart} totalTests={TOTAL_TESTS} afterContent={afterContent} />;
  }

  if (screen === "results" && result) {
    return <ResultsScreen result={result} onRestart={handleRestart} />;
  }

  if (screen === "transition") {
    const finishedKey = TEST_ORDER[justFinishedStep];
    const nextKey = TEST_ORDER[justFinishedStep + 1];
    const finishedScore = scoreSingle(finishedKey, raw);
    return (
      <InterTestCard
        justFinishedLabel={getTestLabel(finishedKey)}
        justFinishedScore={finishedScore}
        nextLabel={getTestLabel(nextKey)}
        step={justFinishedStep}
        totalSteps={TOTAL_TESTS}
        onContinue={handleContinueFromTransition}
      />
    );
  }

  // playing
  const current = TEST_ORDER[step];
  const shellProps = {
    step,
    totalSteps: TOTAL_TESTS,
    onBack: handleBack,
    cumulative,
  };

  if (current === "reaction") {
    return (
      <ReactionTest
        {...shellProps}
        onComplete={(value) => advanceFrom("reaction", value)}
      />
    );
  }
  if (current === "memory") {
    return (
      <MemoryTest
        {...shellProps}
        onComplete={(value) => advanceFrom("memory", value)}
      />
    );
  }
  if (current === "stroop") {
    return (
      <StroopTest
        {...shellProps}
        onComplete={(value) => advanceFrom("stroop", value)}
      />
    );
  }
  return (
    <DotTrackerTest
      {...shellProps}
      onComplete={(value) => advanceFrom("dotChase", value)}
    />
  );
}
