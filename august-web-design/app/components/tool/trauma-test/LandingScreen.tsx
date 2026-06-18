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
      rest: "from the validated PC-PTSD-5 — one tap per question",
    },
    {
      bold: "~2 minutes",
      rest: "to complete, completely anonymous, nothing is stored",
    },
    {
      bold: "Used by the VA",
      rest: ", the National Center for PTSD's standard primary-care screen",
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
            Free <span className="accent-gradient">PTSD / Trauma</span> Test
          </>
        ),
        tagline:
          "Take the PC-PTSD-5, the brief PTSD self-screen used by the VA and primary care clinicians. Answer 5 short yes/no questions about the past month and see whether your symptoms suggest PTSD.",
      }}
      introCard={{
        expectations: buildExpectations(totalQuestions),
        disclaimer: (
          <>
            This is a <strong>screening tool</strong>, not a clinical diagnosis.
            If you&apos;re in crisis or having thoughts of hurting yourself,
            call or text <strong>988 </strong> (Suicide &amp; Crisis Lifeline,
            press <strong>1</strong> for the Veterans Crisis Line), help is
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
