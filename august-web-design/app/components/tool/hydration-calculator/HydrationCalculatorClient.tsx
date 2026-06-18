"use client";

import type { ReactNode } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import CalculatorContainer from "./CalculatorContainer";

export default function HydrationCalculatorClient({ afterContent }: { afterContent?: ReactNode }) {
  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">Hydration</span> Calculator
          </>
        ),
        tagline:
          "Find out if you're drinking enough water based on your body, activity, and daily beverages.",
      }}
      afterContent={afterContent}
      beforeContent={<CalculatorContainer />}
    />
  );
}
