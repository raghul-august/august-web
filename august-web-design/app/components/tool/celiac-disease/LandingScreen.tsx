"use client";

import { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import { EXPECTATIONS } from "@/app/data/tools/celiac-disease-landing";

interface LandingScreenProps {
  onStartTest: () => void;
  afterContent?: ReactNode;
}

export default function LandingScreen({
  onStartTest,
  afterContent,
}: LandingScreenProps) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Free <span className="accent-gradient">Celiac Disease</span> Symptom Test
          </>
        ),
        tagline:
          "A 21-item celiac disease symptom checklist covering digestive, neurological, skin, reproductive, and genetic risk factors. See whether testing is worth bringing up with your doctor.",
      }}
      introCard={{
        expectations: EXPECTATIONS,
        disclaimer: (
          <>
            This is a screening checklist, not a diagnosis. Celiac is
            diagnosed via blood test (tTG-IgA + total IgA) and usually a
            small-bowel biopsy <strong>while you&apos;re still eating gluten</strong>.
            Don&apos;t cut out gluten before being tested — it can hide the
            disease.
          </>
        ),
        ctaLabel: "Start the Test",
        onCtaClick: onStartTest,
      }}
      afterContent={afterContent}
    />
  );
}
