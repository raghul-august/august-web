"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { EncouragementData } from "@/app/data/tools/adhd-questions";
import morningImg from "@/public/quiz/morning.png";
import afternoonImg from "@/public/quiz/afternoon.png";
import eveningImg from "@/public/quiz/evening.png";
import QuizContainer from "../shared/QuizContainer";

interface EncouragementScreenProps {
  data: EncouragementData;
  onContinue: () => void;
}

const illustrationMap: Record<string, any> = {
  "/quiz/morning.png": morningImg,
  "/quiz/afternoon.png": afternoonImg,
  "/quiz/evening.png": eveningImg,
};

export default function EncouragementScreen({
  data,
  onContinue,
}: EncouragementScreenProps) {
  const illustration = data.illustration ? illustrationMap[data.illustration] : null;

  return (
    <QuizContainer showFooter={true} showBlobs={true}>
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-[32px_24px] max-w-[480px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white/80 backdrop-blur-[10px] rounded-[24px] overflow-hidden border border-[var(--border-subtle)]"
        >
          {/* Illustration */}
          {illustration ? (
            <motion.div
              className="relative w-full h-[200px] bg-white"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Image
                src={illustration}
                alt={data.chapter}
                fill
                style={{ objectFit: 'contain', objectPosition: 'center' }}
              />
            </motion.div>
          ) : (
            <motion.div
              className="w-full h-[200px] flex items-center justify-center bg-[var(--brand-subtle)]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="text-[5rem]">{data.timeEmoji}</span>
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            className="p-[24px] text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="text-[0.7rem] font-medium tracking-[0.15em] text-[var(--text-secondary)] mb-[12px]">
              Chapter {data.progress} of 3
            </div>
            <p className="text-[0.95rem] text-[var(--text-secondary)] leading-[1.6] m-[0_0_24px]">
              {data.narrative}
            </p>
            <div className="flex justify-center">
              <motion.button
                className="inline-flex items-center justify-center min-w-[200px] py-[14px] px-[28px] bg-[var(--brand-primary)] text-white border-none rounded-full text-[1rem] font-medium cursor-pointer transition-all duration-200 hover:opacity-90"
                onClick={onContinue}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {data.button}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </QuizContainer>
  );
}
