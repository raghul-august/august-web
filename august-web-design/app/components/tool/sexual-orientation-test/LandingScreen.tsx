"use client";

import React from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";

interface LandingScreenProps {
  onStartTest: () => void;
  totalQuestions: number;
  afterContent?: React.ReactNode;
}

function buildExpectations(totalQuestions: number) {
  return [
    {
      bold: `${totalQuestions} questions`,
      rest: "about romantic and sexual attraction, on a strongly disagree to strongly agree scale",
    },
    { bold: "~2 minutes", rest: "to complete at your own pace" },
    {
      bold: "Four-dimension result",
      rest: "showing same-gender, different-gender, multi-gender, and asexual-spectrum scores — not a single label",
    },
  ];
}

export default function LandingScreen({ onStartTest, totalQuestions, afterContent }: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Sexual Orientation</span> Test
          </>
        ),
        tagline: "A spectrum-based self-reflection. Answer 12 short questions and see where your attractions fall across four dimensions — not just a single label.",
      }}
      introCard={{
        expectations: buildExpectations(totalQuestions),
        disclaimer: (
          <>
            This is a <strong>self-reflection tool</strong>, not a diagnostic
            test. Your orientation is yours to define — these questions just
            help you see patterns.
          </>
        ),
        ctaLabel: "Take the test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
