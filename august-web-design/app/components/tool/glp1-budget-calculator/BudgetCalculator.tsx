"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { useStepForm } from "@/app/components/tool/shared/hooks/useStepForm";
import { track, trackToolEvent } from "@/app/utils/analytics";
import {
  GENDER_OPTIONS,
  AGE_OPTIONS,
  EXPENSE_FIELDS,
  TIERS,
  type Gender,
  type AgeRange,
} from "@/app/data/tools/glp1-budget-calculator-config";
import { computeBudget, type BudgetResult } from "@/app/utils/tools/glp1-budget-compute";
import { fmtUSD } from "@/app/utils/tools/health-math";
import { ToolAuthGate } from "@/components/auth";
import "./glp1-budget-calculator.css";

const TOTAL_STEPS = 5;
const fmt = fmtUSD;

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes, I have coverage" },
  { value: "no", label: "No coverage" },
];

interface FormState {
  gender: Gender | null;
  age: AgeRange | null;
  income: string;
  expenses: Record<string, string>;
  hasInsurance: boolean | null;
  coverage: string;
}

const DEFAULT_STATE: FormState = {
  gender: null,
  age: null,
  income: "",
  expenses: {},
  hasInsurance: null,
  coverage: "",
};

interface StepProps {
  state: FormState;
  update: (patch: Partial<FormState>) => void;
}

function ProfileStep({ state, update }: StepProps) {
  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">About you</h2>
        <p className="tool-step-subtitle">Basic info to personalize your result.</p>
      </div>

      <div className="tool-calc-form-grid">
        <div className="tool-form-group tool-calc-form-span-2">
          <label className="tool-form-label">Gender</label>
          <SegmentedControl
            options={GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            value={state.gender ?? ""}
            onChange={(v) => update({ gender: v as Gender })}
            ariaLabel="Gender"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>

        <div className="tool-form-group tool-calc-form-span-2">
          <label className="tool-form-label">Age range</label>
          <SegmentedControl
            options={AGE_OPTIONS.map((a) => ({ value: a, label: a }))}
            value={state.age ?? ""}
            onChange={(v) => update({ age: v as AgeRange })}
            ariaLabel="Age range"
            className="tool-chip-group tool-chip-group--connected"
            buttonClassName="tool-chip"
            activeClassName="tool-chip--active"
          />
        </div>
      </div>
    </div>
  );
}

function IncomeStep({ state, update }: StepProps) {
  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">Monthly income</h2>
        <p className="tool-step-subtitle">Enter your total monthly take-home pay.</p>
      </div>

      <div className="tool-form-group">
        <label htmlFor="bc-income" className="tool-form-label">Monthly take-home pay</label>
        <div className="bc-currency-input">
          <span className="bc-currency-prefix">$</span>
          <input
            id="bc-income"
            type="number"
            inputMode="numeric"
            className="tool-input bc-currency-field"
            value={state.income}
            onChange={(e) => update({ income: e.target.value })}
            placeholder="0"
            min={0}
            aria-label="Monthly income"
          />
        </div>
      </div>
    </div>
  );
}

