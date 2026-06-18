"use client";

import LandingNav from "./landing/LandingNav";

interface NavbarProps {
  isWebviewSource?: boolean;
  initialCountry?: string | null;
}

export function Navbar({ isWebviewSource = false, initialCountry }: NavbarProps) {
  if (isWebviewSource) return null;

  return <LandingNav initialCountry={initialCountry ?? undefined} />;
}

// Default export for backward compatibility with dynamic imports
export default Navbar;
