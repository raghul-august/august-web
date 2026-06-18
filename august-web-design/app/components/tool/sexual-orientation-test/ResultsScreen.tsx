"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import {
  OrientationResult,
  AffinityTier,
  OrientationArchetype,
} from "@/app/utils/tools/sexual-orientation-scoring";
import { trackToolEvent } from "@/app/utils/analytics";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import { useDownloadResult } from "../shared/hooks/useDownloadResult";
import DownloadResultButton from "../shared/DownloadResultButton";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { BadgeTone } from "@/app/utils/tools/tool-colors";
import { useAuthStore } from "@/stores/auth-store";
import { useIsWebview } from "@/hooks/use-webview";
import { SignUpModal } from "@/components/auth";
import { useLoginModalStore } from "@/stores/login-modal-store";

const tierTone: Record<AffinityTier, BadgeTone> = {
  Strong: "success",
  Moderate: "info",
  Low: "neutral",
};

const dimensionLabels: Record<keyof OrientationResult["dimensions"], string> = {
  sameGender: "Same-gender attraction",
  differentGender: "Different-gender attraction",
  multiGender: "Multi-gender openness",
  asexual: "Asexual spectrum",
};

function getDominant(result: OrientationResult): {
  score: number;
  tier: AffinityTier;
} {
  const { archetype, dimensions } = result;
  const map: Record<OrientationArchetype, keyof OrientationResult["dimensions"] | null> = {
    "predominantly-different": "differentGender",
    "predominantly-same": "sameGender",
    "multi-gender": "multiGender",
    "asexual-spectrum": "asexual",
    exploring: null,
  };
  const key = map[archetype];
  if (key) {
    return {
      score: Math.round(dimensions[key].score),
      tier: dimensions[key].tier,
    };
  }
  const entries = Object.values(dimensions);
  const top = entries.reduce((a, b) => (a.score >= b.score ? a : b));
  return { score: Math.round(top.score), tier: top.tier };
}

interface ResultsScreenProps {
  result: OrientationResult;
  onRestart: () => void;
}

interface DimensionBarProps {
  label: string;
  score: number;
  tier: AffinityTier;
  delay: number;
}

function tierColor(tier: AffinityTier): string {
  if (tier === "Strong") return "var(--brand-primary)";
  if (tier === "Moderate") return "var(--text-secondary)";
  return "var(--text-tertiary)";
}

function DimensionBar({ label, score, tier, delay }: DimensionBarProps) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="w-full"
    >
      <div className="flex items-baseline justify-between mb-2 text-[14px]">
        <span className="text-(--text-secondary) font-medium">{label}</span>
        <span className="flex items-baseline gap-2.5">
          <span className="tabular-nums text-(--text-primary) font-medium">
            {Math.round(clamped)}%
          </span>
          <span
            className="text-[12px] font-medium"
            style={{ color: tierColor(tier) }}
          >
            {tier}
          </span>
        </span>
      </div>
      <div
        className="relative w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--border-subtle)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ delay: delay + 0.1, duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "var(--brand-primary)" }}
        />
      </div>
    </motion.div>
  );
}

interface BipolarBarProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  delay: number;
}

