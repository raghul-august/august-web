"use client";

import { motion } from "framer-motion";
import type { OcdTrack } from "@/app/data/tools/ocd-test-questions";
import QuizContainer from "../shared/QuizContainer";
import QuizQuestionHeader from "../shared/QuizQuestionHeader";

interface TrackSelectScreenProps {
  onSelect: (track: OcdTrack) => void;
  onBack: () => void;
}

const tracks: {
  id: OcdTrack;
  title: string;
  subtitle: string;
  instrument: string;
}[] = [
  {
    id: "adult",
    title: "I'm 18 or older",
    subtitle: "4 questions about how much each experience has bothered you in the past month.",
    instrument: "OCI-4",
  },
  {
    id: "youth",
    title: "I'm under 18",
    subtitle: "5 questions about how often each experience has happened in the last month.",
    instrument: "OCI-CV-5",
  },
];

export default function TrackSelectScreen({
  onSelect,
  onBack,
}: TrackSelectScreenProps) {
  return (
    <QuizContainer showFooter={true}>
      <QuizQuestionHeader
        currentIndex={0}
        totalQuestions={1}
        onBack={onBack}
      />
      <div className="flex-1 flex flex-col justify-center p-[24px_24px_32px] max-w-[560px] mx-auto w-full">
        <div className="mb-[28px]">
          <span className="inline-block text-xs font-medium tracking-wider text-[var(--brand-primary)] bg-white px-3 py-1.5 rounded-full mb-4">
            One quick question first
          </span>
          <h2 className="text-[1.3rem] font-medium leading-[1.4] text-[var(--text-primary)] tracking-[-0.01em] m-0 max-[480px]:!text-[1.15rem] max-[360px]:!text-[1.05rem]">
            Which version of the screen would you like to take?
          </h2>
          <p className="mt-3 text-[0.9rem] leading-[1.55] text-[var(--text-tertiary)]">
            The International OCD Foundation uses a different instrument for
            adults and for kids and teens. Pick the one that fits.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-auto">
          {tracks.map((t, index) => (
            <motion.button
              key={t.id}
              onClick={() => onSelect(t.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 rounded-xl text-left bg-[var(--surface-subtle)] border border-[var(--border-subtle)] hover:bg-[var(--brand-subtle)] hover:border-[var(--brand-primary)]/30 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[15px] font-medium text-[var(--text-primary)]">
                  {t.title}
                </span>
                <span className="text-[10px] font-medium tracking-wider uppercase text-[var(--brand-primary)] bg-white px-2 py-1 rounded-full">
                  {t.instrument}
                </span>
              </div>
              <p className="text-[13px] leading-[1.55] text-[var(--text-secondary)] m-0">
                {t.subtitle}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </QuizContainer>
  );
}
