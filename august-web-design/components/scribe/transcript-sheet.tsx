'use client';

import type { ScribeTranscriptTurn } from '@/services/scribe-service';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';

const SHEET_TRANSITION = 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)';
const HANDLE_HEIGHT = 44;

interface TranscriptSheetProps {
  sheet: ReturnType<typeof useBottomSheet>;
  transcriptText: string | null;
  turns: ScribeTranscriptTurn[] | null;
  durationMs?: number;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export { useBottomSheet };

export function TranscriptSheet({ sheet, transcriptText, turns, durationMs }: TranscriptSheetProps) {
  const { currentHeight, isDragging, onPointerDown, sheetRef, snapPoint } = sheet;
  const translateY = `calc(100vh - ${typeof currentHeight === 'number' ? `${currentHeight}px` : currentHeight})`;
  const showBackdrop = snapPoint === 'expanded';
  const contentMaxHeight = typeof currentHeight === 'number'
    ? `${currentHeight - HANDLE_HEIGHT}px`
    : `calc(${currentHeight} - ${HANDLE_HEIGHT}px)`;

  return (
    <>
      {showBackdrop && (
        <div
          className="fixed inset-0 bg-black/20 z-30 transition-opacity duration-300"
          onClick={() => sheet.snapTo('collapsed')}
        />
      )}
      <div
        ref={sheetRef}
        className="fixed z-40 rounded-t-2xl flex flex-col"
        style={{
          height: '100vh',
          top: 0,
          // Constrain to content area: on desktop center with max-width, on mobile full-width
          left: '50%',
          transform: `translateX(-50%) translateY(${translateY})`,
          transition: isDragging ? 'none' : SHEET_TRANSITION,
          willChange: 'transform',
          background: '#faf8f3',
          borderTop: '1px solid #d6d3d1',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15), 0 -12px 48px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '640px',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing shrink-0"
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown}
        >
          <div className="w-9 h-1 rounded-full" style={{ backgroundColor: '#D6D3D1' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 shrink-0" style={{ borderBottom: '1px solid #EDEBE5' }}>
          <div>
            <h2 className="text-lg font-semibold text-[#141515]">Transcript</h2>
            {durationMs ? (
              <p className="text-xs text-[#767F7C] mt-0.5">{formatDuration(durationMs)} recording</p>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5">
            <i className="ph ph-check-circle" style={{ fontSize: '16px', color: '#206E55' }} aria-hidden />
            <span className="text-xs font-medium text-[#206E55]">Transcribed</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="overflow-y-auto px-5 py-4 pb-8"
          style={{
            maxHeight: contentMaxHeight,
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
          data-no-drag
        >
          {turns && turns.length > 0 ? (
            <div className="space-y-4">
              {turns.map((turn, i) => (
                <div key={i} className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                      style={{
                        backgroundColor: turn.speaker === 'doctor' ? 'rgba(32, 110, 85, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: turn.speaker === 'doctor' ? '#206E55' : '#6366F1',
                      }}
                    >
                      {turn.speaker}
                    </span>
                  </div>
                  <p className="text-sm text-[#141515] leading-relaxed">{turn.text}</p>
                </div>
              ))}
            </div>
          ) : transcriptText ? (
            <p className="text-sm text-[#141515] leading-relaxed whitespace-pre-wrap">{transcriptText}</p>
          ) : (
            <p className="text-sm text-[#767F7C]">No transcript available</p>
          )}
        </div>
      </div>
    </>
  );
}
