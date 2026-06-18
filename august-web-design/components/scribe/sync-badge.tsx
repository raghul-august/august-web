'use client';

import type { QueueSyncState } from '@/lib/scribe/chunk-queue';

interface SyncBadgeProps {
  syncState: QueueSyncState;
  ackedChunks: number;
  totalChunks: number;
}

const LABELS: Record<QueueSyncState, string> = {
  synced: 'Synced',
  uploading: 'Uploading...',
  retrying: 'Retrying upload...',
  offline: 'Offline',
  idle: '',
};

const COLORS: Record<QueueSyncState, string> = {
  synced: '#206E55',
  uploading: '#206E55',
  retrying: '#D97706',
  offline: '#DC2626',
  idle: '#9CA3AF',
};

export function SyncBadge({ syncState, ackedChunks, totalChunks }: SyncBadgeProps) {
  if (syncState === 'idle' && totalChunks === 0) return null;

  const color = COLORS[syncState];
  const label = LABELS[syncState];
  const showProgress = totalChunks > 0 && syncState !== 'synced';

  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color }}>
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          backgroundColor: color,
          animation: syncState === 'uploading' ? 'scribePulse 1.5s ease-in-out infinite' : undefined,
        }}
      />
      <span className="font-medium">
        {label}
        {showProgress && ` (${ackedChunks}/${totalChunks})`}
      </span>

      <style jsx>{`
        @keyframes scribePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
