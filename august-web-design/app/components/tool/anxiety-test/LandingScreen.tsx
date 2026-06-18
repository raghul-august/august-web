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
      rest: ", items drawn from the Generalized Anxiety Disorder Questionnaire (GAD-Q-IV) and the GAD-7",
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
            Free <span className="accent-gradient">Anxiety</span> Test
          </>
        ),
        tagline:
          "A short, anonymous self-screen for generalized anxiety. Rate 20 statements about worry, restlessness, sleep, and physical anxiety symptoms, see where you land on a 5-tier severity banding in under 4 minutes.",
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
