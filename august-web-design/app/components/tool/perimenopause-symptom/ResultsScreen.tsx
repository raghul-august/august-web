"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { PerimenopauseResult } from "@/app/utils/tools/perimenopause-symptom-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import { useDownloadResult } from "../shared/hooks/useDownloadResult";
import DownloadResultButton from "../shared/DownloadResultButton";

interface ResultsScreenProps {
  result: PerimenopauseResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "perimenopause-symptom",
    filename: `perimenopause-symptom-${result.tier.label}`,
    heading: "Perimenopause Symptom Result",
    subtitle: `Perimenopause Report • ${result.tier.label}`,
    toolName: "Perimenopause Symptom Test",
    maxPageHeight : 1400
  });

  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("perimenopause-symptom", "cta_clicked", {
      cta_type: "talk_to_august",
      score: result.score,
      tier: result.tier.id,
    });
    openAugustChat(
      `Hi August. I just took the perimenopause symptom quiz (Greene-style) and scored ${result.score}/${result.maxScore} (${result.tier.label}). I'd like to talk about what this means and how to advocate for myself with a clinician.`,
    );
  }, [result]);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div ref={resultRef} className="max-w-[680px] mx-auto px-5 pt-10 pb-[60px]">
          <div className="flex justify-end mb-3" data-skip-screenshot="true">
            <DownloadResultButton onClick={handleDownload} />
          </div>
          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your perimenopause score
            </p>

            <div className="flex justify-center mb-6">
              <ScoreRing
                score={result.score}
                max={result.maxScore}
                size={160}
                caption={`/ ${result.maxScore}`}
              />
            </div>

            <div className="mb-5 flex justify-center">
              <TierBadge
                label={`${result.tier.label} : ${result.tier.range}`}
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

            <div
              className="flex items-center gap-4 mt-4 mb-0 pb-0 justify-center flex-wrap"
              data-skip-screenshot="true"
            >
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
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              Where your symptoms are showing up
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              The Greene Climacteric Scale groups symptoms into five domains.
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

          {result.topSymptom && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
                What stood out
              </h3>
              <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
                The single highest-rated symptom on your inventory was &ldquo;
                {result.topSymptom.text}&rdquo;. Lead with this one when you
                talk to a clinician, it&apos;s often the wedge that opens the
                broader perimenopause conversation.
              </p>
            </motion.div>
          )}

          {/* Source + disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4" data-skip-screenshot="true">
            <p className="tl-disclaimer">
              Symptom inventory modelled on the Greene Climacteric Scale
              (Greene, Maturitas, 1998). A screening tool, not a clinical
              diagnosis.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
