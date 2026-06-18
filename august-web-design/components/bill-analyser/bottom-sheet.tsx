'use client';

import type { ReactNode } from 'react';
import type { useBottomSheet } from '@/hooks/use-bottom-sheet';

const SHEET_TRANSITION = 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)';
const HANDLE_HEIGHT = 44;

interface BottomSheetProps {
    sheet: ReturnType<typeof useBottomSheet>;
    children: ReactNode;
}

export function BottomSheet({ sheet, children }: BottomSheetProps) {
    const { currentHeight, isDragging, onPointerDown, sheetRef, snapPoint } = sheet;
    const translateY = `calc(100vh - ${typeof currentHeight === 'number' ? `${currentHeight}px` : currentHeight})`;
    const showBackdrop = snapPoint === 'expanded';
    const contentMaxHeight = typeof currentHeight === 'number'
        ? `${currentHeight - HANDLE_HEIGHT}px`
        : `calc(${currentHeight} - ${HANDLE_HEIGHT}px)`;

    return (
        <>
            {showBackdrop && (
                <div className="fixed inset-0 bg-black/20 z-30 transition-opacity duration-300" />
            )}
            <div
                ref={sheetRef}
                className="fixed left-0 right-0 z-40 rounded-t-2xl flex flex-col"
                style={{
                    height: '100vh',
                    top: 0,
                    transform: `translateY(${translateY})`,
                    transition: isDragging ? 'none' : SHEET_TRANSITION,
                    willChange: 'transform',
                    background: '#faf8f3',
                    borderTop: '1px solid #d6d3d1',
                    boxShadow: '0 -4px 24px rgba(0,0,0,0.15), 0 -12px 48px rgba(0,0,0,0.08)',
                }}
            >
                <div
                    className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing shrink-0"
                    style={{ touchAction: 'none' }}
                    onPointerDown={onPointerDown}
                >
                    <div className="w-9 h-1 rounded-full" style={{ backgroundColor: '#D6D3D1' }} />
                </div>
                <div
                    className="overflow-y-auto px-1 pb-8"
                    style={{
                        maxHeight: contentMaxHeight,
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain',
                    }}
                    data-no-drag
                >
                    {children}
                </div>
            </div>
        </>
    );
}