function ExpensesStep({ state, update }: StepProps) {
  const sections = ["household", "lifestyle", "healthcare"] as const;
  const sectionLabels: Record<string, string> = {
    household: "Household",
    lifestyle: "Lifestyle",
    healthcare: "Healthcare",
  };

  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">Monthly expenses</h2>
        <p className="tool-step-subtitle">Estimate your typical monthly spending.</p>
      </div>

      <div className="bc-expense-stack">
        {sections.map((sec) => {
          const fields = EXPENSE_FIELDS.filter((f) => f.section === sec);
          if (!fields.length) return null;
          return (
            <div key={sec} className="bc-expense-section">
              <div className="tool-calc-section-label">{sectionLabels[sec]}</div>
              <div className="bc-expense-grid">
                {fields.map((f) => (
                  <div className="tool-form-group" key={f.id}>
                    <label htmlFor={`bc-exp-${f.id}`} className="tool-form-label">{f.label}</label>
                    <div className="bc-currency-input">
                      <span className="bc-currency-prefix">$</span>
                      <input
                        id={`bc-exp-${f.id}`}
                        type="number"
                        inputMode="numeric"
                        className="tool-input bc-currency-field"
                        value={state.expenses[f.id] ?? ""}
                        onChange={(e) =>
                          update({ expenses: { ...state.expenses, [f.id]: e.target.value } })
                        }
                        placeholder="0"
                        min={0}
                        aria-label={f.label}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoverageStep({ state, update }: StepProps) {
  return (
    <div className="tool-calc-step-body">
      <div className="tool-calc-step-header">
        <h2 className="tool-step-title">Coverage</h2>
        <p className="tool-step-subtitle">
          Do you have insurance or prescription coverage for GLP-1 medication?
        </p>
      </div>

      <div className="tool-form-group">
        <SegmentedControl
          options={YES_NO_OPTIONS}
          value={state.hasInsurance === null ? "" : state.hasInsurance ? "yes" : "no"}
          onChange={(v) => update({ hasInsurance: v === "yes" })}
          ariaLabel="Insurance coverage"
          className="tool-chip-group tool-chip-group--connected"
          buttonClassName="tool-chip"
          activeClassName="tool-chip--active"
        />
      </div>

      {state.hasInsurance && (
        <div className="tool-form-group">
          <label htmlFor="bc-copay" className="tool-form-label">
            Expected monthly copay (your out-of-pocket cost per fill)
          </label>
          <div className="bc-currency-input">
            <span className="bc-currency-prefix">$</span>
            <input
              id="bc-copay"
              type="number"
              inputMode="numeric"
              className="tool-input bc-currency-field"
              value={state.coverage}
              onChange={(e) => update({ coverage: e.target.value })}
              placeholder="0"
              min={0}
              aria-label="Expected monthly copay"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  result,
  income,
  expenseNums,
  onRestart,
}: {
  result: BudgetResult;
  income: number;
  expenseNums: Record<string, number>;
  onRestart: () => void;
}) {
  const { budget, totalExpenses, tier } = result;
  const dotColor = tier.id <= 3 ? "bc-dot-green" : tier.id === 4 ? "bc-dot-yellow" : "bc-dot-red";
  const allExpensesZero = Object.values(expenseNums).every((v) => v === 0);

  return (
    <div className="tool-calc-result-stack">
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Available monthly budget</span>
        <div className="tool-calc-value-row">
          <span className="tool-calc-value">{fmt(budget)}</span>
          <span className="tool-calc-value-unit">/ month</span>
        </div>
        <p className="tool-calc-result-desc">{tier.description}</p>
        {income > 0 && (
          <div className="tool-calc-meta-row">
            <span>Expenses share of take-home pay</span>
            <strong>{Math.round((totalExpenses / income) * 100)}%</strong>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <a
          href="/chat?msg=I just used the GLP-1 Budget Calculator and want to discuss my results"
          className="tool-btn tool-btn--primary"
          onClick={() => {
            // track("tool_cta_clicked", { tool: "glp1-budget-calculator", target: "chat" });
            trackToolEvent("glp1-budget-calculator", "cta_clicked", { target: "chat" });
          }}
        >
          Talk to august
        </a>
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
          Start over
        </button>
      </div>

      <div className="tool-calc-table-card">
        <span className="tool-calc-section-label">
          <span className={`bc-dot ${dotColor}`} aria-hidden /> Best fit: {tier.label}
        </span>
        <p className="tool-calc-table-caption">{tier.tips}</p>
        <div className="tool-calc-table" role="table">
          {TIERS.filter((t) => t.id < 5).map((t) => (
            <div
              key={t.id}
              role="row"
              className={`tool-calc-table-row${t.id === tier.id ? " tool-calc-table-row--active" : ""}`}
            >
              <div className="tool-calc-table-cell-label">
                <span className="tool-calc-table-label">{t.label}</span>
              </div>
              <div className="tool-calc-table-cell-value">
                {budget >= t.min ? (
                  <strong className="bc-tier-check">&#10003;</strong>
                ) : (
                  <>
                    <strong>{fmt(t.min)}</strong>
                    <span className="tool-calc-table-unit">/mo</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {allExpensesZero && (
        <p className="tool-error">
          Did you fill in all your expenses? Incomplete data may overestimate your available budget.
        </p>
      )}
    </div>
  );
}

interface NavProps {
  step: number;
  totalSteps: number;
  canAdvance: boolean;
  onNext: () => void;
  onBack: () => void;
  isLastFormStep: boolean;
}

function NavigationControls({ step, totalSteps, canAdvance, onNext, onBack, isLastFormStep }: NavProps) {
  return (
    <div className="tool-calc-nav">
      {step > 0 ? (
        <button type="button" className="tool-btn tool-btn--ghost tool-calc-nav-btn" onClick={onBack}>
          <ArrowLeftIcon size={14} weight="bold" aria-hidden />
          Back
        </button>
      ) : (
        <div />
      )}

      <div className="tool-calc-dots" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={`tool-calc-dot${i === step ? " tool-calc-dot--active" : i < step ? " tool-calc-dot--completed" : ""}`}
          />
        ))}
      </div>

      <button
        type="button"
        className="tool-btn tool-btn--primary tool-calc-nav-btn"
        disabled={!canAdvance}
        onClick={onNext}
      >
        {isLastFormStep ? "See my budget" : "Next"}
        <ArrowRightIcon size={14} weight="bold" aria-hidden />
      </button>
    </div>
  );
}

interface Props {
  afterContent?: React.ReactNode;
}

export default function BudgetCalculator({ afterContent }: Props) {
  const [state, setState] = useState<FormState>(DEFAULT_STATE);
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [computeError, setComputeError] = useState<string | null>(null);
  const { step, next, back, reset } = useStepForm({ totalSteps: TOTAL_STEPS });

  const hasViewedRef = useRef(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("glp1-budget-calculator", "viewed");
  }, []);

  useEffect(() => {
    trackToolEvent("glp1-budget-calculator", "section_completed", { step });
  }, [step]);

  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [step]);

  const update = useCallback((patch: Partial<FormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackToolEvent("glp1-budget-calculator", "started");
    }
  }, []);

  const expenseNums = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(state.expenses)) {
      out[k] = parseFloat(v) || 0;
    }
    return out;
  }, [state.expenses]);

  const canAdvance = useMemo(() => {
    if (step === 0) return state.gender !== null && state.age !== null;
    if (step === 1) return parseFloat(state.income) > 0;
    if (step === 2) return true;
    if (step === 3) return state.hasInsurance !== null;
    return false;
  }, [step, state]);

  const handleRestart = useCallback(() => {
    reset();
    setState(DEFAULT_STATE);
    setResult(null);
    setComputeError(null);
  }, [reset]);

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS - 2) {
      next();
      return;
    }
    try {
      const res = computeBudget({
        income: parseFloat(state.income) || 0,
        expenses: expenseNums,
        hasCoverage: !!state.hasInsurance,
        copay: state.hasInsurance ? parseFloat(state.coverage) || 0 : 0,
      });
      setComputeError(null);
      setResult(res);
      next();
      trackToolEvent("glp1-budget-calculator", "completed", {
        tier: res.tier.label,
        budget: res.budget,
      });
    } catch (err) {
      const msg = err instanceof RangeError ? err.message : "Invalid input - please check your values.";
      setComputeError(msg);
    }
  }, [step, state, expenseNums, next]);

  const isResultsStep = step === TOTAL_STEPS - 1;
  const isLastFormStep = step === TOTAL_STEPS - 2;

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            GLP-1 <span className="accent-gradient">Budget Calculator</span>
          </>
        ),
        tagline:
          "Estimate how much you can comfortably allocate toward GLP-1 medication each month. Free, private, instant.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {step === 0 && <ProfileStep state={state} update={update} />}
                  {step === 1 && <IncomeStep state={state} update={update} />}
                  {step === 2 && <ExpensesStep state={state} update={update} />}
                  {step === 3 && <CoverageStep state={state} update={update} />}
                  {isResultsStep && result && (
                    <ResultPanel
                      result={result}
                      income={parseFloat(state.income) || 0}
                      expenseNums={expenseNums}
                      onRestart={handleRestart}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {computeError && !isResultsStep && (
                <p className="tool-error" role="alert">{computeError}</p>
              )}

              {!isResultsStep && (
                <NavigationControls
                  step={step}
                  totalSteps={TOTAL_STEPS}
                  canAdvance={canAdvance}
                  onNext={handleNext}
                  onBack={back}
                  isLastFormStep={isLastFormStep}
                />
              )}
            </div>
            <ToolAuthGate active={isResultsStep && !!result} />
            <p className="tool-calc-disclaimer">
              This is a budget planning tool, not medical advice. Affordability does not determine medical eligibility. Consult your doctor before starting any medication.
            </p>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
