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
      rest: "from the validated PHQ-9 — one tap per question",
    },
    {
      bold: "~3 minutes",
      rest: "to complete, completely anonymous, nothing is stored",
    },
    {
      bold: "Based on the PHQ-9",
      rest: ", the most widely used depression screen in primary care",
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
            Free <span className="accent-gradient">Depression</span> Test
          </>
        ),
        tagline:
          "Take the 2-week PHQ-9 self-screen used by clinicians worldwide. See your depression severity score against the standard banding in under 3 minutes.",
      }}
      introCard={{
        expectations: buildExpectations(totalQuestions),
        disclaimer: (
          <>
            This is a <strong>screening tool</strong>, not a clinical diagnosis.
            If you&apos;re having thoughts of hurting yourself, call or text{" "}
            <strong>988</strong> (Suicide &amp; Crisis Lifeline), help is
            available 24/7.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
