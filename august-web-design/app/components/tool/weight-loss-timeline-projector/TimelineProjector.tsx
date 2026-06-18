"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./weight-loss-timeline-projector.css";
import SegmentedControl from "../shared/SegmentedControl";
import { landingStyles } from "../shared/landing-styles";
import {
  MEDICATIONS,
  MEDICATION_ORDER,
  type Medication,
} from "@/app/data/tools/weight-loss-timeline-projector-config";
import {
  computeProjection,
  type ProjectionResult,
} from "@/app/utils/tools/weight-loss-timeline-projector-compute";
import {
  fmtDecimal,
  kgToLbs,
  lbsToKg,
  parseNumOrNull,
} from "@/app/utils/tools/health-math";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import ResultBadge, { type BadgeState } from "./ResultBadge";
import ProjectionChart from "./ProjectionChart";
import MilestoneTable from "./MilestoneTable";
import CaloriePanel from "./CaloriePanel";
import { ToolAuthGate } from "@/components/auth";

// ─── Privacy-aware analytics buckets ────────────────────────────────────────

const weightBucket = (lb: number): string => {
  if (lb < 150) return "<150";
  if (lb < 200) return "150-200";
  if (lb < 250) return "200-250";
  if (lb < 300) return "250-300";
  return "300+";
};

const pctLossBucket = (p: number): string => {
  if (p < 10) return "<10";
  if (p < 15) return "10-15";
  if (p < 20) return "15-20";
  return "20+";
};

const weekBucket = (w: number): string => {
  if (w < 12) return "<12";
  if (w < 24) return "12-24";
  if (w < 48) return "24-48";
  return "48+";
};

