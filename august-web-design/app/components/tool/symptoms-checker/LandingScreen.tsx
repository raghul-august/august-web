"use client";

import { ReactNode } from "react";
import { landingStyles } from "../shared/landing-styles";

interface LandingScreenProps {
  onStart: () => void;
  totalSteps: number;
  afterContent?: ReactNode;
}

function buildExpectations(totalSteps: number) {
  return [
    {
      bold: `Up to ${totalSteps} short questions`,
      rest: "covering your body region, the symptom itself, Mayo-style related factors, duration, severity, and red flags",
    },
    {
      bold: "Under 3 minutes",
      rest: "to complete — one tap per question, auto-advances as you go",
    },
    {
      bold: "Personalized triage",
      rest: ": care-urgency level, common causes, and self-care guidance",
    },
  ];
}

export default function LandingScreen({
  onStart,
  totalSteps,
  afterContent,
}: LandingScreenProps) {
  const expectations = buildExpectations(totalSteps);

  return (
    <div style={landingStyles.page}>
      <section className="tl-hero-section">
        <div
          className="tl-content-narrow tl-hero-overlay tl-text-center"
          style={{ padding: "12px 24px 48px" }}
        >
          <h1 style={landingStyles.heroHeadline} className="tl-hero-headline">
            Free <span className="accent-gradient">Symptoms</span> Checker
          </h1>
          <p style={landingStyles.heroTagline} className="tl-hero-tagline">
            Pick a body region, describe what you&apos;re feeling, and find out
            whether self-care, a routine visit, urgent care, or the ER is the
            right next step.
          </p>

          <div style={landingStyles.quizIntro} className="tl-quiz-intro">
            <div style={landingStyles.quizIntroSection}>
              <h3 style={landingStyles.quizIntroTitle}>What to expect</h3>
              <ul
                style={landingStyles.quizIntroList}
                className="tl-quiz-intro-list"
              >
                {expectations.map((exp) => (
                  <li key={exp.bold} style={landingStyles.quizIntroListItem}>
                    <strong>{exp.bold}</strong> {exp.rest}
                  </li>
                ))}
              </ul>
            </div>
            <div style={landingStyles.quizIntroSection}>
              <h3 style={landingStyles.quizIntroTitle}>Disclaimer</h3>
              <p style={landingStyles.quizIntroText}>
                This is a <strong>triage tool</strong>, not a diagnosis. If you
                think you may be having an emergency — chest pressure, trouble
                breathing, signs of a stroke — call 911 right now.
              </p>
            </div>
            <div className="flex justify-center">
              <button
                className="tool-btn tool-btn--primary"
                onClick={onStart}
              >
                Start the check
              </button>
            </div>
          </div>
        </div>
      </section>

      {afterContent && (
        <div style={landingStyles.contentSection}>
          <div style={landingStyles.contentWrapper}>{afterContent}</div>
        </div>
      )}
    </div>
  );
}
