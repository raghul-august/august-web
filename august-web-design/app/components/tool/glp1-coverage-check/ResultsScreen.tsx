"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type {
  GLP1CoverageResult,
  MedicationCoverageStatus,
} from "@/app/utils/tools/glp1-coverage-scoring";
import type { GLP1Answers } from "@/app/data/tools/glp1-coverage-questions";
import MedicationCard from "./MedicationCard";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import { landingStyles } from "../shared/landing-styles";
import { colors } from "@/app/utils/tools/tool-colors";
import { useDownloadResult } from "../shared/hooks/useDownloadResult";
import DownloadResultButton from "../shared/DownloadResultButton";

const PAGE_BG = colors.bg;

const ShareSheet = dynamic(() => import("../shared/ShareSheet"), { ssr: false });

interface ResultsScreenProps {
  result: GLP1CoverageResult;
  answers: GLP1Answers;
  onRestart: () => void;
}

// Age from MM-YYYY. Approximates with the birth month (no day precision).
function ageFromDob(dob?: string): number | null {
  if (!dob || typeof dob !== "string") return null;
  const m = /^(\d{2})-(\d{4})$/.exec(dob);
  if (!m) return null;
  const month = parseInt(m[1], 10);
  const year = parseInt(m[2], 10);
  const now = new Date();
  let age = now.getFullYear() - year;
  if (now.getMonth() + 1 < month) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

const CURRENT_MED_LABEL: Record<string, string> = {
  currently: "Currently taking",
  previously: "Previously tried",
  never: "None",
};

const TIER_HEADLINE: Record<string, string> = {
  strong: "You're well-positioned for GLP-1 coverage.",
  good: "You have good signs for GLP-1 coverage.",
  requires_steps: "Coverage is possible with a few steps first.",
  unlikely: "Coverage may be harder to secure right now.",
  medical_review: "Talk to a provider before next steps.",
};

const bmiFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const STATUS_RANK: Record<MedicationCoverageStatus, number> = {
  likely: 3,
  possible: 2,
  unlikely: 1,
  not_recommended: 0,
};

export default function ResultsScreen({ result, answers, onRestart }: ResultsScreenProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareRequested, setShareRequested] = useState(false);
  const shareOpenerRef = useRef<HTMLButtonElement | null>(null);

  const shareUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/tool/glp1-coverage-check?tier=${result.overallTier.tier}`;
  const shareText = `I just checked my GLP-1 insurance coverage - ${result.overallTier.title}. Check yours at`;

  const handleShare = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      track("glp1_result_shared", { tier: result.overallTier.tier });
      shareOpenerRef.current = e.currentTarget;
      setShareRequested(true);
      setShareOpen(true);
    },
    [result.overallTier.tier]
  );

  const handleCloseShare = useCallback(() => {
    setShareOpen(false);
    setTimeout(() => shareOpenerRef.current?.focus(), 0);
  }, []);

  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "glp1-coverage-check",
    filename: `glp1-coverage-${result.overallTier.tier}`,
    heading: "GLP-1 Coverage Check Result",
    subtitle: `Coverage Outlook • ${result.overallTier.title}`,
    toolName: "GLP-1 Coverage Check",
     maxPageHeight : 1350
  });

  const handleAugust = useCallback(() => {
    const parts: string[] = ["Hi, I just completed the GLP-1 Coverage Check."];
    if (result.overallTier?.title) {
      parts.push(`My coverage outlook is "${result.overallTier.title}".`);
    }
    if (Number.isFinite(result.bmi) && result.bmi > 0) {
      const bmiText = bmiFormatter.format(result.bmi);
      parts.push(
        result.bmiCategory
          ? `My BMI is ${bmiText} (${result.bmiCategory}).`
          : `My BMI is ${bmiText}.`
      );
    }
    const topMed = [...(result.medications ?? [])].sort((a, b) => {
      const r = STATUS_RANK[b.coverageStatus] - STATUS_RANK[a.coverageStatus];
      if (r !== 0) return r;
      return Number(b.featured) - Number(a.featured);
    })[0];
    if (topMed?.name) {
      parts.push(
        `My strongest medication match is ${topMed.name} (${topMed.coverageStatus.replace(
          "_",
          " "
        )}).`
      );
    }
    if (result.hasContraindications) {
      parts.push("I may have a medical contraindication worth reviewing.");
    }
    parts.push("Can you help me understand my options?");

    // track("tool_cta_clicked", {
    //   tool: "glp1-coverage-check",
    //   tier: result.overallTier?.tier ?? "",
    //   bmi: Number.isFinite(result.bmi) ? result.bmi : 0,
    // });
    trackToolEvent("glp1-coverage-check", "cta_clicked", {
      tier: result.overallTier?.tier ?? "",
      bmi: Number.isFinite(result.bmi) ? result.bmi : 0,
    });
    openAugustChat(parts.join(" "));
  }, [result]);

  const age = ageFromDob(typeof answers.dob === "string" ? answers.dob : undefined);
  const goalWeight = typeof answers.goal_weight === "number" ? answers.goal_weight : null;
  const currentMedKey =
    typeof answers.weight_loss_med === "string" ? answers.weight_loss_med : null;
  const currentMedLabel = currentMedKey
    ? CURRENT_MED_LABEL[currentMedKey] ?? null
    : null;

  return (
    <>
      <div style={{ ...landingStyles.page, background: PAGE_BG }}>
        <section
          style={{
            ...landingStyles.heroSection,
            minHeight: 0,
            background: PAGE_BG,
          }}
        >
          <div
            ref={resultRef}
            style={{ ...landingStyles.heroOverlay, maxWidth: 880 }}
            className="tl-hero-overlay"
          >
            <div
              className="flex justify-end mb-3"
              data-skip-screenshot="true"
            >
              <DownloadResultButton onClick={handleDownload} />
            </div>
            {/* Profile hero strip - composed summary of stats + verdict. */}
            <section className="glp1-profile-hero" aria-label="Your profile at a glance">
              <div className="glp1-profile-hero-stats">
                <div>
                  <div className="glp1-profile-hero-stat-label">BMI</div>
                  <div className="glp1-profile-hero-stat-value">
                    {bmiFormatter.format(result.bmi)}
                    <span className="text-[12px] text-[var(--text-secondary)] ml-[6px] tracking-[0] font-medium">
                      {result.bmiCategory}
                    </span>
                  </div>
                </div>
                {age !== null && (
                  <div>
                    <div className="glp1-profile-hero-stat-label">Age</div>
                    <div className="glp1-profile-hero-stat-value">{age}</div>
                  </div>
                )}
                {currentMedLabel && (
                  <div>
                    <div className="glp1-profile-hero-stat-label">Weight-loss med</div>
                    <div
                      className="glp1-profile-hero-stat-value text-[clamp(16px,2vw,18px)]"
                    >
                      {currentMedLabel}
                    </div>
                  </div>
                )}
                {goalWeight !== null && (
                  <div>
                    <div className="glp1-profile-hero-stat-label">Goal</div>
                    <div className="glp1-profile-hero-stat-value">
                      {goalWeight}
                      <span className="text-[12px] text-[var(--text-secondary)] ml-1 font-medium">
                        lbs
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="glp1-profile-hero-verdict">
                <div className="glp1-profile-hero-verdict-cap">Coverage outlook</div>
                <div className="glp1-profile-hero-verdict-word">
                  <span className="accent-gradient">{result.overallTier.title}</span>
                </div>
              </div>
            </section>

            {/* CTA right under the hero strip - visible before any scrolling. */}
            <div className="mt-6 flex flex-wrap gap-3 items-center" data-skip-screenshot="true">
              <button className="glp1-btn-primary" onClick={handleAugust}>
                Talk to August
              </button>
              <span className="text-[13px] text-[var(--text-secondary)]">
                {TIER_HEADLINE[result.overallTier.tier]}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 48,
                marginTop: 48,
              }}
            >
            {result.hasContraindications && (
              <div
                role="alert"
                className="bg-[rgba(220,80,60,0.08)] border border-[rgba(220,80,60,0.24)] rounded-[8px] px-[18px] py-[14px] text-[14px] text-[var(--glp1-error)] leading-[1.5]"
              >
                We spotted a possible medical contraindication - please review with your
                provider before starting a GLP-1.
              </div>
            )}

            <div>
              <h3 className="text-[18px] font-medium text-[#1C1917] mt-0 mb-2">
                Medication coverage
              </h3>
              <div>
                {result.medications.map((med) => (
                  <MedicationCard key={med.name} medication={med} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[18px] font-medium text-[#1C1917] mt-0 mb-4">
                Key factors
              </h3>
              <div className="glp1-factors-grid">
                <div className="glp1-factor-col glp1-factor-col--favor">
                  <h4>In your favor</h4>
                  <ul>
                    {result.helpingFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                    {result.helpingFactors.length === 0 && (
                      <li className="text-[#767f7c]">
                        No strong positive signals yet.
                      </li>
                    )}
                  </ul>
                </div>
                <div className="glp1-factor-col glp1-factor-col--concern">
                  <h4>Worth considering</h4>
                  <ul>
                    {result.complicatingFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                    {result.complicatingFactors.length === 0 && (
                      <li className="text-[#767f7c]">
                        No specific complications flagged.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {result.recommendations.length > 0 && (
              <div>
                <h3 className="text-[18px] font-medium text-[#1C1917] mt-0 mb-4">
                  Next steps
                </h3>
                <ol className="list-none p-0 m-0 flex flex-col gap-[10px]">
                  {result.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[14px] text-[var(--text-secondary)] leading-[1.6]"
                    >
                      <span className="font-medium text-[var(--brand-primary)] min-w-[20px] tabular-nums">
                        {i + 1}.
                      </span>
                      {rec}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="pt-6 border-t border-[#E8EAE8] flex flex-wrap gap-4 items-center justify-between" data-skip-screenshot="true">
              <p className="text-[12px] text-[#767f7c] leading-[1.6] m-0 max-w-[520px]">
                This is an educational estimate, not a guarantee of insurance coverage.
                Verify with your insurer and a healthcare provider.
              </p>
              <div className="flex gap-2">
                <button className="glp1-btn-ghost" onClick={onRestart}>
                  Retake
                </button>
                <button
                  className="glp1-btn-ghost"
                  onClick={handleShare}
                  aria-haspopup="dialog"
                  aria-expanded={shareOpen}
                >
                  Share
                </button>
              </div>
            </div>
            </div>
          </div>
        </section>
      </div>

      {shareRequested && (
        <div
          aria-modal={shareOpen || undefined}
          role={shareOpen ? "dialog" : undefined}
          aria-label="Share your result"
        >
          <ShareSheet
            isOpen={shareOpen}
            onClose={handleCloseShare}
            shareUrl={shareUrl}
            shareText={shareText}
          />
        </div>
      )}
    </>
  );
}