const targetCalBucket = (c: number): string => {
  if (c < 1500) return "<1500";
  if (c < 2000) return "1500-2000";
  if (c < 2500) return "2000-2500";
  return "2500+";
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function TimelineProjector({
  afterContent,
}: {
  afterContent?: React.ReactNode;
}) {
  const [medication, setMedication] = useState<Medication>("tirzepatide");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [currentRaw, setCurrentRaw] = useState("");
  const [goalRaw, setGoalRaw] = useState("");
  const [alreadyOnMed, setAlreadyOnMed] = useState(false);
  const [weeksOnMedRaw, setWeeksOnMedRaw] = useState("");
  const [touchedGoal, setTouchedGoal] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleCalculate = useCallback(() => {
    setHasCalculated(true);
  }, []);

  const projection: ProjectionResult = useMemo(
    () =>
      computeProjection({
        medication,
        unit,
        current: parseNumOrNull(currentRaw),
        goal: parseNumOrNull(goalRaw),
        weeksOnMed: alreadyOnMed ? parseNumOrNull(weeksOnMedRaw) : null,
      }),
    [medication, unit, currentRaw, goalRaw, alreadyOnMed, weeksOnMedRaw],
  );

  // Mount tracking
  useEffect(() => {
    track("glp1_timeline_viewed", { default_med: medication });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMedicationChange = useCallback((next: Medication) => {
    setMedication((prev) => {
      if (prev !== next) track("glp1_timeline_med_change", { from: prev, to: next });
      return next;
    });
  }, []);

  const handleUnitChange = useCallback((next: "lb" | "kg") => {
    setUnit((prev) => {
      if (prev === next) return prev;
      track("glp1_timeline_unit_change", { from: prev, to: next });
      const conv = (raw: string): string => {
        const n = parseNumOrNull(raw);
        if (n == null) return raw;
        const converted = next === "kg" ? lbsToKg(n) : kgToLbs(n);
        return Number(converted.toFixed(1)).toString();
      };
      setCurrentRaw(conv);
      setGoalRaw(conv);
      return next;
    });
  }, []);

  const handleAlreadyOnMedToggle = useCallback((checked: boolean) => {
    setAlreadyOnMed(checked);
    track("glp1_timeline_already_on_med", { enabled: checked });
  }, []);

  // Fire `projection_computed` once per settled valid input set, debounced.
  const lastFiredKeyRef = useRef<string>("");
  useEffect(() => {
    if (projection.kind !== "ok") return;
    const lbCurrent = projection.unit === "lb" ? projection.current : kgToLbs(projection.current);
    const lbGoal = projection.unit === "lb" ? projection.goal : kgToLbs(projection.goal);
    const pctLoss = ((lbCurrent - lbGoal) / lbCurrent) * 100;
    const key = [
      projection.medication,
      projection.unit,
      weightBucket(lbCurrent),
      pctLossBucket(pctLoss),
      weekBucket(projection.goalWeek),
      projection.withinTrialWindow ? "in" : "ext",
    ].join("|");
    if (key === lastFiredKeyRef.current) return;
    const t = setTimeout(() => {
      track("glp1_timeline_projection_computed", {
        medication: projection.medication,
        unit: projection.unit,
        current_bucket: weightBucket(lbCurrent),
        goal_pct_loss_bucket: pctLossBucket(pctLoss),
        goal_week_bucket: weekBucket(projection.goalWeek),
        extrapolated: !projection.withinTrialWindow,
        very_early: projection.veryEarly,
        unreachable: projection.unreachable,
      });
      lastFiredKeyRef.current = key;
    }, 400);
    return () => clearTimeout(t);
  }, [projection]);

  const handleCtaClick = useCallback(() => {
    if (projection.kind !== "ok") return;
    const lbCurrent = projection.unit === "lb" ? projection.current : kgToLbs(projection.current);
    const lbGoal = projection.unit === "lb" ? projection.goal : kgToLbs(projection.goal);
    const pctLoss = ((lbCurrent - lbGoal) / lbCurrent) * 100;
    // track("tool_cta_clicked", {
    //   tool: "weight-loss-timeline-projector",
    //   medication: projection.medication,
    //   goal_week_bucket: weekBucket(projection.goalWeek),
    //   extrapolated: !projection.withinTrialWindow,
    // });
    trackToolEvent("weight-loss-timeline-projector", "cta_clicked", {
      medication: projection.medication,
      goal_week_bucket: weekBucket(projection.goalWeek),
      extrapolated: !projection.withinTrialWindow,
    });
    const med = MEDICATIONS[projection.medication];
    const weeks = Math.ceil(projection.goalWeek);
    const msg =
      `I'm considering ${med.label} for weight loss — going from ${fmtDecimal(projection.current, 1)} ${projection.unit} to ${fmtDecimal(projection.goal, 1)} ${projection.unit} ` +
      `(about ${fmtDecimal(pctLoss, 1)}% loss). Projection says ~${weeks} weeks` +
      (projection.withinTrialWindow ? "." : " (extrapolated past trial data).");
    openAugustChat(msg);
  }, [projection]);

  const med = MEDICATIONS[medication];
  const milestoneWeeks = useMemo(() => med.milestones.map((m) => m.week), [med]);

  const goalGeCurrent =
    projection.kind === "invalid" && projection.reason === "goal-ge-current";
  const weeksOutOfRange =
    projection.kind === "invalid" && projection.reason === "weeks-on-med-out-of-range";

  const badgeState: BadgeState | null = (() => {
    if (projection.kind !== "ok") return null;
    if (projection.unreachable) return "unreachable";
    if (projection.veryEarly) return "early";
    if (!projection.withinTrialWindow) return "extrapolated";
    return "achievable";
  })();

  return (
    <>
      <div style={landingStyles.page}>
        <section style={{ ...landingStyles.heroSection, minHeight: 0 }}>
          <div
            style={{ ...landingStyles.heroOverlay, maxWidth: 1100 }}
            className="tl-hero-overlay"
          >
            <div style={landingStyles.heroCard}>
              <h1
                style={{ ...landingStyles.heroHeadline, textWrap: "balance" }}
                className="tl-hero-headline"
              >
                Weight loss <span className="accent-gradient">timeline projector</span>
              </h1>
              <p style={landingStyles.heroTagline} className="tl-hero-tagline">
                See how many weeks it'll take to reach your goal weight on tirzepatide,
                semaglutide, or retatrutide — based on published clinical-trial data.
              </p>
            </div>

            <div className="wltp-layout" style={{ marginTop: 16 }}>
              {/* ── Inputs ── */}
              <form
                className="tool-card wltp-input-card"
                onSubmit={(e) => e.preventDefault()}
                aria-label="Projection inputs"
              >
                <div className="wltp-section">
                  <label className="wltp-label">Medication</label>
                  <div className="tool-chip-group" role="radiogroup" aria-label="Medication">
                    {MEDICATION_ORDER.map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={medication === m}
                        className={`tool-chip${medication === m ? " tool-chip--active" : ""}`}
                        onClick={() => handleMedicationChange(m)}
                      >
                        {MEDICATIONS[m].label}
                      </button>
                    ))}
                  </div>
                  <p className="wltp-trial-source">
                    {med.brand} · {med.trialSource}
                  </p>
                </div>

                <div className="wltp-section">
                  <label className="wltp-label">Units</label>
                  <SegmentedControl
                    ariaLabel="Weight unit"
                    options={[
                      { value: "lb", label: "lb" },
                      { value: "kg", label: "kg" },
                    ]}
                    value={unit}
                    onChange={(v) => handleUnitChange(v as "lb" | "kg")}
                    className="tool-chip-group"
                    buttonClassName="tool-chip"
                    activeClassName="tool-chip--active"
                  />
                </div>

                <div className="wltp-section wltp-row-2">
                  <div>
                    <label className="wltp-label">Current weight ({unit})</label>
                    <input
                      className="tool-input"
                      inputMode="decimal"
                      placeholder={unit === "lb" ? "220" : "100"}
                      value={currentRaw}
                      onChange={(e) => setCurrentRaw(e.target.value)}
                      aria-label={`Current weight in ${unit}`}
                    />
                  </div>
                  <div>
                    <label className="wltp-label">Goal weight ({unit})</label>
                    <input
                      className="tool-input"
                      inputMode="decimal"
                      placeholder={unit === "lb" ? "170" : "77"}
                      value={goalRaw}
                      onChange={(e) => setGoalRaw(e.target.value)}
                      onBlur={() => setTouchedGoal(true)}
                      aria-invalid={touchedGoal && goalGeCurrent}
                      aria-label={`Goal weight in ${unit}`}
                    />
                    {touchedGoal && goalGeCurrent && (
                      <div className="wltp-help wltp-help--error">
                        Goal weight should be lower than current.
                      </div>
                    )}
                  </div>
                </div>

                <div className="wltp-section">
                  <label className="wltp-checkbox-row">
                    <input
                      type="checkbox"
                      checked={alreadyOnMed}
                      onChange={(e) => handleAlreadyOnMedToggle(e.target.checked)}
                    />
                    I'm already on this medication
                  </label>
                  {alreadyOnMed && (
                    <div style={{ marginTop: 10 }}>
                      <label className="wltp-label">Weeks on medication</label>
                      <input
                        className="tool-input"
                        inputMode="numeric"
                        placeholder={`0 – ${med.maxWeek}`}
                        value={weeksOnMedRaw}
                        onChange={(e) => setWeeksOnMedRaw(e.target.value)}
                        aria-invalid={weeksOutOfRange}
                        aria-label="Weeks on medication"
                      />
                      {weeksOutOfRange && (
                        <div className="wltp-help wltp-help--error">
                          Enter a number between 0 and {med.maxWeek}.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!hasCalculated && (
                  <div className="wltp-section" style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      type="button"
                      className="tool-btn tool-btn--primary"
                      onClick={handleCalculate}
                      disabled={projection.kind !== "ok"}
                      style={projection.kind !== "ok" ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                    >
                      Calculate
                    </button>
                  </div>
                )}
              </form>

              {/* ── Result card ── */}
              {hasCalculated && (
              <div className="tool-card wltp-result">
                {projection.kind !== "ok" ? (
                  <div className="wltp-empty">
                    Enter your current and goal weight to see your timeline.
                  </div>
                ) : (
                  <>
                    {badgeState && <ResultBadge state={badgeState} />}
                    <h2 className="wltp-headline">
                      {projection.unreachable
                        ? "Not realistically reachable"
                        : `~${Math.ceil(projection.goalWeek)} weeks`}
                    </h2>
                    <p className="wltp-subheadline">
                      {projection.unreachable
                        ? "The goal lies past the realistic projection range for this medication. Consider talking with a clinician about a more achievable target."
                        : `to lose ${fmtDecimal(projection.current - projection.goal, 1)} ${projection.unit} on ${med.label}.`}
                    </p>

                    <button
                      type="button"
                      className="tool-btn tool-btn--primary wltp-cta"
                      onClick={handleCtaClick}
                    >
                      Talk to august about this plan
                    </button>

                    <ProjectionChart
                      weeks={projection.weeks}
                      goalWeek={projection.goalWeek}
                      goal={projection.goal}
                      baseline={projection.baselineWeight}
                      unit={projection.unit}
                      maxWeek={med.maxWeek}
                      milestoneWeeks={milestoneWeeks}
                      extrapolated={!projection.withinTrialWindow}
                      weeksOnMed={projection.weeksOnMed}
                      unreachable={projection.unreachable}
                    />

                    <div style={{ marginTop: 16 }}>
                      <MilestoneTable
                        rows={projection.milestoneRows}
                        unit={projection.unit}
                      />
                    </div>
                  </>
                )}
              </div>
              )}
            </div>

            {hasCalculated && projection.kind === "ok" && !projection.unreachable && (
              <CaloriePanel
                medication={medication}
                unit={unit}
                weight={parseNumOrNull(currentRaw)}
                onOpenedFirstTime={() =>
                  track("glp1_timeline_calorie_panel_opened", { medication })
                }
                onComputed={(r) => {
                  if (r.kind === "ok") {
                    track("glp1_timeline_calorie_computed", {
                      medication,
                      deficit_pct: r.deficitPct,
                      target_cal_bucket: targetCalBucket(r.targetCalories),
                    });
                  }
                }}
              />
            )}
          </div>
        </section>

        <section
          className="wltp-page-content"
          style={landingStyles.contentSection}
        >
          <div style={landingStyles.contentWrapper} className="tl-content-wrapper">
            <p
              style={{
                margin: "16px auto 0",
                maxWidth: 640,
                fontSize: 12,
                lineHeight: 1.55,
                color: "var(--text-tertiary)",
                textAlign: "center",
              }}
            >
              Educational projection only. Not a prescription, dosing recommendation, or
              weight-loss plan. Talk to a clinician about whether GLP-1 therapy is right
              for you.
            </p>
          </div>
        </section>

        {afterContent && (
          <div className="tool-landing-content-wrap">
            {afterContent}
          </div>
        )}
      </div>

      <ToolAuthGate active={hasCalculated && projection.kind === "ok"} />
    </>
  );
}
