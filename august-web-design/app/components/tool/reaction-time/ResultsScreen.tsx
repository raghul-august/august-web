"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { ReactionTimeResult } from "@/app/utils/tools/reaction-time-scoring";
import { REACTION_TIME_TIERS } from "@/app/data/tools/reaction-time-config";
import QuizContainer from "../shared/QuizContainer";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: ReactionTimeResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("reaction-time", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      average_ms: result.averageMs,
    });
    openAugustChat(
      `Hi, I just took the reaction time test and averaged ${result.averageMs} ms across ${result.trials.length} trials (best: ${result.bestMs} ms). What does this say about my reflexes, and are there ways to improve?`,
    );
  }, [result]);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div className="max-w-[640px] mx-auto px-5 pt-10 pb-[60px]">
          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] p-[48px_32px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-4 uppercase">
              Your average reaction time
            </p>

            <div className="flex items-baseline justify-center gap-2 mb-2 mt-2">
              <span
                className="font-medium leading-none text-[var(--text-primary)] tabular-nums"
                style={{ fontSize: "4.25rem", letterSpacing: "-0.02em" }}
              >
                {result.averageMs}
              </span>
              <span className="text-[1.4rem] font-medium text-[var(--text-secondary)]">
                ms
              </span>
            </div>

            <p className="text-[0.85rem] text-[var(--text-tertiary)] mb-5">
              across {result.trials.length} trial{result.trials.length === 1 ? "" : "s"}
              {result.falseStarts > 0 && (
                <> · {result.falseStarts} false start{result.falseStarts === 1 ? "" : "s"}</>
              )}
            </p>

            <div className="mb-5 flex justify-center">
              <TierBadge
                label={`${result.tier.label} · ${result.tier.range}`}
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
                Start Over
              </button>
            </div>
          </motion.div>

          {/* Trial breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-1">
              Trial breakdown
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              Best {result.bestMs} ms · slowest {result.worstMs} ms ·
              roughly faster than {result.percentile}% of attempts on a
              normal-curve reference (mean ≈ 285 ms).
            </p>
            <div className="rt-trial-list">
              {result.trials.map((t, i) => (
                <div
                  key={i}
                  className={`rt-trial-pill ${
                    t === result.bestMs ? "rt-trial-pill--best" : ""
                  }`}
                >
                  <span className="rt-trial-pill-label">#{i + 1}</span>
                  <span className="rt-trial-pill-value">{t} ms</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* About your score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              How the tiers work
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              Brackets used by this test, fast to slow:
            </p>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {REACTION_TIME_TIERS.map((tier) => (
                <li
                  key={tier.id}
                  className="flex justify-between gap-3 items-center add-border-top text-[0.88rem] text-(--text-secondary) leading-[1.5] ml-2"
                >
                  <span className="font-medium text-(--text-primary) tabular-nums shrink-0">
                    {tier.range}
                  </span>
                  <span className="flex-1 text-right">{tier.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* What to do next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
              Things that move your number
            </h3>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) mb-2">
              On a simple click test like this, sleep, caffeine, screen
              refresh rate, and whether you&apos;re on a wired mouse can each
              shift your average by 30–50 ms. Trying a few more runs after a
              short warm-up usually trims your time noticeably.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              If your reaction time has changed suddenly and you&apos;re
              worried, chat with August. It&apos;s an AI health companion
              that can help you sort whether it&apos;s worth flagging to a
              doctor.
            </p>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              A reflex test like this is for curiosity, not diagnosis. It
              can&apos;t detect concussion, ADHD, or any clinical condition.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
