"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { PersonalityDisorderResult } from "@/app/utils/tools/personality-disorder-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: PersonalityDisorderResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    // track("tool_cta_clicked", {
    //   tool: "personality-disorder-test",
    //   cta_type: "talk_to_august",
    //   tier: result.tier.id,
    //   score: result.score,
    //   self_harm_flag: result.showSelfHarmWarning,
    // });
    trackToolEvent("personality-disorder-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      score : result.score,
      max_score : result.maxScore,
      self_harm_flag :result.showSelfHarmWarning,
      total_bpd : result.totalBpd
    });
    openAugustChat(
      `Hi, I just took the Personality Disorder (BPD) self-test and scored ${result.score}/${result.maxScore} (${result.tier.label}). I'd like to talk about what this means and what good next steps look like.`,
    );
  }, [result]);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div className="max-w-[640px] mx-auto px-5 pt-10 pb-[60px]">
          {/* Crisis warning — only when self-harm item > 0 */}
          {/* {result.showSelfHarmWarning && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-(--danger-50) border border-(--danger)/30 rounded-2xl p-[20px_22px] mb-6"
              role="alert"
            >
              <p className="text-[0.75rem] uppercase tracking-[0.08em] font-semibold text-(--danger-700) mb-2">
                Crisis support
              </p>
              <p className="text-[0.92rem] leading-[1.65] text-(--text-primary) m-0">
                Your responses indicate you may be at risk of hurting yourself.
                If you need help right now, you can reach the Suicide &amp;
                Crisis Lifeline by calling or texting{" "}
                <a
                  href="tel:988"
                  className="font-semibold text-(--danger-700) underline underline-offset-2"
                >
                  988
                </a>{" "}
                or chat at{" "}
                <a
                  href="https://988lifeline.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-(--danger-700) underline underline-offset-2"
                >
                  988lifeline.org
                </a>
                . You can also text{" "}
                <a
                  href="sms:741741;?&body=MHA"
                  className="font-semibold text-(--danger-700) underline underline-offset-2"
                >
                  &ldquo;MHA&rdquo; to 741-741
                </a>{" "}
                to reach the Crisis Text Line. Warmlines are an excellent place
                for non-crisis support.
              </p>
            </motion.div>
          )} */}

          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] p-[48px_32px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
         >
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your BPD trait score
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
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              About your score
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              Each of the 15 BPD items is scored 0–3. Adding them up gives your
              total (0–45). The banding is:
            </p>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {[
                { range: "0–9", label: "Few BPD traits" },
                { range: "10–18", label: "Some BPD traits" },
                { range: "19–27", label: "Moderate BPD traits" },
                { range: "28–36", label: "Many BPD traits" },
                { range: "37–45", label: "Strong overlap with BPD" },
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
            {result.functionalLabel && (
              <p className="text-[0.85rem] leading-[1.65] text-(--text-tertiary) mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <span className="font-semibold text-(--text-secondary)">
                  Functional impact:
                </span>{" "}
                {result.functionalLabel}. This isn&apos;t part of the trait
                score, it&apos;s a clinical anchor for how much these patterns
                are affecting daily life.
              </p>
            )}
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
              BPD is one of the most treatable serious mental health
              conditions. Dialectical behaviour therapy (DBT), mentalisation
              based therapy (MBT), and schema therapy all have strong evidence
              behind them, and most people who get focused treatment improve
              substantially within a few years.
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
              encouraged to share these results with a physician or healthcare
              provider.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
