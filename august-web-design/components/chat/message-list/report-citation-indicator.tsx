'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore, ReportCitation } from '@/stores/chat-store';
import {
  CITATION_MAX_TIMEOUT,
  CITATION_STEP_DELAY,
  CITATION_COMPLETION_DELAY,
} from './constants';

export function ReportCitationIndicator({ citations }: { citations: ReportCitation[] }) {
  const [visibleCount, setVisibleCount] = useState(() => (citations.length > 0 ? 1 : 0));
  const [activeIndex, setActiveIndex] = useState(citations.length > 0 ? 0 : -1);
  const clearReportCitations = useChatStore((state) => state.clearReportCitations);
  const completeCitationSteps = useChatStore((state) => state.completeCitationSteps);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const hasCompletedRef = useRef(false);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
    setVisibleCount(citations.length > 0 ? 1 : 0);
    setActiveIndex(citations.length > 0 ? 0 : -1);
    hasCompletedRef.current = false;

    for (let i = 1; i < citations.length; i++) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + 1, citations.length));
        setActiveIndex(i);
      }, i * CITATION_STEP_DELAY);
      timersRef.current.push(timer);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [citations]);

  useEffect(() => {
    if (
      visibleCount >= citations.length &&
      citations.length > 0 &&
      !hasCompletedRef.current
    ) {
      completionTimerRef.current = setTimeout(() => {
        completeCitationSteps();
        completionTimerRef.current = null;
      }, CITATION_COMPLETION_DELAY);
      hasCompletedRef.current = true;
    }
  }, [visibleCount, citations.length, completeCitationSteps]);

  useEffect(() => {
    const timer = setTimeout(() => {
      clearReportCitations();
    }, CITATION_MAX_TIMEOUT);
    return () => clearTimeout(timer);
  }, [citations, clearReportCitations]);

  const visibleCitations = citations.slice(0, visibleCount);

  return (
    <div ref={containerRef} className="relative pl-5">
      {/* Vertical connecting line */}
      {visibleCitations.length > 1 && (
        <div
          className="absolute left-[3px] top-[8px] w-[1px] bg-border"
          style={{
            height: `calc(100% - 16px)`,
          }}
        />
      )}

      <div className="space-y-3">
        {visibleCitations.map((citation, index) => (
          <div key={`${citation.report_id}-${index}`} className="relative flex items-start gap-3">
            <div className="absolute -left-5 top-[5px] w-[7px] h-[7px] rounded-full bg-muted-foreground z-10" />
            <span
              className={`text-sm ${index === activeIndex ? 'shimmer-citation' : ''}`}
            >
              {citation.citation}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .shimmer-citation {
          background: linear-gradient(
            90deg,
            #5a564e 0%,
            #5a564e 40%,
            #8a857a 50%,
            #5a564e 60%,
            #5a564e 100%
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
