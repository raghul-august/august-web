"use client";

import React from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";

interface LandingScreenProps {
  onStartTest: () => void;
  afterContent?: React.ReactNode;
}

const expectations = [
  { bold: "34 questions", rest: "about your secret health habits and body experiences" },
  { bold: "~2-3 minutes", rest: "to complete, just check what applies" },
  { bold: "Rice Purity format", rest: ", start at 100, see how far you drop" },
];

export default function LandingScreen({ onStartTest, afterContent }: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Rice Purity Test - But For Your{" "}
            <span className="accent-gradient">Health</span>
          </>
        ),
        tagline: "34 body secrets. One score. How much have you been carrying alone?",
      }}
      introCard={{
        expectations,
        disclaimer: (
          <>
            This is <strong>not a diagnosis</strong>. It&apos;s an awareness tool that
            shows how many health experiences you&apos;ve been handling in silence. No
            judgment. Just a mirror.
          </>
        ),
        ctaLabel: "Start the test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
