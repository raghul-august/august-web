"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/burnout-at-work-config";
import ToolLandingLayout from "../shared/ToolLandingLayout";

interface LandingScreenProps {
  onStartTest: () => void;
  totalQuestions: number;
  afterContent?: ReactNode;
}

export default function LandingScreen({
  onStartTest,
  totalQuestions: _totalQuestions,
  afterContent,
}: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Free <span className="accent-gradient">Burnout at Work</span> Test
          </>
        ),
        tagline:
          "Twenty short questions to see how close to burnout you are covering emotional exhaustion, cynicism about work, and reduced effectiveness. About 3 minutes, anonymous, no sign-up.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a <strong>self-reflection screener</strong>, not a clinical assessment. The WHO classifies burnout as an occupational phenomenon, not a medical diagnosis but if your score is high and your day-to-day is suffering, talking to a clinician or therapist is the right next step.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
