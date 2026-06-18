"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { AutismResult } from "@/app/utils/tools/autism-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import { ToolAuthGate } from "@/components/auth";

interface ResultsScreenProps {
  result: AutismResult;
  onRestart: () => void;
}

export default function ResultsScreen({
  result,
  onRestart,
}: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    // track("tool_cta_clicked", {
    //   tool: "autism-test",
    //   cta_type: "talk_to_august",
    //   tier: result.tier.id,
    //   score: result.score,
    // });
    trackToolEvent("autism-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      score: result.score,
    });
    openAugustChat(
      `Hi, I just took the AQ-10 Autism Test and scored ${result.score}/${result.maxScore} (${result.tier.label}). I'd like to talk about what this means and what to do next.`,
    );
  }, [result]);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-[var(--surface-subtle)] to-(--brand-subtle)/40">
        <div className="max-w-[640px] mx-auto px-5 pt-10 pb-[60px]">
          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] p-[48px_32px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-[var(--text-tertiary)] tracking-[0.08em] mb-5 uppercase">
              Your AQ-10 score
            </p>

            <div className="flex justify-center mb-6">
              <ScoreRing
                score={result.score}
                max={result.maxScore}
                size={160}
                caption={`/ ${result.maxScore}`}
              />
            </div>

            <div className="mb-3 flex justify-center">
              <TierBadge
                label={`${result.tier.label} : ${result.tier.range}`}
                tone={getBadgeTone(result.tier.badge)}
                size="md"
              />
            </div>

            {result.meetsReferralCutoff && (
              <div className="mb-4 flex justify-center">
                <span className="autism-cutoff-pill">
                  At or above NHS referral threshold (6+)
                </span>
              </div>
            )}

            <p className="text-base text-[1.125rem] leading-[1.65] text-[var(--text-primary)] font-medium mb-2 text-[1.1rem]">
              {result.tier.headline}
            </p>
            <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] max-w-[520px] mx-auto">
              {result.tier.description}
            </p>

            <div className="flex items-center justify-center gap-4 mt-5 mb-0 pb-0">
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

          {/* Endorsed items */}
          {result.endorsedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)]"
            >
              <h3 className="text-[1.125rem] font-medium text-(--text-primary) mb-2">
                Items you scored in the autism-direction
              </h3>
              {/* <p className="text-[0.75rem] md:text-[0.95rem] text-(--text-tertiary) mb-4 leading-normal">
                Each of these contributed one point to your AQ-10 total. If you
                bring this score to a clinician, these are the specific
                statements worth talking through first.
              </p> */}
              <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
                {result.endorsedItems.map((row) => (
                  <li
                    key={row.id}
                    className="flex justify-between text-[var(--text-secondary)] leading-[1.5]  add-border-top"
                  >
                    <span className="text-[0.85rem]">{row.text}</span>
                    <span className="text-[0.65rem] font-semibold text-[var(--brand-primary)] uppercase tracking-[0.06em] whitespace-nowrap pt-[2px] shrink-0">
                      {row.answerLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* What to do next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] my-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
              What to do next
            </h3>
            {result.meetsReferralCutoff ? (
              <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] mb-3">
                Your score is at or above the threshold the NHS uses to refer
                adults for a full autism assessment. The most useful next step
                is to book an appointment with your GP or primary-care provider
                and ask about an adult autism assessment. Take a screenshot of
                this result with you. A formal evaluation usually involves
                structured interviews (such as ADOS-2 or ADI-R) and a
                developmental history; it can take several hours but is the
                only way to confirm or rule out a diagnosis.
              </p>
            ) : (
              <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] mb-3">
                Your score is below the AQ-10 referral threshold (6). That does
                not rule autism out particularly for adults who mask or
                camouflage traits. If the questions resonated with your lived
                experience, instruments like the longer AQ (50 items), the
                RAADS-R, or the CAT-Q (Camouflaging Autistic Traits
                Questionnaire) give a more nuanced picture, and a conversation
                with a clinician is still appropriate.
              </p>
            )}
            <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] m-0">
              If you want help making sense of your score or thinking through
              the next conversation, chat with August.
            </p>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.75rem] leading-[1.6] text-[var(--text-tertiary)] opacity-80 max-w-[520px] mx-auto px-4">
            Educational screening only. A brief test using a screening tool
            does not provide a diagnosis — only a trained clinician can do
            that. AQ-10 © Allison, Auyeung &amp; Baron-Cohen, 2012;
            public-domain instrument reproduced verbatim.
          </div>
        </div>
      </div>

      <ToolAuthGate active />
    </QuizContainer>
  );
}
