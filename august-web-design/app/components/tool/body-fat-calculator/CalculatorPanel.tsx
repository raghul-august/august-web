"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import {
  type FormData,
  type Mode,
  type Sex,
  type Units,
  DEFAULT_FORM_DATA,
} from "@/app/data/tools/body-fat-calculator-config";
import {
  computeResult,
  validate,
  isValid,
  type ValidationErrors,
} from "@/app/utils/tools/body-fat-calculator-compute";

const ResultPanel = lazy(() => import("./ResultPanel"));

const MODE_OPTIONS = [
  { value: "navy",      label: "Navy" },
  { value: "army-abcp", label: "Army ABCP" },
];
const SEX_OPTIONS = [
  { value: "male",   label: "Male" },
  { value: "female", label: "Female" },
];
const UNITS_OPTIONS = [
  { value: "metric", label: "Metric" },
  { value: "us",     label: "US" },
];

// ── field helpers ─────────────────────────────────────────────────────────

function unitHint(field: "weight" | "height" | "neck" | "waist" | "hip" | "abdominal", units: Units, sex: Sex): string {
  if (field === "weight")     return units === "metric" ? "kg" : "lbs";
  if (field === "height")     return units === "metric" ? "cm" : "in";
  if (field === "neck")       return units === "metric" ? "cm" : "in";
  if (field === "waist")      return units === "metric" ? "cm" : "in";
  if (field === "hip")        return units === "metric" ? "cm" : "in";
  if (field === "abdominal")  return "inches — at navel level";
  return "";
}

function InputField({
  label,
  hint,
  value,
  onChange,
  error,
  inputMode = "decimal",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  inputMode?: "decimal" | "numeric";
}) {
  return (
    <div className="tool-form-group">
      <label className="tool-form-label">
        {label}
        {hint && (
          <span style={{ fontWeight: 400, color: "var(--text-tertiary)", marginLeft: 4 }}>
            ({hint})
          </span>
        )}
      </label>
      <input
        type="number"
        className="tool-input"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
      />
      {error && <span className="tool-error">{error}</span>}
    </div>
  );
}

// ── CalculatorPanel ───────────────────────────────────────────────────────

