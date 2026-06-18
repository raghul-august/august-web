import { CSSProperties } from "react";
import { colors } from "../../../utils/tools/tool-colors";

export const landingStyles: Record<string, CSSProperties> = {
  // Page
  page: {
    minHeight: "100vh",
    background: "var(--surface-page, #FAF9F5)",
  },

  // Hero Section
  heroSection: {
    position: "relative",
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: "var(--surface-page, #FAF9F5)",
  },
  heroOverlay: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "900px",
    padding: "128px 24px 80px",
  },
  heroCard: {
    textAlign: "center" as const,
  },
  heroHeadline: {
    fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
    fontWeight: 500,
    lineHeight: 1.15,
    color: "var(--text-primary, #141515)",
    margin: "0 0 8px",
    letterSpacing: "-0.03em",
  },

  // fontSize lives in tool-shared.css `.tl-hero-tagline` so mobile media
  // queries can override it. Setting it inline here would beat class rules.
  heroTagline: {
    lineHeight: 1.6,
    color: "var(--text-secondary, #5A554A)",
    margin: "0 0 48px",
    maxWidth: "700px",
    marginLeft: "auto",
    marginRight: "auto",
    fontWeight: 300,
  },

  // Quiz Intro Card (glassmorphism)
  quizIntro: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "32px",
    marginTop: "48px",
    maxWidth: "500px",
    marginLeft: "auto",
    marginRight: "auto",
    border: "1px solid var(--border-subtle, #E5E2DA)",
    textAlign: "left" as const,
  },
  quizIntroSection: {
    marginBottom: "24px",
  },
  quizIntroTitle: {
    fontSize: "1rem",
    fontWeight: 500,
    color: colors.green900,
    margin: "0 0 16px",
  },
  quizIntroList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  quizIntroListItem: {
    position: "relative" as const,
    paddingLeft: "24px",
    fontSize: "0.9rem",
    color: colors.neutral700,
    lineHeight: 1.6,
  },
  quizIntroText: {
    fontSize: "0.9rem",
    color: colors.neutral700,
    margin: 0,
    lineHeight: 1.6,
  },

  // Buttons
  ctaPrimaryFullWidth: {
    background: "var(--tool-accent-dark)",
    color: "white",
    border: "none",
    borderRadius: "9999px",
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    minWidth: "200px",
    margin: "16px auto 0",
    display: "block",
  },
  // Content Section
  contentSection: {
    background: "var(--surface-page, #FAF9F5)",
    padding: "112px 0 80px",
  },
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
  },

  // Info Card
  infoCard: {
    background:
      "linear-gradient(135deg, rgba(233, 241, 238, 0.5) 0%, rgba(255, 255, 255, 0.9) 100%)",
    border: `1px solid ${colors.green100}`,
    borderRadius: "16px",
    padding: "clamp(24px, 5vw, 48px)",
    marginBottom: "80px",
    textAlign: "center" as const,
  },
  cardTitle: {
    fontSize: "clamp(1.5rem, 4.5vw, 2.25rem)",
    fontWeight: 500,
    color: colors.green900,
    margin: "0 0 20px",
    letterSpacing: "-0.02em",
  },
  cardText: {
    fontSize: "clamp(1rem, 2vw, 1.125rem)",
    lineHeight: 1.7,
    color: colors.neutral700,
    maxWidth: "800px",
    margin: "0 auto",
  },

  // Text Sections
  textSection: {
    marginBottom: "80px",
  },
  sectionHeading: {
    fontSize: "clamp(1.5rem, 4vw, 2rem)",
    fontWeight: 500,
    color: "var(--text-primary, #141515)",
    margin: "0 0 24px",
    letterSpacing: "-0.01em",
    textAlign: "left" as const,
  },
  subsectionHeading: {
    fontSize: "clamp(1.5rem, 4vw, 2rem)",
    fontWeight: 500,
    color: "var(--text-primary, #141515)",
    margin: "0 0 20px",
    letterSpacing: "-0.02em",
  },
  bodyText: {
    fontSize: "clamp(0.9375rem, 1.8vw, 1.0625rem)",
    lineHeight: 1.8,
    color: "var(--text-secondary, #5A554A)",
    margin: "0 0 24px",
  },

  // Features Section
  featuresSection: {
    marginBottom: "80px",
  },
  featuresTitle: {
    fontSize: "clamp(1.5rem, 4vw, 2rem)",
    fontWeight: 500,
    color: "var(--text-primary, #141515)",
    margin: "0 0 16px",
    letterSpacing: "-0.01em",
    textAlign: "left" as const,
  },
  featuresSubtitle: {
    fontSize: "clamp(0.9375rem, 1.8vw, 1.0625rem)",
    lineHeight: 1.8,
    color: "var(--text-secondary, #5A554A)",
    margin: "0 0 48px",
    textAlign: "left" as const,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    marginTop: "32px",
  },
  featureCard: {
    padding: 0,
    borderRadius: "16px",
    border: "1px solid var(--border-subtle, #E5E2DA)",
    background: colors.green50,
    overflow: "hidden",
  },
  featureTitle: {
    fontSize: "1.25rem",
    fontWeight: 500,
    color: "var(--text-primary, #141515)",
    margin: "0 0 12px",
    padding: "0 28px",
    paddingTop: "24px",
  },
  featureText: {
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    color: "var(--text-secondary, #5A554A)",
    margin: 0,
    padding: "0 28px 28px 28px",
  },

  // CTA Banner
  ctaBanner: {
    background: "linear-gradient(135deg, var(--tool-accent-dark) 0%, var(--tool-accent) 100%)",
    borderRadius: "16px",
    padding: "64px 48px",
    margin: "80px 0",
    textAlign: "center" as const,
  },
  ctaContent: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  ctaHeadline: {
    fontSize: "2.25rem",
    fontWeight: 500,
    color: "white",
    margin: "0 0 16px",
    letterSpacing: "-0.02em",
  },
  ctaSubheadline: {
    fontSize: "1.125rem",
    color: "rgba(255, 255, 255, 0.95)",
    margin: "0 0 32px",
    lineHeight: 1.6,
  },
  ctaBenefits: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 40px",
    textAlign: "left" as const,
    display: "inline-block",
  },
  ctaBenefitItem: {
    position: "relative" as const,
    paddingLeft: "32px",
    marginBottom: "12px",
    color: "white",
    fontSize: "1.0625rem",
    lineHeight: 1.6,
  },
  ctaButton: {
    background: "white",
    color: colors.green700,
    border: "none",
    borderRadius: "9999px",
    padding: "16px 48px",
    fontSize: "1.0625rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  // Body text center variant
  bodyTextCenter: {
    fontSize: "1.0625rem",
    lineHeight: 1.8,
    color: "var(--text-secondary, #5A554A)",
    margin: "0 0 24px",
    textAlign: "center" as const,
    maxWidth: "700px",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "48px",
  },

};
