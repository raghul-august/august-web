"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/narcissism-test-config";
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
            Free <span className="accent-gradient">Narcissism</span> Test
          </>
        ),
        tagline:
          "A 20-question self-screen drawn from the NPI, NARQ, and B-PNI inventories. See where your responses fall on a 5-tier narcissism spectrum in about 3 minutes, with no sign-up.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a <strong>self-reflection screener</strong>, not a clinical
            diagnosis. Narcissistic personality disorder is diagnosed by a
            mental health professional after a structured interview not by a
            web quiz. Treat the result as one data point.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
