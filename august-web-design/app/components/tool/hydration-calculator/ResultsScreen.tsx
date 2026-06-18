"use client";

import type { HydrationResult } from "@/app/data/tools/hydration-calculator-config";
import { FOOD_WATER_CONTRIBUTION } from "@/app/data/tools/hydration-calculator-config";
import { track, trackToolEvent } from "@/app/utils/analytics";

interface ResultsScreenProps {
  result: HydrationResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const {
    recommendedIntakeLiters,
    actualIntakeLiters,
    dailyWaterLossLiters,
    foodWaterContributionLiters,
    isSufficientlyHydrated,
    totalCaloriesFromBeverages,
    isWithinCalorieGuideline,
    calorieExcess,
    conditionalMessages,
  } = result;

  return (
    <div className="hc-results-stack">
      {/* Card 1: Hydration Status */}
      <div className="hc-result-card">
        <div className="hc-result-title">Hydration Status</div>
        <div
          className={`hc-verdict ${
            isSufficientlyHydrated ? "hc-verdict--sufficient" : "hc-verdict--insufficient"
          }`}
        >
          {isSufficientlyHydrated ? "You're well hydrated" : "You may need to drink more"}
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          {actualIntakeLiters}L of your estimated {recommendedIntakeLiters}L daily need
        </p>
      </div>

      <div className=" flex justify-center gap-4 my-2">
        <a
          href="/chat?msg=I just used the hydration calculator and want to discuss my results"
          className="tool-btn tool-btn--primary"
          style={{ textDecoration: "none" }}
          onClick={() => {
            // track("tool_cta_clicked", { tool: "hydration-calculator", target: "chat" });
            trackToolEvent("hydration-calculator", "cta_clicked", { target: "chat" });
          }}
        >Talk to august</a>
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
          Start over
        </button>
      </div>

      {/* Card 2: Liquid Calories */}
      <div className="hc-result-card">
        <div className="hc-result-title">Calories from Beverages</div>
        <div className="hc-calorie-value">{totalCaloriesFromBeverages} kcal / day</div>
        <div
          className={`hc-calorie-status ${
            isWithinCalorieGuideline ? "hc-calorie-status--within" : "hc-calorie-status--above"
          }`}
        >
          {isWithinCalorieGuideline
            ? "Within WHO guidelines"
            : `${calorieExcess} kcal above WHO guidelines`}
        </div>
      </div>

      {/* Card 3: Water Balance */}
      <div className="hc-result-card">
        <div className="hc-result-title">Your Water Balance</div>
        <div className="hc-data-row">
          <span className="hc-data-label">Recommended daily intake</span>
          <span className="hc-data-value">{recommendedIntakeLiters} L</span>
        </div>
        <div className="hc-data-row">
          <span className="hc-data-label">Your beverage intake</span>
          <span className="hc-data-value">{actualIntakeLiters} L</span>
        </div>
        <div className="hc-data-row">
          <span className="hc-data-label">Estimated daily water loss</span>
          <span className="hc-data-value">{dailyWaterLossLiters} L</span>
        </div>
        <div className="hc-data-row">
          <span className="hc-data-label">Water from food</span>
          <span className="hc-data-value">{foodWaterContributionLiters ?? FOOD_WATER_CONTRIBUTION} L</span>
        </div>
      </div>

      {/* Conditional Messages */}
      {conditionalMessages.length > 0 && (
        <div className="hc-messages">
          {conditionalMessages.map((msg, i) => (
            <div key={i} className={`hc-message hc-message--${msg.type}`}>
              {msg.text}
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 8 }}>
        <p
          style={{
            color: "var(--text-tertiary)",
            fontSize: "0.75rem",
            lineHeight: 1.5,
            textAlign: "center",
            maxWidth: 480,
            margin: 0,
          }}
        >
          This calculator is for educational and general wellness purposes only. It does not
          constitute medical advice. Consult your healthcare provider for personalized
          recommendations.
        </p>
      </div>
    </div>
  );
}
