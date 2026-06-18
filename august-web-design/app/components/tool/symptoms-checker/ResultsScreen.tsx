"use client";

import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { getBadgeTone } from "@/app/utils/tools/tool-colors";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import type { SymptomsResult } from "@/app/utils/tools/symptoms-checker-scoring";
import QuizContainer from "../shared/QuizContainer";
import TierBadge from "../shared/TierBadge";
import { ToolAuthGate } from "@/components/auth";

interface ResultsScreenProps {
  result: SymptomsResult;
  onRestart: () => void;
}

function UrgencyHeroIcon({ tone }: { tone: SymptomsResult["urgency"]["tone"] }) {
  // Pick a glyph that matches what the urgency band is asking the user to do.
  if (tone === "warning") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <circle cx="12" cy="17" r="0.6" fill="currentColor" />
      </svg>
    );
  }
  if (tone === "caution") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15.5 14" />
      </svg>
    );
  }
  if (tone === "neutral") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <line x1="3.5" y1="10" x2="20.5" y2="10" />
        <line x1="8" y1="3.5" x2="8" y2="6.5" />
        <line x1="16" y1="3.5" x2="16" y2="6.5" />
      </svg>
    );
  }
  // info / self-care / routine
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 13.2A8.5 8.5 0 1 1 12 4.5" />
      <polyline points="8.5 12 11.5 15 20 6.5" />
    </svg>
  );
}

function heroToneClass(tone: SymptomsResult["urgency"]["tone"]): string {
  return `sc-urgency-hero sc-urgency-hero--${tone}`;
}

