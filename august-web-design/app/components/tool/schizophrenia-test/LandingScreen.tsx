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
      rest: "covering perceptual experiences, unusual beliefs, thought changes, and shifts in how reality feels — one tap per question",
    },
    {
      bold: "~4 minutes",
      rest: "to complete, completely anonymous, nothing is stored",
    },
    {
      bold: "Clinically grounded",
      rest: ", every item is drawn from the Prodromal Questionnaire — Brief (PQ-B), the same screener used by Mental Health America",
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
            Free <span className="accent-gradient">Schizophrenia</span> Test
          </>
        ),
        tagline:
          "A short, anonymous self-screen for psychosis-spectrum experiences, covering perceptual changes, unusual beliefs, thought disturbances, and shifts in how reality feels. See where your responses fall in under 4 minutes.",
      }}
      introCard={{
        expectations: buildExpectations(totalQuestions),
        disclaimer: (
          <>
            This is a <strong>screening tool</strong>, not a clinical diagnosis.
            If you&apos;re in crisis or thinking of hurting yourself, call or
            text <strong>988 </strong> (Suicide &amp; Crisis Lifeline). For early
            psychosis support, you can find specialised programmes through{" "}
            <strong>SAMHSA&apos;s National Helpline at 1-800-662-4357</strong>.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
