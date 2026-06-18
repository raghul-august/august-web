"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { TraumaResult } from "@/app/utils/tools/trauma-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: TraumaResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    // track("tool_cta_clicked", {
    //   tool: "trauma-test",
    //   cta_type: "talk_to_august",
    //   tier: result.tier.id,
    //   score: result.score,
    //   no_trauma: result.noTrauma,
    //   is_positive: result.isPositive,
    // });
    trackToolEvent("trauma-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      score : result.score,
      no_trauma : result.noTrauma,
      is_positive : result.isPositive,
    });
    const scoreLine = result.noTrauma
      ? "I just took the PTSD self-screen and answered that I haven't experienced a qualifying trauma."
      : `I just took the PC-PTSD-5 PTSD self-screen and scored ${result.score}/${result.maxScore} (${result.tier.label}).`;
    openAugustChat(
      `Hi, ${scoreLine} I'd like to talk about what this means and what good next steps look like.`,
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
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your PC-PTSD-5 result
            </p>

            {!result.noTrauma && (
              <div className="flex justify-center mb-6">
                <ScoreRing
                  score={result.score}
                  max={result.maxScore}
                  size={160}
                  caption={`/ ${result.maxScore}`}
                />
              </div>
            )}

            <div className="mb-5 flex justify-center">
              <TierBadge
                label={
                  result.noTrauma
                    ? result.tier.label
                    : `${result.tier.label} : ${result.tier.range}`
                }
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

          {/* About your score — hidden in no-trauma path */}
          {!result.noTrauma && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
                About your score
              </h3>
              <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
                Each of the 5 PC-PTSD-5 items is scored 1 for &ldquo;Yes&rdquo;
                and 0 for &ldquo;No.&rdquo; Adding them up gives your total
                (0&ndash;5). The standard banding the VA uses is:
              </p>
              <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                {[
                  { range: "0–1", label: "Negative screen" },
                  { range: "2", label: "Borderline : just below the cutoff" },
                  { range: "3–5", label: "Positive screen : further assessment recommended" },
                ].map((row) => (
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
              <p className="text-[0.85rem] leading-[1.65] text-(--text-tertiary) mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <span className="font-semibold text-(--text-secondary)">
                  Cutoff:
                </span>{" "}
                A score of {result.cutoff} or more is the validated threshold
                the PC-PTSD-5 uses to flag a possible PTSD presentation in
                primary care.
              </p>
            </motion.div>
          )}

          {/* What to do next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
              What to do next
            </h3>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) mb-2">
              PTSD is treatable. Trauma-focused therapies like prolonged
              exposure (PE), cognitive processing therapy (CPT), and EMDR have
              the strongest evidence, most people who complete a course
              experience substantial symptom reduction. Medication can also
              help in some cases.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              If you want to talk through what your result means and what a
              reasonable next step looks like for you specifically, chat with
              August. It&apos;s an AI health companion that can listen, help
              you understand the result, and point you toward the right kind
              of support.
            </p>
          </motion.div>

          {/* Source + disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              Online screening is not a diagnostic instrument. Only a trained
              provider can diagnose PTSD. You&apos;re encouraged to share these
              results with a physician or healthcare provider.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
