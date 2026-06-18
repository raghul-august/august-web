"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";

interface LandingScreenProps {
  onStartTest: () => void;
  totalTests: number;
  afterContent?: ReactNode;
}

function buildExpectations(totalTests: number) {
  return [
    {
      bold: `${totalTests} interactive tests`,
      rest: "reaction tap, color-pattern memory, Stroop focus, and a moving-dot chase",
    },
    { bold: "About two minutes", rest: "to finish all four, one short breath each" },
    {
      bold: "A clear cognitive snapshot",
      rest: "scored out of 100, with a per-domain breakdown and what to do about it",
    },
  ];
}

export default function LandingScreen({ onStartTest, totalTests, afterContent }: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Drug Interaction</span> Checker
          </>
        ),
        tagline: "A 4-part interactive self-screen. See how substances, fatigue, and stress are interacting with your reaction, memory, focus, and tracking right now. Free, private, takes about two minutes.",
      }}
      introCard={{
        expectations: buildExpectations(totalTests),
        disclaimer: (
          <>
            <strong>Entertainment only.</strong> This is a brain game, not a
            medical or legal drug test. If you or someone you&apos;re with is in
            crisis, call SAMHSA&apos;s free 24/7 helpline at{" "}
            <strong>1-800-662-HELP (4357)</strong>.
          </>
        ),
        ctaLabel: "Start the screen",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
