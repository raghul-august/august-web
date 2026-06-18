"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { CompatibilityResult } from "@/app/utils/tools/compatibility-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import { ToolAuthGate } from "@/components/auth";

interface ResultsScreenProps {
  result: CompatibilityResult;
  nameA: string;
  nameB: string;
  onRestart: () => void;
}

function tierTone(tone: CompatibilityResult["tier"]["tone"]): string {
  return `compat-tier-pill--${tone}`;
}

export default function ResultsScreen({
  result,
  nameA,
  nameB,
  onRestart,
}: ResultsScreenProps) {
  const safeA = nameA || "You";
  const safeB = nameB || "Your partner";

  const handleTalkToAugust = useCallback(() => {
    // track("tool_cta_clicked", {
    //   tool: "compatibility-test",
    //   cta_type: "talk_to_august",
    //   tier: result.tier.id,
    //   percent: result.percent,
    // });
    trackToolEvent("compatibility-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      percent: result.percent,
    });
    openAugustChat(
      `Hi, I just took the Love Compatibility Test for ${safeA} and ${safeB} and scored ${result.percent}% (${result.tier.label}). I'd like to talk about what this means.`,
    );
  }, [result, safeA, safeB]);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-[var(--surface-subtle)] to-(--brand-subtle)/40">
        <div className="max-w-[640px] mx-auto px-5 pt-10 pb-[60px]">
          {/* Headline score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] p-[48px_32px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1.1rem] font-medium text-[var(--text-tertiary)] tracking-[0.08em] mb-2 uppercase">
              {safeA} &amp; {safeB}
            </p>
            <p className="text-[0.85rem] text-[var(--text-tertiary)] mb-5">
              Compatibility score
            </p>

            <div className="flex justify-center mb-6">
              <ScoreRing
                score={result.percent}
                max={100}
                size={160}
                caption="/ 100"
              />
            </div>

            <div className="mb-4 flex justify-center">
              <TierBadge
                label={`${result.tier.label} : ${result.tier.range}`}
                tone={getBadgeTone(result.tier.badge)}
                size="md"
              />
            </div>

            <p className="text-base leading-[1.65] text-[var(--text-primary)] font-medium mb-2 text-[1.1rem]">
              {result.tier.headline(safeA, safeB)}
            </p>
            <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] max-w-[520px] mx-auto">
              {result.tier.description(safeA, safeB)}
            </p>

            <div className="flex items-center justify-center gap-4 mt-5 mb-0 pb-0">
              <button
                type="button"
                className="tool-btn tool-btn--primary mb-0"
                onClick={handleTalkToAugust}
              >
                Talk to august
              </button>
              <button
                type="button"
                className="tool-btn tool-btn--ghost mb-0"
                onClick={onRestart}
              >
                Start over
              </button>
            </div>
          </motion.div>

          {/* Dimension breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.125rem] font-medium text-(--text-primary) mb-2">
              Your dimension breakdown
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-normal">
              Each dimension is scored from your answers to three statements.
              The lowest one is usually where your next conversation belongs.
            </p>
            <div className="flex flex-col">
              {result.dimensions.map((dim) => (
                <div key={dim.id} className="compat-dim-row">
                  <div className="compat-dim-header">
                    <span className="compat-dim-label">{dim.label}</span>
                    <span className="compat-dim-percent">{dim.percent}%</span>
                  </div>
                  <div
                    className="compat-dim-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={dim.percent}
                    aria-label={`${dim.label} score`}
                  >
                    <div
                      className="compat-dim-fill"
                      style={{ width: `${dim.percent}%` }}
                    />
                  </div>
                  <p className="compat-dim-helper">{dim.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top + bottom highlights */}
          {result.topDimension && result.bottomDimension && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
                Where to lean in
              </h3>
              <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] mb-3">
                <strong>Strength —</strong> {safeA} and {safeB} are at their
                strongest in <strong>{result.topDimension.label.toLowerCase()}</strong>{" "}
                ({result.topDimension.percent}%). Keep doing whatever you&apos;re
                already doing here; it&apos;s the easiest base to build the rest from.
              </p>
              <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] m-0">
                <strong>Growth edge —</strong> The lowest dimension is{" "}
                <strong>{result.bottomDimension.label.toLowerCase()}</strong> at{" "}
                {result.bottomDimension.percent}%. That&apos;s the area where small,
                deliberate changes tend to move the overall score the most.
              </p>
            </motion.div>
          )}

          {/* What to do next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
              What to do next
            </h3>
            <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] mb-3">
              This test is a snapshot, not a forecast, decades of research show
              that how couples handle communication and repair after conflict
              matters more than any single compatibility number. The most useful
              next step is usually to retake it together: have your partner do
              it on their own first, then compare the dimensions where your
              answers diverged most.
            </p>
            <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] m-0">
              If a dimension keeps coming up sore, an in-person couples therapist
               or a guided conversation with August, can help unpack the
              pattern without it turning into another fight.
            </p>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.75rem] leading-[1.6] text-[var(--text-tertiary)] opacity-80 max-w-[520px] mx-auto px-4">
            Educational self-reflection only. Not a clinical assessment, not
            relationship advice, and not a substitute for couples therapy.
            Names you enter stay in your browser.
          </div>
        </div>
      </div>

      <ToolAuthGate active />
    </QuizContainer>
  );
}
