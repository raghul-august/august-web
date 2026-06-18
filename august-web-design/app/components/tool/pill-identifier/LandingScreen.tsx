"use client";

import { ReactNode } from "react";
import { landingStyles } from "../shared/landing-styles";

interface LandingScreenProps {
  onStart: () => void;
  afterContent?: ReactNode;
}

const expectations = [
  {
    bold: "Imprint, color, shape",
    rest: "— the three pieces of information on every FDA-approved pill in the U.S.",
  },
  {
    bold: "~30 seconds",
    rest: "to a likely match, no signup, nothing stored against your account",
  },
  {
    bold: "Educational reference",
    rest: ", confirm any unfamiliar pill with a pharmacist before you take it",
  },
];

export default function LandingScreen({ onStart, afterContent }: LandingScreenProps) {
  return (
    <div style={landingStyles.page}>
      <section className="tl-hero-section">
        <div
          className="tl-content-narrow tl-hero-overlay tl-text-center"
          style={{ padding: "12px 24px 48px" }}
        >
          <h1 style={landingStyles.heroHeadline} className="tl-hero-headline">
            Free <span className="accent-gradient">Pill</span> Identifier
          </h1>
          <p style={landingStyles.heroTagline} className="tl-hero-tagline">
            Match the letters, color, and shape on a tablet or capsule to the
            medication it likely is. Built from the public FDA imprint taxonomy
            used by Drugs.com and DailyMed for quick reference, not for
            diagnosis.
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
                This tool is for <strong>educational reference only</strong>.
                Do not take an unfamiliar pill based on this result. If you
                have an unknown pill in your home or you suspect a poisoning,
                contact your pharmacist or local poison control centre.
              </p>
            </div>
            <div className="flex justify-center">
              <button
                className="tool-btn tool-btn--primary"
                onClick={onStart}
              >
                Identify a pill
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