export default function CalculatorPanel() {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM_DATA);
  const [touched, setTouched] = useState(false);

  // analytics refs (completed has custom debounce logic)
  const completedHashRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { markStarted } = useCalculatorAnalytics("body-fat-calculator");

  const setField = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    markStarted();
    setTouched(true);
    setForm((prev) => ({ ...prev, [key]: val }));
  }, [markStarted]);

  const handleMode = useCallback((v: string) => {
    const mode = v as Mode;
    setField("mode", mode);
    trackToolEvent("body-fat-calculator", "section_completed", {
      step: "mode-change",
      mode,
      sex: form.sex,
    });
  }, [setField, form.sex]);

  const handleSex = useCallback((v: string) => {
    const sex = v as Sex;
    setField("sex", sex);
    trackToolEvent("body-fat-calculator", "section_completed", {
      step: "sex-change",
      mode: form.mode,
      sex,
    });
  }, [setField, form.mode]);

  const handleUnits = useCallback((v: string) => {
    setField("units", v as Units);
  }, [setField]);

  // validation + compute
  const errors: ValidationErrors = useMemo(() => {
    if (!touched) return {};
    return validate(form);
  }, [form, touched]);

  const { result, errors: computeErrors } = useMemo(() => {
    if (!touched) {
      // show default result on first paint using pre-filled defaults
      return computeResult(DEFAULT_FORM_DATA);
    }
    return computeResult(form);
  }, [form, touched]);

  const allErrors = { ...errors, ...computeErrors };
  const hasErrors = !isValid(allErrors);
  const formulaError = allErrors._formula;

  // debounced completed analytics
  useEffect(() => {
    if (!result) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const bfp = result.kind === "navy" ? result.bfp : result.bfp;
      const hash = `${result.kind}|${result.sex}|${Math.round(bfp * 10) / 10}`;
      if (completedHashRef.current === hash) return;
      completedHashRef.current = hash;
      trackToolEvent("body-fat-calculator", "section_completed", {
        step: "calc",
        mode: form.mode,
        sex: form.sex,
      });
      if (result.kind === "navy") {
        trackToolEvent("body-fat-calculator", "completed", {
          mode: "navy",
          sex: result.sex,
          bf_pct: result.bfp,
          category: result.category,
          ideal_bfp: result.idealBfp,
          bmi_bfp: result.bmiBfp,
        });
      } else {
        trackToolEvent("body-fat-calculator", "completed", {
          mode: "army-abcp",
          sex: result.sex,
          bf_pct: result.bfp,
          verdict: result.pass ? "pass" : "fail",
          age_bracket: result.ageBracket,
          threshold: result.threshold,
        });
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [result, form.mode, form.sex]);

  const isNavy = form.mode === "navy";
  const isFemale = form.sex === "female";

  return (
    <div className="bfc-two-col tool-compact-controls">
      {/* LEFT: inputs */}
      <div className="tool-card">
        {/* Mode + Units + Sex toggles */}
        <div className="bfc-toggle-row">
          <div className="bfc-toggle-group">
            <span className="bfc-toggle-label">Method</span>
            <SegmentedControl
              options={MODE_OPTIONS}
              value={form.mode}
              onChange={handleMode}
              ariaLabel="Calculation method"
              className="tool-chip-group tool-chip-group--connected"
              buttonClassName="tool-chip"
              activeClassName="tool-chip--active"
            />
          </div>
          {isNavy && (
            <div className="bfc-toggle-group">
              <span className="bfc-toggle-label">Units</span>
              <SegmentedControl
                options={UNITS_OPTIONS}
                value={form.units}
                onChange={handleUnits}
                ariaLabel="Unit system"
                className="tool-chip-group tool-chip-group--connected"
                buttonClassName="tool-chip"
                activeClassName="tool-chip--active"
              />
            </div>
          )}
          <div className="bfc-toggle-group">
            <span className="bfc-toggle-label">Sex</span>
            <SegmentedControl
              options={SEX_OPTIONS}
              value={form.sex}
              onChange={handleSex}
              ariaLabel="Sex"
              className="tool-chip-group tool-chip-group--connected"
              buttonClassName="tool-chip"
              activeClassName="tool-chip--active"
            />
          </div>
        </div>

        {/* Army hint */}
        {!isNavy && (
          <p className="bfc-army-hint">Army ABCP uses lbs and inches only.</p>
        )}

        <div className="bfc-field-grid">
          {isNavy ? (
            <>
              <InputField
                label="Height"
                hint={unitHint("height", form.units, form.sex)}
                value={form.height}
                onChange={(v) => setField("height", v)}
                error={errors.height}
              />
              <InputField
                label="Neck"
                hint={unitHint("neck", form.units, form.sex)}
                value={form.neck}
                onChange={(v) => setField("neck", v)}
                error={errors.neck}
              />
              <InputField
                label="Age"
                hint="years"
                value={form.age}
                onChange={(v) => setField("age", v)}
                error={errors.age}
                inputMode="numeric"
              />
              <InputField
                label="Weight"
                hint={unitHint("weight", form.units, form.sex)}
                value={form.weight}
                onChange={(v) => setField("weight", v)}
                error={errors.weight}
              />
              <InputField
                label="Waist"
                hint={unitHint("waist", form.units, form.sex)}
                value={form.waist}
                onChange={(v) => setField("waist", v)}
                error={errors.waist}
              />
              {isFemale && (
                <InputField
                  label="Hip"
                  hint={unitHint("hip", form.units, form.sex)}
                  value={form.hip}
                  onChange={(v) => setField("hip", v)}
                  error={errors.hip}
                />
              )}
            </>
          ) : (
            <>
              <InputField
                label="Age"
                hint="years"
                value={form.age}
                onChange={(v) => setField("age", v)}
                error={errors.age}
                inputMode="numeric"
              />
              <InputField
                label="Weight"
                hint={unitHint("weight", "us", form.sex)}
                value={form.weight}
                onChange={(v) => setField("weight", v)}
                error={errors.weight}
              />
              <InputField
                label="Abdominal"
                hint={unitHint("abdominal", form.units, form.sex)}
                value={form.abdominal}
                onChange={(v) => setField("abdominal", v)}
                error={errors.abdominal}
              />
            </>
          )}
        </div>

        <div className="bfc-card-footer">
          <a
            href="/chat?msg=I just used the body fat calculator and want to discuss my results"
            className="tool-btn tool-btn--primary"
            onClick={() => track("tool_cta_clicked", { tool: "body-fat-calculator", target: "chat" })}
          >
            Talk to august
          </a>
        </div>
      </div>

      {/* RIGHT: results */}
      <div>
        <Suspense fallback={
          <div className="tool-card" style={{ minHeight: 240 }}>
            <div className="bfc-pending">
              <span className="bfc-pending__dash">—</span>
              <p className="bfc-pending__text">Loading…</p>
            </div>
          </div>
        }>
          <ResultPanel
            result={hasErrors ? null : (result ?? null)}
            formulaError={formulaError}
          />
        </Suspense>
      </div>
    </div>
  );
}
