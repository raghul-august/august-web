"use client";

import { useState, useMemo, useEffect } from "react";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import {
  ACTIVITY_LEVELS,
  GLP1_PHASES,
  DIET_OPTIONS,
  MEALS_PER_DAY_OPTIONS,
} from "@/app/data/tools/glp1-meal-planner-config";
import { computeMealPlan, SLOT_DISTRIBUTIONS, type MealPlanOptions, type MealResult, type Sex } from "@/app/utils/tools/glp1-meal-compute";
import {
  cmToFeetInches,
  feetInchesToCm,
  fmtDecimal,
  fmtInt,
  kgToLbs,
  lbsToKg,
  parseNumOrNull,
} from "@/app/utils/tools/health-math";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import "./glp1-meal-planner.css";
import { landingStyles } from "../shared/landing-styles";
import { ToolAuthGate } from "@/components/auth";
import { useDownloadResult } from "../shared/hooks/useDownloadResult";
import DownloadResultButton from "../shared/DownloadResultButton";

type UnitSystem = "imperial" | "metric";

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const SLOT_CONFIG: Record<string, { time: string; label: string; display: string }> = {
  breakfast: { time: "7:00 AM", label: "BREAKFAST", display: "Breakfast" },
  "morning-snack": { time: "10:00 AM", label: "MORNING SNACK", display: "Snack" },
  lunch: { time: "12:30 PM", label: "LUNCH", display: "Lunch" },
  "afternoon-snack": { time: "3:30 PM", label: "AFTERNOON SNACK", display: "Snack" },
  dinner: { time: "6:30 PM", label: "DINNER", display: "Dinner" },
};
const getTimeForSlot = (s: string) => SLOT_CONFIG[s]?.time ?? "";
const slotLabel = (s: string) => SLOT_CONFIG[s]?.label ?? "";
const slotDisplayName = (s: string) => SLOT_CONFIG[s]?.display ?? "";

type FormState = {
  unitSystem: UnitSystem;
  weightLbRaw: string;
  weightKgRaw: string;
  heightFeetRaw: string;
  heightInchesRaw: string;
  heightCmRaw: string;
  age: string;
  sex: Sex;
  activity: string;
  strengthTraining: boolean;
  mealsPerDay: 3 | 4 | 5;
  diet: string;
  phase: string;
};

function resolveWeightLbs(form: FormState): number | null {
  if (form.unitSystem === "imperial") {
    return parseNumOrNull(form.weightLbRaw);
  }
  const kg = parseNumOrNull(form.weightKgRaw);
  return kg == null ? null : kgToLbs(kg);
}

function resolveHeightInches(form: FormState): number | null {
  if (form.unitSystem === "imperial") {
    const feet = parseNumOrNull(form.heightFeetRaw);
    if (feet == null) return null;
    const inches = parseNumOrNull(form.heightInchesRaw) ?? 0;
    return feet * 12 + inches;
  }
  const cm = parseNumOrNull(form.heightCmRaw);
  return cm == null ? null : cm / 2.54;
}

// Converts raw form strings to validated numeric MealInput fields.
// Returns null if any required field is missing/invalid.
function formToInput(form: FormState) {
  const weightLbs = resolveWeightLbs(form);
  const heightIn = resolveHeightInches(form);
  const age = parseNumOrNull(form.age);
  if (
    weightLbs == null || weightLbs <= 0 ||
    heightIn == null || heightIn <= 0 ||
    age == null || age < 18
  ) {
    return null;
  }
  return {
    weightLbs,
    heightIn,
    age,
    sex: form.sex,
    activity: form.activity,
    strengthTraining: form.strengthTraining,
    mealsPerDay: form.mealsPerDay,
    diet: form.diet,
    phase: form.phase,
  };
}