const INLINE_NAVBAR_HEIGHT = 56;

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  useEffect(() => {
    // Results is lazy-loaded inside <Suspense>, so Quiz's screen-change effect
    // fires before this component is on screen and the scroll has no content
    // to land on. Re-run the scroll here once the results are actually mounted.
    const container = document.querySelector<HTMLElement>(
      "[data-scroll-container]",
    );
    container?.scrollTo({ top: INLINE_NAVBAR_HEIGHT, behavior: "smooth" });
  }, []);

  const handleTalkToAugust = useCallback(() => {
    // track("tool_cta_clicked", {
    //   tool: "symptoms-checker",
    //   cta_type: "talk_to_august",
    //   urgency: result.urgency.id,
    //   symptom: result.summary.symptomLabel ?? "unknown",
    // });
    trackToolEvent("symptoms-checker", "cta_clicked", {
      cta_type: "talk_to_august",
      urgency: result.urgency.id,
      symptoms : result.summary.symptomLabel ?? "unknown"
    });
    const msg = `Hi, I just used the symptoms checker. It suggested "${result.urgency.label}" for ${result.summary.symptomLabel ?? "my symptom"}${
      result.summary.regionLabel ? ` (${result.summary.regionLabel})` : ""
    }. I'd like to talk through what to do next.`;
    openAugustChat(msg);
  }, [result]);

  const {
    urgency,
    conditions,
    recommendations,
    matchedRedFlags,
    matchedFactors,
    summary,
  } = result;

  const factorsByGroup = matchedFactors.reduce<Record<string, string[]>>((acc, f) => {
    (acc[f.groupTitle] = acc[f.groupTitle] ?? []).push(f.label);
    return acc;
  }, {});

  const summaryRows: { label: string; value: string }[] = [];
  if (summary.sexLabel) summaryRows.push({ label: "Sex", value: summary.sexLabel });
  if (summary.ageLabel) summaryRows.push({ label: "Age", value: summary.ageLabel });
  if (summary.regionLabel) summaryRows.push({ label: "Body region", value: summary.regionLabel });
  if (summary.symptomLabel) summaryRows.push({ label: "Primary symptom", value: summary.symptomLabel });
  if (summary.durationLabel) summaryRows.push({ label: "Duration", value: summary.durationLabel });
  if (summary.severityLabel) summaryRows.push({ label: "Severity", value: summary.severityLabel });

  return (
    <QuizContainer showFooter={true}>
      <div className="bg-gradient-to-b from-[var(--surface-subtle)] to-[var(--brand-subtle)]/40">
        <div className="max-w-[640px] mx-auto px-5 pt-10 pb-[60px]">
          {/* Hero urgency card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--surface-elevated)] rounded-[28px] py-8 px-6 border border-[var(--border-subtle)] text-center mb-6"
          >
            <p className="text-[0.78rem] font-medium text-[var(--text-tertiary)] tracking-[0.08em] mb-5 uppercase">
              Suggested next step
            </p>

            <div className="flex justify-center mb-6">
              <div className={heroToneClass(urgency.tone)}>
                <UrgencyHeroIcon tone={urgency.tone} />
              </div>
            </div>

            <div className="mb-5 flex justify-center">
              <TierBadge
                label={urgency.short}
                tone={getBadgeTone(urgency.badge)}
                size="md"
              />
            </div>

            <p className="text-[1.1rem] leading-[1.5] text-[var(--text-primary)] font-medium mb-2">
              {urgency.headline}
            </p>
            <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] max-w-[520px] mx-auto">
              {urgency.description}
            </p>

            <div className="flex items-center justify-center flex-wrap gap-4 mt-6">
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

          {/* What you told us */}
          {summaryRows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
                What you told us
              </h3>
              <p className="text-[0.85rem] text-[var(--text-tertiary)] mb-4 leading-normal">
                The inputs we used to build this triage.
              </p>
              <ul className="flex flex-col m-0 p-0 list-none">
                {summaryRows.map((row) => (
                  <li
                    key={row.label}
                    className="flex justify-between gap-3 items-start sc-row text-[0.85rem] text-[var(--text-secondary)] leading-[1.5]"
                  >
                    <span className="text-[0.7rem] font-semibold text-[var(--brand-primary)] uppercase tracking-[0.06em] whitespace-nowrap pt-[2px] shrink-0">
                      {row.label}
                    </span>
                    <span className="text-[0.85rem] text-right text-[var(--text-primary)]">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Red flags that pushed urgency up */}
          {matchedRedFlags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
                What pushed your urgency up
              </h3>
              <p className="text-[0.85rem] text-[var(--text-tertiary)] mb-4 leading-normal">
                The symptoms you flagged that clinicians take most seriously.
              </p>
              <ul className="flex flex-col m-0 p-0 list-none">
                {matchedRedFlags.map((label) => (
                  <li
                    key={label}
                    className="sc-row text-[0.85rem] text-[var(--text-secondary)] leading-[1.5]"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Related factors */}
          {matchedFactors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
                Related factors you flagged
              </h3>
              <p className="text-[0.85rem] text-[var(--text-tertiary)] mb-4 leading-normal">
                Qualifiers that shape what your symptom is most likely to be.
              </p>
              <ul className="flex flex-col m-0 p-0 list-none">
                {Object.entries(factorsByGroup).map(([groupTitle, labels]) => (
                  <li
                    key={groupTitle}
                    className="flex justify-between gap-3 items-start sc-row text-[0.85rem] text-[var(--text-secondary)] leading-[1.5]"
                  >
                    <span className="text-[0.7rem] font-semibold text-[var(--brand-primary)] uppercase tracking-[0.06em] whitespace-nowrap pt-[2px] shrink-0">
                      {groupTitle}
                    </span>
                    <span className="text-[0.85rem] text-right text-[var(--text-primary)]">
                      {labels.join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Possible causes */}
          {conditions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[28px_24px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-2">
                Common causes that match
              </h3>
              <p className="text-[0.85rem] text-[var(--text-tertiary)] mb-4 leading-normal">
                The most common causes that line up with what you described. None
                of these are a diagnosis — a clinician can narrow it down.
              </p>
              <ul className="flex flex-col m-0 p-0 list-none">
                {conditions.map((c) => (
                  <li key={c.name} className="sc-row">
                    <p className="text-[0.9rem] font-medium text-[var(--text-primary)] mb-1">
                      {c.name}
                    </p>
                    <p className="text-[0.85rem] text-[var(--text-secondary)] leading-[1.55] m-0">
                      {c.description}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* What to do next */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[var(--surface-elevated)] rounded-2xl p-[32px_28px] border border-[var(--border-subtle)] mb-6"
            >
              <h3 className="text-[1.1rem] font-medium text-[var(--text-primary)] mb-3">
                What to do next
              </h3>
              <p className="text-[0.85rem] leading-[1.7] text-[var(--text-secondary)] mb-4">
                Practical next steps tailored to the urgency level above. If
                anything new appears or symptoms get worse, escalate care.
              </p>
              <ul className="flex flex-col gap-[10px] m-0 p-0 list-none">
                {recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-[10px] text-[0.88rem] text-[var(--text-secondary)] leading-[1.6]"
                  >
                    <span className="text-[var(--brand-primary)] shrink-0 pt-[2px] text-[0.85rem]">
                      ✓
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Disclaimer */}
          <div className="text-center text-[0.75rem] leading-[1.6] text-[var(--text-tertiary)] opacity-80 max-w-[520px] mx-auto px-4">
            Educational triage only. Not a diagnosis and not a replacement for
            professional medical advice. If you think you may be having an
            emergency, call 911.
          </div>
        </div>
      </div>

      <ToolAuthGate active />
    </QuizContainer>
  );
}
