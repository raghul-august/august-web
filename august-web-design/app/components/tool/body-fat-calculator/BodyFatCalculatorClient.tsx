"use client";

import type { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import CalculatorPanel from "./CalculatorPanel";

export default function BodyFatCalculatorClient({ afterContent }: { afterContent?: ReactNode }) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Body Fat</span> Calculator
          </>
        ),
        tagline:
          "U.S. Navy circumference method or Army ABCP 2023 standard — instant client-side results.",
      }}
      beforeContent={
        <>
          <CalculatorPanel />
          <p
            className="tl-disclaimer"
            style={{ textAlign: "center", maxWidth: 640, margin: "-24px auto 48px", padding: "0 24px" }}
          >
            This calculator is for educational and general wellness purposes only. It does not
            constitute medical advice. Consult your healthcare provider for personalized
            recommendations.
          </p>
        </>
      }
      afterContent={afterContent}
    />
  );
}
