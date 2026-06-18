"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "./glp1-dose-calculator.css";
import { landingStyles } from "../shared/landing-styles";
import {
  type Medication,
} from "@/app/data/tools/glp1-dose-calculator-config";
import {
  computeDose,
  type DoseResult,
} from "@/app/utils/tools/glp1-dose-compute";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import { colors } from "@/app/utils/tools/tool-colors";
import { ToolAuthGate } from "@/components/auth";

const MED_LABEL: Record<Medication, string> = {
  semaglutide: "Semaglutide",
  tirzepatide: "Tirzepatide",
};

const PLACEHOLDER_RESULT: DoseResult = {
  volumeMl: NaN,
  unitsU100: NaN,
  warnings: [],
  displayState: "invalid",
};

const CalculatorScreen = dynamic(() => import("./CalculatorScreen"), {
  ssr: false,
});
const ResultCard = dynamic(() => import("./ResultCard"), { ssr: false });
const DosingScheduleTables = dynamic(() => import("./DosingScheduleTables"));

export default function DoseCalculator({
  afterContent,
}: {
  afterContent?: React.ReactNode;
}) {
  const [medication, setMedication] = useState<Medication>("semaglutide");
  const [concentration, setConcentration] = useState<number | null>(null);
  const [dose, setDose] = useState<number | null>(null);
  const [barrelMl, setBarrelMl] = useState<0.3 | 0.5 | 1.0>(1.0);
  const [vialMl, setVialMl] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const result: DoseResult = useMemo(
    () =>
      computeDose({
        medication,
        concentration: concentration ?? NaN,
        dose: dose ?? NaN,
        barrelMl,
        vialMl: vialMl ?? undefined,
      }),
    [medication, concentration, dose, barrelMl, vialMl]
  );

  useEffect(() => {
    track("glp1_calc_viewed", {});
  }, []);

  const handleMedicationChange = useCallback((next: Medication) => {
    setMedication((prev) => {
      if (prev !== next) track("glp1_calc_med_change", { from: prev, to: next });
      return next;
    });
  }, []);

  const handleConcentrationPreset = useCallback((v: number) => {
    setConcentration(v);
    track("glp1_calc_preset_selected", { field: "conc", value: v });
  }, []);
  const handleDosePreset = useCallback((v: number) => {
    setDose(v);
    track("glp1_calc_preset_selected", { field: "dose", value: v });
  }, []);

  // First time we get a valid result, scroll the result card into view on
   // mobile so the user sees their answer (input form sits above it).
   // Latched - only fires once per page load to avoid scroll jitter as the
   // user keeps editing.
  const firstResultScrolledRef = useRef(false);
  useEffect(() => {
    if (firstResultScrolledRef.current) return;
    if (!showResults) return;
    if (result.displayState === "invalid") return;
    firstResultScrolledRef.current = true;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 959px)").matches
    ) {
      requestAnimationFrame(() => {
        document
          .querySelector(".glp1-result-card")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [showResults, result.displayState]);

  const handleRestart = useCallback(() => {
    setMedication("semaglutide");
    setConcentration(null);
    setDose(null);
    setBarrelMl(1.0);
    setVialMl(null);
    setShowResults(false);
    firstResultScrolledRef.current = false;


  }, []);

  const canCalculate = result.displayState !== "invalid";

  const handleCalculate = useCallback(() => {
    if (!canCalculate) return;
    setShowResults(true);
    trackToolEvent("glp1-dose-calculator", "completed", {
      medication,
      concentration: concentration ?? null,
      dose: dose ?? null,
      barrel_ml: barrelMl,
      vial_ml: vialMl ?? null,
      units_u100: Number.isFinite(result.unitsU100) ? result.unitsU100 : null,
      display_state: result.displayState,
    });
  }, [canCalculate, medication, concentration, dose, barrelMl, vialMl, result.unitsU100, result.displayState]);

  const handleCtaClick = useCallback((target: "consult") => {
    // track("tool_cta_clicked", { tool: "glp1-dose-calculator", target });
    trackToolEvent("glp1-dose-calculator", "cta_clicked", { target });
    const parts: string[] = [
      `Hi, I just used the GLP-1 Dose Calculator for ${MED_LABEL[medication]}.`,
    ];
    if (dose !== null && Number.isFinite(dose)) {
      parts.push(`My prescribed dose is ${dose} mg.`);
    }
    if (concentration !== null && Number.isFinite(concentration)) {
      parts.push(`The vial concentration is ${concentration} mg/mL.`);
    }
    if (Number.isFinite(result.unitsU100)) {
      const units = result.unitsU100; // already rounded in computeDose
      parts.push(`That's ${units} units on a ${barrelMl} mL U-100 syringe.`);
    }
    parts.push("Can you explain what this means?");
    openAugustChat(parts.join(" "));
  }, [medication, dose, concentration, barrelMl, result.unitsU100]);

  return (
    <>
      <div style={{ ...landingStyles.page, background: colors.bg }}>
        <section style={{ ...landingStyles.heroSection, minHeight: 0, background: colors.bg }}>
          <div
            style={{ ...landingStyles.heroOverlay, maxWidth: 1100 }}
            className="tl-hero-overlay"
          >
            <div style={landingStyles.heroCard}>
              <h1
                style={{ ...landingStyles.heroHeadline, textWrap: "balance" }}
                className="tl-hero-headline"
              >
                GLP-1 <span className="accent-gradient">Dose Calculator</span>
              </h1>
              <p style={landingStyles.heroTagline} className="tl-hero-tagline">
                Convert your prescribed mg to insulin-syringe units - instantly, privately.
              </p>
            </div>
            <div className="glp1-calc-layout" style={{ marginTop: 16 }}>
              <CalculatorScreen
                medication={medication}
                onMedicationChange={handleMedicationChange}
                concentration={concentration}
                onConcentrationChange={setConcentration}
                onConcentrationPreset={handleConcentrationPreset}
                dose={dose}
                onDoseChange={setDose}
                onDosePreset={handleDosePreset}
                barrelMl={barrelMl}
                onBarrelChange={setBarrelMl}
                vialMl={vialMl}
                onVialChange={setVialMl}
                onCalculate={handleCalculate}
                canCalculate={canCalculate}
              />
              <ResultCard
                dose={dose ?? 0}
                barrelMl={barrelMl}
                result={showResults ? result : PLACEHOLDER_RESULT}
                onCtaClick={handleCtaClick}
                onRestart={handleRestart}
              />
            </div>
          </div>
        </section>

        <hr
          style={{
            width: "80%",
            margin: "32px auto",
            borderColor: "rgba(0, 0, 0, 0.08)",
            borderTopWidth: 1,
            borderStyle: "solid",
          }}
        />

        <section className="glp1-page-content" style={{ background: colors.bg}}>
          <div style={landingStyles.contentWrapper} className="tl-content-wrapper">
            <div
              style={landingStyles.textSection}
            >
              <h2
                style={{
                  ...landingStyles.sectionHeading,
                  textAlign: "center",
                  textWrap: "balance",
                }}
                className="tl-section-heading"
              >
                Standard titration schedules
              </h2>
              <p style={landingStyles.bodyTextCenter}>
                The FDA-labeled starting schedules for semaglutide and tirzepatide - a reference, not a prescription.
              </p>
              <DosingScheduleTables />
            </div>

          </div>
        </section>

        <div style={landingStyles.contentWrapper}>
          {afterContent}
      </div>
      </div>
      <ToolAuthGate active={showResults} />
    </>
  );
}
