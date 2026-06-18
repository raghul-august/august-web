"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import ToolLandingLayout from "@/app/components/tool/shared/ToolLandingLayout";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";
import { useCalculatorAnalytics } from "@/app/components/tool/shared/hooks/useCalculatorAnalytics";
import { useDownloadResult } from "@/app/components/tool/shared/hooks/useDownloadResult";
import DownloadResultButton from "@/app/components/tool/shared/DownloadResultButton";
import { track, trackToolEvent } from "@/app/utils/analytics";
import {
  cmToFeetInches,
  feetInchesToCm,
  fmtDecimal,
  fmtInt,
  kgToLbs,
  lbsToKg,
  parseNumOrNull,
} from "@/app/utils/tools/health-math";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import {
  computeDri,
  driBucket,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
  type DriFormState,
  type DriResult,
  type DriResultOk,
  type UnitSystem,
} from "@/app/utils/tools/dri-calculator-compute";
import {
  ACTIVITY_HELPER,
  ACTIVITY_LABEL,
  AGE_MAX,
  AGE_MIN,
  LIFE_STAGE_OPTIONS,
  SEX_OPTIONS,
  type ActivityLevel,
  type LifeStage,
  type NutrientEntry,
  type NutrientProfile,
  type Sex,
} from "@/app/data/tools/dri-calculator-config";
import {ArrowRightIcon} from "@phosphor-icons/react"
interface Props {
  afterContent?: ReactNode;
}

const UNIT_OPTIONS = [
  { value: "imperial", label: "US Standard" },
  { value: "metric", label: "Metric" },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: ACTIVITY_LABEL.sedentary },
  { value: "low-active", label: ACTIVITY_LABEL["low-active"] },
  { value: "active", label: ACTIVITY_LABEL.active },
  { value: "very-active", label: ACTIVITY_LABEL["very-active"] },
];

const DEFAULT_STATE: DriFormState = {
  unitSystem: "imperial",
  sex: "male",
  ageRaw: "",
  heightCmRaw: "",
  heightFeetRaw: "",
  heightInchesRaw: "",
  weightKgRaw: "",
  weightLbRaw: "",
  activity: "low-active",
  lifeStage: "none",
};

interface NutrientRow {
  key: string;
  label: string;
  group: "Macronutrients" | "Vitamins" | "Minerals";
  entry: NutrientEntry;
}

function buildNutrientRows(profile: NutrientProfile): NutrientRow[] {
  return [
    { key: "protein", label: "Protein", group: "Macronutrients", entry: profile.protein },
    { key: "carbohydrate", label: "Carbohydrate", group: "Macronutrients", entry: profile.carbohydrate },
    { key: "fiber", label: "Fiber", group: "Macronutrients", entry: profile.fiber },
    { key: "water", label: "Total water", group: "Macronutrients", entry: profile.water },
    { key: "vitaminA", label: "Vitamin A", group: "Vitamins", entry: profile.vitaminA },
    { key: "vitaminD", label: "Vitamin D", group: "Vitamins", entry: profile.vitaminD },
    { key: "vitaminE", label: "Vitamin E", group: "Vitamins", entry: profile.vitaminE },
    { key: "vitaminK", label: "Vitamin K", group: "Vitamins", entry: profile.vitaminK },
    { key: "vitaminC", label: "Vitamin C", group: "Vitamins", entry: profile.vitaminC },
    { key: "thiamin", label: "Thiamin (B1)", group: "Vitamins", entry: profile.thiamin },
    { key: "riboflavin", label: "Riboflavin (B2)", group: "Vitamins", entry: profile.riboflavin },
    { key: "niacin", label: "Niacin (B3)", group: "Vitamins", entry: profile.niacin },
    { key: "vitaminB6", label: "Vitamin B6", group: "Vitamins", entry: profile.vitaminB6 },
    { key: "folate", label: "Folate", group: "Vitamins", entry: profile.folate },
    { key: "vitaminB12", label: "Vitamin B12", group: "Vitamins", entry: profile.vitaminB12 },
    { key: "calcium", label: "Calcium", group: "Minerals", entry: profile.calcium },
    { key: "iron", label: "Iron", group: "Minerals", entry: profile.iron },
    { key: "magnesium", label: "Magnesium", group: "Minerals", entry: profile.magnesium },
    { key: "zinc", label: "Zinc", group: "Minerals", entry: profile.zinc },
    { key: "potassium", label: "Potassium", group: "Minerals", entry: profile.potassium },
    { key: "sodium", label: "Sodium", group: "Minerals", entry: profile.sodium },
    { key: "iodine", label: "Iodine", group: "Minerals", entry: profile.iodine },
    { key: "selenium", label: "Selenium", group: "Minerals", entry: profile.selenium },
  ];
}

