"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { PregnancyResult } from "@/app/utils/tools/am-i-pregnant-quiz-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: PregnancyResult;
  onRestart: () => void;
}

const SCORE_BANDS = [
  { range: "≥ 22", label: "Pregnancy is likely" },
  { range: "12–21", label: "Pregnancy is possible" },
  { range: "5–11", label: "Possibly too early to tell" },
  { range: "< 5", label: "Pregnancy looks unlikely" },
];

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("am-i-pregnant-quiz", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      score: result.score,
      test_confirmed: result.testConfirmed,
    });
    openAugustChat(
      `Hi, I just took the "Am I Pregnant?" quiz and the result was "${result.tier.label}" (score ${result.score}). I'd like to talk through what this means and what to do next.`,
    );
  }, [result]);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div className="max-w-[640px] mx-auto px-5 pt-10 pb-[60px]">
          {/* Hero result card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] py-7 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your result
            </p>

            <div className="flex justify-center mb-6">
              <ScoreRing
                score={result.percent}
                max={100}
                size={160}
                caption="likelihood"
              />
            </div>

            <div className="mb-5 flex justify-center">
              <TierBadge
                label={result.tier.label}
                tone={getBadgeTone(result.tier.badge)}
                size="md"
              />
            </div>

            <p className="text-base leading-[1.65] text-(--text-primary) font-medium mb-2 text-[1.1rem]">
              {result.tier.headline}
            </p>
            <p className="text-[0.9rem] leading-[1.7] text-(--text-secondary) max-w-[560px] mx-auto">
              {result.tier.description}
            </p>

            <div className="flex items-center gap-4 mt-5 mb-0 justify-center flex-wrap">
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

          {/* What to do next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[var(--surface-elevated)] rounded-2xl py-6 px-6 border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              What to do next
            </h3>
            <p className="text-[0.95rem] leading-[1.7] text-(--text-primary) font-medium mb-3">
              {result.tier.nextStep}
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              Home pregnancy tests are most accurate from the day your period
              is due, using first-morning urine. A blood test at a clinic can
              detect pregnancy a few days earlier and is the gold standard.
            </p>
          </motion.div>

          {/* Top signals */}
          {result.topSignals.length > 0 && !result.testConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-[var(--surface-elevated)] rounded-2xl py-6 px-6 border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-1">
                What pushed the score
              </h3>
              <p className="text-[0.82rem] text-(--text-tertiary) mb-3 m-0">
                The answers that contributed the most weight to your result.
              </p>
              <ul className="flex flex-col gap-0 m-0 p-0 list-none">
                {result.topSignals.map((signal) => (
                  <li
                    key={signal}
                    className="add-border-top text-[0.9rem] leading-[1.55] text-(--text-secondary)"
                  >
                    {signal}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Score bands */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[var(--surface-elevated)] rounded-2xl py-6 px-6 border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              About this score
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-3 leading-[1.65]">
              Each answer adds points based on how strongly it points to
              pregnancy. A positive home pregnancy test overrides the band on
              its own — it&apos;s a strong signal in itself.
            </p>
            <ul className="flex flex-col gap-0 m-0 p-0 list-none">
              {SCORE_BANDS.map((row) => (
                <li
                  key={row.range}
                  className="flex justify-between gap-3 items-center add-border-top text-[0.88rem] text-(--text-secondary) leading-[1.5]"
                >
                  <span className="font-medium text-(--text-primary) tabular-nums shrink-0">
                    {row.range}
                  </span>
                  <span className="flex-1 text-right">{row.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              This quiz is for general information only and isn&apos;t medical
              advice. Only a urine or blood pregnancy test can confirm
              pregnancy. If you may need emergency contraception, act sooner
              rather than later — most options work for up to 3–5 days.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
