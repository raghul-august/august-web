"use client";

import ToolLandingLayout from "../shared/ToolLandingLayout";

interface LandingScreenProps {
  onStartTest: () => void;
  totalQuestions: number;
  afterContent?: React.ReactNode;
}

function buildExpectations(totalQuestions: number) {
  return [
    { bold: `${totalQuestions} questions`, rest: "covering attention, impulse control, and hyperactivity" },
    { bold: "~2 minutes", rest: "to complete at your own pace" },
    { bold: "Based on ASRS-v1.1", rest: "- a clinically validated screening tool" },
  ];
}

export default function LandingScreen({ onStartTest, totalQuestions, afterContent }: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">ADHD</span> Test
          </>
        ),
        tagline: 'Join August to turn your "distractions" into your greatest strengths with personalized support.',
      }}
      introCard={{
        expectations: buildExpectations(totalQuestions),
        disclaimer: (
          <>
            This is a <strong>screening tool</strong>, not a diagnosis. It&apos;s designed to
            help you understand patterns in your attention and focus.
          </>
        ),
        ctaLabel: "Let's begin",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
