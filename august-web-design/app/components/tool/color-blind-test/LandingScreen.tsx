"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import { CALIBRATION_TIPS, EXPECTATIONS } from "@/app/data/tools/color-blind-test-landing";

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
            Free <span className="accent-gradient">Color Blind</span> Test
          </>
        ),
        tagline:
          "A 12-plate, Ishihara-style online screen for color vision deficiency. Identify likely red-green (protan/deutan) or blue-yellow (tritan) patterns in about 2 minutes, anonymous, no email required.",
      }}
      introCard={{
        expectations: EXPECTATIONS,
        disclaimer: (
          <>
            <span>
              This is a <strong>screening tool</strong>, not a clinical diagnosis.
              Online color tests are affected by your screen calibration, ambient
              lighting and viewing distance for a definitive answer, see an
              eye-care professional.
            </span>
            <span className="block mt-2 font-medium text-(--text-secondary)">
              Before you start:
            </span>
            <ul className="cbt-calibration-list">
              {CALIBRATION_TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
