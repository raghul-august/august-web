"use client";

import type { FormData } from "@/app/utils/tools/pregnancy-weight-gain-compute";
import type { ValidationErrors } from "@/app/utils/tools/pregnancy-weight-gain-compute";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";

interface FormStepProps {
  formData: FormData;
  errors: ValidationErrors;
  onUpdate: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onMarkStarted: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const TWINS_OPTIONS = [
  { value: "false", label: "Singleton" },
  { value: "true", label: "Twins" },
];

export function FormStep({ formData, errors, onUpdate, onMarkStarted, onSubmit, canSubmit }: FormStepProps) {
  const { unitSystem, heightFt, heightIn, heightCm, gestationalWeek, twins, preWeight, currentWeight } = formData;
  const isMetric = unitSystem === "metric";
  const weightUnit = isMetric ? "kg" : "lb";

  return (
    <>
      <div className="tool-step-header">
        <h2 className="tool-step-title">Your details</h2>
        <p className="tool-step-subtitle">Enter your details to see your personalized weight gain range.</p>
      </div>

      <div className="tool-form-grid-responsive">
        {/* Row 1: Units + Twins */}
        <div className="tool-form-group">
          <label className="tool-form-label">Units</label>
          <SegmentedControl
            options={UNIT_OPTIONS}
            value={unitSystem}
            onChange={(v) => { onMarkStarted(); onUpdate("unitSystem", v as "imperial" | "metric"); }}
            ariaLabel="Unit system"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        <div className="tool-form-group">
          <label className="tool-form-label">Pregnant with twins?</label>
          <SegmentedControl
            options={TWINS_OPTIONS}
            value={String(twins)}
            onChange={(v) => { onMarkStarted(); onUpdate("twins", v === "true"); }}
            ariaLabel="Pregnancy type"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        {/* Row 2: Height + Weight + Week (mirrors bmr-hwa-row) */}
        <div className="pwg-hwa-row tool-form-span-2">
          {isMetric ? (
            <>
              <div className="tool-form-group">
                <label htmlFor="pwg-height-cm" className="tool-form-label">Height (cm)</label>
                <input
                  id="pwg-height-cm"
                  type="text"
                  inputMode="decimal"
                  className="tool-input"
                  placeholder="e.g. 165"
                  value={heightCm ?? ""}
                  aria-invalid={!!errors.heightCm}
                  onChange={(e) => {
                    onMarkStarted();
                    onUpdate("heightCm", e.target.value === "" ? null : Number(e.target.value));
                  }}
                />
              </div>
              <div className="tool-form-group">
                <label htmlFor="pwg-pre-weight" className="tool-form-label">Weight ({weightUnit})</label>
                <input
                  id="pwg-pre-weight"
                  type="text"
                  inputMode="decimal"
                  className="tool-input"
                  placeholder="e.g. 63"
                  value={preWeight ?? ""}
                  aria-invalid={!!errors.preWeight}
                  onChange={(e) => {
                    onMarkStarted();
                    onUpdate("preWeight", e.target.value === "" ? null : Number(e.target.value));
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="tool-form-group">
                <label className="tool-form-label">Height</label>
                <div className="tool-ft-in-row">
                  <div className="tool-ft-in-item">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="tool-input"
                      placeholder="5"
                      aria-label="Feet"
                      value={heightFt ?? ""}
                      aria-invalid={!!errors.heightFt}
                      onChange={(e) => {
                        onMarkStarted();
                        onUpdate("heightFt", e.target.value === "" ? null : Number(e.target.value));
                      }}
                    />
                    <span className="tool-ft-in-suffix">ft</span>
                  </div>
                  <div className="tool-ft-in-item">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="tool-input"
                      placeholder="6"
                      aria-label="Inches"
                      value={heightIn ?? ""}
                      onChange={(e) => {
                        onMarkStarted();
                        onUpdate("heightIn", e.target.value === "" ? null : Number(e.target.value));
                      }}
                    />
                    <span className="tool-ft-in-suffix">in</span>
                  </div>
                </div>
              </div>
              <div className="tool-form-group">
                <label htmlFor="pwg-pre-weight" className="tool-form-label">Weight ({weightUnit})</label>
                <input
                  id="pwg-pre-weight"
                  type="text"
                  inputMode="decimal"
                  className="tool-input"
                  placeholder="e.g. 140"
                  value={preWeight ?? ""}
                  aria-invalid={!!errors.preWeight}
                  onChange={(e) => {
                    onMarkStarted();
                    onUpdate("preWeight", e.target.value === "" ? null : Number(e.target.value));
                  }}
                />
              </div>
            </>
          )}
          <div className="tool-form-group">
            <label htmlFor="pwg-week" className="tool-form-label">Week</label>
            <input
              id="pwg-week"
              type="text"
              inputMode="numeric"
              className="tool-input"
              placeholder="e.g. 20"
              value={gestationalWeek}
              onChange={(e) => {
                onMarkStarted();
                const raw = e.target.value.replace(/\D/g, "");
                const v = raw === "" ? 1 : Math.min(40, Math.max(1, Number(raw)));
                onUpdate("gestationalWeek", v);
              }}
            />
          </div>
        </div>

        {/* Row 3: Current weight (optional) */}
        <div className="tool-form-group tool-form-span-2 pwg-cur-weight-wrap">
          <label htmlFor="pwg-cur-weight" className="tool-form-label">Current wt (optional, {weightUnit})</label>
          <input
            id="pwg-cur-weight"
            type="text"
            inputMode="decimal"
            className="tool-input"
            placeholder={isMetric ? "e.g. 70" : "e.g. 155"}
            value={currentWeight ?? ""}
            aria-invalid={!!errors.currentWeight}
            onChange={(e) => {
              onMarkStarted();
              onUpdate("currentWeight", e.target.value === "" ? null : Number(e.target.value));
            }}
          />
        </div>

        {errors.heightFt && <p className="tool-error tool-form-span-2" role="alert">{errors.heightFt}</p>}
        {errors.heightCm && <p className="tool-error tool-form-span-2" role="alert">{errors.heightCm}</p>}
        {errors.preWeight && <p className="tool-error tool-form-span-2" role="alert">{errors.preWeight}</p>}
        {errors.currentWeight && <p className="tool-error tool-form-span-2" role="alert">{errors.currentWeight}</p>}
      </div>

      <div className="pwg-form-footer">
        <button
          type="button"
          className="tool-btn tool-btn--primary"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          See my results &rarr;
        </button>
      </div>

    </>
  );
}
