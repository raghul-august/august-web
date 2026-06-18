"use client";

import { ReactNode } from "react";
import { EXPECTATIONS } from "@/app/data/tools/reaction-time-config";
import ToolLandingLayout from "../shared/ToolLandingLayout";

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
            Free <span className="accent-gradient">Reaction Time</span> Test
          </>
        ),
        tagline:
          "Five quick trials, one number. Click as soon as the screen turns green and see how your visual reaction time compares to the average adult — in under a minute, with no sign-up.",
      }}
      introCard={{
        expectations: [...EXPECTATIONS],
        disclaimer: (
          <>
            This is a casual reflex check, <strong>not a medical test</strong>.
            It can&apos;t diagnose ADHD, concussion, or any clinical condition.
            Results depend on your mouse, screen, and how tired you are, so
            don&apos;t read too much into a single run.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