function ErrorList({ result }: { result: DriResult }) {
  if (result.kind !== "invalid") return null;
  const map: Record<string, string> = {
    missing_age: "Please enter your age.",
    age_out_of_range: `Age must be between ${AGE_MIN} and ${AGE_MAX}.`,
    missing_height: "Please enter your height.",
    height_out_of_range: "That height looks off — please check.",
    missing_weight: "Please enter your weight.",
    weight_out_of_range: "That weight looks off — please check.",
    lifestage_requires_female:
      "Pregnancy and lactation life-stages apply to female-bodied users.",
  };
  return (
    <div className="tool-calc-error-stack">
      <p className="tool-error">{map[result.reason]}</p>
    </div>
  );
}

function ResultPanel({
  result,
  onRestart,
  resultRef,
  onDownload,
}: {
  result: DriResultOk;
  onRestart: () => void;
  resultRef: RefObject<HTMLDivElement | null>;
  onDownload: () => void | Promise<void>;
}) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("dri-calculator", "cta_clicked", {
      cta_type: "talk_to_august",
      sex: result.sex,
      age: result.age,
      activity: result.activity,
      life_stage: result.lifeStage,
    });
    openAugustChat(
      `Hi August. I used the DRI calculator. My estimated daily calorie need is about ${result.eerKcal} kcal with ${result.macros.proteinGrams} g of protein. I'd like to talk through how to actually hit my vitamin and mineral targets day-to-day.`,
    );
  }, [result]);

  const rows = useMemo(() => buildNutrientRows(result.profile), [result]);
  const macros = rows.filter((r) => r.group === "Macronutrients");
  const vitamins = rows.filter((r) => r.group === "Vitamins");
  const minerals = rows.filter((r) => r.group === "Minerals");

  return (
    <div ref={resultRef} className="tool-calc-result-stack">
      <div className="flex justify-end" data-skip-screenshot="true">
        <DownloadResultButton onClick={onDownload} />
      </div>
      <div className="tool-calc-result-primary">
        <span className="tool-calc-section-label">Daily calorie target</span>
        <div className="tool-calc-value-row">
          <span className="tool-calc-value">{fmtInt(result.eerKcal)}</span>
          <span className="tool-calc-value-unit">kcal/day</span>
        </div>
        <p className="tool-calc-result-desc">
          Estimated Energy Requirement (EER) using Mifflin–St Jeor REE × PAL{" "}
          ({result.activityLabel}). Resting need alone is{" "}
          {fmtInt(result.reeKcal)} kcal.
        </p>

        <div className="tool-calc-meta-row no-border-top">
          <span>Body Mass Index</span>
          <strong>{fmtDecimal(result.bmi, 1)}</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Protein</span>
          <strong>{result.macros.proteinGrams} g</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Carbohydrate (midpoint AMDR)</span>
          <strong>{result.macros.carbsGrams} g</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Fat (midpoint AMDR)</span>
          <strong>{result.macros.fatGrams} g</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Fiber</span>
          <strong>{result.macros.fiberGrams} g</strong>
        </div>
        <div className="tool-calc-meta-row">
          <span>Total water</span>
          <strong>{result.macros.waterLiters} L</strong>
        </div>
      </div>

      <div
        className="flex justify-center items-center gap-4 flex-wrap"
        data-skip-screenshot="true"
      >
        <button
          type="button"
          className="tool-btn tool-btn--primary"
          onClick={handleTalkToAugust}
        >
          Talk to august
        </button>
        <button
          type="button"
          className="tool-btn tool-btn--ghost"
          onClick={onRestart}
        >
          Start over
        </button>
      </div>

      {[
        { title: "Macronutrients", items: macros },
        { title: "Vitamins", items: vitamins },
        { title: "Minerals", items: minerals },
      ].map(({ title, items }) => (
        <div key={title} className="tool-calc-table-card">
          <span className="tool-calc-section-label">{title}</span>
          <p className="tool-calc-table-caption">
            Daily targets from the IOM / NIH Dietary Reference Intake tables.
          </p>
          <div className="tool-calc-table" role="table">
            {items.map((row) => (
              <div key={row.key} role="row" className="tool-calc-table-row">
                <div className="tool-calc-table-cell-label">
                  <span className="tool-calc-table-label">{row.label}</span>
                  <span className="tool-calc-table-helper">
                    {row.entry.isAI ? "Adequate Intake" : "RDA"}
                    {row.entry.ul != null
                      ? ` · UL ${row.entry.ul} ${row.entry.unit}`
                      : ""}
                  </span>
                </div>
                <div className="tool-calc-table-cell-value">
                  <strong>{fmtDecimal(row.entry.amount, 1)}</strong>
                  <span className="tool-calc-table-unit">{row.entry.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DriCalculator({ afterContent }: Props) {
  const [state, setState] = useState<DriFormState>(DEFAULT_STATE);
  const [submitted, setSubmitted] = useState(false);

  const { markStarted, markCompleted } = useCalculatorAnalytics("dri-calculator");

  const result = useMemo<DriResult>(
    () => (submitted ? computeDri(state) : { kind: "invalid", reason: "missing_age" }),
    [submitted, state],
  );

  const update = useCallback(
    (patch: Partial<DriFormState>) => {
      setState((prev) => ({ ...prev, ...patch }));
      markStarted();
      for (const [field, value] of Object.entries(patch)) {
        track("dri_calculator_field_change", {
          field,
          has_value: Boolean(value),
        });
      }
    },
    [markStarted],
  );

  const onUnitChange = useCallback(
    (raw: string) => {
      const next = raw as UnitSystem;
      if (next === state.unitSystem) return;
      const patch: Partial<DriFormState> = { unitSystem: next };
      if (next === "metric") {
        const feet = parseNumOrNull(state.heightFeetRaw);
        const inches = parseNumOrNull(state.heightInchesRaw) ?? 0;
        if (feet != null) patch.heightCmRaw = fmtDecimal(feetInchesToCm(feet, inches), 0);
        const lb = parseNumOrNull(state.weightLbRaw);
        if (lb != null) patch.weightKgRaw = fmtDecimal(lbsToKg(lb), 1);
      } else {
        const cm = parseNumOrNull(state.heightCmRaw);
        if (cm != null) {
          const { feet, inches } = cmToFeetInches(cm);
          patch.heightFeetRaw = String(feet);
          patch.heightInchesRaw = String(inches);
        }
        const kg = parseNumOrNull(state.weightKgRaw);
        if (kg != null) patch.weightLbRaw = fmtDecimal(kgToLbs(kg), 1);
      }
      update(patch);
    },
    [state, update],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      markStarted();
      setSubmitted(true);
    },
    [markStarted],
  );

  const handleRestart = useCallback(() => {
    trackToolEvent("dri-calculator", "cta_clicked", {
      cta_type: "start_over",
    });
    setSubmitted(false);
    setState(DEFAULT_STATE);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const showResults = submitted && result.kind === "ok";
  const resultOk = result.kind === "ok" ? result : null;
  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "dri-calculator",
    filename: resultOk
      ? `dri-calculator-${resultOk.eerKcal}kcal`
      : "dri-calculator",
    heading: "Dietary Reference Intake",
    subtitle: resultOk
      ? `DRI Report • ${resultOk.eerKcal} kcal/day`
      : "DRI Report",
    toolName: "DRI Calculator",
    maxPageHeight : 1485
  });

  useEffect(() => {
    trackToolEvent("dri-calculator", "section_completed", {
      section: showResults ? "result" : "form",
    });
  }, [showResults]);

  useEffect(() => {
    if (!submitted || result.kind !== "ok") return;
    const sig = driBucket(result);
    markCompleted(sig, {
      sex: result.sex,
      age: result.age,
      activity: result.activity,
      life_stage: result.lifeStage,
      kcal: result.eerKcal,
    });
  }, [submitted, result, markCompleted]);

  const isMetric = state.unitSystem === "metric";
  const showFemaleOnly = state.sex === "female";

  const isFormComplete = useMemo(() => {
    const ageOk = parseNumOrNull(state.ageRaw) != null;
    const heightOk = isMetric
      ? parseNumOrNull(state.heightCmRaw) != null
      : parseNumOrNull(state.heightFeetRaw) != null;
    const weightOk = isMetric
      ? parseNumOrNull(state.weightKgRaw) != null
      : parseNumOrNull(state.weightLbRaw) != null;
    return ageOk && heightOk && weightOk;
  }, [
    isMetric,
    state.ageRaw,
    state.heightCmRaw,
    state.heightFeetRaw,
    state.weightKgRaw,
    state.weightLbRaw,
  ]);

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Free <span className="accent-gradient">DRI</span> Calculator
          </>
        ),
        tagline:
          "Your personal Dietary Reference Intakes, calories, macros, vitamins, and minerals based on the IOM and NIH Office of Dietary Supplements tables.",
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <div className="tool-card tool-calc-card">
              {!showResults ? (
                <form onSubmit={handleSubmit} className="tool-calc-step-body">
                  <div className="tool-calc-step-header">
                    <h2 className="tool-step-title">Your details</h2>
                    <p className="tool-step-subtitle">
                      A few basics so we can look up the right age/sex DRI band.
                    </p>
                  </div>

                  <div className="tool-calc-form-grid">

                    {/* Units  */}
                    <div className="tool-form-group">
                      <label className="tool-form-label">Units</label>
                      <SegmentedControl
                        options={UNIT_OPTIONS}
                        value={state.unitSystem}
                        onChange={onUnitChange}
                        ariaLabel="Unit system"
                        className="tool-chip-group tool-chip-group--connected"
                        buttonClassName="tool-chip"
                        activeClassName="tool-chip--active"
                      />
                    </div>

                    {/* Sex */}
                    <div className="tool-form-group">
                      <label className="tool-form-label">Sex</label>
                      <SegmentedControl
                        options={[...SEX_OPTIONS]}
                        value={state.sex}
                        onChange={(v) =>
                          update({
                            sex: v as Sex,
                            lifeStage: v === "female" ? state.lifeStage : "none",
                          })
                        }
                        ariaLabel="Sex"
                        className="tool-chip-group tool-chip-group--connected"
                        buttonClassName="tool-chip"
                        activeClassName="tool-chip--active"
                      />
                    </div>
                    
                    {/* Height and Weight */}
                    <div className="dri-pair-row tool-calc-form-span-2">
                      {isMetric ? (
                        <>
                          <div className="tool-form-group">
                            <label
                              htmlFor="dri-height-cm"
                              className="tool-form-label"
                            >
                              Height (cm)
                            </label>
                            <input
                              id="dri-height-cm"
                              type="text"
                              inputMode="decimal"
                              className="tool-input"
                              placeholder="e.g. 165"
                              value={state.heightCmRaw}
                              onChange={(e) =>
                                update({ heightCmRaw: e.target.value })
                              }
                            />
                          </div>
                          <div className="tool-form-group">
                            <label
                              htmlFor="dri-weight-kg"
                              className="tool-form-label"
                            >
                              Weight (kg)
                            </label>
                            <input
                              id="dri-weight-kg"
                              type="text"
                              inputMode="decimal"
                              className="tool-input"
                              placeholder="e.g. 65"
                              value={state.weightKgRaw}
                              onChange={(e) =>
                                update({ weightKgRaw: e.target.value })
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="tool-form-group">
                            <label
                              className="tool-form-label"
                              htmlFor="dri-height-feet"
                            >
                              Height
                            </label>
                            <div className="tool-calc-combo-input">
                              <div className="tool-calc-combo-segment">
                                <input
                                  id="dri-height-feet"
                                  type="text"
                                  inputMode="numeric"
                                  className="tool-calc-combo-input__field"
                                  placeholder="5"
                                  aria-label="Feet"
                                  value={state.heightFeetRaw}
                                  onChange={(e) =>
                                    update({ heightFeetRaw: e.target.value })
                                  }
                                />
                                <span className="tool-calc-combo-input__suffix">
                                  ft
                                </span>
                              </div>
                              <span
                                className="tool-calc-combo-input__divider"
                                aria-hidden="true"
                              />
                              <div className="tool-calc-combo-segment">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="tool-calc-combo-input__field"
                                  placeholder="6"
                                  aria-label="Inches"
                                  value={state.heightInchesRaw}
                                  onChange={(e) =>
                                    update({ heightInchesRaw: e.target.value })
                                  }
                                />
                                <span className="tool-calc-combo-input__suffix">
                                  in
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="tool-form-group">
                            <label
                              htmlFor="dri-weight-lb"
                              className="tool-form-label"
                            >
                              Weight (lb)
                            </label>
                            <input
                              id="dri-weight-lb"
                              type="text"
                              inputMode="decimal"
                              className="tool-input"
                              placeholder="e.g. 145"
                              value={state.weightLbRaw}
                              onChange={(e) =>
                                update({ weightLbRaw: e.target.value })
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Age and Activity Level */}
                    <div className="dri-pair-row tool-calc-form-span-2">
                      <div className="tool-form-group">
                        <label
                          htmlFor="dri-activity"
                          className="tool-form-label"
                        >
                          Activity level
                        </label>
                        <select
                          id="dri-activity"
                          className="tool-input"
                          value={state.activity}
                          onChange={(e) =>
                            update({
                              activity: e.target.value as ActivityLevel,
                            })
                          }
                        >
                          {ACTIVITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <p className="dri-activity-helper">
                          {ACTIVITY_HELPER[state.activity]}
                        </p>
                      </div>
                      <div className="tool-form-group">
                        <label htmlFor="dri-age" className="tool-form-label">
                          Age (years)
                        </label>
                        <input
                          id="dri-age"
                          type="text"
                          inputMode="numeric"
                          className="tool-input"
                          placeholder="e.g. 32"
                          value={state.ageRaw}
                          onChange={(e) => update({ ageRaw: e.target.value })}
                        />
                      </div>
                    </div>

                    {showFemaleOnly && (
                      <div className="tool-form-group tool-calc-form-span-2">
                        <label
                          htmlFor="dri-life-stage"
                          className="tool-form-label"
                        >
                          Life stage
                        </label>
                        <select
                          id="dri-life-stage"
                          className="tool-input"
                          value={state.lifeStage}
                          onChange={(e) =>
                            update({ lifeStage: e.target.value as LifeStage })
                          }
                        >
                          {LIFE_STAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* <ErrorList result={result} /> */}

                  <div className="tool-calc-nav">
                    <div />
                    <button
                      type="submit"
                      className="tool-btn tool-btn--primary tool-calc-nav-btn"
                      disabled={!isFormComplete}
                    >
                      Calculate
                      <ArrowRightIcon/>
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <ResultPanel
                    result={result as DriResultOk}
                    onRestart={handleRestart}
                    resultRef={resultRef}
                    onDownload={handleDownload}
                  />
                </motion.div>
              )}
            </div>
            <p className="tl-disclaimer">
              Estimated using the Mifflin–St Jeor REE formula and the IOM / NIH
              Office of Dietary Supplements Dietary Reference Intake tables.
              For clinical nutrition planning, work with a registered dietitian.
            </p>
          </div>
{/* 
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
            <FaqAccordion faqs={FAQ_ITEMS} />
          </div> */}
        </section>
      }
      afterContent={afterContent}
    />
  );
}
