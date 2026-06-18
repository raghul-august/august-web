"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import { EXPECTATIONS } from "@/app/data/tools/enneagram-test-landing";

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
            Free <span className="accent-gradient">Enneagram</span> Test
          </>
        ),
        tagline:
          "A short, anonymous Enneagram personality test. Answer 36 statements and discover which of the nine Enneagram types fits you best, what your wing is, and how close your secondary type was all in about five minutes.",
      }}
      introCard={{
        expectations: EXPECTATIONS,
        disclaimer: (
          <>
            The Enneagram is a <strong>self-reflection framework</strong>, not a
            clinical diagnostic test. It works best as a starting point for
            understanding the motivations underneath your behavior, not as a
            label that defines you. If you&apos;re going through something hard,
            a licensed mental-health professional is the right next step.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
