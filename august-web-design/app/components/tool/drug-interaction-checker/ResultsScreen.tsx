"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CookedResult,
  getTestLabel,
} from "@/app/utils/tools/drug-interaction-checker-scoring";
import { track, trackToolEvent } from "@/app/utils/analytics";
import QuizContainer from "../shared/QuizContainer";
import ScoreRing from "../shared/ScoreRing";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import { DISCLAIMER } from "@/app/data/tools/drug-interaction-checker-config";

function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

interface ResultsScreenProps {
  result: CookedResult;
  onRestart: () => void;
}

interface ScoreBarProps {
  label: string;
  score: number;
  delay: number;
}

function ScoreBar({ label, score, delay }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="w-full"
    >
      <div className="flex items-baseline justify-between mb-2 text-[14px]">
        <span className="text-[var(--text-secondary)] font-medium">{label}</span>
        <span className="tabular-nums text-[var(--text-primary)] font-medium">
          {Math.round(clamped)} / 100
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

const CROSS_LINKS: Array<{ label: string; href: string; sub: string }> = [
  {
    label: "Free ADHD test",
    href: "/tool/free-adhd-test",
    sub: "Find out if your focus issues are more than vibes",
  },
  {
    label: "Childhood trauma test",
    href: "/tool/childhood-trauma-test",
    sub: "A guided check-in on early experiences",
  },
  {
    label: "Chronotype test",
    href: "/tool/chronotype-test",
    sub: "Why your sleep schedule keeps fighting you",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-[20px] font-medium mb-5"
      style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
    >
      {children}
    </h3>
  );
}

export default function ResultsScreen({
  result,
  onRestart,
}: ResultsScreenProps) {
  const { verdict, scores, weakestTest, specimenId } = result;
  const animatedOverall = useCountUp(scores.overall, 1200);

  const handleTalkToAugust = useCallback(() => {
    // track("tool_cta_clicked", {
    //   tool: "drug-interaction-checker",
    //   cta_type: "talk_to_august",
    //   tier: verdict.tier,
    //   overall: scores.overall,
    // });
    trackToolEvent("drug-interaction-checker", "cta_clicked", {
      cta_type: "talk_to_august",
      tier: verdict.tier,
      overall: scores.overall,
    });
    openAugustChat(verdict.augustPrompt);
  }, [verdict]);

  const handleCrossLink = useCallback(
    (href: string) => {
      track("drug_interaction_checker_cross_link_clicked", {
        event_category: "Drug Interaction Checker",
        href,
        tier: verdict.tier,
      });
      window.open(href, "_self");
    },
    [verdict.tier]
  );

  const weakestLabel = getTestLabel(weakestTest);

  return (
    <QuizContainer showFooter={true}>
      <div className="max-w-[640px] mx-auto px-5 pt-12 pb-20 w-full">
        {/* Hero — flat, no card, no emoji */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p
            className="text-[12px] font-medium mb-5"
            style={{
              color: "var(--text-tertiary)",
              letterSpacing: "0.04em",
            }}
          >
            Cognitive interaction report
          </p>

          <div className="flex justify-center mb-6">
            <ScoreRing
              score={animatedOverall}
              max={100}
              size={160}
              caption="of 100"
            />
          </div>

          <h2
            className="text-[2rem] md:text-[2.25rem] font-medium mb-3"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {verdict.name}
          </h2>

          <p
            className="text-[13px] font-medium mb-5"
            style={{ color: "var(--brand-primary)" }}
          >
            {verdict.shortLabel}
          </p>

          <p
            className="text-[16px] leading-[1.65] max-w-[520px] mx-auto"
            style={{ color: "var(--text-secondary)", fontWeight: 300 }}
          >
            {verdict.description}
          </p>
        </motion.div>

        {/* Per-test breakdown */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl p-7 md:p-8 mb-5"
          style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <SectionHeading>Per-test breakdown</SectionHeading>
          <div className="flex flex-col gap-5">
            <ScoreBar label="Reaction tap" score={scores.reaction} delay={0.4} />
            <ScoreBar label="Pattern memory" score={scores.memory} delay={0.45} />
            <ScoreBar label="Color trick" score={scores.stroop} delay={0.5} />
            <ScoreBar label="Dot chase" score={scores.dotChase} delay={0.55} />
          </div>
        </motion.section>

        {/* Session summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-2xl p-7 md:p-8 mb-5"
          style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <SectionHeading>Session summary</SectionHeading>
          <dl className="grid grid-cols-1 gap-3 mb-5">
            <div className="flex justify-between text-[14px]">
              <dt className="text-[var(--text-tertiary)]">Session ID</dt>
              <dd className="tabular-nums font-medium text-[var(--text-primary)] m-0">
                {specimenId}
              </dd>
            </div>
            <div className="flex justify-between text-[14px]">
              <dt className="text-[var(--text-tertiary)]">Finding</dt>
              <dd className="font-medium text-[var(--text-primary)] m-0">
                {verdict.shortLabel}
              </dd>
            </div>
            <div className="flex justify-between text-[14px]">
              <dt className="text-[var(--text-tertiary)]">Weakest domain</dt>
              <dd className="font-medium text-[var(--text-primary)] m-0">
                {weakestLabel}
              </dd>
            </div>
          </dl>
          <p
            className="text-[15px] leading-[1.7] m-0"
            style={{ color: "var(--text-secondary)", fontWeight: 300 }}
          >
            {verdict.receipt}
          </p>
        </motion.section>

        {/* What to do next */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="rounded-2xl p-7 md:p-8 mb-5"
          style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <SectionHeading>What to do next</SectionHeading>
          <ul className="list-none m-0 mb-6 p-0 flex flex-col gap-2.5">
            {verdict.advice.map((line) => (
              <li
                key={line}
                className="text-[15px] leading-[1.65] pl-5 relative"
                style={{ color: "var(--text-secondary)", fontWeight: 300 }}
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-[10px] w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--brand-primary)" }}
                />
                {line}
              </li>
            ))}
          </ul>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleTalkToAugust}
              className="rounded-full font-medium cursor-pointer transition-colors duration-200 hover:bg-[var(--brand-primary-hover)]"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "auto",
                minWidth: "200px",
                padding: "14px 28px",
                fontSize: "16px",
                background: "var(--brand-primary)",
                color: "var(--text-inverse)",
                border: "none",
              }}
            >
              Talk to august now
            </button>
          </div>
        </motion.section>

        {/* Cross-tool links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="rounded-2xl p-7 md:p-8 mb-8"
          style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <SectionHeading>While you&apos;re here</SectionHeading>
          <div className="flex flex-col gap-2.5">
            {CROSS_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleCrossLink(link.href)}
                className="w-full text-left px-5 py-4 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-[var(--surface-subtle)]"
                style={{
                  background: "var(--surface-page)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="text-[15px] font-medium text-[var(--text-primary)]">
                  {link.label}
                </div>
                <div
                  className="text-[13px] mt-1"
                  style={{ color: "var(--text-tertiary)", fontWeight: 300 }}
                >
                  {link.sub}
                </div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Take again */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-center mb-8"
        >
          <button
            type="button"
            onClick={onRestart}
            className="text-[14px] font-medium underline-offset-4 hover:underline cursor-pointer bg-transparent border-0 p-0"
            style={{ color: "var(--text-tertiary)" }}
          >
            Take the test again
          </button>
        </motion.div>

        {/* Disclaimer */}
        <p
          className="text-center text-[12px] leading-[1.6] max-w-[520px] mx-auto"
          style={{ color: "var(--text-tertiary)", fontWeight: 300 }}
        >
          {DISCLAIMER}
        </p>
      </div>
    </QuizContainer>
  );
}
