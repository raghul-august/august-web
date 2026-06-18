"use client";

import FinalCta from "./landing/FinalCta";
import LandingFooter from "./landing/LandingFooter";

interface FooterProps {
  showLanguageSwitcher?: boolean;
}

export function Footer({ showLanguageSwitcher = false }: FooterProps) {
  return (
    <>
      <FinalCta />
      <LandingFooter />
    </>
  );
}

// Default export for backward compatibility with dynamic imports
export default Footer;
