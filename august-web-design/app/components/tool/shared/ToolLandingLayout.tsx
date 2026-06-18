"use client";

import { ReactNode } from "react";
import { landingStyles } from "./landing-styles";

// Note: ToolLayout now wraps tools in AppShell (sidebar + inline Navbar), so
// this layout no longer renders the website Navbar/Footer — they'd double up.

interface HeroProps {
  title: ReactNode;
  tagline: string;
}

interface IntroCardProps {
  expectations: { bold: string; rest: string }[];
  disclaimer: ReactNode;
  ctaLabel: string;
  onCtaClick: () => void;
}

interface ToolLandingLayoutProps {
  hero: HeroProps;
  introCard?: IntroCardProps;
  beforeContent?: ReactNode;
  afterContent?: ReactNode;
  children?: ReactNode;
}

export default function ToolLandingLayout({
  hero,
  introCard,
  beforeContent,
  afterContent,
  children,
}: ToolLandingLayoutProps) {
  return (
    <>
      <div style={landingStyles.page}>
        {/* Hero */}
        <section className="tl-hero-section" style={{ minHeight: introCard ? "80vh" : undefined }}>
          <div
            className="tl-content-narrow tl-hero-overlay tl-text-center"
            style={{ paddingTop: 32 }}
          >
            <h1 style={landingStyles.heroHeadline} className="tl-hero-headline">
              {hero.title}
            </h1>
            <p style={landingStyles.heroTagline} className="tl-hero-tagline">
              {hero.tagline}
            </p>

            {/* Intro card (quiz tools) */}
            {introCard && (
              <div style={landingStyles.quizIntro} className="tl-quiz-intro">
                <div style={landingStyles.quizIntroSection}>
                  <h3 style={landingStyles.quizIntroTitle}>What to expect</h3>
                  <ul style={landingStyles.quizIntroList} className="tl-quiz-intro-list">
                    {introCard.expectations.map((exp) => (
                      <li key={exp.bold} style={landingStyles.quizIntroListItem}>
                        <strong>{exp.bold}</strong> {exp.rest}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={landingStyles.quizIntroSection}>
                  <h3 style={landingStyles.quizIntroTitle}>Disclaimer</h3>
                  <p style={landingStyles.quizIntroText}>{introCard.disclaimer}</p>
                </div>
                <div className="flex justify-center">
                <button
                  // style={landingStyles.ctaPrimaryFullWidth}
                  className="tool-btn tool-btn--primary"
                  onClick={introCard.onCtaClick}
                >
                  {introCard.ctaLabel}
                </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {beforeContent}

        {/* Main content area */}
        <div style={landingStyles.contentSection}>
          <div style={landingStyles.contentWrapper}>
            {children}

            {afterContent}
          </div>
        </div>
      </div>
    </>
  );
}
