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
      rest: "covering body image, binge eating, compensatory behaviours, and restrictive eating — one tap per question",
    },
    {
      bold: "~4 minutes",
      rest: "to complete, completely anonymous, nothing is stored",
    },
    {
      bold: "Clinically grounded",
      rest: ", every item is drawn from the SWED screener (Stanford-Washington University Eating Disorder Screen) used by Mental Health America",
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
            Free <span className="accent-gradient">Eating Disorder</span> Test
          </>
        ),
        tagline:
          "A short, anonymous self-screen for signs of disordered eating — covering body image, binge eating, compensatory behaviours, and restrictive patterns. See where your responses fall in under 4 minutes.",
      }}
      introCard={{
        expectations: buildExpectations(totalQuestions),
        disclaimer: (
          <>
            This is a <strong>screening tool</strong>, not a clinical diagnosis.
            If you&apos;re in crisis or thinking of hurting yourself, call or
            text <strong>988</strong> (Suicide &amp; Crisis Lifeline). For
            eating-disorder-specific support, you can also text{" "}
            <strong>&ldquo;NEDA&rdquo; to 741-741</strong>.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
