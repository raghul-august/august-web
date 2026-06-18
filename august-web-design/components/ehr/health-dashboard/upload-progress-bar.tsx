'use client';

import { useEffect, useState } from 'react';
import type { UploadJob } from '@/stores/ehr-store';

/**
 * Bar slice each stage occupies (start..end of the 0..1 fill). The
 * current status acts as a floor + 95% cap on the time-based estimate
 * so the bar never advances past what the runner has actually
 * confirmed. The matching cumulative time thresholds (5s upload, 30s
 * extract, 15s index — totalling ~50s) live in `jobProgress` below.
 */
const STAGE: Record<string, { start: number; end: number } | undefined> = {
  uploading: { start: 0, end: 0.10 },
  extracting: { start: 0.10, end: 0.50 },
  indexing: { start: 0.50, end: 0.85 },
};

export function UploadProgressBar({
  jobs,
  allTerminal,
}: {
  jobs: UploadJob[];
  allTerminal: boolean;
}) {
  // `now` ticks every 250ms while jobs are in flight so the time-based
  // interpolation animates. Read from state in render so we never call
  // Date.now() mid-render (React purity rule).
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (allTerminal || jobs.length === 0) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [allTerminal, jobs.length]);

  // Per-job progress, pure function of (status, startedAt, now).
  // Time estimate climbs continuously based on elapsed time vs the
  // assumed cumulative pipeline durations; the current status acts as
  // a floor and a (95%) cap so the bar never claims more progress than
  // the runner has actually confirmed. No per-stage entry tracking
  // needed — keeps render pure with no setState-in-effect dance.
  function jobProgress(job: UploadJob): number {
    if (job.status === 'done' || job.status === 'failed') return 1;
    const slice = STAGE[job.status];
    if (!slice) return 0;
    const elapsed = now - job.startedAt;
    let timeEstimate: number;
    if (elapsed < 5_000) {
      timeEstimate = (elapsed / 5_000) * 0.10;
    } else if (elapsed < 35_000) {
      timeEstimate = 0.10 + ((elapsed - 5_000) / 30_000) * 0.40;
    } else if (elapsed < 50_000) {
      timeEstimate = 0.50 + ((elapsed - 35_000) / 15_000) * 0.35;
    } else {
      timeEstimate = 0.85;
    }
    const sliceCap = slice.start + (slice.end - slice.start) * 0.95;
    return Math.min(Math.max(timeEstimate, slice.start), sliceCap);
  }

  const total = jobs.length;
  if (total === 0) return null;
  const greenSum = jobs
    .filter(j => j.status !== 'failed')
    .reduce((sum, j) => sum + jobProgress(j), 0);
  const failedSum = jobs.filter(j => j.status === 'failed').length;
  const greenPct = (greenSum / total) * 100;
  const failedPct = (failedSum / total) * 100;

  return (
    <div className="relative h-2 rounded-full bg-[#ECEEED] overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-[#206E55] transition-[width] duration-700 ease-out overflow-hidden"
        style={{ width: `${greenPct}%` }}
      >
        {!allTerminal && <div className="absolute inset-0 progress-stripes" />}
      </div>
      <div
        className="absolute inset-y-0 bg-[#C44040] transition-[left,width] duration-700 ease-out"
        style={{ left: `${greenPct}%`, width: `${failedPct}%` }}
      />
      <style jsx>{`
        .progress-stripes {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.22) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.22) 50%,
            rgba(255, 255, 255, 0.22) 75%,
            transparent 75%
          );
          background-size: 14px 14px;
          animation: progress-stripes-move 0.9s linear infinite;
        }
        @keyframes progress-stripes-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 14px 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .progress-stripes {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
