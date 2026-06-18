"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";

interface LandingScreenProps {
  onStartTest: () => void;
  afterContent?: ReactNode;
}

const expectations = [
  {
    bold: "4–5 short questions",
    rest: "from the OCI-4 (adults) or OCI-CV-5 (youth), the ultra-brief screens used by the International OCD Foundation",
  },
  {
    bold: "~2 minutes",
    rest: "to complete, completely anonymous, nothing is stored",
  },
  {
    bold: "Clinically grounded",
    rest: ", every item is taken verbatim from the published OCI screening instruments",
  },
];

export default function LandingScreen({
  onStartTest,
  afterContent,
}: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Free <span className="accent-gradient">OCD</span> Test
          </>
        ),
        tagline:
          "A short, anonymous self-screen for obsessive-compulsive disorder, built on the OCI-4 and OCI-CV-5, the ultra-brief OCD screens used by the International OCD Foundation. See whether a fuller assessment is recommended in under 2 minutes.",
      }}
      introCard={{
        expectations,
        disclaimer: (
          <>
            This is a <strong>screening tool</strong>, not a clinical diagnosis.
            A diagnosis can only be made by a licensed mental health
            professional. If you&apos;re in crisis or thinking of hurting
            yourself, call or text <strong>988 </strong> (Suicide &amp; Crisis
            Lifeline).
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
