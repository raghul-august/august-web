"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { SocialAnxietyResult } from "@/app/utils/tools/social-anxiety-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import { useDownloadResult } from "../shared/hooks/useDownloadResult";
import DownloadResultButton from "../shared/DownloadResultButton";

interface ResultsScreenProps {
  result: SocialAnxietyResult;
  onRestart: () => void;
}

const BANDS = [
  { range: "20–35", label: "Minimal" },
  { range: "36–51", label: "Mild" },
  { range: "52–67", label: "Moderate" },
  { range: "68–83", label: "Severe" },
  { range: "84–100", label: "Very severe" },
];

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("social-anxiety-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      score : result.score,
      positive_screen : result.positiveScreen,
      positive_screen_cutoff : result.positiveScreenCutoff
    });
    openAugustChat(
      `Hi, I just took the Social Anxiety self-test and scored ${result.score}/${result.maxScore} (${result.tier.label}). I'd like to talk about what this means and what good next steps look like.`,
    );
  }, [result]);

  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "social-anxiety-test",
    filename: `social-anxiety-test-${result.tier.label}`,
    heading: "Social Anxiety Test Result",
    subtitle: `Social Anxiety Report • ${result.tier.label}`,
    toolName: "Social Anxiety Test",
    maxPageHeight : 1350
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
              Your social anxiety score
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

          {/* Positive-screen callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[24px] border border-[var(--border-subtle)] mb-6 flex items-start gap-4"
          >
            <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--brand-subtle)] flex items-center justify-center text-[var(--brand-primary)] font-semibold">
              {result.score}
            </div>
            <div className="flex-1">
              <p className="text-[0.95rem] font-medium text-(--text-primary) mb-1">
                Your total score is {result.score} out of {result.maxScore}.
              </p>
              <p className="text-[0.85rem] leading-[1.65] text-(--text-secondary) m-0">
                {result.positiveScreen ? (
                  <>
                    Scores of <strong>{result.positiveScreenCutoff} or higher </strong> sit at or
                    above the moderate band, a level where talking to a
                    clinician about what&apos;s going on tends to be worth it.
                  </>
                ) : (
                  <>
                    Scores below <strong>{result.positiveScreenCutoff}</strong> fall in the
                    minimal-to-mild range. If specific situations still feel
                    hard, that doesn&apos;t mean nothing&apos;s there — it just
                    means this brief screen didn&apos;t flag a moderate or
                    higher pattern overall.
                  </>
                )}
              </p>
            </div>
          </motion.div>

          {/* About your score */}
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
              Each of the 20 items is rated 1 (strongly disagree) to 5 (strongly
              agree). Four items are reverse-score, agreeing with them
              indicates lower social anxiety. Adding them up gives your total
              ({result.minScore}–{result.maxScore}). The 5-tier banding is:
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
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
              What to do next
            </h3>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) mb-2">
              Social anxiety is highly treatable. Cognitive-behavioural therapy
              with gradual exposure has the strongest evidence base, and many
              people see significant improvement with focused treatment.
              Medication (typically SSRIs) can help in some cases, alongside
              therapy.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              If you want to talk through what your score means and what a
              reasonable next step looks like for you specifically, chat with
              August. It&apos;s an AI health companion that can listen, help
              you understand the result, and point you toward the right kind
              of support.
            </p>
          </motion.div>

          {/* Source + disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              Online screening is not a diagnostic instrument. You&apos;re
              encouraged to share these results with a physician or mental
              health professional.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
