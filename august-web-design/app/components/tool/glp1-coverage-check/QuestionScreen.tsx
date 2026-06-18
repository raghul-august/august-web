"use client";

import { useState, useCallback, useEffect, useRef, useId, useMemo } from "react";
import type { GLP1Question, GLP1AnswerValue } from "@/app/data/tools/glp1-coverage-questions";
import { US_STATES } from "@/app/data/tools/glp1-coverage-questions";
import BMIPreview from "./BMIPreview";

const WHY_WE_ASK: Record<string, string> = {
  dob: "We use this to estimate BMI-related eligibility rules, which most insurers require for coverage.",
  weight: "We use this with your height to estimate BMI.",
};

type UnitSystem = "imperial" | "metric";

const LBS_PER_KG = 2.20462;
const CM_PER_INCH = 2.54;

function safeParseNumber(raw: string): number | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/[^\d.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}

function lbsToKg(lbs: number): number {
  return Math.round((lbs / LBS_PER_KG) * 10) / 10;
}
function kgToLbs(kg: number): number {
  return Math.round(kg * LBS_PER_KG * 10) / 10;
}
function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * CM_PER_INCH * 10) / 10;
}
function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / CM_PER_INCH;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches - feet * 12) * 10) / 10;
  return { feet, inches };
}

interface QuestionScreenProps {
  question: GLP1Question;
  answer: GLP1AnswerValue | undefined;
  onAnswer: (questionId: string, value: GLP1AnswerValue) => void;
  onNext: () => void;
  onBack: () => void;
  sectionTitle: string;
  questionNumber: number;
  totalInSection: number;
  isFirstOverall: boolean;
  isLastQuestion: boolean;
  bmiData?: { bmi: number; category: string; weightToLose: number } | null;
  unitSystem: UnitSystem;
  onToggleUnit: () => void;
}

const AUTO_ADVANCE_TYPES = ["radio"];
const MANUAL_ADVANCE_TYPES = ["checkbox", "number", "dropdown", "date-masked", "height-dual"];

// unitSuffixStyle and fieldLabelStyle converted to Tailwind classes below
// optionLabelStyle kept as dynamic (fontWeight depends on active state)
const optionLabelStyle = (active: boolean): React.CSSProperties => ({
  fontWeight: active ? 500 : 400,
});

