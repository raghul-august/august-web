"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { VibeCheck, getBadgeTone } from "../../../utils/tools/adhd-scoring";
import { track, trackToolEvent } from "@/app/utils/analytics";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import { openAugustChat, getQuizUrl } from "../../../utils/tools/tool-urls";
import ShareSheet from "../shared/ShareSheet";
import { useAuthStore } from "@/stores/auth-store";
import { useIsWebview } from "@/hooks/use-webview";
import { SignUpModal } from "@/components/auth";
import { useLoginModalStore } from "@/stores/login-modal-store";
import lowKeyCard from "@/public/quiz/cards/low_key_card.png";
import maybeSomethingCard from "@/public/quiz/cards/maybe_something_card.png";
import notableVibesCard from "@/public/quiz/cards/notable_vibes_card.png";
import goodVibesCard from "@/public/quiz/cards/good_vibes_card.png";

import { colors } from "../../../utils/tools/tool-colors";

interface ResultsScreenProps {
  continuous: number;
  dichotomous: number;
  vibe: VibeCheck;
  onRestart: () => void;
}

function getCardImage(score: number) {
  if (score <= 9) return lowKeyCard;
  if (score <= 13) return maybeSomethingCard;
  if (score <= 17) return notableVibesCard;
  return goodVibesCard;
}