export default function MealPlanner({
  afterContent,
}: {
  afterContent?: React.ReactNode;
}) {
  const [form, setForm] = useState<FormState>({
    unitSystem: "imperial",
    weightLbRaw: "",
    weightKgRaw: "",
    heightFeetRaw: "",
    heightInchesRaw: "",
    heightCmRaw: "",
    age: "",
    sex: "male",
    activity: "moderate",
    strengthTraining: true,
    mealsPerDay: 4,
    diet: "Standard",
    phase: "adjusted",
  });
  const [screen, setScreen] = useState<"input" | "results">("input");
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [result, setResult] = useState<MealResult | null>(null);

  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "glp1-meal-planner",
    filename: "glp1-meal-plan",
    heading: "GLP-1 Meal Plan",
    subtitle: "Suggested Daily Plan",
    toolName: "GLP-1 Meal Planner",
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  function onUnitChange(raw: string) {
    const next = raw as UnitSystem;
    if (next === form.unitSystem) return;
    track("meal_planner_unit_change", { from: form.unitSystem, to: next });
    const patch: Partial<FormState> = { unitSystem: next };
    if (next === "metric") {
      const lb = parseNumOrNull(form.weightLbRaw);
      if (lb != null) patch.weightKgRaw = fmtDecimal(lbsToKg(lb), 1);
      const feet = parseNumOrNull(form.heightFeetRaw);
      if (feet != null) {
        const inches = parseNumOrNull(form.heightInchesRaw) ?? 0;
        patch.heightCmRaw = fmtDecimal(feetInchesToCm(feet, inches), 0);
      }
    } else {
      const kg = parseNumOrNull(form.weightKgRaw);
      if (kg != null) patch.weightLbRaw = fmtDecimal(kgToLbs(kg), 1);
      const cm = parseNumOrNull(form.heightCmRaw);
      if (cm != null) {
        const { feet, inches } = cmToFeetInches(cm);
        patch.heightFeetRaw = String(feet);
        patch.heightInchesRaw = String(inches);
      }
    }
    setForm((p) => ({ ...p, ...patch }));
  }

  useEffect(() => {
    track("meal_planner_viewed", {});
  }, []);

  const preview = useMemo(() => {
    const input = formToInput(form);
    if (!input) return null;
    try {
      return computeMealPlan(input);
    } catch {
      return null;
    }
  }, [form]);

  const weightKg = useMemo(() => {
    const lbs = resolveWeightLbs(form);
    if (lbs == null || lbs <= 0) return 0;
    return lbsToKg(lbs);
  }, [form]);

  const multiplier = useMemo(() => {
    const level = ACTIVITY_LEVELS.find((l) => l.id === form.activity);
    let m = level?.multiplier ?? 1.0;
    if (form.strengthTraining && m < 1.5) m = 1.5;
    return m;
  }, [form.activity, form.strengthTraining]);

  const slots = SLOT_DISTRIBUTIONS[form.mealsPerDay] || SLOT_DISTRIBUTIONS[4];

  function handleGenerate() {
    if (!preview) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    setResult(preview);
    setScreen("results");
    setExpandedMeal(null);
    track("meal_planner_generated", {
      protein: preview.proteinTarget,
      diet: form.diet,
      phase: form.phase,
    });
  }

  function handleConsult() {
    if (!result) return;
    trackToolEvent("glp1-meal-planner", "cta_clicked", { target: "consult" });
    const parts: string[] = [
      "Hi, I just used the GLP-1 Meal Planner.",
      `My daily protein target is ${result.proteinTarget}g and daily calories are ~${fmtInt(result.dailyCalories)} cal.`,
      `I'm on the ${form.phase} phase with a ${form.diet} diet, eating ${form.mealsPerDay} meals per day.`,
      "Can you help me make the most of this plan?",
    ];
    openAugustChat(parts.join(" "));
  }

  function handleRestart() {
    track("meal_planner_restarted", { event_category: "GLP-1 Meal Planner" });
    window.scrollTo({ top: 0, behavior: "instant" });
    setScreen("input");
    setExpandedMeal(null);
    setResult(null);
    setForm({
      unitSystem: "imperial",
      weightLbRaw: "",
      weightKgRaw: "",
      heightFeetRaw: "",
      heightInchesRaw: "",
      heightCmRaw: "",
      age: "",
      sex: "male",
      activity: "moderate",
      strengthTraining: true,
      mealsPerDay: 4,
      diet: "Standard",
      phase: "adjusted",
    });
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const dateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, []);

  const currentPhase = GLP1_PHASES.find((p) => p.id === form.phase);

  return (
    <>
      <div className="mp-page">
        <section className="mp-hero-section">
          <div className="mp-hero-content tl-hero-overlay">
            {screen === "input" && (
              <div className="mp-hero-text">
                <h1 className="mp-hero-title tl-hero-headline">
                  GLP-1{" "}
                  <span className="accent-gradient">Meal Planner</span>
                </h1>
                <p className="mp-hero-tagline tl-hero-tagline">
                  Build a high-protein meal plan tailored to your GLP-1 phase,
                  activity level, and diet. Free, private, instant.
                </p>
              </div>
            )}

            {/* ── INPUT SCREEN ── */}
            {screen === "input" && (
              <div className="mp-form-area">
                <div className="mp-input-grid">
                  <div className="mp-section-card">
                    <div className="mp-section-label">Your Profile</div>

                    {/* Unit system */}
                    <div className="mp-form-group">
                      <label className="mp-form-label">Units</label>
                      <SegmentedControl
                        options={UNIT_OPTIONS}
                        value={form.unitSystem}
                        onChange={onUnitChange}
                        ariaLabel="Unit system"
                        className="mp-unit-toggle"
                        buttonClassName="mp-unit-btn"
                        activeClassName="mp-unit-btn--active "
                      />
                    </div>

                    {/* Height + Age */}
                    <div className="mp-form-row">
                      <div className="mp-form-group">
                        <label className="mp-form-label" htmlFor="mp-height-primary">
                          Height {form.unitSystem === "metric" ? "(cm)" : ""}
                        </label>
                        {form.unitSystem === "imperial" ? (
                          <div className="tool-calc-combo-input">
                            <div className="tool-calc-combo-segment">
                              <input
                                id="mp-height-primary"
                                type="text"
                                inputMode="numeric"
                                className="tool-calc-combo-input__field placeholder:opacity-65"
                                value={form.heightFeetRaw}
                                onChange={(e) => set("heightFeetRaw", e.target.value)}
                                placeholder="5"
                                aria-label="Feet"
                              />
                              <span className="tool-calc-combo-input__suffix">ft</span>
                            </div>
                            <span className="tool-calc-combo-input__divider" aria-hidden="true" />
                            <div className="tool-calc-combo-segment">
                              <input
                                type="text"
                                inputMode="numeric"
                                className="tool-calc-combo-input__field placeholder:opacity-65"
                                value={form.heightInchesRaw}
                                onChange={(e) => set("heightInchesRaw", e.target.value)}
                                placeholder="9"
                                aria-label="Inches"
                              />
                              <span className="tool-calc-combo-input__suffix">in</span>
                            </div>
                          </div>
                        ) : (
                          <input
                            id="mp-height-primary"
                            type="text"
                            inputMode="decimal"
                            className="tool-input placeholder:opacity-65"
                            value={form.heightCmRaw}
                            onChange={(e) => set("heightCmRaw", e.target.value)}
                            placeholder="eg. 175"
                            aria-label="Height in centimeters"
                          />
                        )}
                      </div>

                      <div className="mp-form-group">
                        <label className="mp-form-label" htmlFor="mp-age">Age</label>
                        <input
                          id="mp-age"
                          type="text"
                          inputMode="numeric"
                          className="tool-input placeholder:opacity-65"
                          value={form.age}
                          onChange={(e) => set("age", e.target.value)}
                          placeholder="eg. 35"
                          aria-label="Age"
                        />
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="mp-form-row">
                    
                    <div className="mp-form-group">
                      <label className="mp-form-label" htmlFor="mp-weight">
                        Current weight ({form.unitSystem === "imperial" ? "lb" : "kg"})
                      </label>
                      <input
                        id="mp-weight"
                        type="text"
                        inputMode="decimal"
                        className="tool-input placeholder:opacity-65"
                        value={form.unitSystem === "imperial" ? form.weightLbRaw : form.weightKgRaw}
                        onChange={(e) =>
                          set(
                            form.unitSystem === "imperial" ? "weightLbRaw" : "weightKgRaw",
                            e.target.value,
                          )
                        }
                        placeholder={form.unitSystem === "imperial" ? "eg. 185" : "eg. 84"}
                        aria-label="Weight"
                      />
                    </div>
                     {/* Activity level */}
                    <div className="mp-form-group">
                      <label htmlFor="mp-activity" className="mp-form-label">Activity level</label>
                      <select
                        id="mp-activity"
                        className="tool-input"
                        value={form.activity}
                        onChange={(e) => set("activity", e.target.value)}
                        aria-label="Activity level"
                        style={{
                        // fontSize: "0.8rem",
                        paddingRight: "36px",
                        textOverflow: "ellipsis",
                      }}
                      >
                        {ACTIVITY_LEVELS.map((lvl) => (
                          <option key={lvl.id} value={lvl.id}>
                            {lvl.shortLabel} - {lvl.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    </div>


                    {/* Sex + Strength training */}
                    <div className="mp-form-row">
                      <div className="mp-form-group">
                        <label className="mp-form-label">Sex</label>
                        <SegmentedControl
                          options={[
                            { value: "male", label: "Male" },
                            { value: "female", label: "Female" },
                          ]}
                          value={form.sex}
                          onChange={(v) => set("sex", v as Sex)}
                          ariaLabel="Sex"
                          className="mp-unit-toggle"
                          buttonClassName="mp-unit-btn"
                          activeClassName="mp-unit-btn--active"
                        />
                      </div>

                      <div className="mp-form-group">
                        <label className="mp-form-label">
                          Do you strength train?
                        </label>
                        <SegmentedControl
                          options={[
                            { value: "yes", label: "Yes" },
                            { value: "no", label: "No" },
                          ]}
                          value={form.strengthTraining ? "yes" : "no"}
                          onChange={(v) => set("strengthTraining", v === "yes")}
                          ariaLabel="Strength training"
                          className="mp-unit-toggle"
                          buttonClassName="mp-unit-btn"
                          activeClassName="mp-unit-btn--active"
                        />
                      </div>
                    </div>

                   
                  </div>

                  {/* Plan settings section */}
                  <div className="mp-section-card mp-plan-settings-card">
                    <div className="mp-section-label">Plan Settings</div>

                    <div className="mp-form-group">
                      <label className="mp-form-label">Meals per day</label>
                      <SegmentedControl
                        options={MEALS_PER_DAY_OPTIONS.map((n) => ({
                          value: String(n),
                          label: `${n} meals`,
                        }))}
                        value={String(form.mealsPerDay)}
                        onChange={(v) => set("mealsPerDay", parseInt(v, 10) as 3 | 4 | 5)}
                        ariaLabel="Meals per day"
                        className="mp-unit-toggle"
                        buttonClassName="mp-unit-btn"
                        activeClassName="mp-unit-btn--active"
                      />
                    </div>

                    <div className="mp-form-group">
                      <label htmlFor="mp-diet" className="mp-form-label">Diet preference</label>
                      <select
                        id="mp-diet"
                        className="tool-input"
                        value={form.diet}
                        onChange={(e) => set("diet", e.target.value)}
                        aria-label="Diet preference"
                      >
                        {DIET_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mp-form-group">
                      <label className="mp-form-label">GLP-1 phase</label>
                      <div className="mp-phase-cards">
                        {GLP1_PHASES.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className={`mp-phase-card${form.phase === p.id ? " mp-phase-card--active" : ""}`}
                            onClick={() => set("phase", p.id)}
                          >
                            <div className="mp-phase-name">
                              {p.id === "early"
                                ? "Early"
                                : p.id === "adjusted"
                                  ? "Adjusted"
                                  : "Maintenance"}
                            </div>
                            <div className="mp-phase-desc">
                              {p.id === "early"
                                ? "First 4 weeks"
                                : p.id === "adjusted"
                                  ? "Weeks 4-12"
                                  : "12+ weeks"}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                 <div className="mp-cta-row">
                  <button
                    type="button"
                    className="tool-btn tool-btn--primary mb-6"
                    onClick={handleGenerate}
                    disabled={!preview}
                  >
                    Generate my meal plan
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="8" x2="13" y2="8" />
                      <polyline points="9 4 13 8 9 12" />
                    </svg>
                  </button>
                </div>


                {/* Live Preview (full width below) */}
                <div className="mp-preview-panel">
                  <div className="mp-section-card">
                    <div className="mp-section-label">
                      <span className="mp-live-dot" />
                      Your Plan Preview
                    </div>

                    {preview ? (
                      <>
                        <div className="mp-stat-row">
                          <div className="mp-preview-label">Daily Protein Target</div>
                          <div className="mp-preview-stat mp-preview-stat--brand">
                            {preview.proteinTarget}g
                          </div>
                          <div className="mp-preview-formula">
                            {Math.round(weightKg)}kg x {multiplier}g/kg
                          </div>
                        </div>

                        <div className="mp-stat-row">
                          <div className="mp-preview-label">Daily Calories</div>
                          <div className="mp-preview-stat-secondary">
                            ~{fmtInt(preview.dailyCalories)} cal
                          </div>
                          <div className="mp-preview-formula">
                            Mifflin-St Jeor BMR &times; activity
                          </div>
                        </div>

                        <div className="mp-stat-row">
                          <div className="mp-preview-label">Per-Meal Protein</div>
                          <div className="mp-preview-stat-muted">
                            ~{preview.perMealProtein}g across {form.mealsPerDay} meals
                          </div>
                        </div>

                        <div className="mp-preview-divider" />

                        <div className="mp-preview-label">Your daily meals</div>
                        <div className="mp-slot-grid">
                          {slots.map((s) => (
                            <div key={s} className="mp-meal-slot-preview">
                              <div className="mp-slot-name">{slotDisplayName(s)}</div>
                              <div className="mp-slot-protein">
                                ~{preview.perMealProtein}g protein
                              </div>
                            </div>
                          ))}
                        </div>

                        {currentPhase && (
                          <div className="mp-phase-note">
                            <p>{currentPhase.label}. {currentPhase.description}</p>
                          </div>
                        )}

                        <div className="mp-preview-info">
                          Plans are personalized based on your inputs
                        </div>
                      </>
                    ) : (
                      <div className="mp-preview-empty">
                        Enter your weight to see preview
                      </div>
                    )}
                  </div>
                </div>

               
              </div>
            )}

            {/* ── RESULTS SCREEN ── */}
            {screen === "results" && result && (
              <div ref={resultRef} className="mp-results">
                <div className="flex justify-end mb-3" data-skip-screenshot="true">
                  <DownloadResultButton onClick={handleDownload} />
                </div>

                <div className="mp-results-header">
                  <h1>Suggested Meal Plan</h1>
                  <div className="mp-results-date">{dateStr}</div>
                </div>

                <div className="mp-stat-bar">
                  <div className="mp-stat">
                    <div className="mp-stat-value">{fmtInt(result.totals.calories)}</div>
                    <div className="mp-stat-label">Calories</div>
                  </div>
                  <div className="mp-stat mp-stat--highlight">
                    <div className="mp-stat-value">{result.totals.protein}g</div>
                    <div className="mp-stat-label">Protein</div>
                  </div>
                  <div className="mp-stat">
                    <div className="mp-stat-value">{result.totals.carbs}g</div>
                    <div className="mp-stat-label">Carbs</div>
                  </div>
                  <div className="mp-stat">
                    <div className="mp-stat-value">{result.totals.fat}g</div>
                    <div className="mp-stat-label">Fat</div>
                  </div>
                </div>

                <div className="mp-progress-wrap">
                  <div className="mp-progress-bar">
                    <div
                      className="mp-progress-fill"
                      style={{ width: `${Math.min(100, Math.round((result.totals.calories / result.dailyCalories) * 100))}%` }}
                    />
                  </div>
                  <div className="mp-progress-labels">
                    <span>{fmtInt(result.totals.calories)} of {fmtInt(result.dailyCalories)} cal</span>
                    <span>{Math.max(0, result.dailyCalories - result.totals.calories)} remaining</span>
                  </div>
                </div>

                <div className="mp-result-actions" data-skip-screenshot="true">
                  <button
                    type="button"
                    className="tool-btn tool-btn--primary mb-0"
                    onClick={handleConsult}
                  >
                    Talk to august
                  </button>
                  <button
                    type="button"
                    className="tool-btn tool-btn--ghost mb-0"
                    onClick={handleRestart}
                  >
                    Start over
                  </button>
                </div>

                {result.warnings.length > 0 && (
                  <div className="mp-warnings">
                    {result.warnings.includes("very_low_calories") && (
                      <p>Your calorie target is very low. Please consult your healthcare provider.</p>
                    )}
                    {result.warnings.includes("elderly_protein_note") && (
                      <p>Adults over 65 may benefit from discussing protein targets with their provider.</p>
                    )}
                    {result.warnings.includes("protein_below_target") && (
                      <p>This plan falls slightly below your protein target. Consider adding a protein-rich snack.</p>
                    )}
                    {result.warnings.includes("calories_below_target") && (
                      <p>Total calories are below your daily target. This may be fine in early GLP-1 phases but monitor how you feel.</p>
                    )}
                    {result.warnings.includes("calories_above_target") && (
                      <p>Total calories exceed your daily target. Consider smaller portions or swapping a meal.</p>
                    )}
                  </div>
                )}

                <div className="">
                  {result.meals.map((meal, i) => {
                    const isExpanded = expandedMeal === i;
                    return (
                      <div key={i} className="mp-meal-row">
                        <div className="mp-meal-main" onClick={() => setExpandedMeal(isExpanded ? null : i)}>
                          <span className="mp-meal-time">{getTimeForSlot(meal.mealSlot)}</span>
                          <div className="mp-meal-info">
                            <div className="mp-meal-type">{slotLabel(meal.mealSlot)}</div>
                            <div className="mp-meal-name">{meal.name}</div>
                          </div>
                          <div className="mp-meal-macros">
                            <span className="mp-meal-cal">{meal.calories} cal</span>
                            <span className="mp-meal-protein">{meal.protein}g P</span>
                          </div>
                          <span className={`mp-chevron${isExpanded ? " mp-chevron--open" : ""}`}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 6l4 4 4-4" />
                            </svg>
                          </span>
                        </div>
                        {isExpanded && (
                          <div className="mp-meal-expanded">
                            <div className="mp-meal-ingredients">{meal.ingredients.join(", ")}</div>
                            <div className="mp-meal-macro-detail">
                              {meal.calories} cal
                              <span className="mp-macro-sep">&middot;</span>
                              <span>{meal.protein}g protein</span>
                              <span className="mp-macro-sep">&middot;</span>
                              {meal.carbs}g carbs
                              <span className="mp-macro-sep">&middot;</span>
                              {meal.fat}g fat
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mp-actions" data-skip-screenshot="true">
                  {/* <button type="button" onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); setScreen("input"); }}>
                    Back to settings
                  </button> */}
                  {/* <span className="mp-actions-dot">&middot;</span> */}
                  <button
                    type="button"
                    onClick={() => {
                      // Pass Date.now() as seed so the regenerate button always yields a different plan
                      const input = formToInput(form);
                      if (!input) return;
                      try {
                        const opts: MealPlanOptions = { seed: Date.now() };
                        setResult(computeMealPlan(input, opts));
                        setExpandedMeal(null);
                        track("meal_planner_regenerated", { diet: form.diet, phase: form.phase });
                      } catch { /* ignore */ }
                    }}
                  >
                    Regenerate
                  </button>
                </div>
                  <div className="tl-disclaimer" data-skip-screenshot="true">
                  This is an educational meal planning tool, not medical advice. Consult your doctor or registered dietitian before making dietary changes while on GLP-1 medication.
                </div>
              </div>
            )}
          </div>
        </section>

        {afterContent && (
          <div className="tool-landing-content-wrap">
            {afterContent}
          </div>
        )}
      </div>
      <ToolAuthGate active={screen === "results" && !!result} />
    </>
  );
}
