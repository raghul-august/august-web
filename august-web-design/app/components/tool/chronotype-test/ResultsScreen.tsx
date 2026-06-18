"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { ChronotypeResult, SleepScoreRating } from "../../../utils/tools/chronotype-scoring";
import { trackToolEvent } from "@/app/utils/analytics";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import { useDownloadResult } from "../shared/hooks/useDownloadResult";
import DownloadResultButton from "../shared/DownloadResultButton";
import { openAugustChat } from "../../../utils/tools/tool-urls";
import type { BadgeTone } from "@/app/utils/tools/tool-colors";
import { useAuthStore } from "@/stores/auth-store";
import { useIsWebview } from "@/hooks/use-webview";
import { SignUpModal } from "@/components/auth";
import { useLoginModalStore } from "@/stores/login-modal-store";

const scheduleLabels: Record<string, string> = {
  wakeTime: "Wake",
  peakFocus: "Peak Focus",
  exercise: "Exercise",
  bedtime: "Bedtime",
};

const sleepRatingTone: Record<SleepScoreRating, BadgeTone> = {
  Excellent: "success",
  Good: "success",
  Fair: "info",
  "Needs Improvement": "warning",
  Poor: "danger",
};

interface ResultsScreenProps {
  result: ChronotypeResult;
  onRestart: () => void;
}

export default function ResultsScreen({
  result,
  onRestart,
}: ResultsScreenProps) {
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const isWebview = useIsWebview();

  const handleTalkToAugust = useCallback(() => {
    // track("tool_cta_clicked", {
    //   tool: "chronotype-test",
    //   cta_type: "talk_to_august",
    //   chronotype: result.animal,
    // });
    trackToolEvent("chronotype-test", "cta_clicked", {
      cta_type: "talk_to_august",
      chronotype: result.animal,
    });
    openAugustChat(
      `Hi, I just took the chronotype quiz and found out I'm a ${result.name}. I'd like to learn more about optimizing my sleep.`,
    );
  }, [result]);

  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "chronotype-test",
    filename: `chronotype-${result.name}`,
    heading: "Chronotype Result",
    subtitle: `Chronotype Report • ${result.name}`,
    toolName: "Chronotype Test",
  });

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div ref={resultRef} className="max-w-[640px] mx-auto px-8 sm:px-12 pt-10 pb-[60px]">
          <div
            className="flex justify-end mb-3"
            data-skip-screenshot="true"
          >
            <DownloadResultButton
              onClick={handleDownload}
              className="tool-btn tool-btn--primary mb-0"
            />
          </div>
          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] p-[48px_32px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your chronotype result
            </p>

            <div className="flex justify-center mb-6">
              <ScoreRing
                score={result.sleepScore}
                max={100}
                size={160}
                caption="/ 100"
              />
            </div>

            <div className="mb-5 flex justify-center">
              <TierBadge
                label={`${result.name} : ${result.sleepScoreRating}`}
                tone={sleepRatingTone[result.sleepScoreRating]}
                size="md"
              />
            </div>

            <p className="text-base leading-[1.65] text-(--text-primary) font-medium mb-2 text-[1.1rem]">
              {result.population} of people share your rhythm.
            </p>
            <p className="text-[0.85rem] leading-[1.7] text-(--text-secondary) max-w-140 mx-auto">
              {result.description}
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

          {/* Your optimal schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              Your optimal schedule
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              These windows are when a typical {result.name.replace(/^The /, "")} tends to feel
              naturally aligned for waking, focusing, moving, and winding down.
            </p>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {(Object.entries(result.schedule) as [string, string][]).map(
                ([key, value]) => (
                  <li
                    key={key}
                    className="flex justify-between gap-3 items-center add-border-top text-[0.88rem] text-(--text-secondary) leading-[1.5] ml-2"
                  >
                    <span className="font-medium text-(--text-primary) tabular-nums shrink-0">
                      {scheduleLabels[key]}
                    </span>
                    <span className="flex-1 text-right">{value}</span>
                  </li>
                ),
              )}
            </ul>
            <p className="text-[0.85rem] leading-[1.65] text-(--text-tertiary) mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <span className="font-semibold text-(--text-secondary)">
                Sleep Health Score:
              </span>{" "}
              {result.sleepScore}/100 ({result.sleepScoreRating}) : Based on the
              sleep habits you reported. Higher scores mean stronger sleep
              hygiene foundations.
            </p>
          </motion.div>

          {/* Your traits + what to do next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
              What this means for you
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.traits.map((trait) => (
                <span
                  key={trait}
                  className="px-3 py-1 bg-[var(--brand-subtle)] border border-[var(--border-subtle)] rounded-full text-[12px] text-[var(--brand-primary)] font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
            <p className="text-[0.85rem] leading-[1.75] text-(--text-secondary) mb-2">
              Your chronotype is a strong signal, but it&apos;s only one input.
              Small adjustments to light exposure, meal timing, and screen
              habits can shift your energy patterns more than most people
              expect.
            </p>
            <p className="text-[0.85rem] leading-[1.75] text-(--text-secondary) m-0">
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
              This quiz is based on validated chronotype research and is for
              informational purposes only. It is not a medical diagnosis. For
              personalized sleep advice, consult a healthcare professional.
            </p>
          </div>
        </div>
      </div>

      {isAnonymous && !isWebview && (
        <SignUpModal
          onDismiss={() => useLoginModalStore.getState().close()}
        />
      )}
    </QuizContainer>
  );
}