export default function QuestionScreen({
  question, answer, onAnswer, onNext, onBack, sectionTitle,
  questionNumber, totalInSection, isFirstOverall, isLastQuestion, bmiData, unitSystem, onToggleUnit,
}: QuestionScreenProps) {
  const isWeightQuestion = question.id === "weight" || question.id === "goal_weight";
  const isBodyMetricsQuestion = question.id === "height" || isWeightQuestion;
  const isMetric = unitSystem === "metric";
  const errorId = useId();
  const helperId = useId();

  const [checkboxValues, setCheckboxValues] = useState<string[]>(
    Array.isArray(answer) ? (answer as string[]) : []
  );
  const [numberValue, setNumberValue] = useState<string>(() => {
    if (typeof answer !== "number") return "";
    if (isWeightQuestion && isMetric) return String(lbsToKg(answer));
    return String(answer);
  });
  const [dateValue, setDateValue] = useState<string>(
    typeof answer === "string" && question.inputType === "date-masked" ? answer : ""
  );
  const [heightValue, setHeightValue] = useState<{ feet: string; inches: string }>(
    answer && typeof answer === "object" && !Array.isArray(answer) && "feet" in answer
      ? { feet: String((answer as { feet: number; inches: number }).feet), inches: String((answer as { feet: number; inches: number }).inches) }
      : { feet: "", inches: "" }
  );
  const [cmValue, setCmValue] = useState<string>(() => {
    if (answer && typeof answer === "object" && !Array.isArray(answer) && "feet" in answer) {
      const h = answer as { feet: number; inches: number };
      return String(feetInchesToCm(h.feet, h.inches));
    }
    return "";
  });

  useEffect(() => {
    checkboxUserEdited.current = false;
    setCheckboxValues(Array.isArray(answer) ? (answer as string[]) : []);
    if (typeof answer === "number") {
      setNumberValue(isWeightQuestion && isMetric ? String(lbsToKg(answer)) : String(answer));
    } else {
      setNumberValue("");
    }
    setDateValue(typeof answer === "string" && question.inputType === "date-masked" ? answer : "");
    if (answer && typeof answer === "object" && !Array.isArray(answer) && "feet" in answer) {
      const h = answer as { feet: number; inches: number };
      setHeightValue({ feet: String(h.feet), inches: String(h.inches) });
      setCmValue(String(feetInchesToCm(h.feet, h.inches)));
    } else {
      setHeightValue({ feet: "", inches: "" });
      setCmValue("");
    }
  }, [question.id, unitSystem]);

  const isAutoAdvance = AUTO_ADVANCE_TYPES.includes(question.inputType);

  const validateNumber = (raw: string): boolean => {
    const parsed = safeParseNumber(raw);
    if (parsed === null || parsed <= 0) return false;
    const n = isWeightQuestion && isMetric ? kgToLbs(parsed) : parsed;
    if (question.validation?.min !== undefined && n < question.validation.min) return false;
    if (question.validation?.max !== undefined && n > question.validation.max) return false;
    return true;
  };

  const canContinue = (() => {
    switch (question.inputType) {
      case "checkbox": return checkboxValues.length > 0;
      case "number": return validateNumber(numberValue);
      case "dropdown": return typeof answer === "string" && answer !== "";
      case "date-masked": return dateValue.length === 7 && isValidMMYYYY(dateValue);
      case "height-dual":
        if (isMetric) { const cm = safeParseNumber(cmValue); return cm !== null && cm > 0; }
        const ft = safeParseNumber(heightValue.feet);
        const inch = safeParseNumber(heightValue.inches);
        return ft !== null && ft > 0 && inch !== null && inch >= 0;
      default: return true;
    }
  })();

  const handleNext = useCallback(() => {
    if (!canContinue) return;
    if (question.inputType === "number") {
      const raw = safeParseNumber(numberValue);
      if (raw === null) return;
      onAnswer(question.id, isWeightQuestion && isMetric ? kgToLbs(raw) : raw);
    }
    if (question.inputType === "height-dual") {
      if (isMetric) {
        const cm = safeParseNumber(cmValue);
        if (cm === null) return;
        const { feet, inches } = cmToFeetInches(cm);
        onAnswer(question.id, { feet, inches });
      } else {
        const ft = safeParseNumber(heightValue.feet);
        const inch = safeParseNumber(heightValue.inches);
        if (ft === null || inch === null) return;
        onAnswer(question.id, { feet: ft, inches: inch });
      }
    }
    onNext();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [canContinue, question.inputType, question.id, numberValue, heightValue, cmValue, isMetric, isWeightQuestion, onAnswer, onNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && MANUAL_ADVANCE_TYPES.includes(question.inputType)) handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [question.inputType, handleNext]);

  const handleRadioSelect = (value: string) => {
    onAnswer(question.id, value);
    if (!isLastQuestion) {
      setTimeout(() => onNext(), 350);
    }
  };

  const handleCheckboxToggle = (value: string) => {
    checkboxUserEdited.current = true;
    setCheckboxValues((prev) => {
      if (value === "none") return prev.includes("none") ? [] : ["none"];
      const withoutNone = prev.filter((v) => v !== "none");
      return withoutNone.includes(value)
        ? withoutNone.filter((v) => v !== value)
        : [...withoutNone, value];
    });
  };

  const checkboxUserEdited = useRef(false);
  useEffect(() => {
    if (checkboxUserEdited.current && question.inputType === "checkbox") {
      onAnswer(question.id, checkboxValues);
    }
  }, [checkboxValues]);

  const handleDateInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    const formatted = digits.length > 2 ? digits.slice(0, 2) + "-" + digits.slice(2) : digits;
    setDateValue(formatted);
    if (formatted.length === 7 && isValidMMYYYY(formatted)) onAnswer(question.id, formatted);
  };

  const numberInvalid = numberValue !== "" && !validateNumber(numberValue);
  const dateInvalid = dateValue.length === 7 && !isValidMMYYYY(dateValue);

  const weightUnit = isMetric ? "kg" : "lbs";
  const weightPlaceholder = isMetric ? "Weight in kg" : "Weight in lbs";
  const displayMin = isWeightQuestion && isMetric && question.validation?.min != null
    ? lbsToKg(question.validation.min) : question.validation?.min;
  const displayMax = isWeightQuestion && isMetric && question.validation?.max != null
    ? lbsToKg(question.validation.max) : question.validation?.max;

  const rangeHint = useMemo(() => {
    if (displayMin == null && displayMax == null) return null;
    if (displayMin != null && displayMax != null) return `Please enter a value between ${displayMin} and ${displayMax}.`;
    if (displayMin != null) return `Minimum value is ${displayMin}.`;
    return `Maximum value is ${displayMax!}.`;
  }, [displayMin, displayMax]);

  const handleImperialHeight = (field: "feet" | "inches", value: string) => {
    const next = { ...heightValue, [field]: value };
    setHeightValue(next);
    const ft = safeParseNumber(next.feet);
    const inch = safeParseNumber(next.inches);
    if (ft !== null && ft > 0 && inch !== null && inch >= 0) {
      onAnswer(question.id, { feet: ft, inches: inch });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div key={question.id} className="glp1-question-enter flex flex-col flex-1">
        <div className="glp1-question-meta flex items-center justify-between mb-6">
          <span className="text-[11px] text-[var(--text-secondary)] font-medium tracking-[0.12em]">
            {sectionTitle}
          </span>
          <span className="text-[12px] text-[#767f7c] tabular-nums">
            Question {questionNumber} of {totalInSection}
          </span>
        </div>

        <h2 className="text-balance text-[clamp(28px,4vw,42px)] font-normal leading-[1.2] tracking-[-0.02em] text-[#1C1917] m-0">
          {question.text}
        </h2>
        {WHY_WE_ASK[question.id] && (
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 mb-0">
            {WHY_WE_ASK[question.id]}
          </p>
        )}

        {question.subtitle && (
          <p id={helperId} className="text-[16px] text-[var(--text-secondary)] mt-3 mb-0 leading-[1.5]">
            {question.subtitle}
          </p>
        )}

        <div className="mt-6">
          {isBodyMetricsQuestion && (() => {
            const imperialLabel = question.id === "height" ? "ft / in" : "lbs";
            const metricLabel = question.id === "height" ? "cm" : "kg";
            // btnStyle is dynamic (background/color depend on active state)
            const btnStyle = (active: boolean): React.CSSProperties => ({
              background: active ? "#1C1917" : "transparent",
              color: active ? "#fff" : "#767f7c",
            });
            return (
              <div role="group" aria-label="Unit system" className="inline-flex rounded-[8px] border border-[#E8EAE8] overflow-hidden mb-5">
                <button type="button" onClick={() => unitSystem !== "imperial" && onToggleUnit()} aria-pressed={unitSystem === "imperial"} className="px-4 py-2 text-[13px] font-medium border-none cursor-pointer" style={btnStyle(!isMetric)}>
                  {imperialLabel}
                </button>
                <button type="button" onClick={() => unitSystem !== "metric" && onToggleUnit()} aria-pressed={unitSystem === "metric"} className="px-4 py-2 text-[13px] font-medium border-none border-l border-l-[#E8EAE8] cursor-pointer" style={btnStyle(isMetric)}>
                  {metricLabel}
                </button>
              </div>
            );
          })()}

          {question.inputType === "radio" && (
            <div role="radiogroup" aria-describedby={question.subtitle ? helperId : undefined} className="flex flex-col gap-3">
              {question.options?.map((opt) => {
                const selected = answer === opt.value;
                return (
                  <div key={opt.value} role="radio" aria-checked={selected} tabIndex={0}
                    className={`glp1-option-row${selected ? " glp1-option-row--selected" : ""}`}
                    onClick={() => handleRadioSelect(opt.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleRadioSelect(opt.value); } }}
                  >
                    <div className="flex items-center gap-3">
                      {/* radio circle - border/fill depend on selected state */}
                      <div aria-hidden className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center bg-[var(--surface-elevated)]" style={{ border: selected ? "2px solid var(--brand-primary)" : "1px solid var(--border-subtle)" }}>
                        {selected && <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />}
                      </div>
                      <span className="text-[16px] text-[var(--text-primary)] leading-[1.4]" style={optionLabelStyle(selected)}>{opt.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {question.inputType === "checkbox" && (
            <div role="group" aria-describedby={question.subtitle ? helperId : undefined} className="flex flex-col gap-3">
              {question.options?.map((opt) => {
                const checked = checkboxValues.includes(opt.value);
                return (
                  <div key={opt.value} role="checkbox" aria-checked={checked} tabIndex={0}
                    className={`glp1-option-row${checked ? " glp1-option-row--selected" : ""}`}
                    onClick={() => handleCheckboxToggle(opt.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCheckboxToggle(opt.value); } }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`glp1-checkbox${checked ? " glp1-checkbox--checked" : ""}`} aria-hidden>
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[16px] text-[#1C1917] leading-[1.4]" style={optionLabelStyle(checked)}>{opt.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {question.inputType === "number" && (
            <div className="relative">
              <input className="glp1-input" type="number" inputMode="decimal"
                placeholder={isWeightQuestion ? weightPlaceholder : (question.placeholder ?? "")}
                value={numberValue} aria-invalid={numberInvalid}
                aria-describedby={numberInvalid ? errorId : question.subtitle ? helperId : undefined}
                onChange={(e) => {
                  setNumberValue(e.target.value);
                  const n = safeParseNumber(e.target.value);
                  if (n !== null && n > 0) onAnswer(question.id, isWeightQuestion && isMetric ? kgToLbs(n) : n);
                }}
                style={isWeightQuestion ? { paddingRight: 48 } : undefined}
              />
              {isWeightQuestion && <span aria-hidden className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#767f7c] font-medium pointer-events-none">{weightUnit}</span>}
              {numberInvalid && rangeHint && (
                <p id={errorId} role="alert" className="text-[13px] text-[#DC503C] mt-2">{rangeHint}</p>
              )}
            </div>
          )}

          {question.inputType === "dropdown" && (
            <select className="glp1-select" value={typeof answer === "string" ? answer : ""}
              aria-describedby={question.subtitle ? helperId : undefined}
              onChange={(e) => onAnswer(question.id, e.target.value)}
            >
              <option value="" disabled>Select...</option>
              {(question.id === "state" ? US_STATES : question.options ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {question.inputType === "date-masked" && (
            <>
              <input className="glp1-input" type="text" inputMode="numeric" placeholder="MM-YYYY"
                value={dateValue} maxLength={7} aria-invalid={dateInvalid}
                aria-describedby={dateInvalid ? errorId : question.subtitle ? helperId : undefined}
                onChange={(e) => handleDateInput(e.target.value)}
              />
              {dateInvalid && (
                <p id={errorId} role="alert" className="text-[13px] text-[#DC503C] mt-2">
                  Please enter a valid month and year (MM-YYYY).
                </p>
              )}
            </>
          )}

          {question.inputType === "height-dual" && (isMetric ? (
            <div className="max-w-[200px]">
              <label className="block text-[12px] text-[var(--text-secondary)] font-medium tracking-[0.08em] mb-2">Centimeters</label>
              <div className="relative">
                <input className="glp1-input pr-8" type="number" inputMode="decimal" placeholder="Height in cm"
                  value={cmValue}
                  onChange={(e) => {
                    setCmValue(e.target.value);
                    const cm = safeParseNumber(e.target.value);
                    if (cm !== null && cm > 0) {
                      const { feet, inches } = cmToFeetInches(cm);
                      onAnswer(question.id, { feet, inches });
                    }
                  }}
                />
                <span aria-hidden className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#767f7c] font-medium pointer-events-none">cm</span>
              </div>
            </div>
          ) : (
            <div className="glp1-height-dual flex gap-4">
              {([["feet", "ft", "Feet"], ["inches", "in", "Inches"]] as const).map(([field, unit, label]) => (
                <div key={field} className="flex-1">
                  <label className="block text-[12px] text-[var(--text-secondary)] font-medium tracking-[0.08em] mb-2">{label}</label>
                  <div className="relative">
                    <input className="glp1-input pr-8" type="number" inputMode="numeric"
                      value={heightValue[field]}
                      onChange={(e) => handleImperialHeight(field, e.target.value)}
                    />
                    <span aria-hidden className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#767f7c] font-medium pointer-events-none">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {bmiData && (
          <div className="mt-6">
            <BMIPreview bmi={bmiData.bmi} category={bmiData.category} weightToLose={bmiData.weightToLose} unitSystem={unitSystem} />
          </div>
        )}

        <div className="glp1-question-footer mt-auto pt-8 flex items-center justify-between">
          <div>
            {!isFirstOverall && <button className="glp1-btn-ghost" onClick={onBack}>← Back</button>}
          </div>
          <div>
            {(!isAutoAdvance || isLastQuestion) && (
              <button className="glp1-btn-primary" onClick={handleNext} disabled={!canContinue} aria-disabled={!canContinue}
                style={!canContinue ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
              >
                {isLastQuestion ? "Calculate" : "Continue →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function isValidMMYYYY(str: string): boolean {
  const m = /^(\d{2})-(\d{4})$/.exec(str);
  if (!m) return false;
  const month = parseInt(m[1], 10);
  const year = parseInt(m[2], 10);
  return month >= 1 && month <= 12 && year >= 1900 && year <= new Date().getFullYear();
}
