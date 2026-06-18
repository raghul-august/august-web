"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import { EXPECTATIONS } from "@/app/data/tools/iq-test-landing";

interface LandingScreenProps {
  onStartTest: () => void;
  afterContent?: ReactNode;
}

export default function LandingScreen({
  onStartTest,
  afterContent,
}: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Free <span className="accent-gradient">IQ Test</span>
          </>
        ),
        tagline:
          "A short, untimed, anonymous IQ screen across verbal, numerical, pattern, logical, and spatial reasoning. Get an estimate on the Wechsler scale (mean 100) with a percentile and band in about five minutes.",
      }}
      introCard={{
        expectations: EXPECTATIONS,
        disclaimer: (
          <>
            This is a brief <strong>screening tool</strong> for curiosity, not a
            clinical IQ assessment. Formal IQ tests are administered in person
            by a licensed psychologist. Read the result as a directional
            signal, not a definitive number.
          </>
        ),
        ctaLabel: "Start the IQ Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
