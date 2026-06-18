"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "./ToolLandingLayout";

interface QuizLandingScreenProps {
  heroTitle: ReactNode;
  heroTagline: string;
  expectations: { bold: string; rest: string }[];
  disclaimer: ReactNode;
  ctaLabel?: string;
  onStartTest: () => void;
  afterContent?: ReactNode;
}

export default function QuizLandingScreen({
  heroTitle,
  heroTagline,
  expectations,
  disclaimer,
  ctaLabel = "Start the Test",
  onStartTest,
  afterContent,
}: QuizLandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{ title: heroTitle, tagline: heroTagline }}
      introCard={{
        expectations,
        disclaimer,
        ctaLabel,
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
