"use client";

import { PlateauFormData, MEDICATION_OPTIONS, EXERCISE_OPTIONS, PROTEIN_OPTIONS, SLEEP_OPTIONS, UnitSystem } from "@/app/data/tools/glp1-plateau-calculator-config";
import { kgToLbs, lbsToKg } from "@/app/utils/tools/health-math";

interface Props {
  formData: PlateauFormData;
  error: string | null;
  onFieldChange: (field: keyof PlateauFormData, value: string) => void;
  onSubmit: () => void;
}

export default function CalculatorForm({ formData, error, onFieldChange, onSubmit }: Props) {
  const isMetric = formData.unitSystem === "metric";
  const weightLabel = isMetric ? "kg" : "lbs";

  const handleUnitToggle = (system: UnitSystem) => {
    if (system === formData.unitSystem) return;
    const convert = (val: string, toMetric: boolean) => {
      const n = parseFloat(val);
      if (!Number.isFinite(n)) return "";
      return String(Math.round(toMetric ? lbsToKg(n) : kgToLbs(n)));
    };
    onFieldChange("unitSystem", system);
    onFieldChange("startingWeight", convert(formData.startingWeight, system === "metric"));
    onFieldChange("currentWeight", convert(formData.currentWeight, system === "metric"));
  };

  return (
    <div className="tool-card pc-calculator-card" style={{ padding: 24 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="tool-form-section-title" style={{ margin: 0 }}>Weight and Timeline</div>
        <div className="tool-chip-group tool-chip-group--connected">
          {(["imperial", "metric"] as const).map((sys) => (
            <button
              key={sys}
              type="button"
              className={`tool-chip${formData.unitSystem === sys ? " tool-chip--active" : ""}`}
              aria-pressed={formData.unitSystem === sys}
              onClick={() => handleUnitToggle(sys)}
            >
              {sys === "imperial" ? "lbs" : "kg"}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-form-grid">
        <div className="tool-form-group">
          <label className="tool-form-label" htmlFor="pc-sw">Starting weight ({weightLabel})</label>
          <input
            id="pc-sw"
            className="tool-input"
            type="number"
            inputMode="numeric"
            placeholder={isMetric ? "e.g. 109" : "e.g. 240"}
            min={isMetric ? 45 : 100}
            max={isMetric ? 272 : 600}
            value={formData.startingWeight}
            onChange={e => onFieldChange("startingWeight", e.target.value)}
          />
        </div>

        <div className="tool-form-group">
          <label className="tool-form-label" htmlFor="pc-cw">Current weight ({weightLabel})</label>
          <input
            id="pc-cw"
            className="tool-input"
            type="number"
            inputMode="numeric"
            placeholder={isMetric ? "e.g. 95" : "e.g. 210"}
            min={isMetric ? 36 : 80}
            max={isMetric ? 272 : 600}
            value={formData.currentWeight}
            onChange={e => onFieldChange("currentWeight", e.target.value)}
          />
        </div>

        <div className="tool-form-group">
          <label className="tool-form-label" htmlFor="pc-wom">Weeks on medication</label>
          <input
            id="pc-wom"
            className="tool-input"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 20"
            min={1}
            max={200}
            value={formData.weeksOnMedication}
            onChange={e => onFieldChange("weeksOnMedication", e.target.value)}
          />
        </div>

        <div className="tool-form-group">
          <label className="tool-form-label" htmlFor="pc-wp">Weeks without weight change</label>
          <input
            id="pc-wp"
            className="tool-input"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 6"
            min={0}
            max={52}
            value={formData.weeksWithoutChange}
            onChange={e => onFieldChange("weeksWithoutChange", e.target.value)}
          />
        </div>
      </div>

      <div className="tool-form-section-title" style={{ marginTop: 24 }}>Medication and Lifestyle</div>
      <div className="tool-form-grid">
        <div className="tool-form-group">
          <label className="tool-form-label" htmlFor="pc-med">Current medication and dose</label>
          <select
            id="pc-med"
            className="tool-input"
            value={formData.medication}
            onChange={e => onFieldChange("medication", e.target.value)}
          >
            <option value="">Select medication</option>
            {MEDICATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="tool-form-group">
          <label className="tool-form-label" htmlFor="pc-ex">Weekly exercise</label>
          <select
            id="pc-ex"
            className="tool-input"
            value={formData.exercise}
            onChange={e => onFieldChange("exercise", e.target.value)}
          >
            <option value="">Select level</option>
            {EXERCISE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="tool-form-group">
          <label className="tool-form-label" htmlFor="pc-prot">Daily protein</label>
          <select
            id="pc-prot"
            className="tool-input"
            value={formData.protein}
            onChange={e => onFieldChange("protein", e.target.value)}
          >
            <option value="">Select level</option>
            {PROTEIN_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="tool-form-group">
          <label className="tool-form-label" htmlFor="pc-slp">Nightly sleep</label>
          <select
            id="pc-slp"
            className="tool-input"
            value={formData.sleep}
            onChange={e => onFieldChange("sleep", e.target.value)}
          >
            <option value="">Select quality</option>
            {SLEEP_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="tool-error">{error}</p>}

      <button
        className="tool-btn tool-btn--primary"
        style={{ width: "100%", marginTop: 24 }}
        onClick={onSubmit}
      >
        Diagnose my plateau
      </button>

      <p className="tool-disclaimer">
        This tool is for educational purposes only. It does not constitute medical advice.
        Always consult your healthcare provider before making changes to your medication or treatment plan.
      </p>
    </div>
  );
}
