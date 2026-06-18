"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import { BPD_OPTIONS } from "@/app/data/tools/borderline-personality-test-questions";
import type { BpdResult } from "@/app/utils/tools/borderline-personality-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import { ToolAuthGate } from "@/components/auth";

interface ResultsScreenProps {
  result: BpdResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    // track("tool_cta_clicked", {
    //   tool: "borderline-personality-test",
    //   cta_type: "talk_to_august",
    //   tier: result.tier.id,
    //   score: result.score,
    // });
    trackToolEvent("borderline-personality-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      score: result.score,
    });
    openAugustChat(
      `Hi, I just took the Borderline Personality Disorder Test and scored ${result.score}/${result.maxScore} (${result.tier.label}). I'd like to talk about what this means and what to do next.`,
    );
  }, [result]);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-[var(--surface-subtle)] to-(--brand-subtle)/40">
        <div className="max-w-[640px] mx-auto px-5 pt-10 pb-[60px]">
          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] p-[48px_32px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-[var(--text-tertiary)] tracking-[0.08em] mb-5 uppercase">
              Your BPD trait score
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

            <p className="text-base leading-[1.65] text-[var(--text-primary)] font-medium mb-2 text-[1.1rem]">
              {result.tier.headline}
            </p>
            <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] max-w-[520px] mx-auto">
              {result.tier.description}
            </p>

            <div className="flex items-center justify-center gap-4 mt-4 mb-0 pb-0">
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

          {/* Top domains */}
          {result.topDomains.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-(--text-primary) mb-2">
                Statements you related to most
              </h3>
              <p className="text-[0.95rem] text-(--text-tertiary) mb-4 leading-normal">
                The items that contributed most to your score. These are the
                experiences worth raising first with a therapist if you decide to
                seek one.
              </p>
              <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
                {result.topDomains.map((row) => {
                  const matchedOption = BPD_OPTIONS.find(
                    (o) => o.value === row.value,
                  );
                  return (
                    <li
                      key={row.id}
                      className="flex justify-between gap-3 items-start p-[12px_14px] text-[0.85rem] quiz-row-border text-[var(--text-secondary)] leading-[1.5]"
                    >
                      <span className="text-[0.85rem]">{row.text}</span>
                      <span className="text-[0.7rem] font-semibold text-[var(--brand-primary)] uppercase tracking-[0.06em] whitespace-nowrap pt-[2px] shrink-0">
                        {matchedOption?.label ?? ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}

          {/* What to do next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
              What to do next
            </h3>
            <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] mb-6">
              BPD cannot be diagnosed from a 20-question self-test — only a
              qualified clinician can do that. But the patterns this test
              surfaces are real and treatable. Dialectical behaviour therapy
              (DBT), mentalization-based therapy (MBT), and schema therapy all
              have strong evidence for BPD and BPD-like presentations. If you
              want to talk through what your results mean and figure out a next
              step that actually fits your life, chat with August.
            </p>
          </motion.div>

          {/* Crisis disclaimer */}
          <div className="text-center text-[0.75rem] leading-[1.6] text-[var(--text-tertiary)] opacity-80 max-w-[520px] mx-auto px-4">
            Educational self-assessment only. Not a clinical diagnosis and not a
            replacement for professional mental health advice. If you are in
            crisis or thinking about self-harm or suicide, call or text{" "}
            <strong>988</strong> (US Suicide and Crisis Lifeline) or text{" "}
            <strong>HOME to 741741</strong>.
          </div>
        </div>
      </div>

      <ToolAuthGate active />
    </QuizContainer>
  );
}
