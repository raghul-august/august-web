"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  score: number;
  max: number;
  size?: number;
  ringColor?: string;
  trackColor?: string;
  caption?: ReactNode;
}

export default function ScoreRing({
  score,
  max,
  size = 160,
  ringColor = "var(--brand-primary)",
  trackColor = "var(--border-subtle)",
  caption,
}: Props) {
  const r = (size - 16) / 2; // 8px stroke on each side
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  const progress = max > 0 ? score / max : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={trackColor}
            strokeWidth={10}
          />
          {/* Animated fill */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>

        {/* Centered score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-medium leading-none text-[var(--text-primary)]"
            style={{ fontSize: size * 0.275 }}
          >
            {score}
          </span>
          {caption && (
            <span className="text-[var(--text-secondary)] font-medium" style={{ fontSize: size * 0.1 }}>
              {caption}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
