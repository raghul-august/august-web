"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ACTIVITY_OPTIONS,
  type ActivityKey,
  type Medication,
} from "@/app/data/tools/weight-loss-timeline-projector-config";
import {
  computeCalorieTargets,
  type CalorieResult,
} from "@/app/utils/tools/weight-loss-timeline-projector-compute";
import { fmtInt, parseNumOrNull } from "@/app/utils/tools/health-math";
import SegmentedControl from "@/app/components/tool/shared/SegmentedControl";

type Props = {
  medication: Medication;
  unit: "lb" | "kg";
  weight: number | null;
  onOpenedFirstTime?: () => void;
  onComputed?: (result: CalorieResult) => void;
};

export default function CaloriePanel({
  medication,
  unit,
  weight,
  onOpenedFirstTime,
  onComputed,
}: Props) {
  const [open, setOpen] = useState(false);
  const [heightUnit, setHeightUnit] = useState<"ftin" | "cm">("ftin");
  const [feetRaw, setFeetRaw] = useState("");
  const [inchesRaw, setInchesRaw] = useState("");
  const [cmRaw, setCmRaw] = useState("");
  const [ageRaw, setAgeRaw] = useState("");
  const [sex, setSex] = useState<"male" | "female">("female");
  const [activity, setActivity] = useState<ActivityKey>("moderate");

  const result = useMemo(
    () =>
      computeCalorieTargets({
        medication,
        unit,
        weight,
        heightUnit,
        heightFeet: parseNumOrNull(feetRaw),
        heightInches: parseNumOrNull(inchesRaw),
        heightCm: parseNumOrNull(cmRaw),
        age: parseNumOrNull(ageRaw),
        sex,
        activity,
      }),
    [medication, unit, weight, heightUnit, feetRaw, inchesRaw, cmRaw, ageRaw, sex, activity],
  );

  const openedFiredRef = useRef(false);
  const computedFiredRef = useRef(false);

  useEffect(() => {
    if (open && !openedFiredRef.current) {
      openedFiredRef.current = true;
      onOpenedFirstTime?.();
    }
  }, [open, onOpenedFirstTime]);

  useEffect(() => {
    if (result.kind === "ok" && !computedFiredRef.current) {
      computedFiredRef.current = true;
      onComputed?.(result);
    }
  }, [result, onComputed]);

  return (
    <details
      className="tool-card wltp-details"
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary>
        <span>Personalized calorie & macro targets</span>
        <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>
          Optional
        </span>
      </summary>

      <div className="wltp-details-body">
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.55,
          }}
        >
          Add a few details and we&apos;ll estimate your daily calorie target on{" "}
          {medication}. Uses Mifflin–St Jeor for BMR, your activity level for
          TDEE, and a medication-class deficit (about 25% on tirzepatide and
          retatrutide, 20% on semaglutide).
        </p>

        <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
          {/* Height */}
          <div>
            <label className="wltp-label">Height</label>
            <div style={{ marginBottom: 8 }}>
              <SegmentedControl
                ariaLabel="Height unit"
                options={[
                  { value: "ftin", label: "ft / in" },
                  { value: "cm", label: "cm" },
                ]}
                value={heightUnit}
                onChange={(v) => setHeightUnit(v as "ftin" | "cm")}
                className="tool-chip-group"
                buttonClassName="tool-chip"
                activeClassName="tool-chip--active"
              />
            </div>
            {heightUnit === "ftin" ? (
              <div className="wltp-row-2">
                <input
                  className="tool-input"
                  inputMode="numeric"
                  placeholder="Feet"
                  value={feetRaw}
                  onChange={(e) => setFeetRaw(e.target.value)}
                  aria-label="Height in feet"
                />
                <input
                  className="tool-input"
                  inputMode="numeric"
                  placeholder="Inches"
                  value={inchesRaw}
                  onChange={(e) => setInchesRaw(e.target.value)}
                  aria-label="Height in inches"
                />
              </div>
            ) : (
              <input
                className="tool-input"
                inputMode="numeric"
                placeholder="cm"
                value={cmRaw}
                onChange={(e) => setCmRaw(e.target.value)}
                aria-label="Height in cm"
              />
            )}
          </div>

          {/* Age */}
          <div>
            <label className="wltp-label">Age</label>
            <input
              className="tool-input"
              inputMode="numeric"
              placeholder="years"
              value={ageRaw}
              onChange={(e) => setAgeRaw(e.target.value)}
              aria-label="Age in years"
            />
          </div>

          {/* Sex */}
          <div>
            <label className="wltp-label">Sex</label>
            <div className="tool-chip-group" role="radiogroup" aria-label="Sex">
              {(["female", "male"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={sex === s}
                  className={`tool-chip${sex === s ? " tool-chip--active" : ""}`}
                  onClick={() => setSex(s)}
                >
                  {s === "female" ? "Female" : "Male"}
                </button>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div>
            <label className="wltp-label">Activity level</label>
            <div className="tool-chip-group" role="radiogroup" aria-label="Activity level">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  role="radio"
                  aria-checked={activity === opt.key}
                  title={opt.description}
                  className={`tool-chip${activity === opt.key ? " tool-chip--active" : ""}`}
                  onClick={() => setActivity(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {result.kind === "ok" && (
          <div style={{ marginTop: 20 }}>
            <div className="wltp-stat-grid">
              <div className="wltp-stat">
                <div className="wltp-stat-label">BMR</div>
                <div className="wltp-stat-value">{fmtInt(result.bmr)}</div>
                <div className="wltp-stat-unit">kcal/day</div>
              </div>
              <div className="wltp-stat">
                <div className="wltp-stat-label">TDEE</div>
                <div className="wltp-stat-value">{fmtInt(result.tdee)}</div>
                <div className="wltp-stat-unit">kcal/day</div>
              </div>
              <div className="wltp-stat">
                <div className="wltp-stat-label">Target</div>
                <div className="wltp-stat-value">{fmtInt(result.targetCalories)}</div>
                <div className="wltp-stat-unit">kcal/day</div>
              </div>
            </div>

            <div className="wltp-macro-grid">
              <div className="wltp-macro">
                <div className="wltp-macro-label">Protein</div>
                <div className="wltp-macro-value">{result.proteinG}g</div>
              </div>
              <div className="wltp-macro">
                <div className="wltp-macro-label">Carbs</div>
                <div className="wltp-macro-value">{result.carbsG}g</div>
              </div>
              <div className="wltp-macro">
                <div className="wltp-macro-label">Fat</div>
                <div className="wltp-macro-value">{result.fatG}g</div>
              </div>
            </div>

            <p
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "var(--text-tertiary)",
                textAlign: "center",
              }}
            >
              30% protein / 40% carbs / 30% fat of {fmtInt(result.targetCalories)} kcal
              · about a {fmtInt(result.deficit)} kcal/day deficit
              {result.flooredAt1200 ? " (floored at 1,200 kcal)" : ""}
            </p>
          </div>
        )}
      </div>
    </details>
  );
}
