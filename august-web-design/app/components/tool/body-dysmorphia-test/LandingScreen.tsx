"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/body-dysmorphia-test-config";
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
            Free <span className="accent-gradient">Body Dysmorphia</span> Test
          </>
        ),
        tagline:
          "Twenty short questions adapted from clinical body dysmorphic disorder (BDD) assessments. See whether the way you think about your appearance overlaps with the patterns clinicians screen for — in about 3 minutes, anonymously.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a <strong>self-reflection screener</strong>, not a clinical diagnosis. Body dysmorphic disorder is diagnosed by a mental health professional after a structured interview, not a web quiz. Treat the result as one data point.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
