"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { MentalAgeResult } from "@/app/utils/tools/mental-age-test-scoring";
import { MENTAL_AGE_TIERS } from "@/app/data/tools/mental-age-test-config";
import QuizContainer from "../shared/QuizContainer";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: MentalAgeResult;
  onRestart: () => void;
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("mental-age-test", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: result.tier.id,
      mental_age: result.mentalAge,
    });
    openAugustChat(
      `Hi, I just took the Mental Age Test and my mental age came back as ${result.mentalAge} (${result.tier.label}). I'd love to talk about what that might say about my habits and outlook.`,
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
              Your mental age
            </p>

            <div className="flex justify-center mb-6">
              <div
                className="flex flex-col items-center justify-center rounded-full border bg-[var(--surface-subtle)]"
                style={{
                  width: 160,
                  height: 160,
                  borderColor: "var(--border-subtle)",
                  // background:
                  //   "linear-gradient(135deg, var(--brand-subtle), var(--surface-elevated))",
                }}
                
              >
                <span className="text-[3.5rem] font-light leading-none text-(--brand-primary) tabular-nums">
                  {result.mentalAge}
                </span>
                <span className="text-[0.75rem] uppercase tracking-[0.15em] text-(--text-tertiary) mt-1">
                  years
                </span>
              </div>
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
                Take again
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
              How the score works
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              Each of the 15 questions has four options. Behind each option is
              an implicit mental age (roughly 18–55). We average the values you
              picked and round to the nearest year, then place you in one of
              five tiers:
            </p>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {MENTAL_AGE_TIERS.map((tier) => (
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

          {/* What this means */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-(--surface-elevated) rounded-2xl p-[32px_28px] border border-(--border-subtle) mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-(--text-primary) mb-3">
              What this number means (and doesn&apos;t)
            </h3>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) mb-2">
              Your mental age here is a snapshot of lifestyle and decision
              patterns how you spend a Friday night, manage stress, treat
              money, and pick music. It is not a measure of intelligence,
              emotional maturity, or how &quot;developed&quot; you are.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              If your number surprised you (in either direction), August is a
              good place to unpack it. It&apos;s an AI companion that can help
              you think about whether your current habits are serving the life
              you actually want.
            </p>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-140 mx-auto px-4">
            <p className="tl-disclaimer">
              Mental age tests are for entertainment and self-reflection only.
              They are not validated psychological instruments and shouldn&apos;t
              be used to assess intelligence, maturity, or cognitive function.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}