function BipolarBar({ leftLabel, rightLabel, value, delay }: BipolarBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const isBalanced = clamped >= 45 && clamped <= 55;
  const leanLabel = isBalanced
    ? "Balanced"
    : clamped > 55
      ? `Leans ${rightLabel.toLowerCase()}`
      : `Leans ${leftLabel.toLowerCase()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="w-full"
    >
      <div
        className="relative w-full h-2 rounded-full"
        style={{ background: "var(--border-subtle)" }}
      >
        <div
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-3"
          style={{
            left: "50%",
            background: "var(--text-tertiary)",
            opacity: 0.4,
          }}
        />
        <motion.div
          initial={{ left: "50%" }}
          animate={{ left: `${clamped}%` }}
          transition={{ delay: delay + 0.1, duration: 0.6, ease: "easeOut" }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
          style={{
            background: "var(--brand-primary)",
            border: "2px solid var(--surface-elevated)",
            boxShadow: "0 0 0 1px var(--border-subtle)",
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-[12px]">
        <span style={{ color: "var(--text-tertiary)", fontWeight: 500 }}>
          {leftLabel}
        </span>
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
          {leanLabel}
        </span>
        <span style={{ color: "var(--text-tertiary)", fontWeight: 500 }}>
          {rightLabel}
        </span>
      </div>
    </motion.div>
  );
}

export default function ResultsScreen({
  result,
  onRestart,
}: ResultsScreenProps) {
  const dominant = getDominant(result);
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const isWebview = useIsWebview();

  const handleTalkToAugust = useCallback(() => {
    trackToolEvent("sexual-orientation-test", "cta_clicked", {
      cta_type: "talk_to_august",
      archetype: result.archetype,
    });
    openAugustChat(
      `Hi, I just took the sexual orientation test and got "${result.shortLabel}". I'd like to talk through what this means for me.`
    );
  }, [result]);

  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "sexual-orientation-test",
    filename: `sexual-orientation-${result.shortLabel}`,
    heading: "Sexual Orientation Result",
    subtitle: `Sexual Orientation Report • ${result.shortLabel}`,
    toolName: "Sexual Orientation Test",
  });

  return (
    <QuizContainer showFooter={true}>
      <div ref={resultRef} className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div className="max-w-[640px] mx-auto px-8 sm:px-12 pt-10 pb-[60px]">
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
              Your orientation result
            </p>

            <div className="flex justify-center mb-6">
              <ScoreRing
                score={dominant.score}
                max={100}
                size={160}
                caption="/ 100"
              />
            </div>

            <div className="mb-5 flex justify-center">
              <TierBadge
                label={`${result.name} : ${dominant.tier}`}
                tone={tierTone[dominant.tier]}
                size="md"
              />
            </div>

            <p className="text-base leading-[1.65] text-(--text-primary) font-medium mb-2 text-[1.1rem]">
              {result.shortLabel}
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

          {/* Your spectrum dimensions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              Your spectrum dimensions
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              Orientation isn&apos;t a single number. These four signals show how
              your answers lean across the dimensions the quiz measured.
            </p>
            <div className="flex flex-col gap-4">
              <DimensionBar
                label={dimensionLabels.sameGender}
                score={result.dimensions.sameGender.score}
                tier={result.dimensions.sameGender.tier}
                delay={0.3}
              />
              <DimensionBar
                label={dimensionLabels.differentGender}
                score={result.dimensions.differentGender.score}
                tier={result.dimensions.differentGender.tier}
                delay={0.35}
              />
              <DimensionBar
                label={dimensionLabels.multiGender}
                score={result.dimensions.multiGender.score}
                tier={result.dimensions.multiGender.tier}
                delay={0.4}
              />
              <DimensionBar
                label={dimensionLabels.asexual}
                score={result.dimensions.asexual.score}
                tier={result.dimensions.asexual.tier}
                delay={0.45}
              />
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
              <p className="text-[0.78rem] font-medium text-(--text-tertiary) tracking-[0.04em] mb-3 uppercase">
                Attraction lean
              </p>
              <BipolarBar
                leftLabel="Sexual"
                rightLabel="Romantic"
                value={result.romanticLean}
                delay={0.5}
              />
            </div>

            <p className="text-[0.85rem] leading-[1.65] text-(--text-tertiary) mt-5 pt-4 border-t border-[var(--border-subtle)]">
              <span className="font-semibold text-(--text-secondary)">
                Dominant signal:
              </span>{" "}
              {dominant.score}/100 ({dominant.tier}) : Based on the dimension
              that shaped your archetype. Higher means a clearer, more
              consistent pattern in your answers.
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
              Orientation is a pattern, not a verdict. Twelve questions
              can&apos;t capture every nuance, and your attractions may shift
              over time or sit between labels. Trust your own read of yourself
              over any single result.
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
              This is a self-reflection tool, not a diagnostic instrument. Your
              orientation is personal and complex, and 12 questions can&apos;t
              capture it fully. If you&apos;re working through questions about
              identity, a therapist who specialises in sexuality can help.
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
