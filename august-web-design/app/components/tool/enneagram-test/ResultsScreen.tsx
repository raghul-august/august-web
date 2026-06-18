"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import {
  getTypeDef,
  TYPE_DEFINITIONS,
} from "@/app/data/tools/enneagram-test-landing";
import {
  TYPE_MAX_RAW,
  type EnneagramType,
} from "@/app/data/tools/enneagram-test-questions";
import type { EnneagramResult } from "@/app/utils/tools/enneagram-test-scoring";
import QuizContainer from "../shared/QuizContainer";
import TierBadge from "../shared/TierBadge";

interface ResultsScreenProps {
  result: EnneagramResult;
  onRestart: () => void;
}

export default function ResultsScreen({
  result,
  onRestart,
}: ResultsScreenProps) {
  const primary = getTypeDef(result.primaryType);
  const wing = result.wing ? getTypeDef(result.wing) : null;
  const wingLabel = result.wing
    ? `${result.primaryType}w${result.wing}`
    : `Type ${result.primaryType}`;

  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("enneagram-test", "cta_clicked", {
      cta_type: "talk_to_august",
      primary_type: result.primaryType,
      wing: result.wing,
      tier: result.tier.id,
    });
    openAugustChat(
      `Hi, I just took the Enneagram test and came out as Type ${result.primaryType} (${primary.name})${
        wing ? ` with a ${result.wing} wing (${wingLabel})` : ""
      }. I'd love to talk through what this means for how I move through the world and where to focus on growth.`,
    );
  }, [result, primary, wing, wingLabel]);

  // Triad / center-of-intelligence (public-domain Enneagram grouping)
  const centerOfIntelligence = getCenterOfIntelligence(result.primaryType);

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div className="max-w-[680px] mx-auto px-5 pt-10 pb-[60px]">
          {/* Primary type hero card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] py-7 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[0.95rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-3 uppercase">
              Your Enneagram type
            </p>

            <h1 className="text-[2rem] sm:text-[2.4rem] font-semibold leading-[1.15] tracking-[-0.02em] text-(--text-primary) m-0">
              Type {result.primaryType}
            </h1>
            <p className="text-[1.15rem] sm:text-[1.25rem] font-medium text-(--brand-primary) mt-1 mb-4">
              {primary.name}
            </p>

            <div className="mb-5 flex justify-center">
              <TierBadge
                label={result.tier.label}
                tone={getBadgeTone(result.tier.badge)}
                size="md"
              />
            </div>

            <p className="text-base leading-[1.65] text-(--text-primary) font-medium mb-2 text-[1.05rem]">
              {primary.headline}
            </p>
            <p className="text-[0.9rem] leading-[1.75] text-(--text-secondary) max-w-[560px] mx-auto">
              {primary.summary}
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

          {/* What this tier means */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[var(--surface-elevated)] py-6 px-6 border-t border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-2">
              How confident is this result?
            </h3>
            <p className="text-[0.88rem] leading-[1.7] text-(--text-secondary) m-0">
              {result.tier.description}
            </p>
          </motion.div>

          {/* Motivations / fears / desires */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[var(--surface-elevated)] py-6 px-6 border-t border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-4">
              What drives a Type {result.primaryType}
            </h3>

            <div className="flex flex-col gap-3.5">
              <FactRow label="Core motivation" classname="" value={primary.motivation} />
              <FactRow label="Basic fear" classname="add-border-top" value={primary.fear} />
              <FactRow label="Basic desire" classname="add-border-top"  value={primary.desire} />
              <FactRow label="At their best" classname="add-border-top"  value={primary.atBest} />
              <FactRow label="At their worst" classname="add-border-top"  value={primary.atWorst} />
              <FactRow label="Growth direction" classname="add-border-top"  value={primary.growth} />
              <FactRow
                label="Center of intelligence"
                value={centerOfIntelligence}
                classname="add-border-top" 
              />
            </div>
          </motion.div>

          {/* Wing */}
          {wing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[var(--surface-elevated)] py-6 px-6 border-t border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-1">
                Your wing
              </h3>
              <p className="text-[0.82rem] text-(--text-tertiary) m-0 mb-3">
                Wings are the adjacent types on the Enneagram circle that color
                how your primary type expresses itself.
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[1.4rem] font-semibold text-(--text-primary)">
                  {wingLabel}
                </span>
                <span className="text-[0.95rem] text-(--brand-primary) font-medium">
                  Type {wing.type} — {wing.name}
                </span>
              </div>
              <p className="text-[0.9rem] leading-[1.7] text-(--text-secondary) m-0">
                Your second-strongest signal is Type {wing.type}, {wing.name}.
                That means the {primary.name.toLowerCase().replace(/^the /, "")}{" "}
                engine inside you tends to express itself with notes of {wing.name.toLowerCase().replace(/^the /, "")}{" "}
                — {wing.headline.toLowerCase().replace(/^you /, "").replace(/^./, (c) => c.toLowerCase())}
              </p>
            </motion.div>
          )}

          {/* Full ranking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-[var(--surface-elevated)] py-6 px-6 border-t border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-1">
              Your full ranking
            </h3>
            <p className="text-[0.82rem] text-(--text-tertiary) m-0 mb-4">
              How strongly each of the nine types showed up in your responses.
            </p>

            <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
              {result.ranking.map((row) => {
                const def = TYPE_DEFINITIONS.find((t) => t.type === row.type);
                const isPrimary = row.type === result.primaryType;
                const isWing = row.type === result.wing;
                return (
                  <li
                    key={row.type}
                    className="flex items-center gap-3 add-border-top"
                    aria-current={isPrimary ? "true" : undefined}
                  >
                    <span
                      className={`tabular-nums text-[0.85rem] w-[60px] shrink-0 ${
                        isPrimary
                          ? "text-(--brand-primary) font-semibold"
                          : "text-(--text-secondary)"
                      }`}
                    >
                      Type {row.type}
                    </span>
                    <span
                      className={`text-[0.85rem] w-[120px] shrink-0 ${
                        isPrimary
                          ? "text-(--text-primary) font-medium"
                          : "text-(--text-secondary)"
                      }`}
                    >
                      {def?.name ?? ""}
                      {isWing && !isPrimary ? " (wing)" : ""}
                    </span>
                    <div className="flex-1 h-[8px] rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isPrimary
                            ? "bg-[var(--brand-primary)]"
                            : isWing
                              ? "bg-[var(--brand-primary)]/60"
                              : "bg-[var(--border-strong)]"
                        }`}
                        style={{ width: `${Math.max(row.percent, 3)}%` }}
                      />
                    </div>
                    <span
                      className={`text-[0.78rem] tabular-nums w-[44px] text-right shrink-0 ${
                        isPrimary
                          ? "text-(--text-primary) font-medium"
                          : "text-(--text-tertiary)"
                      }`}
                    >
                      {row.raw}/{TYPE_MAX_RAW}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Adjacent types reminder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[var(--surface-elevated)] rounded-2xl py-6 px-6 border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-2">
              How to read this result
            </h3>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) mb-2">
              The Enneagram is more useful as a map of motivations than as a
              label. Two people with the same primary type can look very
              different on the outside, because what the type really describes
              is the engine underneath the fear that pulls them away and the
              desire that pulls them toward.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0">
              If your top two scores were close, read both descriptions and
              notice which one&apos;s deepest motivation feels{" "}
              <em>uncomfortably</em> familiar. That uncomfortable recognition is
              usually a better signal than which behavior list sounds more like
              you.
            </p>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              The Enneagram is a self-reflection framework, not a clinical
              instrument. This test isn&apos;t a diagnosis of anything. If
              you&apos;re going through something hard, a licensed mental-health
              professional is the right next step.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}

function FactRow({ label, value , classname}: { label: string; value: string;classname : string }) {
  return (
    <div className={`flex flex-col gap-1 ${classname}`}>
      <span className="text-[0.72rem] uppercase tracking-[0.08em] font-medium text-(--text-tertiary)">
        {label}
      </span>
      <span className="text-[0.92rem] leading-[1.6] text-(--text-secondary)">
        {value}
      </span>
    </div>
  );
}

function getCenterOfIntelligence(type: EnneagramType): string {
  // Triads are public-domain: Heart (2,3,4), Head (5,6,7), Body (8,9,1).
  if (type === 2 || type === 3 || type === 4)
    return "Heart center — works through feeling, image, and connection.";
  if (type === 5 || type === 6 || type === 7)
    return "Head center — works through thought, planning, and analysis.";
  return "Body center — works through instinct, gut response, and action.";
}

