"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { IntroversionResult } from "@/app/utils/tools/introversion-test-scoring";
import { INTROVERSION_TIERS } from "@/app/data/tools/introversion-test-config";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: IntroversionResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("introversion-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      score: result.score,
      max_score: result.maxScore,
      percent: result.percent,
    });
    openAugustChat(
      `Hi, I just took the Introvert / Extrovert self-test and scored ${result.score}/${result.maxScore} (${result.tier.label}). I'd love to talk about what that means for how I structure my work and social life.`,
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
              Your introversion / extroversion score
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
              Each of the 20 statements is rated 1–5 (Strongly Disagree → Strongly Agree). Nine items are reverse-keyed so the score sums to a single 20–100 number where higher = more extroverted, lower = more introverted. The bands:
            </p>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {INTROVERSION_TIERS.map((tier) => (
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
              There's no 'right' answer on the introversion–extroversion spectrum only useful knowledge. The most actionable thing is to design your life around where you actually are: introverts thrive with more solo recharge built in; extroverts thrive with more social structure; ambiverts can swing either way and benefit from noticing which mode they need.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              If you'd like to talk through what your score means for how you work, date, or socialise, August is a low-pressure place to start. It's an AI companion that can help you think about whether your current rhythm matches your wiring.
            </p>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-140 mx-auto px-4">
            <p className="tl-disclaimer">
              Online personality testing is for self-reflection only. Where you sit on this spectrum is a personality trait, not a diagnosis or a fixed identity.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
