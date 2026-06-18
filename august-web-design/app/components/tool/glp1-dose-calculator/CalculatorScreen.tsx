"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  MEDICATIONS,
  SYRINGE_BARRELS_ML,
  type Medication,
} from "@/app/data/tools/glp1-dose-calculator-config";
import { parseNumOrNull, clampToRange } from "@/app/utils/tools/health-math";
import SegmentedControl from "../shared/SegmentedControl";

// Inline "why we ask" disclosure. Accessible: button with aria-expanded, panel
// id linked via aria-controls. Space/Enter toggles, Escape closes + refocuses.
function WhyWeAsk({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const panelId = useId();
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const onKey = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
        btnRef.current?.focus();
      }
    },
    [open]
  );
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <span ref={wrapRef} className="glp1-why-wrap">
      <button
        ref={btnRef}
        type="button"
        className="glp1-why-btn"
        aria-label={`More about ${label.toLowerCase()}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        onKeyDown={onKey}
      >
        ?
      </button>
      {open && (
        <div id={panelId} role="note" className="glp1-why-panel">
          {text}
        </div>
      )}
    </span>
  );
}

interface Props {
  medication: Medication;
  onMedicationChange: (m: Medication) => void;
  concentration: number | null;
  onConcentrationChange: (v: number | null) => void;
  onConcentrationPreset: (v: number) => void;
  dose: number | null;
  onDoseChange: (v: number | null) => void;
  onDosePreset: (v: number) => void;
  barrelMl: 0.3 | 0.5 | 1.0;
  onBarrelChange: (b: 0.3 | 0.5 | 1.0) => void;
  vialMl: number | null;
  onVialChange: (v: number | null) => void;
  onCalculate: () => void;
  canCalculate: boolean;
}

// Clamp-to-range constants for gentle input hardening.
const CONC_MIN = 0.1;
const CONC_MAX = 200;
const DOSE_MIN = 0.1;
const DOSE_MAX = 100;
const VIAL_MIN = 0.1;
const VIAL_MAX = 50;

const MED_OPTIONS = (Object.keys(MEDICATIONS) as Medication[]).map((m) => ({
  value: m,
  label: MEDICATIONS[m].label,
}));

const BARREL_OPTIONS = SYRINGE_BARRELS_ML.map((b) => ({
  value: String(b),
  label: `${b.toFixed(1)} mL`,
}));

export default function CalculatorScreen(props: Props) {
  const {
    medication,
    onMedicationChange,
    concentration,
    onConcentrationChange,
    onConcentrationPreset,
    dose,
    onDoseChange,
    onDosePreset,
    barrelMl,
    onBarrelChange,
    vialMl,
    onVialChange,
    onCalculate,
    canCalculate,
  } = props;

  const medCfg = MEDICATIONS[medication];

  const concInvalid =
    concentration !== null &&
    Number.isFinite(concentration) &&
    (concentration < CONC_MIN || concentration > CONC_MAX);
  const doseInvalid =
    dose !== null &&
    Number.isFinite(dose) &&
    (dose < DOSE_MIN || dose > DOSE_MAX);
  const vialInvalid =
    vialMl !== null &&
    Number.isFinite(vialMl) &&
    (vialMl < VIAL_MIN || vialMl > VIAL_MAX);

  const concentrationPresetValue =
    concentration !== null && medCfg.concentrationsMgPerMl.includes(concentration as never)
      ? String(concentration)
      : "";
  const dosePresetValue =
    dose !== null && medCfg.doseChipsMg.includes(dose as never)
      ? String(dose)
      : "";

  return (
    <section className="tool-card tool-calc-card glp1-calc-card" aria-label="GLP-1 dose calculator inputs">
      <div className="tool-calc-step-body">
        <div className="tool-calc-step-header">
          <h2 className="tool-step-title">Dose details</h2>
          <p className="tool-step-subtitle">
            Pick your medication, then enter what your prescriber wrote.
          </p>
        </div>

        <div className="tool-calc-form-grid">
          {/* Medication */}
          <div className="tool-form-group tool-calc-form-span-2">
            <label className="tool-form-label">Medication</label>
            <SegmentedControl
              options={MED_OPTIONS}
              value={medication}
              onChange={(v) => onMedicationChange(v as Medication)}
              ariaLabel="Medication"
              className="tool-chip-group tool-chip-group--connected"
              buttonClassName="tool-chip"
              activeClassName="tool-chip--active"
            />
          </div>

          {/* Concentration */}
          <div className="tool-form-group">
            <div className="glp1-label-row">
              <label htmlFor="glp1-conc" className="tool-form-label">
                Vial concentration (mg/mL)
              </label>
              <WhyWeAsk
                label="Vial concentration"
                text="This is the strength printed on your vial label."
              />
            </div>
            <input
              id="glp1-conc"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={concentration != null ? String(concentration) : ""}
              
              onChange={(e) =>
                onConcentrationChange(
                  clampToRange(parseNumOrNull(e.target.value), CONC_MIN, CONC_MAX),
                )
              }
              aria-label="Vial concentration in mg/mL"
              aria-invalid={concInvalid}
              placeholder="e.g. 2.5"
              className="tool-input"
              // style={{fontSize : 0.8}}
            />
            {concInvalid && (
              <p role="alert" className="tool-error">
                {concentration! < CONC_MIN
                  ? "Concentration must be at least 0.1 mg/mL. Double-check your vial label."
                  : "That concentration is unusually high — please re-check the label."}
              </p>
            )}
          </div>

          {/* Common concentrations dropdown */}
          <div className="tool-form-group">
            <label htmlFor="glp1-conc-preset" className="tool-form-label">
              Common concentrations
            </label>
            <select
              id="glp1-conc-preset"
              className="tool-input"
              value={concentrationPresetValue}
              aria-label="Common vial concentrations"
              onChange={(e) => {
                const v = parseNumOrNull(e.target.value);
                if (v != null) onConcentrationPreset(v);
              }}
              style={{
              // fontSize: "0.8rem",
              paddingRight: "36px",
              textOverflow: "ellipsis",
            }}
            >
              <option value="" disabled>
                Pick a common concentration
              </option>
              {medCfg.concentrationsMgPerMl.map((v) => (
                <option key={v} value={v}>
                  {v} mg/mL
                </option>
              ))}
            </select>
          </div>

          {/* Dose */}
          <div className="tool-form-group">
            <div className="glp1-label-row">
              <label htmlFor="glp1-dose" className="tool-form-label">
                Prescribed dose (mg)
              </label>
              <WhyWeAsk
                label="Prescribed dose"
                text="The milligrams your clinician prescribed for this week — or pick a common dose."
              />
            </div>
            <input
              id="glp1-dose"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={dose != null ? String(dose) : ""}
              onChange={(e) =>
                onDoseChange(
                  clampToRange(parseNumOrNull(e.target.value), DOSE_MIN, DOSE_MAX),
                )
              }
              aria-label="Prescribed dose in mg"
              aria-invalid={doseInvalid}
              placeholder="e.g. 0.25"
              className="tool-input"
              // style={{fontSize : 0.8}}
            />
            {doseInvalid && (
              <p role="alert" className="tool-error">
                {dose! < DOSE_MIN
                  ? "Dose must be at least 0.1 mg. Check the dose your prescriber wrote."
                  : "That dose is higher than any labeled GLP-1 dose — please confirm with your prescriber."}
              </p>
            )}
          </div>

          {/* Common doses dropdown */}
          <div className="tool-form-group">
            <label htmlFor="glp1-dose-preset" className="tool-form-label">
              Common doses
            </label>
            <select
              id="glp1-dose-preset"
              className="tool-input"
              value={dosePresetValue}
              aria-label="Common prescribed doses"
              onChange={(e) => {
                const v = parseNumOrNull(e.target.value);
                if (v != null) onDosePreset(v);
              }}
              style={{
              // fontSize: "0.8rem",
              paddingRight: "36px",
              textOverflow: "ellipsis",
            }}
            >
              <option value="" disabled>
                Pick a common dose
              </option>
              {medCfg.doseChipsMg.map((v) => (
                <option key={v} value={v}>
                  {v} mg
                </option>
              ))}
            </select>
          </div>

          {/* Syringe barrel */}
          <div className="tool-form-group tool-calc-form-span-2">
            <div className="glp1-label-row">
              <span className="tool-form-label">Syringe barrel size</span>
              <WhyWeAsk
                label="Barrel size"
                text="Barrel size = the 0.3/0.5/1.0 mL insulin syringe you'll use; it affects which tick marks are available."
              />
            </div>
            <SegmentedControl
              options={BARREL_OPTIONS}
              value={String(barrelMl)}
              onChange={(v) => onBarrelChange(parseFloat(v) as 0.3 | 0.5 | 1.0)}
              ariaLabel="Syringe barrel size"
              className="tool-chip-group tool-chip-group--connected"
              buttonClassName="tool-chip"
              activeClassName="tool-chip--active"
            />
          </div>

          {/* Vial size (optional) */}
          <div className="tool-form-group tool-calc-form-span-2">
            <div className="glp1-label-row">
              <label htmlFor="glp1-vial" className="tool-form-label">
                Vial size (optional, mL)
              </label>
              <WhyWeAsk
                label="Vial size"
                text="Optional — add this to see doses per vial and weeks of supply."
              />
            </div>
            <input
              id="glp1-vial"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={vialMl != null ? String(vialMl) : ""}
              onChange={(e) =>
                onVialChange(
                  clampToRange(parseNumOrNull(e.target.value), VIAL_MIN, VIAL_MAX),
                )
              }
              aria-label="Vial size in mL"
              aria-invalid={vialInvalid}
              placeholder="e.g. 2"
              className="tool-input"
            />
            {vialInvalid && (
              <p role="alert" className="tool-error">
                {vialMl! < VIAL_MIN
                  ? "Vial size must be at least 0.1 mL."
                  : "That vial size is unusually large — please double-check."}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="tool-btn tool-btn--primary"
          style={{ width: "100%", marginTop: 20 }}
          disabled={!canCalculate}
          onClick={onCalculate}
        >
          Calculate
        </button>
      </div>
    </section>
  );
}
