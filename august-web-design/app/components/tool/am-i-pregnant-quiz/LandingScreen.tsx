"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import { EXPECTATIONS, HERO_TAGLINE } from "@/app/data/tools/am-i-pregnant-quiz-landing";

interface LandingScreenProps {
  onStartTest: () => void;
  afterContent?: ReactNode;
}

export default function LandingScreen({ onStartTest, afterContent }: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Am I <span className="accent-gradient">Pregnant</span>?
          </>
        ),
        tagline: HERO_TAGLINE,
      }}
      introCard={{
        expectations: EXPECTATIONS,
        disclaimer: (
          <>
            This is a <strong>screening quiz</strong>, not a pregnancy diagnosis.
            Only a urine or blood test can confirm pregnancy. If you may need
            emergency contraception, the sooner it&apos;s taken the better, but most
            options work for up to <strong>3–5 days</strong> after unprotected
            sex.
          </>
        ),
        ctaLabel: "Start the Quiz",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
