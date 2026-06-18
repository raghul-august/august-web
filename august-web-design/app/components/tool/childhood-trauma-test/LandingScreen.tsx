"use client";

import ToolLandingLayout from "../shared/ToolLandingLayout";

interface LandingScreenProps {
  onStartTest: () => void;
  afterContent?: React.ReactNode;
}

const expectations = [
  { bold: "10 questions", rest: "about experiences during your first 18 years" },
  { bold: "~1-2 minutes", rest: "to complete, simple yes or no format" },
  { bold: "Based on the CDC-Kaiser ACE Study", rest: ", a research-backed framework" },
];

export default function LandingScreen({ onStartTest, afterContent }: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Free Childhood <span className="accent-gradient">Trauma</span> Test
          </>
        ),
        tagline: "Find out whether early life experiences may be affecting your wellbeing today. Based on the CDC-Kaiser Permanente Adverse Childhood Experiences framework.",
      }}
      introCard={{
        expectations,
        disclaimer: (
          <>
            This is a <strong>screening tool</strong>, not a diagnosis. It&apos;s designed to
            help you reflect on childhood experiences and their potential impact.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
