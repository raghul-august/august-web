"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import { EXPECTATIONS } from "@/app/data/tools/perimenopause-symptom-landing";

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
            Free <span className="accent-gradient">Perimenopause</span> Symptom Quiz
          </>
        ),
        tagline:
          "A 21-item symptom checklist modelled on the Greene Climacteric Scale, the research instrument clinicians use to track perimenopause across hot flushes, mood, sleep, joint pain, and more.",
      }}
      introCard={{
        expectations: EXPECTATIONS,
        disclaimer: (
          <>
            This is a screening tool, not a diagnosis. Perimenopause is
            diagnosed by a clinician based on age, cycle, and symptoms. If
            you&apos;re in mental-health crisis, call or text{" "}
            <strong>988</strong> (Suicide &amp; Crisis Lifeline).
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
