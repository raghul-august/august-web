"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { SchizophreniaResult } from "@/app/utils/tools/schizophrenia-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import { useDownloadResult } from "../shared/hooks/useDownloadResult";
import DownloadResultButton from "../shared/DownloadResultButton";

interface ResultsScreenProps {
  result: SchizophreniaResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("schizophrenia-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      score : result.score,
      endorsed_count : result.endorsedCount,
      positive_screen : result.positiveScreen,
      primary_domain : result.primaryDomain
    });
    openAugustChat(
      `Hi, I just took the Schizophrenia / Psychosis self-test (PQ-B) and scored ${result.score}/${result.maxScore} with ${result.endorsedCount}/${result.totalItems} items endorsed (${result.tier.label}). I'd like to talk about what this means and what good next steps look like.`,
    );
  }, [result]);

  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "schizophrenia-test",
    filename: `schizophrenia-test-${result.tier.label}`,
    heading: "Schizophrenia / Psychosis Test Result",
    subtitle: `PQ-B Report • ${result.tier.label}`,
    toolName: "Schizophrenia Test",
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
              Your psychosis-risk score
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

          {/* Positive-screen callout (Loewy 2011 threshold) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[24px] border border-[var(--border-subtle)] mb-6 flex items-start gap-4"
          >
            <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--brand-subtle)] flex items-center justify-center text-[var(--brand-primary)] font-semibold">
              {result.endorsedCount}
            </div>
            <div className="flex-1">
              <p className="text-[0.95rem] font-medium text-(--text-primary) mb-1">
                {result.positiveScreen
                  ? `You endorsed ${result.endorsedCount} of ${result.totalItems} items.`
                  : `You endorsed ${result.endorsedCount} of ${result.totalItems} items.`}
              </p>
              <p className="text-[0.85rem] leading-[1.65] text-(--text-secondary) m-0">
                {result.positiveScreen ? (
                  <>
                    The PQ-B&apos;s standard cut-off is{" "}
                    <strong>{result.positiveScreenThreshold} or more endorsed items</strong>,
                    so this is a <strong>positive screen</strong>. That
                    doesn&apos;t mean a diagnosis — it means a clinician
                    trained in early psychosis can give you a clearer picture.
                  </>
                ) : (
                  <>
                    The PQ-B&apos;s standard cut-off for a positive screen is{" "}
                    <strong>{result.positiveScreenThreshold} or more endorsed items</strong>,
                    so this falls below that threshold.
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
              Each of the 21 items is scored 0 (didn&apos;t happen) to 5 (yes,
              very distressing). Adding them up gives your distress-weighted
              total (0–{result.maxScore}). The banding is:
            </p>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {[
                { range: "0–5", label: "Minimal indicators" },
                { range: "6–19", label: "Some indicators" },
                { range: "20–39", label: "Moderate indicators" },
                { range: "40–64", label: "Elevated indicators" },
                { range: "65–105", label: "Strong indicators" },
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
          </motion.div>

          {/* Domain breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              Where your score is coming from
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              <span className="font-semibold text-(--text-secondary)">
                Top area:
              </span>{" "}
              {result.primaryDomain.label.toLowerCase()}.{" "}
              {result.primaryDomain.description}
            </p>
            <ul className="flex flex-col gap-3 m-0 p-0 list-none">
              {result.domains.map((d) => (
                <li key={d.id} className="flex flex-col gap-3">
                  <div className="flex justify-between items-baseline gap-3 text-[0.88rem]">
                    <span className="font-medium text-(--text-primary)">
                      {d.label}
                    </span>
                    <span className="text-(--text-tertiary) tabular-nums shrink-0">
                      {d.score} / {d.max} · {d.endorsedCount}/{d.itemCount}{" "}
                      endorsed
                    </span>
                  </div>
                  <div className="h-[6px] bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-primary)] rounded-full transition-all duration-700"
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
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
              Early psychosis responds to treatment. Coordinated Specialty Care
              (CSC) programmes combining therapy, medication where helpful,
              family support, and supported education or employment have
              strong evidence and are the standard of care for first-episode
              and prodromal presentations. Earlier engagement is associated
              with better long-term outcomes.
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
              Online screening is not a diagnostic
              instrument. You&apos;re encouraged to share these results with a
              physician or mental health professional trained in recognising
              early signs of psychosis.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
