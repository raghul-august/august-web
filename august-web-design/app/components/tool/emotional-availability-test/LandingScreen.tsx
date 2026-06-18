"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/emotional-availability-test-config";
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
            Free <span className="accent-gradient">Emotional Availability</span> Test
          </>
        ),
        tagline:
          "Twenty short questions to see how open or guarded you are in close relationships. The result is a five-tier read on your emotional availability — anonymous, no sign-up, in about 3 minutes.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a <strong>self-reflection screener</strong>, not a clinical assessment. Patterns of emotional availability shift over time, between relationships, and through therapy — treat the result as a snapshot, not a verdict.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
