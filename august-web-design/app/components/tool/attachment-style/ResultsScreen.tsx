"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import {
  STYLE_DEFINITIONS,
} from "@/app/data/tools/attachment-style-landing";
import type { AttachmentResult } from "@/app/utils/tools/attachment-style-scoring";
import QuizContainer from "../shared/QuizContainer";
import TierBadge from "../shared/TierBadge";
import { useDownloadResult } from "../shared/hooks/useDownloadResult";
import DownloadResultButton from "../shared/DownloadResultButton";

interface ResultsScreenProps {
  result: AttachmentResult;
  onRestart: () => void;
}

export default function ResultsScreen({
  result,
  onRestart,
}: ResultsScreenProps) {
  const { primaryDef, secondaryDef } = result;

  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("attachment-style", "cta_clicked", {
      cta_type: "talk_to_august",
      primary_style: result.primary,
      secondary_style: result.secondary,
      tier: result.tier.id,
    });
    openAugustChat(
      `Hi, I just took the attachment-style test and my primary style was ${primaryDef.name} (with ${secondaryDef.name} as a close runner-up). I'd love to talk through what this means for how I show up in close relationships and where to focus.`,
    );
  }, [result, primaryDef, secondaryDef]);

  // Place dot on the 0–100 grid. x = anxiety, y = avoidance, with (0,0) at
  // bottom-left visually — so we invert avoidance for the top axis.
  const dotX = result.anxiety.percent;
  const dotY = 100 - result.avoidance.percent;

  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "attachment-style",
    filename: `attachment-style-${primaryDef.name}`,
    heading: "Attachment Style Result",
    subtitle: `Attachment Style Report • ${primaryDef.name}`,
    toolName: "Attachment Style Test",
  });

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div ref={resultRef} className="max-w-[680px] mx-auto px-8 sm:px-12 pt-10 pb-[60px]">
          <div
            className="flex justify-end mb-3"
            data-skip-screenshot="true"
          >
            <DownloadResultButton
              onClick={handleDownload}
              className="tool-btn tool-btn--primary mb-0"
            />
          </div>
          {/* Primary style hero card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] py-7 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[0.95rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-3 uppercase">
              Your attachment style
            </p>

            <h1 className="text-[2rem] sm:text-[2.4rem] font-semibold leading-[1.15] tracking-[-0.02em] text-(--text-primary) m-0">
              {primaryDef.name}
            </h1>

            <div className="my-4 flex justify-center">
              <TierBadge
                label={result.tier.label}
                tone={getBadgeTone(result.tier.badge)}
                size="md"
              />
            </div>

            <p className="text-base leading-[1.65] text-(--text-primary) font-medium mb-2 text-[1.05rem]">
              {primaryDef.headline}
            </p>
            <p className="text-[0.9rem] leading-[1.75] text-(--text-secondary) max-w-[560px] mx-auto m-0">
              {primaryDef.summary}
            </p>

            <div
              className="flex items-center gap-4 mt-5 mb-0 justify-center flex-wrap"
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

          {/* Axis grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[var(--surface-elevated)] rounded-2xl py-6 px-6 border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-1">
              Where you land on the map
            </h3>
            <p className="text-[0.82rem] text-(--text-tertiary) m-0 mb-4">
              Your two scores plot onto the anxiety × avoidance map used in
              modern adult-attachment research.
            </p>

            <div className="attachment-grid" aria-label="Anxiety by avoidance grid">
              <span className="attachment-grid-label" style={{ top: 6, left: "50%", transform: "translateX(-50%)" }}>
                High avoidance
              </span>
              <span className="attachment-grid-label" style={{ bottom: 6, left: "50%", transform: "translateX(-50%)" }}>
                Low avoidance
              </span>
              <span className="attachment-grid-label" style={{ top: "50%", left: 6, transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "left center" }}>
                Low anxiety
              </span>
              <span className="attachment-grid-label" style={{ top: "50%", right: 6, transform: "translateY(-50%) rotate(90deg)", transformOrigin: "right center" }}>
                High anxiety
              </span>

              <span
                className="attachment-grid-dot"
                style={{ left: `${dotX}%`, top: `${dotY}%` }}
                aria-label={`Anxiety ${result.anxiety.percent}, Avoidance ${result.avoidance.percent}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <AxisRow label="Anxiety" percent={result.anxiety.percent} />
              <AxisRow label="Avoidance" percent={result.avoidance.percent} />
            </div>
          </motion.div>

          {/* Confidence tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[var(--surface-elevated)] rounded-2xl py-6 px-6 border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-2">
              How confident is this result?
            </h3>
            <p className="text-[0.88rem] leading-[1.7] text-(--text-secondary) m-0">
              {result.tier.description}
            </p>
          </motion.div>

          {/* Primary style details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[var(--surface-elevated)] rounded-2xl py-6 px-6 border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-4">
              Inside the {primaryDef.name} pattern
            </h3>
            <div className="flex flex-col gap-3.5">
              <FactRow label="In relationships" value={primaryDef.inRelationships} />
              <FactRow label="At their best" value={primaryDef.strengths} classname="add-border-top" />
              <FactRow label="Watch-outs" value={primaryDef.watchOuts} classname="add-border-top" />
              <FactRow label="Growth direction" value={primaryDef.growth} classname="add-border-top" />
              <FactRow label="Estimated prevalence" value={primaryDef.prevalence} classname="add-border-top" />
            </div>
          </motion.div>

          {/* Secondary style */}
          {result.secondary !== result.primary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="bg-[var(--surface-elevated)] rounded-2xl py-6 px-6 border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-1">
                Your runner-up: {secondaryDef.name}
              </h3>
              <p className="text-[0.82rem] text-(--text-tertiary) m-0 mb-3">
                The second style your responses leaned toward.
              </p>
              <p className="text-[0.9rem] leading-[1.7] text-(--text-secondary) m-0">
                {secondaryDef.summary}
              </p>
            </motion.div>
          )}

          {/* Full ranking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[var(--surface-elevated)] rounded-2xl py-6 px-6 border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.05rem] font-medium text-[var(--text-primary)] mb-1">
              Your full ranking
            </h3>
            <p className="text-[0.82rem] text-(--text-tertiary) m-0 mb-4">
              How close your scores landed to each of the four quadrants.
            </p>
            <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
              {result.ranking.map((row) => {
                const def = STYLE_DEFINITIONS.find((s) => s.id === row.id)!;
                const isPrimary = row.id === result.primary;
                return (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 add-border-top"
                    aria-current={isPrimary ? "true" : undefined}
                  >
                    <span
                      className={`text-[0.85rem] w-[150px] shrink-0 ${
                        isPrimary
                          ? "text-(--text-primary) font-medium"
                          : "text-(--text-secondary)"
                      }`}
                    >
                      {def.name}
                    </span>
                    <div className="flex-1 h-[8px] rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isPrimary
                            ? "bg-[var(--brand-primary)]"
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
                      {row.percent}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              Attachment-style frameworks describe patterns, not diagnoses.
              This test is for self-reflection and isn&apos;t a clinical
              assessment. If you&apos;re going through something hard, a
              licensed mental-health professional is the right next step.
            </p>
          </div>
        </div>
      </div>
    </QuizContainer>
  );
}

function FactRow({ label, value, classname = "" }: { label: string; value: string; classname?: string }) {
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

function AxisRow({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.72rem] uppercase tracking-[0.08em] font-medium text-(--text-tertiary)">
          {label}
        </span>
        <span className="text-[0.85rem] tabular-nums font-medium text-(--text-primary)">
          {percent}%
        </span>
      </div>
      <div className="h-[6px] rounded-full bg-[var(--surface-subtle)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--brand-primary)]"
          style={{ width: `${Math.max(percent, 3)}%` }}
        />
      </div>
    </div>
  );
}
