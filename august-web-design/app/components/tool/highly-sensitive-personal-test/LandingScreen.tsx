"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/highly-sensitive-personal-test-config";
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
            Free <span className="accent-gradient">Highly Sensitive Person</span> Test
          </>
        ),
        tagline:
          "Twenty short questions adapted from the Highly Sensitive Person Scale (HSPS) developed by Elaine Aron. See where your sensory-processing sensitivity sits on a 5-tier spectrum in about 3 minutes.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a <strong>self-reflection screener</strong>, not a clinical assessment. Being a Highly Sensitive Person is a temperament trait, not a disorder — there is nothing to 'cure'.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
