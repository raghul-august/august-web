"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { AceResult } from "@/app/utils/tools/ace-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: AceResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("ace-test", "cta_clicked", {
      cta_type: "talk_to_august",
      score: result.score,
      tier: result.tier.id,
    });
    openAugustChat(
      `Hi August. I just took the ACE quiz and scored ${result.score}/10 (${result.tier.label}). I'd like to talk through what that does and doesn't mean for me.`,
    );
  }, [result]);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div className="max-w-[680px] mx-auto px-5 pt-10 pb-[60px]">
          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] p-[48px_32px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your ACE score
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

          {/* Category breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              What contributed to your score
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              The ACE study groups its 10 items into three categories.
            </p>
            <ul className="flex flex-col gap-3 m-0 p-0 list-none">
              {result.breakdown.map((row) => (
                <li
                  key={row.category}
                  className="flex flex-col gap-1 pb-3 add-border-top text-[0.88rem] text-(--text-secondary) leading-[1.5]"
                >
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="font-medium text-(--text-primary)">
                      {row.label}
                    </span>
                    <span className="font-medium text-(--text-primary) tabular-nums shrink-0">
                      {row.score} / {row.max}
                    </span>
                  </div>
                  <span className="text-(--text-tertiary) text-[0.82rem]">
                    {row.description}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
              What your score does (and doesn&apos;t) mean
            </h3>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) mb-3">
              {result.tier.populationNote}
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) mb-3">
              The ACE score was designed to study population-level health
              risk. It does not measure the impact of any specific event, and
              it does not capture resilience factors like stable adult
              relationships, community, or access to mental health care.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              Many people with high ACE scores live healthy, connected lives.
              Where the score is useful is as a conversation-starter with a
              clinician about whether trauma-informed care could help.
            </p>
          </motion.div>

          {/* Source + disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              The ACE questionnaire is a research instrument, not a clinical
              diagnosis. Based on Felitti, Anda, et al., American Journal of
              Preventive Medicine, 1998.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
