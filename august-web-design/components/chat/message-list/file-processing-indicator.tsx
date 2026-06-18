'use client';

import { useEffect, useRef, useState } from 'react';
import { PROCESSING_CYCLE_TIME, MAX_PROCESSING_TIME } from './constants';

export function FileProcessingIndicator({
  startTime,
  onTimeout,
  texts,
}: {
  startTime?: number;
  onTimeout: () => void;
  texts: string[];
}) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const isMountedRef = useRef(true);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cycle through texts every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        setCurrentTextIndex((prev) => (prev + 1) % (texts.length || 1));
      }
    }, PROCESSING_CYCLE_TIME);

    return () => clearInterval(interval);
  }, [texts.length]);

  // Auto-timeout after 2 minutes
  useEffect(() => {
    if (!startTime) return;

    const checkTimeout = () => {
      if (!isMountedRef.current) return;
      const elapsed = Date.now() - startTime;
      if (elapsed >= MAX_PROCESSING_TIME) {
        onTimeout();
      }
    };

    const interval = setInterval(checkTimeout, 1000);
    return () => clearInterval(interval);
  }, [startTime, onTimeout]);

  return (
    <div className="text-sm text-muted-foreground">
      <span className="shimmer-text">{texts[currentTextIndex] || texts[0]}</span>
      <style jsx>{`
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #767f7c 0%,
            #767f7c 40%,
            #b5bab9 50%,
            #767f7c 60%,
            #767f7c 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
      `}</style>
    </div>
  );
}
