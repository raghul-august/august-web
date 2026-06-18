"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { CeliacResult } from "@/app/utils/tools/celiac-disease-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: CeliacResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("celiac-disease", "cta_clicked", {
      cta_type: "talk_to_august",
      score: result.score,
      tier: result.tier.id,
    });
    openAugustChat(
      `Hi August. I just took the celiac disease symptom checklist and scored in the "${result.tier.label}" range. I'd like to talk through what testing involves and how to bring this up with my doctor.`,
    );
  }, [result]);

  const scorePercent = Math.round((result.score / result.maxScore) * 100);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div className="max-w-[680px] mx-auto px-5 pt-10 pb-[60px]">
          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your celiac symptom profile
            </p>

            <div className="flex justify-center mb-6">
              <ScoreRing
                score={scorePercent}
                max={100}
                size={160}
                caption="% of max"
              />
            </div>

            <div className="mb-5 flex justify-center">
              <TierBadge
                label={`${result.tier.label}`}
                tone={getBadgeTone(result.tier.badge)}
                size="md"
              />
            </div>

            <p className="text-base leading-[1.65] text-(--text-primary) font-medium mb-2 text-[1.1rem]">
              {result.tier.headline}
            </p>
            <p className="text-[0.85rem] leading-[1.7] text-(--text-secondary) max-w-140 mx-auto">
              {result.tier.description}
            </p>

            <div className="flex items-center gap-4 mt-4 mb-0 pb-0 justify-center flex-wrap">
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

          {/* Domain breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              Where your symptoms cluster
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              Bring this breakdown to your appointment, it makes the conversation faster and more specific.
            </p>
            <ul className="flex flex-col gap-3 m-0 p-0 list-none">
              {result.breakdown.map((row) => {
                const pct = row.max === 0 ? 0 : Math.round((row.score / row.max) * 100);
                return (
                  <li key={row.domain} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline gap-3 text-[0.88rem]">
                      <span className="font-medium text-(--text-primary)">
                        {row.label}
                      </span>
                      <span className="text-(--text-secondary) tabular-nums shrink-0">
                        {row.score} / {row.max}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 999,
                        background: "var(--surface-subtle)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "var(--brand-primary)",
                          transition: "width 600ms ease",
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>

           {/* Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              What to do next
            </h3>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              {result.tier.recommendation}
            </p>
          </motion.div>

          {result.highRiskFlags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="bg-[var(--brand-subtle)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-2">
                Risk markers worth mentioning explicitly
              </h3>
              <ul className="flex flex-col gap-2 m-0 p-0 list-disc list-inside text-[0.88rem] text-(--text-secondary)">
                {result.highRiskFlags.map((flag) => (
                  <li key={flag.id}>{flag.text}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Source + disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              A screening checklist, not a clinical diagnosis. Celiac disease is
              diagnosed via blood tests and small-bowel biopsy by a qualified
              clinician.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
