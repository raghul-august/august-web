"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { colors } from "../../../utils/tools/tool-colors";

interface LoadingCardProps {
  emoji: string;
  messages: string[];
  onComplete: () => void;
  title?: string;
  durationMs?: number;
}

const styles: Record<string, CSSProperties> = {
  area: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "32px 24px",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    padding: "40px 32px",
    textAlign: "center",
    border: "1px solid var(--border-subtle, #E5E2DA)",
  },
  iconWrap: {
    position: "relative",
    width: 120,
    height: 120,
    margin: "0 auto 24px",
  },
  mainEmoji: {
    fontSize: "3.5rem",
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 2,
    lineHeight: 1,
    marginLeft: -28,
    marginTop: -28,
  },
  rings: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  ring: {
    position: "absolute",
    top: "50%",
    left: "50%",
    borderRadius: "50%",
    border: "2px solid transparent",
  },
  ring1: {
    width: 80,
    height: 80,
    marginLeft: -40,
    marginTop: -40,
    borderTopColor: "var(--tool-accent)",
  },
  ring2: {
    width: 100,
    height: 100,
    marginLeft: -50,
    marginTop: -50,
    borderTopColor: colors.green300,
  },
  ring3: {
    width: 120,
    height: 120,
    marginLeft: -60,
    marginTop: -60,
    borderTopColor: colors.green200,
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 500,
    color: colors.green900,
    margin: "0 0 8px",
  },
  message: {
    fontSize: "1rem",
    color: colors.neutral600,
    margin: "0 0 24px",
    minHeight: "1.5em",
  },
  progress: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    background: colors.green100,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "var(--tool-accent)",
    borderRadius: 999,
  },
  percent: {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: colors.green700,
    minWidth: 40,
  },
};

export default function LoadingCard({
  emoji,
  messages,
  onComplete,
  title = "Hang tight",
  durationMs = 3000,
}: LoadingCardProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 50);

    const timeout = setTimeout(() => onCompleteRef.current(), durationMs);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [messages.length, durationMs]);

  return (
    <div style={styles.area}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <div style={styles.iconWrap}>
          <motion.span
            style={styles.mainEmoji}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {emoji}
          </motion.span>
          <div style={styles.rings}>
            <motion.div
              style={{ ...styles.ring, ...styles.ring1 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.div
              style={{ ...styles.ring, ...styles.ring2 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              style={{ ...styles.ring, ...styles.ring3 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </div>

        <motion.h2
          style={styles.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h2>
        <AnimatePresence mode="wait">
          <motion.p
            style={styles.message}
            key={msgIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>

        <div style={styles.progress}>
          <div style={styles.progressBar}>
            <motion.div
              style={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span style={styles.percent}>{Math.min(progress, 100)}%</span>
        </div>
      </motion.div>
    </div>
  );
}
