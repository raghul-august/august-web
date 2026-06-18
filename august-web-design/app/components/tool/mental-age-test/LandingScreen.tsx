"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/mental-age-test-config";
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
            Free <span className="accent-gradient">Mental Age</span> Test
          </>
        ),
        tagline:
          "Your birth certificate only tells part of the story. Answer 15 quick questions about how you sleep, spend, decide, and unwind and see the age your mind actually feels.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a <strong>playful self-reflection quiz</strong>, not a
            clinical assessment. Mental age tests can&apos;t measure
            intelligence, maturity, or cognitive development — they reflect the
            patterns in your lifestyle and choices.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
