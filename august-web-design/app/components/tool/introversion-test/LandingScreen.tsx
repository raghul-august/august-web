"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/introversion-test-config";
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
            Free <span className="accent-gradient">Introvert / Extrovert</span> Test
          </>
        ),
        tagline:
          "Twenty short questions placing you on the introvert–extrovert spectrum one of the Big Five personality traits. See where you land in about 3 minutes, anonymously.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a <strong>personality self-reflection</strong>, not a clinical test. Most people are somewhere in the middle (ambiverts), and where you sit on the spectrum is not better or worse than any other point.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
