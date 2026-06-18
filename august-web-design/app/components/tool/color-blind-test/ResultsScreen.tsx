"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { ColorBlindResult } from "@/app/utils/tools/color-blind-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: ColorBlindResult;
  onRestart: () => void;
}

const BANDS = [
  { range: "11–12 / 12", label: "Normal trichromacy (typical color vision)" },
  { range: "8–10 / 12", label: "Mild deficiency or calibration issue" },
  { range: "5–7 / 12", label: "Likely color vision deficiency — see pattern below" },
  { range: "0–4 / 12", label: "Strong deficiency suggested" },
];

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("color-blind-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      score: result.score,
      total: result.total,
      protan_misses: result.patternCounts.protan,
      deutan_misses: result.patternCounts.deutan,
      tritan_misses: result.patternCounts.tritan,
    });
    openAugustChat(
      `Hi August. I just took the color blind test and scored ${result.score}/${result.total} (${result.tier.label}). I'd like to talk through what this means and what a reasonable next step looks like.`,
    );
  }, [result]);

  const patterns = [
    {
      key: "red-green",
      label: "Red-green plates",
      missed: result.patternCounts.redGreen,
    },
    {
      key: "protan",
      label: "Protan (red-cone) signals",
      missed: result.patternCounts.protan,
    },
    {
      key: "deutan",
      label: "Deutan (green-cone) signals",
      missed: result.patternCounts.deutan,
    },
    {
      key: "tritan",
      label: "Tritan (blue-yellow) signals",
      missed: result.patternCounts.tritan,
    },
  ];

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
              Your color vision score
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
                label={result.tier.label}
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

          {/* Pattern breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              Pattern breakdown
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              How your misses cluster across the deficiency categories the plates
              probe.
            </p>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {patterns.map((p) => (
                <li
                  key={p.key}
                  className="flex justify-between gap-3 items-center add-border-top text-[0.88rem] text-(--text-secondary) leading-[1.5] ml-2"
                >
                  <span className="font-medium text-(--text-primary)">
                    {p.label}
                  </span>
                  <span className="font-medium text-(--text-primary) tabular-nums shrink-0">
                    {p.missed} {p.missed === 1 ? "signal" : "signals"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[0.85rem] leading-[1.65] text-(--text-tertiary) mt-4 pt-4 border-t border-[var(--border-subtle)]">
              Higher counts in a single category point toward that deficiency
              type. A clean spread of zeros means no clear pattern was detected.
            </p>
          </motion.div>

          {/* Score bands */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              About your score
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              Each correct plate identification adds one point. A perfect score
              is {result.maxScore}.
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
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) mb-2">
              If the test flagged a likely deficiency, the most useful next step
              is a clinical color vision exam by an optometrist or
              ophthalmologist they can confirm the exact type and severity
              using calibrated Ishihara plates, the HRR test, or an
              anomaloscope.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              If you want to talk through what your result means and what
              practical day-to-day adaptations look like, chat with August, an
              AI health companion that can listen, help you understand the
              result, and point you toward the right kind of support.
            </p>
          </motion.div>

          {/* Calibration + disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              This is an online screening, not a clinical diagnosis. Results are
              affected by your screen calibration, ambient lighting and viewing
              distance for a definitive answer, see an eye-care professional.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
