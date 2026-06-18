"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect } from "react";
import {
  COLOR_BY_VALUE,
  SHAPE_BY_VALUE,
} from "@/app/data/tools/pill-identifier-config";
import type { PillRecord } from "@/app/data/tools/pill-identifier-config";
import type { PillSearchQuery } from "@/app/utils/tools/pill-identifier-search";
import { openAugustChat } from "@/app/utils/tools/tool-urls";
import { trackToolEvent } from "@/app/utils/analytics";
import QuizContainer from "../shared/QuizContainer";

interface ResultsScreenProps {
  query: PillSearchQuery;
  matches: readonly PillRecord[];
  onBack: () => void;
  onRestart: () => void;
  onRefine: () => void;
}

function PillVisual({ pill }: { pill: PillRecord }) {
  const color = COLOR_BY_VALUE[pill.color];
  const swatch = color?.swatch ?? "#E5E2DA";
  const isCapsule = pill.shape === "capsule";

  return (
    <div className="pill-visual" aria-hidden>
      <div
        className={`pill-visual__pill pill-visual__pill--${pill.shape}`}
        style={{
          background: swatch,
          border:
            pill.color === "white" || pill.color === "clear"
              ? "1px solid var(--border)"
              : "1px solid rgba(0,0,0,0.12)",
        }}
      >
        {isCapsule && (
          <span
            className="pill-visual__capsule-half"
            style={{
              background: swatch,
              filter: "brightness(0.92)",
            }}
          />
        )}
        <span className="pill-visual__imprint">{pill.imprint}</span>
      </div>
    </div>
  );
}

export default function ResultsScreen({
  query,
  matches,
  onBack,
  onRestart,
  onRefine,
}: ResultsScreenProps) {


  const handleTalkToAugust = useCallback(
    (pill?: PillRecord) => {
      trackToolEvent("pill-identifier", "cta_clicked", {
        cta_type: "talk_to_august",
        pill_id: pill?.id ?? null,
        imprint: query.imprint,
        shape: query.shape,
        color: query.color,
      });
      const message = pill
        ? `Hi, I just used the pill identifier and it matched a tablet imprinted "${pill.imprint}" to ${pill.drug} ${pill.strength}. Can you tell me more about it, what it's used for, and what side effects I should look out for?`
        : `Hi, I just searched for a pill with imprint "${query.imprint ?? ""}" but couldn't get a confident match. Can you help me figure out what it might be and what to do next?`;
      openAugustChat(message);
    },
    [query],
  );

  return (
    <QuizContainer showFooter={true}>
      <div className="px-5 pt-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex items-center justify-center p-1 bg-transparent border-none cursor-pointer text-[var(--text-primary)] transition-opacity duration-150 hover:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="flex-1 px-5 py-6 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 max-w-110 mx-auto text-center"
        >
          <span className="inline-block text-xs font-medium tracking-wider text-(--brand-primary) bg-white px-3 py-1.5 rounded-full mb-3">
            {matches.length === 0
              ? "No match"
              : matches.length === 1
                ? "1 match"
                : `${matches.length} matches`}
          </span>
          <h2 className="text-[1.35rem] font-medium leading-[1.35] text-(--text-primary) tracking-[-0.01em] m-0">
            Results for your search
          </h2>
        </motion.div>

        {matches.length === 0 ? (
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="tool-card pill-card pill-card--empty"
          >
            <div className="pill-card__body pill-card__body--centered">
              <div className="pill-card__title-row">
                <h3 className="pill-card__title">Nothing matched</h3>
              </div>
              <p className="pill-card__empty-copy">
                The pill isn&apos;t in this reference set, or the imprint may
                be a logo or symbol rather than letters. Try searching the
                imprint without the color or shape filter or talk to august
                to figure out the next step.
              </p>
              <div className="flex gap-2.5 flex-wrap justify-center">
                <button
                  type="button"
                  className="tool-btn tool-btn--primary"
                  onClick={() => handleTalkToAugust()}
                >
                  Talk to august
                </button>
                <button
                  type="button"
                  className="tool-btn tool-btn--ghost"
                  onClick={onRefine}
                >
                  Refine search
                </button>
              </div>
            </div>
          </motion.article>
        ) : (
          <div className={matches.length > 1 ? "pill-results-grid" : ""}>
            {matches.map((pill, i) => (
              <motion.article
                key={pill.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.04 }}
                className="tool-card pill-card"
              >
                <PillVisual pill={pill} />

                <div className="pill-card__body">
                  <div className="pill-card__title-row">
                    <h3 className="pill-card__title">{pill.drug}</h3>
                    <span className="pill-card__strength">{pill.strength}</span>
                  </div>
                  <p className="pill-card__use">{pill.use}</p>

                  <dl className="pill-card__grid">
                    <div>
                      <dt>Imprint</dt>
                      <dd>{pill.imprint}</dd>
                    </div>
                    <div>
                      <dt>Color</dt>
                      <dd>
                        {COLOR_BY_VALUE[pill.color]?.label ?? pill.color}
                      </dd>
                    </div>
                    <div>
                      <dt>Shape</dt>
                      <dd>
                        {SHAPE_BY_VALUE[pill.shape]?.label ?? pill.shape}
                      </dd>
                    </div>
                    <div>
                      <dt>Class</dt>
                      <dd>{pill.drugClass}</dd>
                    </div>
                    <div>
                      <dt>Manufacturer</dt>
                      <dd>{pill.manufacturer}</dd>
                    </div>
                    {pill.ndc && (
                      <div>
                        <dt>NDC</dt>
                        <dd className="tabular-nums">{pill.ndc}</dd>
                      </div>
                    )}
                    {pill.schedule && pill.schedule !== "Rx" && pill.schedule !== "OTC" && (
                      <div>
                        <dt>DEA schedule</dt>
                        <dd>Class {pill.schedule}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex gap-2.5 flex-wrap justify-center mt-6"
          >
            <button
              type="button"
              className="tool-btn tool-btn--primary"
              onClick={() => handleTalkToAugust(matches[0])}
            >
              Ask august
            </button>
            <button
              type="button"
              className="tool-btn tool-btn--ghost"
              onClick={onRestart}
            >
              Start over
            </button>
          </motion.div>
        )}

        {matches.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="mt-4 text-[0.82rem] leading-relaxed text-(--text-tertiary) text-center max-w-110 mx-auto tl-disclaimer"
          >
            Educational reference only. Confirm any unfamiliar pill with a
            pharmacist or the labelled bottle before taking it.
          </motion.p>
        )}

      </div>
    </QuizContainer>
  );
}
