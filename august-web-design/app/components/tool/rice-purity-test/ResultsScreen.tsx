"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ScoreTier, SecretZone, CategoryBreakdown, getBadgeTone } from "../../../utils/tools/rice-purity-scoring";
import { track, trackToolEvent } from "@/app/utils/analytics";
import QuizContainer from "../shared/QuizContainer";
import { openAugustChat, getQuizUrl } from "../../../utils/tools/tool-urls";
import ShareSheet from "../shared/ShareSheet";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import DownloadResultButton from "../shared/DownloadResultButton";
import { useDownloadResult } from "../shared/hooks/useDownloadResult";
import { useAuthStore } from "@/stores/auth-store";
import { useIsWebview } from "@/hooks/use-webview";
import { SignUpModal } from "@/components/auth";
import { useLoginModalStore } from "@/stores/login-modal-store";

import { colors } from "../../../utils/tools/tool-colors";

/* ──────────────────── bar visualization ──────────────────── */
function CategoryBar({ b, index }: { b: CategoryBreakdown; index: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200 + index * 120);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <li className="mt-3">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[0.88rem] text-(--text-primary) font-medium">
          {b.category.title}
        </span>
        <span className="text-[0.75rem] font-medium text-(--text-tertiary) tabular-nums">
          {b.checked}/{b.total}
        </span>
      </div>
      <div style={{ height: "4px", background: colors.green100, borderRadius: "999px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: visible ? `${Math.max(b.percentage, 2)}%` : "0%",
            background: colors.green500,
            borderRadius: "999px",
            transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </li>
  );
}

/* ──────────────────── main component ──────────────────── */
interface ResultsScreenProps {
  score: number;
  tier: ScoreTier;
  secretZone: SecretZone | null;
  breakdowns: CategoryBreakdown[];
  checkedCount: number;
  onRestart: () => void;
}

export default function ResultsScreen({ score, tier, secretZone, breakdowns, checkedCount, onRestart }: ResultsScreenProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const isWebview = useIsWebview();

  useEffect(() => { setMounted(true); }, []);

  const quizUrl = getQuizUrl("rice-purity-test");
  const shareText = `I scored ${score}/100 on the Rice Purity Test!\nHow many body secrets are you keeping?`;

  const handleShare = useCallback(async () => {
    track("rice_purity_result_shared", { event_category: "Rice Purity Test", score });
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try { await navigator.share({ text: `${shareText}\n${quizUrl}` }); return; } catch {}
    }
    setShowShareMenu(true);
  }, [score, shareText, quizUrl]);

  const { resultRef, handleDownload } = useDownloadResult({
    toolId: "rice-purity-test",
    filename: `rice-purity-test-${score}`,
    heading: "Rice Purity Test Result",
    subtitle: `Purity Report • ${tier.title}`,
    toolName: "Rice Purity Test",
    maxPageHeight: 1200
  });

  const handleTextAugust = useCallback(() => {
    trackToolEvent("rice-purity-test", "cta_clicked", {
      cta_type: "talk_to_august",
      score,
    });
    openAugustChat(`Hi, I just took the Rice Purity Test and scored ${score}/100 (${tier.title}). I'd like to talk about some health questions I've been keeping to myself.`);
  }, [score, tier.title]);

  return (
    <QuizContainer showFooter={true}>
      <ShareSheet
        isOpen={showShareMenu && mounted}
        onClose={() => setShowShareMenu(false)}
        shareUrl={quizUrl}
        shareText={shareText}
      />

      <div className="bg-gradient-to-b from-(--surface-subtle) to-(--brand-subtle)/40">
        <div ref={resultRef} className="max-w-[640px] mx-auto px-5 pt-10 pb-[60px]">
          <div className="flex justify-end mb-3" data-skip-screenshot="true">
            <DownloadResultButton onClick={handleDownload} />
          </div>
          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] p-[48px_32px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your purity score
            </p>

            <div className="flex justify-center mb-6">
              <ScoreRing
                score={score}
                max={100}
                size={160}
                caption="/ 100"
              />
            </div>

            <div className="mb-5 flex justify-center">
              <TierBadge
                label={tier.title}
                tone={getBadgeTone(tier.badge)}
                size="md"
              />
            </div>

            <p className="text-base leading-[1.65] text-(--text-primary) font-medium mb-2 text-[1.1rem]">
              {tier.message}
            </p>
            <p className="text-[0.85rem] leading-[1.7] text-(--text-secondary) max-w-140 mx-auto">
              {checkedCount} of 34 items checked, each one a quiet thing you&apos;ve been carrying.
            </p>

            <div className="flex items-center gap-4 mt-4 mb-0 pb-0 justify-center flex-wrap" data-skip-screenshot="true">
              {/* <button
                type="button"
                className="tool-btn tool-btn--primary mb-0"
                onClick={handleShare}
              >
                Share your score
              </button> */}

              <button
              type="button"
              className="tool-btn tool-btn--primary mb-0"
              onClick={handleTextAugust}
            >
              Talk to August
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

          {/* Secret zone callout */}
          {secretZone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[24px] border border-[var(--border-subtle)] mb-6 flex items-start gap-4"
            >
              <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--brand-subtle)] flex items-center justify-center text-[var(--brand-primary)] font-semibold">
                {secretZone.count}
              </div>
              <div className="flex-1">
                <p className="text-[0.95rem] font-medium text-(--text-primary) mb-1">
                  Your secret zone: {secretZone.label}
                </p>
                <p className="text-[0.85rem] leading-[1.65] text-(--text-secondary) m-0">
                  {secretZone.description}
                </p>
              </div>
            </motion.div>
          )}

          {/* Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
              Breakdown by category
            </h3>
            <p className="text-[0.85rem] text-(--text-tertiary) mb-4 leading-[1.65]">
              Each category groups a different kind of unspoken health thought. Here&apos;s how many you checked in each:
            </p>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {breakdowns.map((b, i) => (
                <CategoryBar key={b.category.id} b={b} index={i} />
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
              Your score says a lot. But the questions you never asked say more.
              The items you checked are the ones most people keep to themselves
              and they&apos;re usually the ones worth talking about first.
            </p>
            <p className="text-[0.88rem] leading-[1.75] text-(--text-secondary) m-0 mb-4">
              August is an AI health companion you can ask anything, without
              judgment. It can listen, help you make sense of what came up, and
              point you toward the right kind of support.
            </p>
            {/* <button
              type="button"
              className="tool-btn tool-btn--primary mb-0"
              onClick={handleTextAugust}
            >
              Ask August — it&apos;s free
            </button> */}
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center text-[0.72rem] leading-[1.65] text-(--text-tertiary) opacity-85 max-w-[560px] mx-auto px-4">
            <p className="tl-disclaimer">
              Not a medical tool. Just a mirror showing what you&apos;ve been
              handling alone.
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
