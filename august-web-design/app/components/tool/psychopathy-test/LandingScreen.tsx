"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/psychopathy-test-config";
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
            Free <span className="accent-gradient">Psychopathy</span> Test
          </>
        ),
        tagline:
          "A 20-question self-screen drawn from the Hare PCL-R, the Psychopathic Personality Inventory, and the Levenson Self-Report Psychopathy Scale. See where your responses fall on a 5-tier psychopathy spectrum in under 3 minutes.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a <strong>self-reflection screener</strong>, not a clinical
            diagnosis. Psychopathy is diagnosed by a trained clinician using a
            structured interview (the PCL-R) with collateral information — not
            by a web quiz. A high score does not mean you are a psychopath.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
