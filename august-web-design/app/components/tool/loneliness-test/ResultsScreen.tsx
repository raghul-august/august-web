"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { LonelinessResult } from "@/app/utils/tools/loneliness-test-scoring";
import { LONELINESS_TIERS } from "@/app/data/tools/loneliness-test-config";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: LonelinessResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("loneliness-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      score: result.score,
      max_score: result.maxScore,
      percent: result.percent,
    });
    openAugustChat(
      `Hi, I just took the Loneliness self-test and scored ${result.score}/${result.maxScore} (${result.tier.label}). I'd like to talk about what this might mean and what to do about it.`,
    );
  }, [result]);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-linear-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div className="max-w-160 mx-auto px-5 pt-10 pb-15">
          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-(--surface-elevated) rounded-[28px] p-[48px_32px] py-6 px-6 border border-(--border-subtle) text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your loneliness score
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
                label={`${result.tier.label} · ${result.tier.range}`}
                tone={getBadgeTone(result.tier.badge)}
                size="md"
              />
            </div>

            <p className="text-base leading-normal text-(--text-primary) font-medium mb-2 text-[1.1rem]">
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

          {/* About your score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-(--surface-elevated) rounded-2xl p-[28px_24px] border border-(--border-subtle) mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-(--text-primary) mb-2">
              About your score
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              Each of the 20 statements is rated 1–5 (Strongly Disagree → Strongly Agree). Three items are reverse-keyed so agreement with connection-themed statements doesn't inflate the score. The total falls between 20 and 100 and is banded as:
            </p>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {LONELINESS_TIERS.map((tier) => (
                <li
                  key={tier.id}
                  className="flex justify-between gap-3 items-center add-border-top text-[0.88rem] text-(--text-secondary) leading-normal ml-2"
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
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-(--surface-elevated) rounded-2xl p-[32px_28px] border border-(--border-subtle) mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-(--text-primary) mb-3">
              What to do next
            </h3>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) mb-2">
              Loneliness is responsive to focused effort, especially when the goal is depth rather than breadth. Increasing the frequency and honesty of contact with people who already feel safe, addressing thoughts that assume people don't want you, and treating co-occurring depression or anxiety where present all help.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              If your score is on the higher end, talking to someone a clinician, a friend, or August in this page is the most useful first step. August is an AI health companion that can help you think about what's contributing and what's worth trying first.
            </p>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-140 mx-auto px-4">
            <p className="tl-disclaimer">
              Online screening is not a diagnostic instrument. Loneliness is a normal human experience, not a clinical diagnosis but at the higher tiers it can co-occur with depression and anxiety, which a clinician should evaluate.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
