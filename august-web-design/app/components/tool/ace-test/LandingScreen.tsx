"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import { EXPECTATIONS } from "@/app/data/tools/ace-test-landing";

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
            Free <span className="accent-gradient">ACE</span> Test
          </>
        ),
        tagline:
          "The original 10-item Adverse Childhood Experiences questionnaire from the CDC-Kaiser ACE Study. Answer 10 yes/no questions to see your score in context.",
      }}
      introCard={{
        expectations: EXPECTATIONS,
        disclaimer: (
          <>
            Some of these questions describe difficult experiences. If anything brings up
            strong feelings, you can stop at any time. If you&apos;re in crisis or
            thinking of hurting yourself, call or text <strong>988</strong>{" "}
            (Suicide &amp; Crisis Lifeline).
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
