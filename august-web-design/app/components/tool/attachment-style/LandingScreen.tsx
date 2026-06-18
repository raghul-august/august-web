"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import { EXPECTATIONS, HERO_TAGLINE } from "@/app/data/tools/attachment-style-landing";

interface LandingScreenProps {
  onStartTest: () => void;
  afterContent?: ReactNode;
}

export default function LandingScreen({ onStartTest, afterContent }: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Free <span className="accent-gradient">Attachment Style</span> Test
          </>
        ),
        tagline: HERO_TAGLINE,
      }}
      introCard={{
        expectations: EXPECTATIONS,
        disclaimer: (
          <>
            This is a <strong>self-reflection tool</strong>, not a clinical
            assessment. Attachment styles are patterns, not diagnoses and
            they can shift over time, especially through healing relationships
            and therapy.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
