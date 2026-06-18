"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";

interface LandingScreenProps {
  onStartTest: () => void;
  totalQuestions: number;
  afterContent?: ReactNode;
}

function buildExpectations(totalQuestions: number) {
  return [
    {
      bold: `${totalQuestions} short questions`,
      rest: "about your daily habits, energy, and sleep preferences — one tap per question",
    },
    {
      bold: "~2 minutes",
      rest: "to complete, completely anonymous, nothing is stored",
    },
    {
      bold: "Based on rMEQ",
      rest: ", a scientifically validated chronotype assessment",
    },
  ];
}

export default function LandingScreen({
  onStartTest,
  totalQuestions,
  afterContent,
}: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Free <span className="accent-gradient">Chronotype</span> Test
          </>
        ),
        tagline:
          "Discover whether you're a Lion, Bear, Wolf, or Dolphin. Answer a few short questions about your sleep-wake patterns and learn how to optimize your day around your natural rhythm.",
      }}
      introCard={{
        expectations: buildExpectations(totalQuestions),
        disclaimer: (
          <>
            This is a <strong>screening tool</strong> for informational
            purposes, not medical advice. It&apos;s designed to help you
            understand your natural sleep-wake patterns.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
