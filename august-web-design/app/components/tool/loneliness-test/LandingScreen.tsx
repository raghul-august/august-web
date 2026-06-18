"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/loneliness-test-config";
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
            Free <span className="accent-gradient">Loneliness</span> Test
          </>
        ),
        tagline:
          "Twenty short questions to see where you sit on the loneliness spectrum  from connected to profoundly lonely. About 3 minutes, anonymous, no sign-up.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a <strong>self-reflection screener</strong>, not a clinical assessment. Loneliness is a universal human experience not a disorder but unrelenting loneliness has real consequences for emotional and physical health.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
