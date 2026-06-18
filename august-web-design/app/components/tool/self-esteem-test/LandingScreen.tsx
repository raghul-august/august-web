"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/self-esteem-test-config";
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
            Free <span className="accent-gradient">Self-Esteem</span> Test
          </>
        ),
        tagline:
          "A 20-question self-screen drawn from the Rosenberg, Coopersmith, Robson, and Neff self-compassion scales. See where your self-regard sits on a 5-tier spectrum in under 3 minutes.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a <strong>self-reflection screener</strong>, not a clinical
            assessment. Self-esteem sits at the centre of how you talk to
            yourself, recover from setbacks, and take in feedback — work with a
            therapist if it has been hurting your day-to-day life.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
