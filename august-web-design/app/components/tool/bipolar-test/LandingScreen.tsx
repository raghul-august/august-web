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
      bold: `${totalQuestions} short statements`,
      rest: "to rate from strongly disagree to strongly agree — one tap per question",
    },
    {
      bold: "~4 minutes",
      rest: "to complete, completely anonymous, nothing is stored",
    },
    {
      bold: "Clinically grounded",
      rest: ", items modeled on the Mood Disorder Questionnaire (MDQ) and DSM-5 bipolar-spectrum criteria",
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
            Free <span className="accent-gradient">Bipolar</span> Test
          </>
        ),
        tagline:
          "A short, anonymous self-screen for bipolar disorder. Rate 20 statements about mood, energy, sleep, impulsivity, and depressive episodes, and see where you land on a 5-tier severity banding in under 4 minutes.",
      }}
      introCard={{
        expectations: buildExpectations(totalQuestions),
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
