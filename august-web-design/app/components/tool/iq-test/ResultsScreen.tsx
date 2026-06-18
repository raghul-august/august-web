"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { IqResult } from "@/app/utils/tools/iq-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: IqResult;
  onRestart: () => void;
}

const BANDS: { range: string; label: string }[] = [
  { range: "Below 70", label: "Lower extreme" },
  { range: "70–84", label: "Below average" },
  { range: "85–114", label: "Average" },
  { range: "115–129", label: "Above average" },
  { range: "130–144", label: "Gifted" },
  { range: "145+", label: "Highly gifted" },
];

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("iq-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      iq_score: result.iqScore,
      percentile: result.percentile,
      raw: result.raw,
      total: result.total,
    });
    openAugustChat(
      `Hi, I just took the IQ self-test and scored ${result.iqScore} (${result.tier.label}, ${result.percentile}th percentile) with ${result.raw}/${result.total} correct. I'd like to talk about what this means and how to think about it.`,
    );
  }, [result]);

  // The ring shows IQ score on a 60..160 visible range so the arc fills meaningfully.
  const RING_MIN = 55;
  const RING_MAX = 160;
  const ringProgress = result.iqScore - RING_MIN;
  const ringMaxProgress = RING_MAX - RING_MIN;

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
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your estimated IQ
            </p>

            <div className="flex justify-center mb-6">
              <ScoreRing
                score={ringProgress}
                max={ringMaxProgress}
                size={170}
                caption={
                  <span className="text-[var(--text-secondary)]">
                    IQ {result.iqScore}
                  </span>
                }
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

            <p className="text-[0.85rem] leading-[1.7] text-(--text-tertiary) mt-3">
              {result.raw} of {result.total} correct · higher than ~
              {result.percentile}% of test-takers.
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
          {result.breakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
                Reasoning by domain
              </h3>
              <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
                A short breakdown of how you did across the five item types.
              </p>
              <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                {result.breakdown.map((row) => (
                  <li
                    key={row.category}
                    className="flex justify-between gap-3 items-center add-border-top text-[0.88rem] text-(--text-secondary) leading-[1.5] ml-2"
                  >
                    <span className="flex-1 text-(--text-primary)">
                      {row.label}
                    </span>
                    <span className="font-medium text-(--text-secondary) tabular-nums shrink-0">
                      {row.correct} / {row.total}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* About IQ scoring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              About IQ bands
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              IQ scores use the Wechsler scale population mean 100, standard
              deviation 15. Roughly two-thirds of adults score between 85 and
              115.
            </p>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {BANDS.map((row) => (
                <li
                  key={row.range}
                  className="flex justify-between gap-3 items-center add-border-top text-[0.88rem] text-(--text-secondary) leading-[1.5] ml-2"
                >
                  <span className="font-medium text-(--text-primary) tabular-nums shrink-0">
                    {row.range}
                  </span>
                  <span className="flex-1 text-right">{row.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* What this is and isn't */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
              What this is, and isn&apos;t
            </h3>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) mb-2">
              This 20-item, untimed online quiz is a brief screen for
              curiosity. Real psychometric IQ tests (WAIS-IV, Stanford-Binet,
              RIAS-2) use far larger item banks, are timed, and are
              administered by a licensed psychologist over 60–90 minutes.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              If you&apos;d like to talk through what your result means, or
              whether a formal cognitive assessment is worth pursuing, chat
              with August. It&apos;s an AI health companion that can listen,
              help you read the number in context, and point you toward useful
              resources.
            </p>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              A 20-item online quiz is not a clinical IQ measurement. Read the
              score as a directional signal and bring any concerns about
              cognition to a licensed clinician.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