function CardModal({
  score,
  dichotomous,
  cardImage,
  vibeLabel,
  onDismiss,
}: {
  score: number;
  dichotomous: number;
  cardImage: any;
  vibeLabel: string;
  onDismiss: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareHovered, setShareHovered] = useState(false);
  const [downloadHovered, setDownloadHovered] = useState(false);
  const [augustHovered, setAugustHovered] = useState(false);
  const [isPreparingShare, setIsPreparingShare] = useState(false);
  const [shareImageBlob, setShareImageBlob] = useState<Blob | null>(null);

  const quizUrl = getQuizUrl("free-adhd-test");

  // Pre-generate the share image as soon as results modal opens
  useEffect(() => {
    if (typeof window === "undefined") return;

    const imageUrl = `${window.location.origin}/api/og/adhd-result?score=${score}`;

    // Fetch and cache the image blob for sharing
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => setShareImageBlob(blob))
      .catch(() => {}); // Silently fail, will retry on share
  }, [score]);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const shareText = `I just took this ADHD quiz!\nCurious about yours?\n${quizUrl}`;

  const handleShare = useCallback(async () => {
    const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    track('quiz_result_shared', {
      event_category: 'ADHD Quiz',
      share_method: hasNativeShare ? 'native_share' : 'share_menu'
    });

    if (hasNativeShare) {
      try {
        let imageBlob = shareImageBlob;
        if (!imageBlob) {
          setIsPreparingShare(true);
          const imageUrl = `${window.location.origin}/api/og/adhd-result?score=${score}`;
          const response = await fetch(imageUrl);
          imageBlob = await response.blob();
          setIsPreparingShare(false);
        }

        const file = new File([imageBlob], "adhd-quiz-result.png", { type: "image/png" });

        if (navigator.canShare?.({ files: [file], text: shareText })) {
          await navigator.share({ files: [file], text: shareText });
          return;
        }

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: shareText });
          return;
        }

        await navigator.share({ text: shareText });
        return;
      } catch (err) {
        setIsPreparingShare(false);
      }
    }

    setShowShareMenu(true);
  }, [score, quizUrl, shareText, shareImageBlob]);

  const handleDownload = useCallback(() => {
    const imageUrl = `${window.location.origin}/api/og/adhd-result?score=${score}`;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "adhd-quiz-result.png";
    link.click();
  }, [score]);

  const handleTextAugust = useCallback(() => {
    // track('tool_cta_clicked', {
    //   tool: 'free-adhd-test',
    //   cta_type: 'talk_to_august'
    // });
    trackToolEvent("free-adhd-test", "cta_clicked", {
      cta_type: "talk_to_august",
      score,
    });

    openAugustChat(`Hi, I have taken this ADHD quiz and scored ${score}/24. I would like to talk more about it`);
  }, [score]);

  if (!mounted) return null;

  return createPortal(
    <>
      <motion.div
        className="fixed inset-0 w-screen h-screen bg-black/75 backdrop-blur-[8px] flex items-center justify-center z-[9999] p-[20px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <motion.div
          className="flex flex-col items-center gap-[16px] max-h-[90vh] py-[20px]"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative max-w-[320px] w-full rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
            <Image src={cardImage} alt={vibeLabel} className="w-full h-auto block" width={320} height={320} />
            <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 flex items-baseline justify-center gap-[3px]">
              <span className="text-[3.25rem] font-medium text-white leading-none">{score}</span>
              <span className="text-[2rem] font-medium text-white/85">/24</span>
            </div>
          </div>
          <div className="flex flex-col gap-[10px] w-full max-w-[320px]">
            <motion.button
              className="w-full flex items-center justify-center gap-[6px] border-none rounded-full py-[12px] px-[18px] text-[0.9rem] font-medium cursor-pointer transition-all duration-150 text-[var(--text-primary)]"
              style={{
                background: shareHovered ? colors.green50 : "white",
                opacity: isPreparingShare ? 0.7 : 1,
              }}
              onClick={handleShare}
              disabled={isPreparingShare}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setShareHovered(true)}
              onMouseLeave={() => setShareHovered(false)}
            >
              {isPreparingShare ? (
                <span>Preparing...</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Share your results
                </>
              )}
            </motion.button>
            <motion.button
              className="w-full flex items-center justify-center gap-[6px] border-none rounded-full py-[12px] px-[18px] text-[0.9rem] font-medium cursor-pointer transition-all duration-150 text-[var(--text-primary)]"
              style={{ background: downloadHovered ? colors.green50 : "white" }}
              onClick={handleDownload}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setDownloadHovered(true)}
              onMouseLeave={() => setDownloadHovered(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download card
            </motion.button>
            <motion.button
              className="w-full flex items-center justify-center gap-[6px] border-none rounded-full py-[12px] px-[18px] text-[0.9rem] font-medium cursor-pointer transition-all duration-150 text-white"
              style={{ background: augustHovered ? colors.green500 : colors.green600 }}
              onClick={handleTextAugust}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setAugustHovered(true)}
              onMouseLeave={() => setAugustHovered(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Discuss your results with August
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
      <ShareSheet
        isOpen={showShareMenu}
        onClose={() => setShowShareMenu(false)}
        shareUrl={quizUrl}
        shareText={`I just took this ADHD quiz and scored ${score}/24!\nCurious about yours?`}
      />
    </>,
    document.body
  );
}

export default function ResultsScreen({
  continuous,
  dichotomous,
  vibe,
  onRestart,
}: ResultsScreenProps) {
  const [showCard, setShowCard] = useState(false);
  const [restartHovered, setRestartHovered] = useState(false);
  const [miniCardHovered, setMiniCardHovered] = useState(false);
  const positive = dichotomous >= 4;
  const cardImage = getCardImage(continuous);
  const vibeTone = getBadgeTone(vibe.badge);
  const screeningTone = getBadgeTone(positive ? "badge-high" : "badge-low");
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const isWebview = useIsWebview();

  return (
    <QuizContainer showFooter={true} showBlobs={true}>
      <AnimatePresence>
        {showCard && (
          <CardModal
            score={continuous}
            dichotomous={dichotomous}
            cardImage={cardImage}
            vibeLabel={vibe.label}
            onDismiss={() => setShowCard(false)}
          />
        )}
      </AnimatePresence>

      {/* Results Content */}
      <div className="flex-1 flex flex-col justify-center items-center py-[32px] px-[24px] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px]"
        >
          {/* Header */}
          <motion.div
            className="text-center mb-[24px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-[1.75rem] font-medium text-[var(--text-primary)] m-[0_0_8px]">The results are in</h1>
            <p className="text-[1rem] text-[var(--text-secondary)] m-0">{vibe.vibe}</p>
          </motion.div>

          {/* Card Preview */}
          <motion.button
            className="flex items-center gap-[16px] w-full py-[12px] px-[16px] bg-white/80 backdrop-blur-[10px] border border-[var(--border-subtle)] rounded-[16px] cursor-pointer transition-all duration-200 mb-[20px]"
            style={{ transform: miniCardHovered ? "translateY(-2px)" : "none" }}
            onClick={() => setShowCard(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onMouseEnter={() => setMiniCardHovered(true)}
            onMouseLeave={() => setMiniCardHovered(false)}
          >
            <Image src={cardImage} alt={vibe.label} width={60} height={60} className="rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]" />
            <span className="text-[0.95rem] font-medium text-[var(--text-primary)]">Tap to view your card</span>
          </motion.button>

          {/* Score Cards */}
          <motion.div
            className="flex gap-[12px] mb-[20px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Symptom score with ScoreRing */}
            <div className="flex-1 p-[20px] rounded-[16px] bg-white/80 backdrop-blur-[10px] border border-[var(--border-subtle)] flex flex-col items-center gap-3">
              <div className="text-[0.75rem] font-medium tracking-[0.1em] text-[var(--text-secondary)]">Symptom score</div>
              <ScoreRing score={continuous} max={24} size={96} />
              <TierBadge label={vibe.label} tone={vibeTone} />
            </div>

            {/* Screening indicator */}
            <div className="flex-1 p-[20px] rounded-[16px] bg-white/80 backdrop-blur-[10px] border border-[var(--border-subtle)] flex flex-col items-center gap-3">
              <div className="text-[0.75rem] font-medium tracking-[0.1em] text-[var(--text-secondary)]">Screening indicator</div>
              <ScoreRing score={dichotomous} max={6} size={96} />
              <TierBadge
                label={positive ? "Positive screen" : "Negative screen"}
                tone={screeningTone}
              />
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            className="bg-white/80 backdrop-blur-[10px] rounded-[16px] p-[20px] mb-[20px] border border-[var(--border-subtle)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-[0.95rem] font-medium text-[var(--text-primary)] m-[0_0_8px]">A note</h3>
            <p className="text-[0.9rem] text-[var(--text-secondary)] leading-[1.6] m-0">
              This isn&apos;t a diagnosis - it&apos;s just a starting point for
              understanding your brain better. If these results resonate,
              consider chatting with a mental health professional who can give
              you the full picture.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-[0.9rem] text-[var(--text-secondary)] m-[0_0_12px]">Found this helpful?</p>
            <motion.button
              className="py-[12px] px-[24px] backdrop-blur-[10px] rounded-full text-[0.9rem] font-medium text-[var(--text-primary)] cursor-pointer transition-all duration-200"
              style={{
                background: restartHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.8)",
                border: `1px solid var(--border-subtle)`,
              }}
              onClick={onRestart}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setRestartHovered(true)}
              onMouseLeave={() => setRestartHovered(false)}
            >
              Take it again
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {isAnonymous && !isWebview && !showCard && (
        <SignUpModal
          onDismiss={() => useLoginModalStore.getState().close()}
        />
      )}
    </QuizContainer>
  );
}
