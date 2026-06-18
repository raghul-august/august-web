"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone, type ScoreTier, type CategoryBreakdown } from "../../../utils/tools/childhood-trauma-scoring";
import ScoreRing from "../shared/ScoreRing";
import TierBadge from "../shared/TierBadge";
import { colors } from "../../../utils/tools/tool-colors";
import { openAugustChat } from "../../../utils/tools/tool-urls";
import QuizContainer from "../shared/QuizContainer";
import { useAuthStore } from "@/stores/auth-store";
import { useIsWebview } from "@/hooks/use-webview";
import { SignUpModal } from "@/components/auth";
import { useLoginModalStore } from "@/stores/login-modal-store";

interface ResultsScreenProps {
  score: number;
  tier: ScoreTier;
  breakdowns: CategoryBreakdown[];
  onRestart: () => void;
}

export default function ResultsScreen({
  score,
  tier,
  breakdowns,
  onRestart,
}: ResultsScreenProps) {
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const isWebview = useIsWebview();

  const handleCTA = useCallback((ctaType: string) => {
    trackToolEvent("childhood-trauma-test", "cta_clicked", {
      cta_type: ctaType,
      score,
      tier: tier.badge,
    });
    openAugustChat(`Hi, I just took the Childhood Trauma (ACE) Test and scored ${score}/10. I'd like to talk more about what this means and how it may be affecting me.`);
  }, [score, tier.badge]);

  return (
    <QuizContainer showFooter={true}>
      <div
        style={{ background: `linear-gradient(160deg, var(--surface-subtle) 0%, ${colors.green50} 100%)` }}
      >
        <div className="max-w-[640px] mx-auto px-5 pt-10">
          {/* score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] py-6 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[1rem] font-medium text-(--text-tertiary) tracking-[0.08em] mb-5 uppercase">
              Your ACE Score
            </p>

            {/* score ring */}
            <div className="flex justify-center mb-6">
              <ScoreRing score={score} max={10} size={160} caption="out of 10" />
            </div>

            {/* tier badge */}
            <div className="mb-5">
              <TierBadge label={tier.title} tone={getBadgeTone(tier.badge)} size="md" />
            </div>

            {/* tier description */}
            <p className="text-[0.85rem] leading-[1.7] text-(--text-secondary) max-w-140 mx-auto">
              {tier.message}
            </p>

            <div className="flex items-center gap-4 mt-4 mb-0 pb-0 justify-center flex-wrap">
              <button
                type="button"
                className="tool-btn tool-btn--primary mb-0"
                onClick={() => handleCTA("talk_to_august")}
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

          {/* category breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-5">
              Category Breakdown
            </h3>
            {breakdowns.map((b) => (
              <div key={b.label} className="mb-4">
                <div className="flex justify-between mb-[6px] text-[0.85rem] font-medium">
                  <span className="text-[var(--text-secondary)]">{b.label}</span>
                  <span className="text-[var(--text-brand)]">
                    {b.count}/{b.total}
                  </span>
                </div>
                <div className="h-2 bg-[var(--brand-subtle)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${b.total > 0 ? (b.count / b.total) * 100 : 0}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${colors.green500}, ${colors.green300})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* what to do next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] mb-6"
          >
            <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
              What to do next
            </h3>
            <p className="text-[0.85rem] leading-[1.7] text-(--text-secondary) max-w-140 mx-auto">
              Understanding your ACE score is just the first step. If you want to
              explore what your results mean in more detail, get personalized
              guidance, or ask questions about your specific situation, you can chat
              with August anytime. August is an AI health companion that can help
              you make sense of your results, understand how childhood trauma
              affects adult life, and point you in the right direction for support
              - all in a private, pressure-free conversation.
            </p>
          </motion.div>

          {/* crisis resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="bg-[var(--danger-50)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
          >
            <h4 className="text-[0.95rem] font-medium text-[var(--danger-700)] mb-3">
              Crisis Resources
            </h4>
            <p className="text-[0.85rem] leading-[1.6] text-[var(--text-secondary)] mb-3">
              If you are experiencing a mental health crisis or need immediate support:
            </p>
            <div className="flex flex-col gap-2">
              <a href="tel:988" className="flex items-center gap-2 text-[0.9rem] font-medium text-[var(--text-primary)] no-underline">
                988 Suicide &amp; Crisis Lifeline - Call or text 988
              </a>
              <a href="sms:741741&body=HELLO" className="flex items-center gap-2 text-[0.9rem] font-medium text-[var(--text-primary)] no-underline">
                Crisis Text Line - Text HOME to 741741
              </a>
              <span className="text-[0.9rem] font-medium text-[var(--text-primary)]">
                Emergency - Call 911
              </span>
            </div>
          </motion.div>

          {/* disclaimer */}
          <div className="text-center text-[0.75rem] leading-[1.6] text-[var(--text-tertiary)] opacity-80 max-w-[520px] mx-auto px-4">
            This childhood trauma test is based on the Adverse Childhood
            Experiences (ACE) questionnaire originally developed through the
            CDC-Kaiser Permanente ACE Study. It is a self-reflection and
            educational tool only. It is not a clinical diagnosis, and it does not
            replace professional mental health advice, therapy, or medical
            treatment. If you are experiencing a mental health crisis or emergency,
            please contact your local emergency services (911) or a crisis helpline
            immediately. Your responses are anonymous and confidential.
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
