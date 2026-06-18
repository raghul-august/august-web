"use client";

import type {
  HydrationFormData,
  BeverageId,
  UnitSystem,
} from "@/app/data/tools/hydration-calculator-config";
import {
  ACTIVITY_OPTIONS,
  COUNTRY_OPTIONS,
  BEVERAGES,
} from "@/app/data/tools/hydration-calculator-config";

/* ── ProfileStep ── */

interface ProfileStepProps {
  formData: HydrationFormData;
  onUpdate: <K extends keyof HydrationFormData>(field: K, value: HydrationFormData[K]) => void;
  onUnitToggle: (system: UnitSystem) => void;
}

export function ProfileStep({ formData, onUpdate, onUnitToggle }: ProfileStepProps) {
  const { gender, pregnancyStatus, age, unitSystem, weightValue, heightValue, weightUnit, heightUnit } = formData;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 className="tool-step-title">Your Profile</h2>

      <div className="hc-gender-toggle">
        {(["male", "female"] as const).map((g) => (
          <button
            key={g}
            type="button"
            className={`hc-gender-btn${gender === g ? " hc-gender-btn--selected" : ""}`}
            aria-pressed={gender === g}
            onClick={() => onUpdate("gender", g)}
          >
            {g === "male" ? "Male" : "Female"}
          </button>
        ))}
      </div>

      {gender === "female" && (
        <div className="hc-pregnancy-group">
          {(["none", "pregnant", "breastfeeding"] as const).map((status) => (
            <button
              key={status}
              type="button"
              className={`tool-chip${pregnancyStatus === status ? " tool-chip--active" : ""}`}
              aria-pressed={pregnancyStatus === status}
              onClick={() => onUpdate("pregnancyStatus", status)}
            >
              {status === "none" ? "None" : status === "pregnant" ? "Pregnant" : "Breastfeeding"}
            </button>
          ))}
        </div>
      )}

      <div className="tool-form-group">
        <label className="tool-form-label" htmlFor="hc-age">Age</label>
        <input
          id="hc-age"
          type="number"
          className="tool-input"
          placeholder="18-78"
          min={18}
          max={78}
          value={age ?? ""}
          onChange={(e) => {
            const v = e.target.value === "" ? null : Number(e.target.value);
            onUpdate("age", v);
          }}
          aria-label="Age"
        />
      </div>

      <div className="hc-unit-toggle">
        {(["metric", "imperial"] as const).map((sys) => (
          <button
            key={sys}
            type="button"
            className={`hc-unit-option${unitSystem === sys ? " hc-unit-option--active" : ""}`}
            aria-pressed={unitSystem === sys}
            onClick={() => onUnitToggle(sys)}
          >
            {sys === "metric" ? "Metric" : "Imperial"}
          </button>
        ))}
      </div>

      <div className="hc-form-row">
        <div className="tool-form-group">
          <label className="tool-form-label" htmlFor="hc-weight">Weight ({weightUnit})</label>
          <input
            id="hc-weight"
            type="number"
            className="tool-input"
            placeholder={weightUnit === "kg" ? "e.g. 70" : "e.g. 154"}
            min={0}
            value={weightValue ?? ""}
            onChange={(e) => {
              const v = e.target.value === "" ? null : Number(e.target.value);
              onUpdate("weightValue", v);
            }}
            aria-label={`Weight in ${weightUnit}`}
          />
        </div>
        <div className="tool-form-group">
          <label className="tool-form-label" htmlFor="hc-height">Height ({heightUnit})</label>
          <input
            id="hc-height"
            type="number"
            className="tool-input"
            placeholder={heightUnit === "cm" ? "e.g. 170" : "e.g. 67"}
            min={0}
            value={heightValue ?? ""}
            onChange={(e) => {
              const v = e.target.value === "" ? null : Number(e.target.value);
              onUpdate("heightValue", v);
            }}
            aria-label={`Height in ${heightUnit}`}
          />
        </div>
      </div>
    </div>
  );
}

/* ── ActivityStep ── */

interface ActivityStepProps {
  formData: HydrationFormData;
  onUpdate: <K extends keyof HydrationFormData>(field: K, value: HydrationFormData[K]) => void;
}

export function ActivityStep({ formData, onUpdate }: ActivityStepProps) {
  const { activityLevel, country } = formData;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 className="tool-step-title">Activity and Location</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="radiogroup" aria-label="Activity level">
        {ACTIVITY_OPTIONS.map((option) => (
          <div
            key={option.value}
            className={`hc-activity-card${activityLevel === option.value ? " hc-activity-card--selected" : ""}`}
            role="radio"
            aria-checked={activityLevel === option.value}
            tabIndex={0}
            onClick={() => onUpdate("activityLevel", option.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onUpdate("activityLevel", option.value);
              }
            }}
          >
            <div className="hc-activity-label">{option.label}</div>
            <div className="hc-activity-desc">{option.description}</div>
          </div>
        ))}
      </div>

      <div className="tool-form-group">
        <label className="tool-form-label" htmlFor="hc-country">Country (optional)</label>
        <select
          id="hc-country"
          className="tool-input"
          value={country}
          onChange={(e) => onUpdate("country", e.target.value)}
          aria-label="Country"
        >
          <option value="">Select country</option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ── BeverageStep ── */

interface BeverageStepProps {
  beverages: Record<BeverageId, number>;
  onUpdate: (id: BeverageId, count: number) => void;
}

export function BeverageStep({ beverages, onUpdate }: BeverageStepProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 className="tool-step-title">Daily Beverage Intake</h2>
        <p className="tool-step-subtitle">How many glasses of each do you drink per day?</p>
      </div>

      <div className="hc-beverage-grid">
        {BEVERAGES.map((bev) => {
          const count = beverages[bev.id] ?? 0;
          return (
            <div
              key={bev.id}
              className={`hc-beverage-card${count > 0 ? " hc-beverage-card--active" : ""}`}
            >
              <span className="hc-beverage-name">{bev.name}</span>
              <span className="hc-beverage-volume">{bev.glassVolumeCl * 10} ml</span>
              <div className="hc-increment-controls">
                <button
                  type="button"
                  className="hc-increment-btn"
                  disabled={count === 0}
                  aria-label={`Decrease ${bev.name}`}
                  onClick={() => onUpdate(bev.id, count - 1)}
                >
                  -
                </button>
                <span className="hc-count" aria-live="polite">{count}</span>
                <button
                  type="button"
                  className="hc-increment-btn"
                  disabled={count >= 20}
                  aria-label={`Increase ${bev.name}`}
                  onClick={() => onUpdate(bev.id, count + 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── NavigationControls ── */

interface NavigationControlsProps {
  step: number;
  totalSteps: number;
  canAdvance: boolean;
  onNext: () => void;
  onBack: () => void;
  isLastFormStep: boolean;
}

export function NavigationControls({
  step,
  totalSteps,
  canAdvance,
  onNext,
  onBack,
  isLastFormStep,
}: NavigationControlsProps) {
  return (
    <div className="hc-nav">
      {step > 0 ? (
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onBack}>
          Back
        </button>
      ) : (
        <div />
      )}

      <div className="hc-dots">
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={`hc-dot${i === step ? " hc-dot--active" : i < step ? " hc-dot--completed" : ""}`}
          />
        ))}
      </div>

      <button
        type="button"
        className="tool-btn tool-btn--primary"
        disabled={!canAdvance}
        onClick={onNext}
      >
        {isLastFormStep ? "Calculate" : "Next"}
      </button>
    </div>
  );
}
