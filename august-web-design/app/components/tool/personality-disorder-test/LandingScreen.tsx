"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";

interface LandingScreenProps {
  onStartTest: () => void;
  totalQuestions: number;
  afterContent?: ReactNode;
}

function buildExpectations(totalQuestions: number) {
  return [
    {
      bold: `${totalQuestions} short questions`,
      rest: "mapped to the DSM-5-TR criteria for borderline personality disorder — one tap per question",
    },
    {
      bold: "~3 minutes",
      rest: "to complete, completely anonymous, nothing is stored",
    },
    {
      bold: "Clinically grounded",
      rest: ", every item is aligned with the nine DSM-5-TR BPD criteria",
    },
  ];
}

export default function LandingScreen({
  onStartTest,
  totalQuestions,
  afterContent,
}: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Free <span className="accent-gradient">Personality Disorder</span> Test
          </>
        ),
        tagline:
          "A short, anonymous self-screen for borderline personality disorder, built on the DSM-5-TR criteria. See where your responses fall on the standard severity banding in under 3 minutes.",
      }}
      introCard={{
        expectations: buildExpectations(totalQuestions),
        disclaimer: (
          <>
            This is a <strong>screening tool</strong>, not a clinical diagnosis.
            If you&apos;re having thoughts of hurting yourself, call or text{" "}
            <strong>988</strong> (Suicide &amp; Crisis Lifeline), help is
            available 24/7.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
